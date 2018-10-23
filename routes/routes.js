const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');

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

    if(password !== passwordConf) {
        res.status(400);
        res.json({
            message: 'Passwords do not match.'
        });
        return;
    }

    //TODO Do registering
    User.find({username: userName})
        .then((user) => {
            if(user !== null) {
                res.sendStatus(409);
            } else {
                const user = new User();
                user.username = userName;
                user.email = email;
                user.password = password;

                User.create(user)
                    .then(() => {
                        res.status(201);
                        res.json({
                            message: "User has been successfully registered",
                            auth: true,
                            token: '' //TODO Add actual token
                        })
                    })
                    .catch((err) => {
                        console.error(err);
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
    const password = req.body.logpassword;

    const requiredFields = [email, password];
    const missingFields = requiredFields.filter(field => typeof field === 'undefined');

    if (typeof contentType === 'undefined' ||
        contentType !== 'application/json' ||
        missingFields.length > 0) {
        res.status(500);
        res.json({
            message: "All fields required."
        });
        return;
    }

    //TODO Error logic
    res.status(401);
    res.json({
        message: "Wrong email or password."
    });

    //TODO Success logic
    res.redirect('/profile');
});

router.get('/profile', (req, res, next) => {

});

router.get('/logout', (req, res, next) => {
    //TODO Logout logic
    res.redirect('/login');
});

module.exports = router;
