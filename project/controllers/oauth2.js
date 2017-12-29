let oauth2orize = require('oauth2orize');
let User = require('../models/user');
let Client = require('../models/client');
let Token = require('../models/token');
let TokenController = require('../controllers/token');
let Code = require('../models/code');
let CodeController = require('../controllers/code');
let Utils = require('../application/utils');

let server = oauth2orize.createServer();

server.serializeClient(function (client, callback) {
    return callback(null, client._id);
});

server.deserializeClient(function (id, done) {
    Client.findOne({ _id: id }, function (err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
});

server.grant(oauth2orize.grant.code(function (client, redirectUri, user, ares, done) {
    // let code = new Code({
    //     value: Utils.uid(16),
    //     clientID: client._id,
    //     redirectUri: redirectUri,
    //     userID: user._id
    // });
    // let code = CodeController.createNewCode(user._id, client._id, redirectUri, client.scope);
    let code = new Code({
        _id: Date.now(),
        value: Utils.uid(16),
        clientID: client._id,
        redirectUri: redirectUri,
        userID: user._id,
        scope: client.scope,
    });
    code.save(function (err) {
        if (err) {
            return done(err);
        }
        done(null, code.value);
    });
}));
server.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, done) {
    Code.findOne({ value: code }, function (err, authCode) {
        if (err) { return done(err); }
        if (authCode === undefined) { return done(null, false); }
        if (client._id !== authCode.clientID) {
            return done(null, false);
        }
        if (redirectUri !== authCode.redirectUri) {
            return done(null, false);
        }
        authCode.remove(function (err) {
            if (err) { return done(err); }
            let token = new Token({
                _id: Date.now(),
                value: Utils.uid(256),
                clientID: authCode.clientID,
                userID: authCode.userID,
                scope: authCode.getScopeString(),
            });
            // let token = TokenController.createNewToken(authCode);
            token.save(function (err) {
                if (err) { return done(err); }
                done(null, token);
            });
        });
    });
}));

// User authorization endpoint
exports.authorization = [
    server.authorization(function (clientID, redirectUri, done) {
        Client.findOne({ _id: clientID, isDeleted: false}, function (err, client) {
            if (err) { return done(err); }
            return done(null, client, redirectUri);
        });
    }),
    function (req, res) {
        res.render('confirm', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
    }
];

// User decision endpoint
exports.decision = [
    server.decision()
];

// Application client token exchange endpoint
exports.token = [
    server.token(),
    server.errorHandler()
];