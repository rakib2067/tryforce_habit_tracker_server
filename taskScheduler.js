const nodemailer = require("nodemailer");
const db = require("./dbConfig/init");

const User = require('./models/user');
const Habit = require('./models/habit');
const { test } = require("shelljs");




async function go()
{
    console.log("Task scheduler started processing.");

    //Get the data
    let habits = await Habit.all;

    habits.forEach(async (habit) =>
    {
        await dailyCrunch(habit);
    })
}


async function dailyCrunch(habit)
{
  // console.log(`now dealing with habit ${habit.id} for user id ${habit.user_id}`)

  // Check if completed habit for the day.
  let failUsers = [];
  let streakUsers = [];

  if(!habit.completed)
  {
    //Set times done to 0.  Increment days exist by 1
    try
    {
        //get habit days exist
        let newDaysExist = parseInt(habit.daysexist) + 1;

        //Set times done to 0 and days exist to newDaysExist
        let update = await db.query("UPDATE habits SET streak = 0, timesdone = 0, daysexist = $1 WHERE id = $2;", [newDaysExist, habit.id]);

        console.log(`habit ${habit.id} updated successfully with failure`);
    }
    catch (err)
    {
        console.log(`Failed to update failure of habit ${habit.id}`);
    }
    
    //Add them to the fail array if failed today.
    try
    {
        failUsers.push(habit.user_id);
    }    
    catch (err)
    {
        console.log(`failed to send fail email for habit ${habit.id}`);
    }

  }
  else if (habit.completed)
  {
    console.log(`user ${habit.user_id} was good and completed habit ${habit.title}`)

    //get habit days exist
    
    let newDaysExist = parseInt(habit.daysexist) + 1;
    let newStreak = parseInt(habit.streak) + 1;

    let update = await db.query("UPDATE habits SET streak = $1, timesdone = 0, completed = false, daysexist = $2 WHERE id = $3;",[newStreak, newDaysExist, habit.id]);

    console.log(`Habit ${habit.id} updated with successful completion.`);

    if(newStreak === 10)
    {
        console.log("Streak is now 10 - sending a congrats email!");
        
        //Add them to streak array
        streakUsers.push(habit.user_id);
    }
  }

  await sendEmail(failUsers,type = "streak");

}


async function sendEmail(users, type)
{

    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport
    ({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: 
        {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    
    users.forEach(async (userId) =>
    {   

    let user = await db.query("SELECT email FROM users WHERE id = $1", [userId+""]);
    let email = user.rows[0].email;

    console.log(`sending email to ${email} now!`);



    let info = await transporter.sendMail({
        from: '"Navi @ Tryforce Team" <tryforceteamnavi@gmail.com>', //sender addy
        to: `${email}`,
        subject: "Hey, Listen!",
        html: "Test email Tryforce Team"
    });

    console.log("Email sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    })


}












module.exports = { go }