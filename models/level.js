const db = require ('../dbConfig/init');

module.exports = class Level
{

    constructor(data)
    {
        this.id = data.id;
        this.xptarget = data.xptarget;
    }


    static get all()
    {
        return new Promise(async (res, rej) => 
        {
            try 
            {
                const result = await db.query('SELECT * FROM levels;')
                const levels = result.rows.map(a => new Level(a));
                res(levels);
            } 
            catch (err) 
            {
                rej("Error retrieving levels")
            }
        });
    }

    static getById(id)
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                let levelData = await db.query(`SELECT * FROM levels WHERE id = $1;`, [id]);
                res(levelData.rows[0]);
            }
            catch (err)
            {
                rej("Error retrieving level")
            }
        });
    }


}