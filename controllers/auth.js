const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


async function register(req, res) 
{
    try 
    {
        //req.body will contain: 'username', 'email', 'password'

        let validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (req.body.password.length < 8 || !validRegex.test(req.body.email) || /@/.test(req.body.username)) {
            console.log("Bad request from client, terminating user registration");
            return;
        }
        console.log("\nNow creating user at controller");
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(req.body.password, salt);
        console.log("Pass salted and hashed")
        const user = await User.create( {...req.body, password : hashed, salt: salt });
        res.status(201).json(user);
    } 
    catch (err) 
    {
        res.status(422).json({err});
    }
}


async function login(req, res)
{
    let user;

    console.log(`User ${req.body.username} attempting to login with password ${req.body.password}`);

    try
    {
        if (/@/.test(req.body.username)) {
            user = await User.getByEmail(req.body.username);
        } else {
            user = await User.getByName(req.body.username);
        }
        console.log(user);
        if (user)
        {
            console.log("Found user on name: " + user.username);
        }
        else if (!user)
        {
            console.log("couldn't find user with name: " +req.body.username);
            user = await User.getByEmail(req.body.username);
            console.log("Found user on email: " + user.username);
        }
        else if (!user)
        {
            console.log("couldn't find user with email: " +req.body.username);
            throw new Error ('Login error - invalid details');
        }
        else
        {
            console.log('Login error - invalid details');
            res.status(401).json({err});
        }
        
        let salt = user.salt;

        console.log("Salt to check: "+ salt);

        const hashed = await bcrypt.hash(req.body.password, salt);
        
        const authed = await bcrypt.compare(hashed, user.password);

        console.log("authed? " + authed)

        if (authed)
        {
            console.log("Auth success, logging in")
            const payload = {username: user.username, email: user.email};
            const sendToken = (err, token) =>
            {
                if (err) {throw new Error ('Token Generation failed')}
                console.log("sending token");
                res.status(200).json({ success:true, token: "Bearer " + token})
            }
            
            jwt.sign(payload, process.env.TOKENKEY, {expiresIn : 3600}, sendToken);
        }
        else
        {
            throw new Error ('User auth failed - controller');
        }       
    }
    catch(err)
    {
        console.log("somnething went wrong..");
        res.status(401).json({err});
    }

}


module.exports = { register, login };