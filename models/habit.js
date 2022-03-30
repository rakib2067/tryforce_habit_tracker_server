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
      try {
        const initialFetch = await db.query(
          "SELECT user_id, timesdone FROM habits WHERE id = $1",
          [updateData.id]
        );
        let timesDone = parseInt(initialFetch.rows[0].timesDone) + 1;
        let result;

        if (parseInt(timesDone) >= parseInt(initialFetch.rows[0].frequency)) {
          try {
            //User did all the times in the day, update completed to true
            result = await db.query(
              "UPDATE habits SET timesdone = $1, completed = true WHERE id = $2 RETURNING *;",
              [timesDone, updateData.id]
            );
          } catch (err) {
            rej("Failed to update times done and to completed");
          }
        } else {
          try {
            //User not hit the target yet, only update times done
            result = await db.query(
              "UPDATE habits SET timesdone = $1 WHERE id = $2 RETURNING *;",
              [timesDone, updateData.id]
            );
          } catch (err) {
            rej("Failed to update times done");
          }
        }

        //Give them an xp
        try {
          let xpResult = await User.addXp(
            parseInt(initialFetch.rows[0].user_id)
          );
        } catch (err) {
          rej("Failed to give the user an exp");
        }

        //give them 10 rupees
        try
        {
            let rupeeResult = await User.addRupees(parseInt(initialFetch.rows[0].user_id));
        }
        catch (err)
        {
            rej("Failed to give the user some rupees");
        }

        let updatedHabit = new Habit(result.rows[0]);
        res(updatedHabit);
      } catch (err) {
        rej("failed to update times done");
      }
    });
  }
};
