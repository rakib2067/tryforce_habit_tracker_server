const nodemailer = require("nodemailer");
const db = require("./dbConfig/init");

const User = require('./models/user');
const Habit = require('./models/habit');
const { uniq } = require("shelljs");

let streakArray = [];
let failArray = [];



async function go()
{
    console.log("Task scheduler started processing.");

    streakArray = [];
    failArray = [];

    //Get the data
    let habits = await Habit.all;

    habits.forEach(async (habit) =>
    {
        await dailyCrunch(habit);
    })
}


async function dailyCrunch(habit)
{




  // Check if completed habit for the day.

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
       failArray.push(habit);
    }    
    catch (err)
    {
        console.log(`failed to send fail email for habit ${habit.id}, ${err}`);
    }

  }
  else if (habit.completed)
  {
    console.log(`user ${habit.user_id} was good and completed habit ${habit.title}`)

    //get habit days exist
    
    let newDaysExist = parseInt(habit.daysexist) + 1;
    let newStreak = parseInt(habit.streak) + 1;

    let update = await db.query("UPDATE habits SET streak = $1, timesdone = 0, completed = false, daysexist = $2 WHERE id = $3;",[newStreak, newDaysExist, habit.id]);
    
    try
    {
        console.log(`Habit ${habit.id} updated with successful completion.`);
    
        if(parseInt(newStreak) % 10 === 0)
        {
            console.log(`User ${habit.user_id} hit a multiple of ten streak - sending a congrats email!`);
            
            //Add them to streak array
            streakArray.push(habit);
        }

        let userUpdate = await User.addRupees(parseInt(habit.user_id)); 
    }
    catch (err)
    {
        console.log("Error adding rupees: " +err)
    };
    

  }


  //let result = await sendStreakEmail(habit);

}

async function sendEmails()
{
    await streakArrayProcessor();
    await failArrayProcessor();
}

async function streakArrayProcessor()
{
    //If nothing in array do nothing
    if(streakArray.length === 0)
    {
        console.log("nothing in streak array - doing nothing")
        return;
    }
    else
    {
        console.log(`streak array: ${streakArray}`);

        let seen = [];
        let appeared = false;

        seen.push(streakArray[0]);

        streakArray.forEach(async (habit) => 
        {

            console.log("Processing " + habit.title + " AT the streak array processor");
            console.log("Seen array: " +seen);


            for ( let i = 0; i < seen.length; i++)
            {

                if(parseInt(seen[i].user_id) === parseInt(habit.user_id))
                {
                    console.log (`value ${habit.user_id} exists - found ${seen[i].user_id}`)
                    appeared = true;
                }

            }
            if (!appeared)
            {
                seen.push(habit);
            }


            appeared = false;

        });
        
        console.log("Send email array: " +seen)

        if (seen)
        {
            seen.forEach(async (habit) => 
            {
                console.log(`sending streak email to ${habit.user_id}`);
                await sendStreakEmail(habit);
            })
        }
    }
    

}

async function failArrayProcessor()
{

        //If nothing in array do nothing
    if(failArray.length === 0)
    {
        console.log("nothing in fail array - doing nothing")
        return;
    }
    else
    {
        console.log(`fail array: ${failArray}`);

        let seen = [];
        let appeared = false;

        seen.push(failArray[0]);

        failArray.forEach(async (habit) => 
        {

            console.log("Processing " + habit.title + " AT the streak array processor");
            console.log("Seen array: " +seen);


            for ( let i = 0; i < seen.length; i++)
            {

                if(parseInt(seen[i].user_id) === parseInt(habit.user_id))
                {
                    console.log (`value ${habit.user_id} exists - found ${seen[i].user_id}`)
                    appeared = true;
                }

            }
            if (!appeared)
            {
                seen.push(habit);
            }


            appeared = false;

        });
        
        console.log("Send email array: " +seen)

        if (seen)
        {
            seen.forEach(async (habit) => 
            {
                console.log(`sending fail email to ${habit.user_id}`);
                await sendFailEmail(habit);
            })
        }
    }
}


async function sendFailEmail(habit)
{

    let testAccount = await nodemailer.createTestAccount();
    let transporter = await nodemailer.createTransport
    ({
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: 
        {
            user: "teamtryforcenavi@gmail.com",
            pass: "Futureproof"
        }
    });

    let user = await db.query(`SELECT username, email FROM users WHERE id = $1;`,[habit.user_id]);

    let email = user.rows[0].email;
    let username = user.rows[0].username;

    console.log(`sending email to ${email} now!`);

    let content =  `<!DOCTYPE html>

    <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
    <head>
    <title></title>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
    <style>
            * {
                box-sizing: border-box;
            }
    
            body {
                margin: 0;
                padding: 0;
            }
    
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: inherit !important;
            }
    
            #MessageViewBody a {
                color: inherit;
                text-decoration: none;
            }
    
            p {
                line-height: inherit
            }
    
            @media (max-width:600px) {
                .icons-inner {
                    text-align: center;
                }
    
                .icons-inner td {
                    margin: 0 auto;
                }
    
                .row-content {
                    width: 100% !important;
                }
    
                .image_block img.big {
                    width: auto !important;
                }
    
                .column .border {
                    display: none;
                }
    
                .stack .column {
                    width: 100%;
                    display: block;
                }
            }
        </style>
    </head>
    <body style="background-color: #1e1a19; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1e1a19;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tr>
    <td style="width:100%;padding-right:0px;padding-left:0px;">
    <div align="center" style="line-height:10px"><img alt="Image" src="https://www.pinclipart.com/picdir/big/423-4236731_the-legend-of-zelda-clipart-fairy-navi-navi.png" style="display: block; height: auto; border: 0; width: 145px; max-width: 100%;" title="Image" width="145"/></div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-left: 10px; padding-right: 10px; padding-top: 0px; padding-bottom: 10px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td>
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; font-family: Georgia, Times, 'Times New Roman', serif; mso-line-height-alt: 14.399999999999999px; color: #ff776d; line-height: 1.2;">
    <p style="margin: 0; font-size: 14px; text-align: center;"><span style="font-size:64px;"><strong><span style="font-size:64px;"><span style="color:#ffffff;font-size:64px;">Hey, Listen!</span></span></strong></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td>
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #ff776d; line-height: 1.2; font-family: Georgia, Times, 'Times New Roman', serif;">
    <p style="margin: 0; font-size: 12px; mso-line-height-alt: 14.399999999999999px;"> </p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-left: 10px; padding-right: 10px; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td>
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; font-family: Georgia, Times, 'Times New Roman', serif; mso-line-height-alt: 14.399999999999999px; color: #297e54; line-height: 1.2;">
    <p style="margin: 0; font-size: 14px; text-align: center;"><span style="font-size:50px;"><strong><span style="font-size:50px;">You forgot to ${habit.title}, ${username}!</span></strong></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 40px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td style="padding-left:10px;padding-top:10px;">
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-family: Georgia, Times, 'Times New Roman', serif; font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #FFFFFF; line-height: 1.2;">
    <p style="margin: 0; font-size: 12px; text-align: center;"><span style="font-size:34px;"><strong><span style="font-size:34px;">You should make sure to mark them all as complete!</span></strong></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:5px;">
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; mso-line-height-alt: 18px; color: #297e54; line-height: 1.5; font-family: Georgia, Times, 'Times New Roman', serif;">
    <p style="margin: 0; font-size: 12px; text-align: center; mso-line-height-alt: 27px;"><span style="font-size:18px;"><span style="font-size:30px;">Log back in now!</span><br/><span style="font-size:30px;">[Insert Website here]</span><br/></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #297e54;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td style="padding-bottom:20px;padding-left:10px;padding-right:10px;padding-top:20px;">
    <div style="font-family: Arial, sans-serif">
    <div style="font-size: 12px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #FFFFFF; line-height: 1.2;">
    <p style="margin: 0; font-size: 12px; text-align: center;"><span style="font-size:11px;">By Team Triforce</span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="icons_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tr>
    <td style="vertical-align: middle; color: #9d9d9d; font-family: inherit; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
    <table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tr>
    <td style="vertical-align: middle; text-align: center;">
    <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
    <!--[if !vml]><!-->
    <table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;">
    <!--<![endif]-->
    <tr>
    <td style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 6px;"><a href="https://www.designedwithbee.com/" style="text-decoration: none;" target="_blank"></a></td>
    <td style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 15px; color: #9d9d9d; vertical-align: middle; letter-spacing: undefined; text-align: center;"></td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table><!-- End -->
    </body>
    </html>`;


    let info = await transporter.sendMail({
        from: '"Navi @ Tryforce Team" <tryforceteamnavi@gmail.com>', //sender addy
        to: `${email}`,
        subject: "Hey, Listen!",
        html: content
    });

}

async function sendStreakEmail(habit)
{


    let testAccount = await nodemailer.createTestAccount();
    let transporter = await nodemailer.createTransport
    ({
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: 
        {
            user: "teamtryforcenavi@gmail.com",
            pass: "Futureproof"
        }
    });
    let user = await db.query(`SELECT username, email FROM users WHERE id = $1;`,[habit.user_id]);

    let email = user.rows[0].email;
    let username = user.rows[0].username;

    console.log(`sending email to ${email} now!`);

    let content =  `<!DOCTYPE html>

    <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
    <head>
    <title></title>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
    <style>
            * {
                box-sizing: border-box;
            }
    
            body {
                margin: 0;
                padding: 0;
            }
    
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: inherit !important;
            }
    
            #MessageViewBody a {
                color: inherit;
                text-decoration: none;
            }
    
            p {
                line-height: inherit
            }
    
            @media (max-width:600px) {
                .icons-inner {
                    text-align: center;
                }
    
                .icons-inner td {
                    margin: 0 auto;
                }
    
                .row-content {
                    width: 100% !important;
                }
    
                .image_block img.big {
                    width: auto !important;
                }
    
                .column .border {
                    display: none;
                }
    
                .stack .column {
                    width: 100%;
                    display: block;
                }
            }
        </style>
    </head>
    <body style="background-color: #1e1a19; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1e1a19;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tr>
    <td style="width:100%;padding-right:0px;padding-left:0px;">
    <div align="center" style="line-height:10px"><img alt="Image" src="https://www.clipartmax.com/png/full/231-2314456_tingle-legend-of-zelda.png" style="display: block; height: auto; border: 0; width: 145px; max-width: 100%;" title="Image" width="145"/></div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-left: 10px; padding-right: 10px; padding-top: 0px; padding-bottom: 10px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td>
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; font-family: Georgia, Times, 'Times New Roman', serif; mso-line-height-alt: 14.399999999999999px; color: #ff776d; line-height: 1.2;">
    <p style="margin: 0; font-size: 14px; text-align: center;"><span style="font-size:64px;"><strong><span style="font-size:64px;"><span style="color:#ffffff;font-size:64px;">Tingle, Tingle! Kooloo-Limpah!!</span></span></strong></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td>
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #ff776d; line-height: 1.2; font-family: Georgia, Times, 'Times New Roman', serif;">
    <p style="margin: 0; font-size: 12px; mso-line-height-alt: 14.399999999999999px;"> </p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-left: 10px; padding-right: 10px; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td>
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; font-family: Georgia, Times, 'Times New Roman', serif; mso-line-height-alt: 14.399999999999999px; color: #297e54; line-height: 1.2;">
    <p style="margin: 0; font-size: 14px; text-align: center;"><span style="font-size:50px;"><strong><span style="font-size:50px;">You've hit a streak of ${habit.streak + 1} on ${habit.title}, ${username}!</span></strong></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 40px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td style="padding-left:10px;padding-top:10px;">
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-family: Georgia, Times, 'Times New Roman', serif; font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #FFFFFF; line-height: 1.2;">
    <p style="margin: 0; font-size: 12px; text-align: center;"><span style="font-size:34px;"><strong><span style="font-size:34px;">Keep it up!</span></strong></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:5px;">
    <div style="font-family: Georgia, 'Times New Roman', serif">
    <div style="font-size: 12px; mso-line-height-alt: 18px; color: #297e54; line-height: 1.5; font-family: Georgia, Times, 'Times New Roman', serif;">
    <p style="margin: 0; font-size: 12px; text-align: center; mso-line-height-alt: 27px;"><span style="font-size:18px;"><span style="font-size:30px;">Log back in now!</span><br/><span style="font-size:30px;">[Insert Website here]</span><br/></span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #297e54;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
    <tr>
    <td style="padding-bottom:20px;padding-left:10px;padding-right:10px;padding-top:20px;">
    <div style="font-family: Arial, sans-serif">
    <div style="font-size: 12px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #FFFFFF; line-height: 1.2;">
    <p style="margin: 0; font-size: 12px; text-align: center;"><span style="font-size:11px;">By Team Triforce</span></p>
    </div>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tbody>
    <tr>
    <td>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 580px;" width="580">
    <tbody>
    <tr>
    <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
    <table border="0" cellpadding="0" cellspacing="0" class="icons_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tr>
    <td style="vertical-align: middle; color: #9d9d9d; font-family: inherit; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
    <table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <tr>
    <td style="vertical-align: middle; text-align: center;">
    <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
    <!--[if !vml]><!-->
    <table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;">
    <!--<![endif]-->
    <tr>
    <td style="vertical-align: middle; text-align: center; padding-top: 5px; padding-bottom: 5px; padding-left: 5px; padding-right: 6px;"><a href="https://www.designedwithbee.com/" style="text-decoration: none;" target="_blank"></a></td>
    <td style="font-family: Helvetica Neue, Helvetica, Arial, sans-serif; font-size: 15px; color: #9d9d9d; vertical-align: middle; letter-spacing: undefined; text-align: center;"></td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table><!-- End -->
    </body>
    </html>`;


    let info = await transporter.sendMail({
        from: '"Tingle @ Tryforce Team" <tryforceteamnavi@gmail.com>', //sender addy
        to: `${email}`,
        subject: "Tingle, Tingle! Kooloo-Limpah!",
        html: content
    });

}

module.exports = { go, sendEmails  }
