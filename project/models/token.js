let mongoose = require('mongoose');

let TokenSchema = new mongoose.Schema({
    _id: { type: Number, required: true, default: getNewID() },
    value: { type: String, required: true },
    userID: { type: Number, required: true },
    clientID: { type: Number, required: false },
    timeCreate: {type: Date, required: true, default: new Date()},
    timeExpired: {type: Date, required: false, default: null},
    scope:{type:String, require: true, default:"*"},
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
        userID: this.userID,
        clientID: this.clientID,
        scope: this.scope,
    }
}
TokenSchema.methods.getBasicInfo = getBasicInfo;
module.exports = mongoose.model('Token', TokenSchema);