const db = require ('../dbConfig/init');

module.exports = class ProfilePic
{

    constructor(data)
    {
        this.id = data.id;
        this.src = data.src;
    }


    static get all()
    {
        return new Promise(async (res, rej) => 
        {
            try 
            {
                const result = await db.query('SELECT * FROM profilePics;')
                const pics = result.rows.map(a => new ProfilePic(a));
                res(pics);
            } 
            catch (err) 
            {
                rej("Error retrieving pics")
            }
        });
    }


    static getById(id)
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                let picData = await db.query(`SELECT * FROM profilePics WHERE id = $1;`, [id]);
                res(picData.rows[0]);
            }
            catch (err)
            {
                rej("Error retrieving pic")
            }
        });
    }



}
