const db = require ('../dbConfig/init');
const Habit = require('./habit');

module.exports = class User
{

    constructor(data)
    {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.rupees = data.rupees;
        this.profilepic = data.profilepic;
        this.xp = data.xp;
        this.level = data.level;
    }


    static get all()
    {
        return new Promise(async (res, rej) => 
        {
            try 
            {
                const result = await db.query('SELECT id, username, email, rupees, profilePic, xp, level FROM users;')
                const users = result.rows.map(a => new User(a));
                res(users);
            } 
            catch (err) 
            {
                rej("Error retrieving users");
            }
        });
    }


    static getById(id)
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                let userData = await db.query(`SELECT * FROM users WHERE id = $1;`, [id]);
                res(userData.rows[0]);
            }
            catch (err)
            {
                rej("error getting user");
            }
        });
    }

    static getByUsername(name)
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                let userData = await db.query(`SELECT * FROM users WHERE username = $1;`, [name]);
                res(new User(userData.rows[0]));
            }
            catch (err)
            {
                rej("Error getting user");
            }
        });
    }

    static getByEmail(email)
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                let userData = await db.query(`SELECT * FROM users WHERE email = $1;`, [email]);
                res(new User(userData.rows[0]));
            }
            catch (err)
            {
                rej("Error getting user");
            }
        });
    }

    static async create(userData)
    {
        let { username, email, password} = userData;
        let rupees = 0;
        let profilePic = 0;
        let xp = 0;
        let level = 0;

        return new Promise (async (res,rej) => 
        {
            console.log("Try catch create user - user model")
            try 
            {
                let result = await db.query(`INSERT INTO users (username, email, password, rupees, profilePic, xp, level)
                                                          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, 
                                                          [username, email, password, rupees, profilePic, xp, level])
                console.log(`User created with ID: ${result.rows[0].id}`);
                res(new User(result.rows[0]));
            }
            catch (err)
            {
                rej('User creatus failus');
            }
        });
    }

    static destroy()
    {
        return new Promise(async (res, rej) => 
        {
            try 
            {
                const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [ this.id ]);

                const habits = await this.habits;

                let idsDeleted = [];

                habits.array.forEach( async (habit) => 
                {
                    idsDeleted.push(habit.title);
                    await habit.destroy();    
                });

                res(`user ${result.id} and habits ${idsDeleted} yeetus deeletus successus`)
            } 
            catch (err) 
            {
                rej('user yeetus failus')
            }
        });
    }

    static update(updateData)
    {
        return new Promise(async (res, rej) => 
        {
            try 
            {
                const result = await db.query(`UPDATE users SET profilePic = $1 WHERE id = $2 RETURNING *;`, [ updateData.url, updateData.id ]);
                res(new User(result.rows[0]));
            } 
            catch (err) 
            {
                rej('User updatus yeetus wehas failus');
            }
        });
    }

    static habits(id)
    {

        return new Promise(async (res, rej) => 
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