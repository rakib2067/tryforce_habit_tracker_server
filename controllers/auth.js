const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


async function register(req, res) 
{

    console.log("register function called at controller");

    try 
    {
        //req.body will contain: 'username', 'email', 'password'

        let validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (req.body.password.length < 8 || !validRegex.test(req.body.email) || /@/.test(req.body.username)) {
            console.log("Client overrode client-side register form protection, terminating user registration");
            return;
        }
        if (await User.getByUsername(req.body.username)) {
            res.status(409).send("Username already taken!");
            return;
        }
        if (await User.getByEmail(req.body.email)) {
            res.status(409).send("Email already used!");
            return;
        }
        console.log("\nNow creating user at controller");
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(req.body.password, salt);
        console.log("Pass salted and hashed")
        const user = await User.create( {...req.body, password : hashed});
        res.status(201).json(user);
    } 
    catch (err) 
    {
        res.status(500).json({err});
    }
}


async function login(req, res)
{
    let user;

    console.log(`User ${req.body.username} attempting to login with password ${req.body.password}`);

    try
    {
        let debugString = '';
        //req.body.username can be a username or email for this purpose
        if (/@/.test(req.body.username)) {
            user = await User.getByEmail(req.body.username);
            debugString = 'email';
        } else {
            user = await User.getByUsername(req.body.username);
            debugString = 'username';
        }
        if (user)
        {
            console.log(`Found user by ${debugString}: ${req.body.username}`);
            console.log(user);
        }
        else
        {
            console.log('Login error - invalid details');
            res.status(401).json({err});
        }
        
        const authed = await bcrypt.compare(req.body.password, user.password);

        console.log("authed? " + authed)

        if (authed)
        {
            console.log("Auth success, logging in")
            const payload = {username: user.username, email: user.email};
            const sendToken = (err, token) =>
            {
                if (err) {throw new Error ('Token Generation failed')}
                console.log("sending token");
                res.status(200).json({ success:true, id: user.id, token: token})
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
        console.log("something went wrong..");
        res.status(401).json({err});
    }

}


module.exports = { register, login };