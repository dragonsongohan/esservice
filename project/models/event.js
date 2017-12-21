//Action with trigger(type, data) for user/group have scheduleID.
let mongoose = require('mongoose');
let Utils = require('../application/utils');
let ContextEnum = {
    1: 'User',
    10: 'Group',
    100: 'System',
};

let EventSchema = new mongoose.Schema({
    _id: { type: Number, default: getNewID},
    // index: {type: Number},
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
    groupEventID: { type: Number, default: Date.now},
    eventImageID: {type: String, required: false, default: null},
    location: {type: String, required: false, default: ''},
    contextData: {},
    context: {type: Number, default: 1},
    isAllDay: {type: Boolean, default: false},
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    timeCreate: { type: Date, required: false, default: new Date(), },
    timeUpdate: { type: Date, required: false, default: new Date(), },
    isDeleted: { type: Boolean, required: true, default: false, },
});

EventSchema.pre('save', function (callback) {
    let _this = this;
    _this.timeUpdate = new Date();
    return callback();
});

function getBasicInfo() {
    return {
        id:  this._id,
        title: this.title,
        content: this.content,
        eventImageID: this.eventImageID,
        userCreate: {
            timeUpdate: Utils.exportDate(this.userCreate.timeUpdate),
            profileImageID: this.userCreate.profileImageID,
            lastName: this.userCreate.lastName,
            firstName: this.userCreate.firstName,
            id: this.userCreate.id,
        },
        context: this.context,
        contextData: this.contextData,
        groupEventID: this.groupEventID,
        isGroupContext: ContextEnum[this.context] === 'Group',
        isAllDay: this.isAllDay,
        location: this.location,
        startTime: Utils.exportDate(this.startTime),
        endTime: Utils.exportDate(this.endTime),
        timeCreate: Utils.exportDate(this.timeCreate),
    }
}
function isGroupContext() {
    return ContextEnum[this.context] === 'Group';
}
function isUserContext() {
    return ContextEnum[this.context] === 'User';
}
function isSystemContext() {
    return ContextEnum[this.context] === 'System';
}

function setSystemContext() {
    this.context = 100;
    return this;
}
function setGroupContext(contextID) {
    this.context = 10;
    this.contextID = contextID;
    return this;
}
function setContext(context) {
    if (isInvalidContext(context)) {
        this.context = context;
        return this;
    }
    return null;
}
function isInvalidContext(context) {
    return !!ContextEnum[context];
}

function getNewID() {
    return Date.now();
}

EventSchema.methods.getBasicInfo = getBasicInfo;
EventSchema.methods.isGroupContext = isGroupContext;
EventSchema.methods.isUserContext = isUserContext;
EventSchema.methods.isSystemContext = isSystemContext;
EventSchema.methods.setContext = setContext;
EventSchema.statics.isInvalidContext = isInvalidContext;

EventSchema.statics.getUserContext = () => 1;
EventSchema.statics.getGroupContext = () => 10;
EventSchema.statics.getSystemContext = () => 100;

EventSchema.statics.getNewID = getNewID;
module.exports = mongoose.model('Event', EventSchema);