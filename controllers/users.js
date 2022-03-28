const User = require('../models/user');
const bcrypt = require('bcrypt');

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

async function create (req, res) 
{
    try 
    {
        console.log("Now creating user at controller");
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(req.body.password, salt);
        console.log("Pass salted and hashed")
        const user = await User.create( {...req.body, password : hashed });
        res.status(201).json(user);
    } 
    catch (err) 
    {
        res.status(422).json({err});
    }
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

module.exports = { getAll, getById, create, update, destroy, getHabitsByUserId }