let mongoose = require('mongoose');
let Utils = require('../application/utils');
let ClientSchema = new mongoose.Schema({
    _id: { type: Number, required: true, default: getNewID},
    name: { type: String, unique: true, required: true},
    secret: { type: String, required: true, default: getNewSecret},
    userID: { type: Number, required: true },
    timeCreate: {type: Date, required: true, default: new Date()},
    timeExpired: {type: Date, required: false, default: null},
    scope:{type:[], require: true, default:["*"]},
    isDeleted: {type: Boolean, required: true, default: false}
});

function getNewSecret() {
    return Utils.uid(16);
}

function getNewID() {
    return Date.now();
}

function getBasicInfo() {
    return {
        id: this._id,
        name: this.name,
        timeCreate: Utils.exportDate(this.timeCreate),
        timeExpired: Utils.exportDate(this.timeExpired),
        userID: this.userID,
        secret: this.secret,
        scope: this.scope,
    }
}
function getStringDescribeScope() {
    //TODO set string scope describescope
    return 'Full Access';
}
function getScopeString() {
    if (!this.scope) {
        return "*";
    }
    if (typeof(this.scope) === 'string') {
        return this.scope;
    }
    if (Array.isArray(this.scope)) {
        return this.scope.join(",");
    }
}
ClientSchema.methods.getScopeString = getScopeString;
ClientSchema.methods.getStringDescribeScope = getStringDescribeScope;
ClientSchema.methods.getBasicInfo = getBasicInfo;
module.exports = mongoose.model('Client', ClientSchema);