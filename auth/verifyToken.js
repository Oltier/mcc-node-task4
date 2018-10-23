const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('mongoose').model('User');

module.exports = (req, res, next) => {
    if (!req.session.hasOwnProperty('token') || !req.session.token) {
        console.error("GET /profile: Token not in the session");
        req.body.auth = false;
        return next();
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(req.session.token, config.secret);
    } catch(err) {
        console.error(`GET /profile: ${err}`);
        console.error("GET /profile: Error on jwt verification");
        req.body.auth = false;
        return next();
    }

    const userId = decodedToken.id || null;

    User.findById(userId)
        .then((user) => {
            if(!user || user._id.toString() !== userId) {
                req.body.auth = false;
                console.error(`GET /profile: User not found for ${user} or userId didn't match: ${user._id} , ${userId}`);
                return next();
            }

            req.body.username = user.username;
            req.body.email = user.email;
            req.body.userId = userId;
            req.body.auth = true;
            return next();
        })
        .catch((err) => {
            console.error(`GET /profile: ${err}`);
            res.sendStatus(500);
        })
};