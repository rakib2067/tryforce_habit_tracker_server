const User = require('../models/user');
const ProfilePic = require('../models/profilePic');

async function getAll(req, res) 
{
        const users = await User.all;
        res.status(200).json(users);
}

async function getById(req, res) 
{
    const user = await User.getById(req.params.id);
    res.status(200).json(user);
}

async function getByUsername(req, res) 
{
        const user = await User.getByUsername(req.params.name);
        res.status(200).json(user);
}

async function getByEmail(req, res) 
{
        const user = await User.getByEmail(req.params.email);
        res.status(200).json(user);
}

async function update(req,res)
{
    try 
    {
        console.log(`Updating user ${req.params.id} profile picture to ${req.body.profilePic}`)
        const user = await User.update(req.body);
        res.status(202).json(user);
    }
    catch (err)
    {
        res.status(422);
    }
}

async function destroy (req, res) 
{
        const user = await User.getById(req.params.id);
        await user.destroy();
        res.status(204).end();
}

async function getHabitsByUserId (req, res)
{
        const habits = await User.habits(req.params.id);
        res.status(200).json(habits);
}

async function getProfilePics (req, res)
{
        console.log("Getting profile pics - all - controller");
        try 
        {
                const profilePics = await ProfilePic.all;
                res.status(200).json(profilePics);
        }
        catch (err)
        {
                res.status(500).send(err);
        }
}

async function getProfilePicsById (req, res)
{
        console.log("Getting profile pics - byId - controller");
        try
        {
                const pic = await ProfilePic.getById(req.params.id);
                res.status(200).json(pic);
        }
        catch (err)
        {
                res.status(500).send(err);
        }

}

async function getXpTarget ( req, res)
{
        try
        {
                const result = await User.getXpTarget(req.params.id);
                res.status(200).json(result);
        }
        catch (err)
        {
                res.status(500).send(err);
        }
}


async function levelUp(req,res)
{
    try 
    {
        console.log(`Updating user ${req.params.id} level to ${parseInt(req.body.level) + 1 }`)
        const user = await User.levelUp(req.params.id);
        res.status(202).json(user);
    }
    catch (err)
    {
        res.status(422);
    }
}

async function addXp(req,res)
{
    try 
    {
        console.log(`Updating user ${req.params.id} xp to add 1 xp`)
        const user = await User.addXp(req.params.id);
        res.status(202).json(user);
    }
    catch (err)
    {
        res.status(422);
    }
}

module.exports = { getAll, getById, update, destroy, getHabitsByUserId, getByUsername, getByEmail, getProfilePics, getProfilePicsById, getXpTarget, levelUp, addXp }