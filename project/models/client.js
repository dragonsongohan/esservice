var mongoose = require('mongoose');
var utils = require('../application/utils');
var ClientSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: new Date()},
    name: { type: String, required: true, index: true},
    secret: { type: String, required: true, default: getNewSecret()},
    userId: { type: String, required: true },
    timeCreate: {type: Date, required: true, default: new Date()},
    isDeleted: {type: Boolean, required: true, default: false}
});

function getNewSecret() {
    return utils.randomString();
}
module.exports = mongoose.model('Client', ClientSchema);