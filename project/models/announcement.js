let mongoose = require('mongoose');
let Utils = require('../application/utils');
let AnnouncementSchema = new mongoose.Schema({
    _id: { type: Number, default: getNewID},
    title: { type: String, required: true, default: 'No Title' },
    content: { type: String, required: true, default: 'No Content' },
    userCreate: {
        type: {
            _id: Number,
            firstName: String,
            lastName: String,
            profileImageID: String,
            timeUpdate: Date,
        },
        required: true,
        default: null
    },
    timeCreate: { type: Date, required: false, default: new Date(), },
    timeUpdate: { type: Date, required: false, default: new Date(), },
    isDeleted: { type: Boolean, required: true, default: false, },
});

AnnouncementSchema.pre('save', function (callback) {
    let _this = this;
    _this.timeUpdate = new Date();
    return callback();
});

function getBasicInfo() {
    return {
        id:  this._id,
        title: this.title,
        content: this.content,
        userCreate: {
            timeUpdate: Utils.exportDate(this.userCreate.timeUpdate),
            profileImageID: this.userCreate.profileImageID,
            lastName: this.userCreate.lastName,
            firstName: this.userCreate.firstName,
            id: this.userCreate.id,
        },
        timeCreate: Utils.exportDate(this.timeCreate),
    }
}
function getNewID() {
    return Date.now();
}

AnnouncementSchema.methods.getBasicInfo = getBasicInfo;
AnnouncementSchema.statics.getNewID = getNewID;

module.exports = mongoose.model('Announcement', AnnouncementSchema);