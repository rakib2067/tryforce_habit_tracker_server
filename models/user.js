const db = require ('../dbConfig/init');
const Habit = require('./habit');

module.exports = class User
{

    constructor(data)
    {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.rupees = data.rupees;
        this.profilePic = data.profilePic;
        this.xp = data.xp;
        this.xpTarget = data.xpTarget;
        this.level = data.level;

    }


    static get all()
    {
        return new Promise (async (res, rej) => 
        {
            try 
            {
                const result = await db.query('SELECT id, name, email, rupees, profilePic, xp, xpTarget, level FROM users;')
                const users = result.rows.map(a => new User(a));
                res(users);
            } 
            catch (err) 
            {
                rej("Error retrieving users")
            }
        });
    }


    static getById(id)
    {
        return new Promise (async (res, rej) =>
        {
            try
            {
                let userData = await db.query(`SELECT * FROM users WHERE id = $1;`, [id]);
                res (userData.rows[0]);
            }
            catch (err)
            {
                rej('User no findy');
            }
        });
    }

    static create (userData)
    {
        let { name, email, password, rupees = 0, profilePic, xp = 0, xpTarget = 10, level = 0 } = userData;
        return new Promise (async (res,rej) => 
        {
            try 
            {
                let result = await db.run(SQL`INSERT INTO users (name, email, password, rupees, profilePic, xp, xpTarget, level)
                                                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`, 
                                                          [name, email, password, rupees, profilePic, xp, xpTarget, level]);
                res(result.rows[0]);
            }
            catch (err)
            {
                rej('User creatus failus');
            }
        });
    }

    destroy()
    {
        return new Promise (async (res, rej) => 
        {
            try 
            {
                const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [ this.id ]);
                res(`user ${result.id} yeetus deeletus successus`)
            } 
            catch (err) 
            {
                rej('user yeetus failus')
            }
        });
    }

    update(updateData)
    {
        let {id, profilePic} = updateData;

        return new Promise (async (res, rej) => 
        {
            try 
            {
                const result = await db.query('UPDATE users SET profilePic = $1 WHERE id = $2 RETURNING *;', [ profilePic, id ]);
                res(result.rows[0])
            } 
            catch (err) 
            {
                rej('User updatus yeetus wehas failus');
            }
        });
    }

    static habits(id)
    {

        return new Promise (async (res, rej) => 
        {
            try 
            {
                const result = await db.query('SELECT * FROM habits WHERE user_id = $1', [ id ]);
                let habits = result.rows.map(a => new Habit(a));
                res(habits);
            } 
            catch (err) 
            {
                rej('Habitus non existus or non findus');
            };
        });

    }



}