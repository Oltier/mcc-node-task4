const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('mongoose').model('User');

module.exports = (req, res, next) => {
    if (!req.session.hasOwnProperty('token') || !req.session.token) {
        console.error("GET /profile: Token not in the session");
        return res.sendStatus(401)
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(req.session.token, config.secret);
    } catch(err) {
        console.error(`GET /profile: ${err}`);
        console.error("GET /profile: Error on jwt verification");
        return res.sendStatus(401);
    }

    const userId = decodedToken.id || null;

    User.findById(userId)
        .then((user) => {
            if(!user || user._id !== userId) {
                console.error(`GET /profile: User not found for ${user} or userId didn't match: ${user._id} , ${userId}`);
                return res.sendStatus(401);
            }

            req.body.username = user.username;
            req.body.email = user.email;
            req.body.userId = userId;
            next();
        })
        .catch((err) => {
            console.error(`GET /profile: ${err}`);
            res.sendStatus(500);
        })
};