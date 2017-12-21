let oauth2orize = require('oauth2orize')
let User = require('../models/user');
let Client = require('../models/client');
let Token = require('../models/token');
let Code = require('../models/code');

function uid(len) {
    let buf = [];
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charlen = chars.length;
    for (let i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }
    return buf.join('');
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let server = oauth2orize.createServer();

server.serializeClient(function (client, callback) {
    return callback(null, client._id);
});

server.deserializeClient(function (id, callback) {
    Client.findOne({ _id: id }, function (err, client) {
        if (err) {
            return callback(err);
        }
        return callback(null, client);
    });
});

// Register authorization code grant type
server.grant(oauth2orize.grant.code(function (client, redirectUri, user, ares, callback) {
    // Create a new authorization code
    let code = new Code({ 
        value: uid(16),
        clientId: client._id,
        redirectUri: redirectUri,
        userId: user._id
    });

    // Save the auth code and check for errors
    code.save(function (err) {
        if (err) {
            return callback(err);
        }

        callback(null, code.value);
    });
}));

// Exchange authorization codes for access tokens
server.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, callback) {
    Code.findOne({ value: code }, function (err, authCode) {
        if (err) {
            return callback(err);
        }
        if (authCode === undefined) {
            return callback(null, false);
        }
        if (client._id.toString() !== authCode.clientId) {
            return callback(null, false);
        }
        if (redirectUri !== authCode.redirectUri) {
            return callback(null, false);
        }

        // Delete auth code now that it has been used
        authCode.remove(function (err) {
            if (err) {
                return callback(err);
            }

            // Create a new access token
            let token = new Token({
                value: uid(256),
                clientId: authCode.clientId,
                userId: authCode.userId
            });

            // Save the access token and check for errors
            token.save(function (err) {
                if (err) {
                    return callback(err);
                }

                callback(null, token);
            });
        });
    });
}));

// User authorization endpoint
exports.authorization = [
    server.authorization(function (clientId, redirectUri, callback) {

        Client.findOne({ id: clientId }, function (err, client) {
            if (err) {
                return callback(err);
            }

            return callback(null, client, redirectUri);
        });
    }),
    function (req, res) {
        res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
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