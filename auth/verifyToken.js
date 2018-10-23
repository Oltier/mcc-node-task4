const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('mongoose').model('User');

module.exports = (req, res, next) => {
    if (!req.session.hasOwnProperty('token') || !req.session.token) {
        return res.sendStatus(401)
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(req.session.token, config.secret);
    } catch(err) {
        console.log(err);
        return res.sendStatus(401);
    }

    const userId = decodedToken.id || null;

    User.findById(userId)
        .then((user) => {
            if(!user || user._id !== userId) {
                return res.sendStatus(401);
            }

            req.body.username = user.username;
            req.body.email = user.email;
            req.body.userId = userId;
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
};