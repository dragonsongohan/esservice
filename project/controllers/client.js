let Client = require('../models/client');
let Utils = require('../application/utils');
let UserController = require('../controllers/user');

async function findClient(req, user = null) {
    try {
        let clientFind = null;
        let clientID = req.params.clientID ? req.params.clientID : req.body.clientID ? req.body.clientID : null;
        if (clientID) {
            let findObject = {_id: clientID};
            if (user) {
                findObject['userID'] = user._id;
            }
            clientFind = await Client.findOne(findObject);
        } else if (req.body.clientname) {
            let findObject = {name: req.body.clientname};
            if (user) {
                findObject['userID'] = user._id;
            }
            clientFind = await Client.findOne(findObject);
        }
        if (clientFind) {
            return clientFind;
        }
        return null;
    } catch (error) {
        return null;
    }
}
async function postClient(req, res, next) {
    try {
        let user = UserController.getCurrentUser(req);
        let client = await findClient(req);
        let clientname = req.body.clientname;
        if (!clientname) {
            return next(Utils.createError('clientname not found', 400));
        }
        let now = new Date();
        if (!client) {
            client = new Client({
                name: clientname,
                userID: user._id,
                isDeleted: false,
                timeCreate: now,
            });
        } else if (client.isDeleted && client.userID === user._id) {
            client.isDeleted = false;
            client.timeCreate = now;
        } else {
            return next(Utils.createError('Client name exited', 400));
        }
        client = await client.save();
        req.responses.data = Utils.createResponse(client.getBasicInfo());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getClient(req, res, next) {
    let user = UserController.getCurrentUser(req);
    let client = await findClient(req, user);
    if (client) {
        req.responses.data = Utils.createResponse(client.getBasicInfo());
        return next();
    }
    return next(Utils.createError('Not Found', 400));
}
async function deleteClient(req, res, next) {
    try {
        let user = UserController.getCurrentUser(req);
        let client = await findClient(req, user);
        if (client) {
            client.isDeleted = true;
            client = await client.save();
            req.responses.data = Utils.createResponse(client.getBasicInfo());
            return next();
        }
        return next(Utils.createError('Not Found', 400));
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getClients(req, res, next) {
    try {
        let user = UserController.getCurrentUser(req);
        let clients = await Client.find({ userID: user._id , isDeleted: false});
        req.responses.data = Utils.createResponse(clients.map(client => client.getBasicInfo()));
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
};

exports.postClient = postClient;
exports.getClients = getClients;
exports.getClient = getClient;
exports.deleteClient = deleteClient;