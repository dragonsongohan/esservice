let mongoose = require('mongoose');
let Utils = require('../application/utils');
let ConfigSchema = new mongoose.Schema({
    _id: {type: Number, required: true, default: getNewID()},
    userID: { type: Number, required: true },
    timeCreate: {type: Date, required: true, default: new Date()},
    config: {type: {}, require: true, default: {inited: false}},
    isDeleted: {type: Boolean, required: true, default: false},
});

function getNewID() {
    return Date.now();
}

function getBasicInfo() {
    return {
        id: this._id,
        timeCreate: Utils.exportDate(this.timeCreate),
        userID: this.userID,
        clientID: this.clientID,
        config: this.config,
    }
}
function setInited(inited) {
    let booleanValue = !!inited;
    if (getInited() === !!inited) {
        return booleanValue;
    }
    this.config.inited = booleanValue;
    return booleanValue;
}

function getInited() {
    if (!this.config) {
        this.config = getDefaultConfig();
        this.config.inited = false;
    }
    if (this.config.inited) {
        return true;
    } else {
        this.config.inited = false;
    }
    return this.config.inited;
}

function getDefaultConfig() {
    return {};
}

ConfigSchema.methods.getBasicInfo = getBasicInfo;
ConfigSchema.methods.getInited = getInited;
ConfigSchema.methods.setInited = setInited;
ConfigSchema.statics.getNewID = getNewID;
ConfigSchema.statics.getDefaultConfig = getDefaultConfig;
module.exports = mongoose.model('Config', ConfigSchema);