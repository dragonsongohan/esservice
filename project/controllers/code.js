let Code = require('../models/code');
let Utils = require('../application/utils');
async function createNewCode(userID, clientID, redirectUri, scope = ["*"]) {
    try {
        if (!userID || !clientID) {
            return null;
        }
        let code = new Code({ 
            value: Utils.uid(16),
            clientID: clientID,
            redirectUri: redirectUri,
            userID: userID,
            scope: scope,
        });

        code = await code.save();
        return code;
    } catch (error) {
        return null;
    }
}

async function deleteCode(codeID) {
    try {
        let code = await Code.findOne({_id: codeID});
        if (!code || code.isDeleted) {
            return true;
        } else {
            code.isDeleted = true;
        }
        code = await code.save();
        return !!code;
    } catch (error) {
        return false;
    }
}

exports.createNewCode = createNewCode;
exports.deleteCode = deleteCode;