const db = require ('../dbConfig/init');
const User = require ('./user');

module.exports = class Habit
{

    constructor(data)
    {
        this.id = data.id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.frequency = data.frequency;
        this.timestampOfLastTrack = data.timestampOfLastTrack;
        this.streak = data.streak;
        this.category = data.category;
    }


    static get all()
    {
        return new Promise (async (res, rej) => 
        {
            try 
            {
                let habitData = await db.query('SELECT * FROM habits;');
                let habits = habitData.rows.map(a => new Habit(a));
                res (habits);
            } 
            catch (err) 
            {
                rej(`Can't find habits`);
            }
        });
    }

    static getById(id)
    {
        return new Promise (async (res, rej) => 
        {
            try 
            {
                let habitData = await db.query('SELECT * FROM habits WHERE id = $1;', [ id ]);
                let habit = new Habit(habitData.rows[0]);
                res(habit);
            } 
            catch (err) 
            {
                rej('Habit not found');
            };
        });
    }

    static create (habitData)
    {
        let { user_id, title, frequency, timestampOfLastTrack, streak, category } = habitData;
        return new Promise (async (res,rej) => 
        {
            try 
            {
                let result = await db.run(SQL`INSERT INTO habits (user_id, title, frequency, timestampOfLastTrack, streak, category)
                                                          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`, 
                                                          [user_id, title, frequency, timestampOfLastTrack, streak, category]);
                res(result.rows[0]);
            }
            catch (err)
            {
                rej('Habit creatus failus');
            }
        });
    }

    destroy()
    {
        return new Promise (async (res, rej) => 
        {
            try 
            {
                const result = await db.query('DELETE FROM habits WHERE id = $1 RETURNING id', [ this.id ]);
                res(`habit ${result.id} yeetus deeletus successus`)
            } 
            catch (err) 
            {
                rej('user yeetus failus')
            }
        });
    }

    update(updateData)
    {
        //TODO

        return new Promise (async (res,rej) =>
        {
            rej("Not implemented yet");
        })
    }

}