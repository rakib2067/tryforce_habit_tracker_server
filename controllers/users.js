const User = require('../models/user');

async function getAll(req, res) 
{
    try 
    {
        const users = await User.all;
        res.status(200).json(users);
    } 
    catch (err) 
    {
        res.status(500).send(err);
    }
}

async function getById(req, res) 
{
    try 
    {
        const user = await User.getById(req.params.id);
        res.status(200).json(user);
    } 
    catch (err) 
    {
        res.status(500).send(err);
    };
}

async function getByName(req, res) 
{
    try 
    {
        const user = await User.getByName(req.params.name);
        res.status(200).json(user);
    } 
    catch (err) 
    {
        res.status(500).send(err);
    };
}

async function getByEmail(req, res) 
{
    try 
    {
        const user = await User.getByEmail(req.params.email);
        res.status(200).json(user);
    } 
    catch (err) 
    {
        res.status(500).send(err);
    };
}

async function update (req,res)
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
    try 
    {
        const user = await User.getById(req.params.id);
        await user.destroy();
        res.status(204).end();
    } 
    catch (err) 
    {
        res.status(404).json({err});
    };
}

async function getHabitsByUserId (req, res)
{
    try
    {
        const habits = await User.habits(req.params.id);
        res.status(200).json(habits);
    }
    catch (err)
    {
        res.status(500);
    }
}

module.exports = { getAll, getById, update, destroy, getHabitsByUserId, getByName, getByEmail }