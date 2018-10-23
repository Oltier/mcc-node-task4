const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const config = require('../config');

const User = mongoose.model('User');

const verifyToken = require('../auth/verifyToken');

router.get('/register', (req, res, next) => {
    res.json({
        message: 'Register User Page'
    });
});

router.post('/register', (req, res, next) => {
    const contentType = req.headers['content-type'];

    const email = req.body.email;
    const userName = req.body.username;
    const password = req.body.password;
    const passwordConf = req.body.passwordConf;

    const requiredFields = [email, userName, password, passwordConf];
    const missingFields = requiredFields.filter(field => typeof field === 'undefined');

    if (typeof contentType === 'undefined' ||
        contentType !== 'application/json' ||
        missingFields.length > 0) {
        res.sendStatus(500);
        return;
    }

    if (password !== passwordConf) {
        res.status(400);
        res.json({
            message: 'Passwords do not match.'
        });
        return;
    }

    User.findOne({username: userName})
        .then((user) => {
            if (user) {
                console.error(`POST /register: ${user} with username: ${userName}`);
                res.sendStatus(409);
            } else {
                const user = new User();
                user.username = userName;
                user.email = email;
                user.password = password;

                User.create(user)
                    .then(() => {
                        req.session.token = generateJwt(user);
                        res.json({
                            message: "User has been successfully registered",
                            auth: true,
                            token: req.session.token
                        })
                    })
                    .catch((err) => {
                        console.error(`POST /register: ${err}`);
                        res.status(500);
                        res.json({
                            message: "Error while registering user."
                        })
                    })
            }
        });
});

router.get('/login', (req, res, next) => {
    res.json({
        message: "Login Page"
    });
});

router.post('/login', (req, res, next) => {
    const contentType = req.headers['content-type'];
    const email = req.body.logemail;
    const password = req.body.logpassword.trim();

    const requiredFields = [email, password];
    const missingFields = requiredFields.filter(field => typeof field === 'undefined');

    if (typeof contentType === 'undefined' ||
        contentType !== 'application/json' ||
        missingFields.length > 0) {
        res.status(400);
        res.json({
            message: "All fields required."
        });
        return;
    }

    User.findOne({email: email})
        .then((user) => {
            if (!user) {
                console.error(`POST /login: User not found with email: ${email}`);
                console.error(`POST /login ${user}`);
                res.status(401).json({
                    message: "Wrong email or password."
                });
                return;
            }

            user.comparePassword(password, (err, isMatch) => {
                if (err) {
                    console.error(`POST /login: ${err}`);
                    res.sendStatus(500);
                    return;
                }

                if (isMatch) {
                    req.session.token = generateJwt(user);
                    res.redirect('/profile');
                } else {
                    console.error("POST /login: Passwords didn't match.");
                    res.status(401).json({
                        message: "Wrong email or password."
                    });
                }
            });
        });
});

router.get('/profile', verifyToken, (req, res, next) => {
    const username = req.body.username || null;
    const email = req.body.email || null;
    const token = req.session.token || null;
    const userId = req.body.userId || null;
    const auth = req.body.auth || null;

    res.json({
        message: "User logged in!",
        username,
        email,
        auth,
        token,
        userId
    })
});

router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if(err) console.error(`GET /logout: ${err}`);
    });
    res.redirect('/login');
});

function generateJwt(user) {
    const payload = {
        id: user._id
    };
    const expiration = {
        expiresIn: '24h'
    };

    return jwt.sign(payload, config.secret, expiration);
}

module.exports = router;
