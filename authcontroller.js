const passport = require('passport');
const User = require('../models/user');

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/gallery');
        });
    })(req, res, next);
};


exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};
