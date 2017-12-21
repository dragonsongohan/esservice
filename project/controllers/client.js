var Client = require('../models/client');

async function getCurrentUser(req) {
    return req.user ? req.user : null;
}

async function findClient(req, user = null) {
    try {
        if (!user) return null;
        let clientFind = null;
        let clientID = req.params.clientID ? req.params.clientID : req.body.clientID ? req.body.clientID : null;
        if (clientID) {
            clientFind = await Client.findOne({
                _id: clientID, userID: user._id
            });
            if (clientFind) {
                return clientFind;
            }
            return null;
        }
        if (req.body.clientname) {
            clientFind = await Client.findOne({
                name: req.body.clientname, userID: user._id
            });
            if (clientFind) {
                return clientFind;
            }
            return null;
        }
    } catch (error) {
        return null;
    }
}
async function postClients(req, res) {
    try {
        let name = req.body.name;
        let user = await getCurrentUser(req);
        if (!name || !user) {
            return res.status(400).json({ code: 400, message: 'Request Invalid' });
        }
        let userID = user._id;
        let client = await Client.find({ name: name, userId: userID });
        if (client) {
            if (client.isDeleted) {
                client.isDeleted = false;
            } else {
                return res.status(400).json({ code: 400, message: 'Client name exited for user' });
            }
        } else {
            client = new Client({
                name: name,
                userID: userID,
                isDeleted: false,
            });
        }
        client = await client.save();
        return res.json({
            code: 200,
            message: 'New client added!',
            data: client
        });
    } catch (error) {
        return res.status(500).json({ code: 500, message: 'Server Error', data: null, error: error.message });
    }
};

async function getClient(req, res) {
    let user = await getCurrentUser(req);
    if (!user) {
        return res.status(400).json({ code: 400, message: 'Request Invalid' });
    }
    let client = await findClient(req, user);
    if (client) {
        return res.status(200).json({ code: 200, message: '', data: client });
    }
    return res.status(400).json({ code: 400, message: 'Not Found' });
}
async function deleteClient(req, res) {
    try {
        let user = await getCurrentUser(req);
        if (!user) {
            return res.status(400).json({ code: 400, message: 'Request Invalid' });
        }
        let client = await findClient(req, user);
        if (client) {
            client.isDeleted = true;
            client = await client.save();
            return res.status(200).json({ code: 200, message: '', data: client });
        }
        return res.status(400).json({ code: 400, message: 'Not Found' });
    } catch (err) {
        return res.status(500).json({ code: 500, message: '' });
    }
}
async function getClients(req, res) {
    try {
        let user = await getCurrentUser(req);
        if (!user) {
            return res.status(400).json({ code: 400, message: 'Request Invalid' });
        }
        let userID = user._id;
        let clients = await Client.find({ userId: userID });
        return res.json({ code: 200, message: 'Success', data: clients });
    } catch (error) {
        return res.status(500).json({ code: 500, message: 'Server Error', data: null, error: error.message });
    }
};

exports.postClients = postClients;
exports.getClients = getClients;
exports.getClient = getClient;
exports.deleteClient = deleteClient;