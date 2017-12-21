let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
let Utils = require('../application/utils');
let GenderEnum = {
    0: "None",
    1: "Male",
    2: "Female"
};
let TypeUserEnum = {
    0: "Normal",
    10: "Teacher",
    100: "System"
};
let StatusEnum = {
    0: "New",
    10: "Normal"
};
let UserSchema = new mongoose.Schema(
    {
        _id: { type: Number, default: getNewID },// id: { type: Number, unique: true, require: true, index: true, default: Date.now() },
        username: { type: String, unique: true, required: true, },
        password: { type: String, required: true },
        firstName: { type: String, required: true, },
        lastName: { type: String, required: true, },
        typeuser: { type: Number, require: false, default: 0, min: 0, max: 1000 },
        email: { type: String, required: false, default: null },//, unique: true},
        phone: { type: String, required: false, default: null },// unique: true},
        profileImageID: { type: String, required: false, default: null, },
        coverImageID: { type: String, require: false, default: null, },
        birthday: { type: Date, required: false, default: null, },
        gender: { type: Number, required: false, default: 0, min: 0, max: 2 },
        about: { type: String, required: false, default: "", },
        quote: { type: String, required: false, default: "", },
        nickname: { type: [String], required: false, },
        skills: {
            type: [{
                _id: { type: Number, default: getNewID },
                name: String,
                description: String,
                isRemoved: {type: Boolean, default: false}
            }],
            required: false,
            default: [],
        },
        worked: {
            type: [{
                _id: { type: Number, default: getNewID },
                startTime: Date,
                endTime: { type: Date, default: null },
                where: String,
                description: String,
                isRemoved: {type: Boolean, default: false}
            }],
            required: false,
            default: [],
        },
        language: {
            type: [{
                _id: { type: Number, default: getNewID },
                code: String,
                text: String,
                isDefault: {type: Boolean, default: false},
                isRemoved: {type: Boolean, default: false}
            }],
            required: false,
            default: [{ code: 'en-US', text: 'English(US)', isDefault: true }]
        },
        lifeEvent: {
            type: [{
                _id: { type: Number, default: getNewID },
                startTime: Date,
                endTime: { type: Date, default: null },
                description: String,
                isRemoved: {type: Boolean, default: false}
            }],
            required: false,
            default: [],
        },
        classs: {
            type: [{
                _id: Number,
                name: String,
                profileImageID: String,
                isRemoved: { type: Boolean, default: false, },
                timeCreate: { type: Date, default: new Date() },
                timeUpdate: { type: Date, default: new Date() },
            }],
            required: false,
            default: [],
        },
        friends: {
            type: [{
                _id: Number,
                firstName: String,
                lastName: String,
                profileImageID: String,
                isRemoved: { type: Boolean, default: false, },
                timeCreate: { type: Date, default: new Date() },
                timeUpdate: { type: Date, default: new Date() },
            }],
            required: false,
            default: [],
        },
        status: { type: Number, required: false, default: 0, min: 0, max: 1000 },
        location: { type: String, required: false, default: "" },
        isDeleted: { type: Boolean, require: false, default: false, },
        requests: {
            type: [{
                _id: Number,
                firstName: String,
                lastName: String,
                profileImageID: String,
                isRemoved: { type: Boolean, default: false, },
                timeCreate: { type: Date, default: new Date() },
                timeUpdate: { type: Date, default: new Date() },
            }],
            require: true,
            default: [],
        },
        requesteds: {
            type: [{
                _id: Number,
                firstName: String,
                lastName: String,
                profileImageID: String,
                isRemoved: { type: Boolean, default: false, },
                timeCreate: { type: Date, default: new Date() },
                timeUpdate: { type: Date, default: new Date() },
            }],
            require: true,
            default: [],
        },
        classrequests: {
            type: [{
                _id: Number,
                name: String,
                profileImageID: String,
                isRemoved: { type: Boolean, default: false, },
                timeCreate: { type: Date, default: new Date() },
                timeUpdate: { type: Date, default: new Date() },
            }],
            require: true,
            default: [],
        },
        timeCreate: {
            type: Date,
            default: new Date(),
        },
        timeUpdate : {
            type: Date,
            default: new Date(),
        },
    });
UserSchema.pre('save', function (callback) {
    let user = this;
    user.timeUpdate = new Date();
    if (!user.isModified('password')) return callback();
    bcrypt.genSalt(5, (err, salt) => {
        if (err) return callback(err);
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return callback(err);
            user.password = hash;
            return callback();
        });
    });
});

function comparePassword(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        return callback(null, isMatch);
    });
}
function addUserInArray(new_user, arrays) {
    if (!new_user) return null;
    let user = arrays.find(u => u._id === new_user._id);
    let timeUpdate = new Date();
    if (!user) {
        user = {_id: new_user._id};
        user.timeUpdate = timeUpdate;
        user.firstName = new_user.firstName;
        user.lastName = new_user.lastName;
        user.profileImageID = new_user.profileImageID;
        user.isRemoved = false;
        arrays.push(user);
    } else {
        user.timeUpdate = timeUpdate;
        user.firstName = new_user.firstName;
        user.lastName = new_user.lastName;
        user.profileImageID = new_user.profileImageID;
        if (user.isRemoved) {
            user.isRemoved = false;
            user.timeCreate = timeUpdate;
        }
    }
    return user;
}
function removeUserFromArray(remove_user, arrays) {
    if (!remove_user) return null;
    let user = arrays.find(u => u._id === remove_user._id);
    if (user) user.isRemoved = true;
    return user;
}
function addGroupInArray(new_group, arrays) {
    if (!new_group) return null;
    let timeUpdate = new Date();
    let group = arrays.find(g => g._id === new_group._id);
    if (!group) {
        group = {_id: new_group._id};
        group.isRemoved = false;
        group.timeUpdate = timeUpdate;
        group.name = new_group.name;
        group.profileImageID = new_group.profileImageID;
        arrays.push(group);
    } else {
        group.timeUpdate = timeUpdate;
        group.name = new_group.name;
        group.profileImageID = new_group.profileImageID;
        if (group.isRemoved) {
            group.isRemoved = false;
            group.timeCreate = timeUpdate;
        }
    }
    return group;
}
function removeGroupFromArray(remove_group, arrays) {
    if (!remove_group) { return null; }
    let group = arrays.find(g => g._id === remove_group._id);
    if (group) group.isRemoved = true;
    return group;
}

function getFriends() {
    return this.friends.filter(friend => friend.isRemoved === false).map(friend => ({
        _id: friend._id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        profileImageID: friend.profileImageID,
        timeCreate: Utils.exportDate(friend.timeCreate),
    }));
}
function addFriend(user, isUpdateReference = true) {
    if (!user) { return null; }
    return addUserInArray(user, this.friends) ? (isUpdateReference ? user.addFriend.call(user, this, false) : user) : null;
}
function removeFriend(user, isUpdateReference = true) {
    if (!user) return null;
    return removeUserFromArray(user, this.friends) ? (isUpdateReference ? user.removeFriend.call(user, this, false) : user) : null;
}
function getRequests() {
    return this.requests.filter(request => request.isRemoved === false).map(request => ({
        _id: request._id,
        firstName: request.firstName,
        lastName: request.lastName,
        profileImageID: request.profileImageID,
        timeCreate: Utils.exportDate(request.timeCreate),
    }));
}
function addRequest(user) {
    return addUserInArray(user, this.requests) ? user.addRequested.call(user, this) ? user : null : null;
}
function removeRequest(user) {
    return removeUserFromArray(user, this.requests) ? user.removeRequested.call(user, this) ? user : null : null;
}
function getRequesteds() {
    return this.requesteds.filter(requested => requested.isRemoved === false).map(requested => ({
        _id: requested._id,
        firstName: requested.firstName,
        lastName: requested.lastName,
        profileImageID: requested.profileImageID,
        timeCreate: Utils.exportDate(requested.timeCreate),
    }));
}
function addRequested(user) {
    return addUserInArray(user, this.requesteds) ? user : null;
}
function removeRequested(user) {
    return removeUserFromArray(user, this.requesteds) ? user : null;
}
function confirmRequested(user) {
    return (addFriend(user, true) && removeRequested(user)) ? user : null;
}
function getClassRequests() {
    return this.classrequests.filter(request => request.isRemoved === false).map(request => ({
        id: request.id,
        name: request.name,
        profileImageID: null,
    }));
}
function addClassRequest(new_group, isUpdateReference = false) {
    if (!addGroupInArray(new_group, this.classrequests)) {
        return null;
    }
    if (!isUpdateReference) {
        return new_group;
    }
    return new_group.addRequested.call(new_group, this) ? new_group : null
}
function removeClassRequest(remove_group, isUpdateReference = false) {
    if (!removeGroupFromArray(remove_group, this.classrequests)) {
        return null;
    }
    if (!isUpdateReference) {
        return remove_group;
    }
    return remove_group.removeRequested.call(remove_group, this, false);
}
function addToClass(group) {
    return addGroupInArray(group, this.classs) ? group : null;
}
function removeFromClass(group) {
    return (removeGroupFromArray(group, this.classs) && group.removeMember(this, false)) ? group : null;
    // return removeGroupFromArray(group, this.classs) ? group : null;
}
function getClasss() {
    return this.classs.filter(classItem => classItem.isRemoved === false).map(classItem => ({
        id: classItem.id,
        name: classItem.name,
        profileImageID: classItem.profileImageID,
    }));
}

function getClasssID() {
    return this.classs.filter(classItem => classItem.isRemoved === false).map(classItem => classItem.id);
}

function validateUserName(username, isRequired = true) {
    if (!username) return !isRequired;
    let re = /^([a-zA-Z\-0-9\.\_]{1,20})$/;
    if (re.test(username)) {return true; }
    if (Utils.validateEmail(username)) { return true; }
    return Utils.validatePhoneNumber(username);
}
function validateGender(gender, isRequired = false) {
    return gender ? GenderEnum[gender] : !isRequired;
}
function validateTypeUser(typeUser, isRequired = false) {
    return typeUser ? TypeUserEnum[typeUser] : !isRequired;
}
function validateStatus(status, isRequired = false) {
    return status ? StatusEnum[status] : !isRequired;
}
function validateInputInfo(inputInfo, checkRequired = false) {
    if (!inputInfo) return [];
    let message = [];
    //---------- REQUIRED --------------
    if (!(validateUserName(inputInfo.username, checkRequired))) {
        message.push("UserName Invalid Format");
    }
    if (!Utils.validateStringLength(inputInfo.firstName, 2, 20, checkRequired)) {
        message.push("FirstName Invalid Format");
    }
    if (!Utils.validateStringLength(inputInfo.lastName, 2, 20, checkRequired)) {
        message.push("LastName Invalid Format");
    }
    if (!Utils.validateStringLength(inputInfo.password, 5, 20, checkRequired)) {
        message.push("Password Invalid Format");
    }
    //------------ NOT REQUIRED ----------------
    if (!Utils.validateStringLength(inputInfo.about, 0, 200, false)) {
        message.push("About Invalid Format");
    }
    if (!Utils.validateStringLength(inputInfo.quote, 0, 100, false)) {
        message.push("Quote Invalid Format");
    }
    if (inputInfo.nickname) {
        if (!Utils.getStringArray(inputInfo.nickname)) {
            message.push("NickName Invalid Format");
        }
    }
    if (inputInfo.language) {
        if (!getArrayLanguage(inputInfo.language)) {
            message.push("Language Invalid Format");
        }
    }
    if (!Utils.validateEmail(inputInfo.email, false)) {
        message.push("Email Invalid Format");
    }
    if (!Utils.validatePhoneNumber(inputInfo.phone, false)) {
        message.push("Phone Invalid Format");
    }
    if (!validateGender(inputInfo.gender, false)) {
        message.push("Gender Invalid Format");
    }
    if (!validateTypeUser(inputInfo.typeuser, false)) {
        message.push("TypeUser Invalid Format");
    }
    if (!validateStatus(inputInfo.status, false)) {
        message.push("Status Invalid Format");
    }
    if (inputInfo.birthday) {
        if (!getBirthDate(inputInfo.birthday)) {
            message.push("Birthday Invalid Format");
        }
    }
    return message;
}

function getGenderInfo(enum_id) {
    return { enum_id: enum_id, text: GenderInfo[enum_id] };
}
function getTypeUserInfo(enum_id) {
    return { enum_id: enum_id, text: TypeUserEnum[enum_id] };
}
function getArrayLanguage(languageString) {
    try {
        let [...languages] = JSON.parse(languageString);
        let data = [];
        for (let index = 0; index < languages.length; index++) {
            let { code = 'en-US', text = 'English(US)', isDefault = false,} = languages[index];
            data.push({
                _id: index,
                code: code,
                text: text,
                isDefault: isDefault ? isDefault: false,
            });
        }
        return data;
    } catch (error) {
        return null;
    }
}
function getBirthDate(dateString) {
    return Utils.parseDate(dateString);
}
function getNewID() {
    return Date.now();
}
function verifyPassword(password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => err ? cb(err) : cb(null, isMatch));
}
function getInfo(params) {
    if (!params) {
        return getBasicInfo.call(this);
    }
    let o = {};
    let ignoreField = ['password', 'isDeleted', 'classs', 'friends'];
    for (let param in params) {
        if (ignoreField.indexOf(param) > -1) {
            continue;
        }
        let field = this[param];
        if (field) {
            o[param] = field;
        }
    }
    return o;
}
function getBasicInfo() {
    return {
        id: this.id,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        typeuser: { enum_id: this.typeuser, text: TypeUserEnum[this.typeuser] },
        isTeacher: TypeUserEnum[this.typeuser] === 'Teacher',
        email: this.email,
        birthday: Utils.exportDate(this.birthday),
        phone: this.phone,
        gender: { enum_id: this.gender, text: GenderEnum[this.gender] },
        about: this.about,
        quote: this.quote,
        location: this.location,
        profileImageID: this.profileImageID,
        coverImageID: this.coverImageID,
    }
}

function isNormalUser() {
    return TypeUserEnum[this.typeuser] === 'Normal';
}
function isTeacher() {
    return TypeUserEnum[this.typeuser] === 'Teacher';
}
function isSystem() {
    return TypeUserEnum[this.typeuser] === 'System';
}
/*-------------------------------------- */
UserSchema.statics.GenderInfo = getGenderInfo;
UserSchema.statics.TypeUserInfo = getTypeUserInfo;
UserSchema.statics.validateUserName = validateUserName;
UserSchema.statics.validateGender = validateGender;
UserSchema.statics.validateTypeUser = validateTypeUser;
UserSchema.statics.validateStatus = validateStatus;
UserSchema.statics.validateInputInfo = validateInputInfo;
UserSchema.statics.getArrayLanguage = getArrayLanguage;
UserSchema.statics.getBirthDate = getBirthDate;
UserSchema.statics.getNewID = getNewID;

UserSchema.methods.verifyPassword = verifyPassword;
UserSchema.methods.getBasicInfo = getBasicInfo;
UserSchema.methods.comparePassword = comparePassword;
UserSchema.methods.getInfo = getInfo;
UserSchema.methods.isNormalUser = isNormalUser;
UserSchema.methods.isTeacher = isTeacher;
UserSchema.methods.isSystem = isSystem;

UserSchema.methods.addFriend = addFriend;
UserSchema.methods.removeFriend = removeFriend;
UserSchema.methods.addRequest = addRequest;
UserSchema.methods.removeRequest = removeRequest;
UserSchema.methods.addRequested = addRequested;
UserSchema.methods.removeRequested = removeRequested;
UserSchema.methods.confirmRequested = confirmRequested;

UserSchema.methods.addClassRequest = addClassRequest;
UserSchema.methods.removeClassRequest = removeClassRequest;

UserSchema.methods.addToClass = addToClass;
UserSchema.methods.removeFromClass = removeFromClass;
UserSchema.methods.getClasss = getClasss;
UserSchema.methods.getClassRequests = getClassRequests;
UserSchema.methods.getFriends = getFriends;
UserSchema.methods.getRequests = getRequests;
UserSchema.methods.getRequesteds = getRequesteds;
UserSchema.methods.getClasssID = getClasssID;

module.exports = mongoose.model('User', UserSchema); 