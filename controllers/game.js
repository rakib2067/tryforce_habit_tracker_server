const Level = require('../models/level');

async function getLevels(req, res) 
{
    try 
    {
        const levels = await Level.all;
        res.status(200).json(levels);
    } 
    catch (err) 
    {
        res.status(500).send(err);
    }
}

async function getLevelById (req, res)
{
        console.log("Getting level - byId - controller");
        try
        {
                const level = await Level.getById(req.params.id);
                res.status(200).json(level);
        }
        catch (err)
        {
                res.status(500).send(err);
        }

}

module.exports = { getLevels, getLevelById };