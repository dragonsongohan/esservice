let Token = require('../models/token');
let Utils = require('../application/utils');
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

async function deleteToken(tokenID) {
    try {
        let token = await Token.findOne({_id: tokenID});
        if (!token || token.isDeleted) {
            return true;
        } else {
            token.isDeleted = true;
        }
        token = await token.save();
        return !!token;
    } catch (error) {
        return false;
    }
}

exports.createNewToken = createNewToken;
exports.deleteToken = deleteToken;