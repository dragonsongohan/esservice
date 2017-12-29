let Token = require('../models/token');
let Utils = require('../application/utils');
let UserController = require('../controllers/user');
async function createNewToken(code) {
    try {
        if (!code || code.isDeleted) {
            return null;
        }
        let token = new Token({
            value: Utils.uid(256),
            clientID: code.clientID,
            userID: code.userID,
            scope: code.getScopeString(),
        });
        token = await token.save();
        return token;
    } catch (error) {
        return null;
    }
}

async function deleteToken(req, res, next) {
    try {
        let currentUser = UserController.getCurrentUser(req);
        let tokenValue = req.body.token;
        if (!tokenValue) {
            return next(Utils.createError('Token request not found', 400));
        }
        let token = await Token.findOne({isDeleted: false, value: tokenValue});
        if (!token) {
            return next(Utils.createError('Token not exited or deleted', 400));
        }
        if (token.userID !== currentUser._id) {
            return next(Utils.createError('User not permit', 400));
        }
        if (!token || token.isDeleted) {
            return true;
        } else {
            token.isDeleted = true;
        }
        token = await token.save();
        req.responses.data = Utils.createResponse();
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function deleteTokens(req, res, next) {
    try {
        let currentUser = UserController.getCurrentUser(req);
        let count = Token.remove({userID: currentUser._id});
        req.responses.data = Utils.createResponse();
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
exports.createNewToken = createNewToken;
exports.deleteToken = deleteToken;
exports.deleteTokens = deleteTokens;