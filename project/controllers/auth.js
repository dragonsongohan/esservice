let BearerStrategy = require('passport-http-bearer').Strategy
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
        passReqToCallback : true,//false => (username, password, done)=>{}
    },
    function (req, username, password, done) {//(username, password, done)
        User.findOne({username: username, isDeleted: false}, function(err, user){
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
    function (username, password, callback) {
        User.findOne({username: username}, function (err, user) {
            if (err) {
                return callback(err);
            }
            if (!user) {
                return callback(null, false);
            }
            user.verifyPassword(password, function (err, isMatch) {
                if (err) {
                    return callback(err);
                }
                return callback(null, isMatch ? user : false);
            });
        });
    }
);
let clientBasicStrategy = new BasicStrategy(
    function (username, password, callback) {
        Client.findOne({id: username}, function (err, client) {
            if (err) {
                return callback(err);
            }
            if (!client || client.secret !== password) {
                return callback(null, false);
            }
            return callback(null, client);
        });
    }
);
let bearerStrategy = new BearerStrategy(
    function (accessToken, callback) {
        Token.findOne({value: accessToken}, function (err, token) {
            if (err) {
                return callback(err);
            }
            if (!token) {
                return callback(null, false);
            }

            User.findOne({_id: token.userId}, function (err, user) {
                if (err) {
                    return callback(err);
                }
                if (!user) {
                    return callback(null, false);
                }
                callback(null, user, {scope: '*'});
            });
        });
    }
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
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

exports.localAuthenticated = passport.authenticate('local', {});
exports.basicAuthenticated = passport.authenticate('basic', {});
exports.clientBasicAuthenticated = passport.authenticate('client-basic', {});
exports.bearerAuthenticated = passport.authenticate('bearer', {});
exports.basicAndBearerAuthenticated = passport.authenticate(['basic', 'bearer'], {});

exports.isAuthenticated = function (req, res, next) {
    passport.authenticate('local',
        function(err, user, info) {
        if (err) return next(Utils.createError(err, 500));
        if (!user) return next(Utils.createError(info, 400));
        req.logIn(user, function(err){
            if (err) return next(Utils.createError(info, 400));
            return next();
        });
    })(req, res, next);
};
// exports.isAuthenticated = passport.authenticate([
//     'local',
//     // 'basic',
//     // 'bearer'
// ], {});
// exports.isAuthenticated = passport.authenticate('local');

exports.isClientAuthenticated = passport.authenticate('client-basic', { session: false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });