const User = require('../models/user');

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

module.exports = { getAll, getById, update, destroy, getHabitsByUserId, getByUsername, getByEmail }