let mongoose = require('mongoose');

let CodeSchema = new mongoose.Schema({
    _id: {type: Number, required: true, default: getNewID()},
    value: { type: String, required: true },
    redirectUri: { type: String, required: true },
    userID: { type: Number, required: true },
    clientID: { type: Number, required: true },
    timeCreate: {type: Date, required: true, default: new Date()},
    timeExpired: {type: Date, required: false, default: null},
    scope:{type:[], require: true, default:["*"]},
    isDeleted: {type: Boolean, required: true, default: false},
});

function getNewID() {
    return Date.now();
}

function getBasicInfo() {
    return {
        id: this._id,
        value: this.value,
        timeCreate: Utils.exportDate(this.timeCreate),
        timeExpired: Utils.exportDate(this.timeExpired),
        redirectUri: this.redirectUri,
        userID: this.userID,
        clientID: this.clientID,
        scope: this.scope,
    }
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
CodeSchema.methods.getScopeString = getScopeString;
CodeSchema.methods.getBasicInfo = getBasicInfo;
module.exports = mongoose.model('Code', CodeSchema);