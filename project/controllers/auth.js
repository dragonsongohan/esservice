let BearerStrategy = require('passport-http-bearer').Strategy;
let LocalStrategy = require('passport-local').Strategy;
let Token = require('../models/token');
let passport = require('passport');
let BasicStrategy = require('passport-http').BasicStrategy;
let User = require('../models/user');
let Client = require('../models/client');
let Utils = require('../application/utils');

let localStrategy = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,//false => (username, password, done)=>{}
},
    function (req, username, password, done) {//(username, password, done)
        User.findOne({ username: username, isDeleted: false }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, 'No user found.');
            user.verifyPassword(password, function (err, isMatch) {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, 'Wrong password');
                }
            });
        });
    }
);

let basicStrategy = new BasicStrategy(
    function (username, password, done) {
        User.findOne({ username: username, isDeleted: false }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, 'No user found.');
            user.verifyPassword(password, function (err, isMatch) {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, 'Wrong password');
                }
            });
        });
    }
);
let clientBasicStrategy = new BasicStrategy(
    function (id, secret, done) {
        Client.findOne({ _id: id, isDeleted: false }, function (err, client) {
            if (err) { return done(err); }
            if (!client) return done(null, false, 'No client found');
            if (client.secret === secret) {
                // let user = User.findById(client.userID).then(function (user) {
                //     done(null, user);
                // }).catch(function (error) {
                //     done(null, false, "client invalid");
                // });
                return done(null, client);
            } else {
                return done(null, false, "Secret wrong");
            }
        });
    }
);
let bearerStrategy = new BearerStrategy(
    function (accessToken, done) {
        Token.findOne({ value: accessToken, isDeleted: false }, function (err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false, "No token found"); }
            User.findOne({ _id: token.userID }, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, "Token invalid"); }
                done(null, user, { scope: token.scope });
            });
        });
    }
);

passport.serializeUser(function (user, done) {
    if (user.userID) {
        done(null, user.userID);//clientID.
    } else {
        done(null, user.id);//userID
    }
});

passport.deserializeUser(
    function (id, done) {
        let user = User.findById(id).then(function (user) {
            done(null, user);
        }).catch(function (error) {
            done(error);
        });
    });

passport.use('local', localStrategy);
passport.use('basic', basicStrategy);
passport.use('client-basic', clientBasicStrategy);
passport.use('bearer', bearerStrategy);

function createOutput(req, res, next) {
    return function (err, user, info) {
        if (err) return next(Utils.createError(err, 500));
        if (!user) return next(Utils.createError("Unauthenticate", 401));
        req.logIn(user, function (err) {
            if (err) return next(Utils.createError("Unauthenticate", 401));
            return next();
        });
    }
}

exports.localAuthenticated = passport.authenticate('local', {});
exports.basicAuthenticated = passport.authenticate('basic', {});
exports.clientBasicAuthenticated = passport.authenticate('client-basic', {});
exports.bearerAuthenticated = passport.authenticate('bearer', {});
exports.basicAndBearerAuthenticated = passport.authenticate(['basic', 'bearer'], {});

exports.isAuthenticated = passport.authenticate([
    // 'local',
    'basic',
    // 'client-basic',
    'bearer',
], {});

// exports.isAuthenticated = function (req, res, next) {
//     passport.authenticate([
//         // 'local',
//         'basic',
//     ], createOutput(req, res, next))(req, res, next);
// };

exports.isClientAuthenticated = passport.authenticate('client-basic', { session: false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });