const db = require("../dbConfig/init");
const User = require("./user");

module.exports = class Habit {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.frequency = data.frequency;
    this.streak = data.streak;
    this.category = data.category;
    this.timesdone = data.timesdone;
    this.completed = data.completed;
    this.daysexist = data.daysexist;
    this.dayscompleted = data.dayscompleted;
  }

  static get all() {
    return new Promise(async (res, rej) => {
      try {
        let habitData = await db.query("SELECT * FROM habits;");
        let habits = habitData.rows.map((a) => new Habit(a));
        res(habits);
      } catch (err) {
        rej(`Can't find habits`);
      }
    });
  }

  static getById(id) {
    return new Promise(async (res, rej) => {
      try {
        let habitData = await db.query("SELECT * FROM habits WHERE id = $1;", [
          id,
        ]);
        let habit = new Habit(habitData.rows[0]);
        res(habit);
      } catch (err) {
        rej("Habit not found");
      }
    });
  }

  static create(habitData) {
    return new Promise(async (res, rej) => {
      try {
        const result = await db.query(
          `INSERT INTO habits (user_id, title, frequency, streak, category, timesdone, completed, daysexist, dayscompleted ) 
                                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
          [
            habitData.id,
            habitData.title,
            habitData.frequency,
            0,
            habitData.category,
            0,
            false,
            0,
            0,
          ]
        );
        res(result.rows[0]);
      } catch (err) {
        rej("Habit creatus failus");
      }
    });
  }

  destroy() {
    return new Promise(async (res, rej) => {
      try {
        const result = await db.query(
          "DELETE FROM habits WHERE id = $1 RETURNING id",
          [this.id]
        );
        res(`habit ${result.id} yeetus deeletus successus`);
      } catch (err) {
        rej("user yeetus failus");
      }
    });
  }

  static updateTimesDone(updateData) {
    return new Promise(async (res, rej) => {

      try 
      {
        const initialFetch = await db.query(
          "SELECT user_id, timesdone, frequency,completed FROM habits WHERE id = $1;",
          [updateData.id]
        );

        const xpQuery = await db.query("SELECT xp FROM users WHERE id = $1;", [updateData.userid]);

        const currentXp = xpQuery.rows[0].xp;

        let isCompleted = initialFetch.rows[0].completed;

        let timesDone;

        if (updateData.operation == "increment") 
        {
          timesDone = parseInt(initialFetch.rows[0].timesdone) + 1;
          await db.query("UPDATE users SET xp=$2 WHERE id = $1;", [updateData.userid, currentXp + 25]);
        } 
        else if (updateData.operation == "decrement")
        {
          timesDone = parseInt(initialFetch.rows[0].timesdone) - 1;
          if (currentXp >= 5) 
          {
            await db.query("UPDATE users SET xp=$2 WHERE id = $1;", [updateData.userid, currentXp - 25]);
          }
        } else 
        {
          throw new Error("Invalid Operation");
        }
        let result;

        if (parseInt(timesDone) == parseInt(initialFetch.rows[0].frequency)) 
        {
          try 
          {
            //User did all the times in the day, update completed to true
            result = await db.query(
              "UPDATE habits SET timesdone = $1, completed = true,dayscompleted=dayscompleted+1 WHERE id = $2 RETURNING *;",
              [timesDone, updateData.id]
            );
            res(new Habit(result.rows[0]));
          } 
          catch (err) 
          {
            rej("Failed to update times done and to completed");
          }
        } 
        else if (parseInt(timesDone) > parseInt(initialFetch.rows[0].frequency) || parseInt(timesDone) < 0 ) 
        {
          try 
          {
            // Will return just the object if user is trying to increment/decrement past the threshold
            result = await db.query("SELECT * FROM habits WHERE id = $1;", [
              updateData.id,
            ]);
            res(new Habit(result.rows[0]));
          } 
          catch (error) 
          {
            rej("Failed to respond completed");
          }
        } 
        else if (isCompleted == true && updateData.operation == "decrement") 
        {
          try {
            // If todays task is completed by accident and user decrements it will decrement and remove days completed and set completed false
            result = await db.query(
              "UPDATE habits SET dayscompleted=dayscompleted-1,completed=false,timesdone = $1 WHERE id=$2 RETURNING *;",
              [timesDone, updateData.id]
            );
            res(new Habit(result.rows[0]));
          } catch (error) {
            rej("Could not decrement timesdone and dayscompleted");
          }
        } 
        else 
        {
          try 
          {
            //User not hit the target yet, only update times done
            result = await db.query(
              "UPDATE habits SET timesdone = $1 WHERE id = $2 RETURNING *;",
              [timesDone, updateData.id]
            );
            res(new Habit(result.rows[0]));
          } 
          catch (err) 
          {
            rej("Failed to update times done");
          }
        }
        // Interpretor not reading past this line for some reason
        //Give them an xp
        try 
        {
          let xpResult = await User.addXp(parseInt(initialFetch.rows[0].user_id));
        } 
        catch (err) 
        {
          rej("Failed to give the user an exp");
        }

        let updatedHabit = new Habit(result.rows[0]);
        res(updatedHabit);
      } catch (err) {
        rej("failed to update times done");
      }
    });
  }
};
