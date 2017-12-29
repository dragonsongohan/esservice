let mongoose = require('mongoose');
let Utils = require('../application/utils');
let TypeMemberEnum = {
    // 0: "Guest",
    1: "Normal",
    10: "Admin",
    // 100: "Owner",
    // 1000: "System",
};
let ScopePostEnum = {
    0: "Public",//All user.
    10: "Protected", //All member
    100: "Private",//list allow member.
};
let TypeGroupEnum = {
    0: "Basic",
    1: "Primary",
    10: "Secondary",
    100: "University",
};
let StatusEnum = {
    0: "New",
    10: "Normal"
};
let GroupSchema = new mongoose.Schema(
    {
        _id: { type: Number, default: getNewID },// id: { type: Number, unique: true, require: true, index: true, default: Date.now() },
        name: { type: String, required: true },
        typegroup: { type: Number, require: false, default: 0, min: 0, max: 1000 },
        profileImageID: { type: String, required: false, default: null, },
        coverImageID: { type: String, require: false, default: null, },
        about: { type: String, required: false, default: "", },
        language: {
            type: [{
                _id: { type: Number, default: getNewID },
                code: String,
                text: String,
                isDefault: Boolean,
                isRemoved: { type: Boolean, default: false }
            }],
            required: false,
            default: [{ code: 'en-US', text: 'English(US)', isDefault: true }],
        },
        members: {
            type: [{
                _id: Number,
                firstName: String,
                lastName: String,
                profileImageID: String,
                typemember: { type: Number, min: 0, max: 1000, default: 1 },
                typeuser: Number,
                isRemoved: { type: Boolean, default: false, },
                dateJoin: Date,
                timeUpdate: Date,
            }],
            required: false,
            default: [],
        },
        memberCount: {type: Number, default: 0},
        status: { type: Number, required: false, default: 0, min: 0, max: 1000 },
        location: { type: String, required: false, default: "" },
        tags: { type: [String], required: false, },
        isDeleted: { type: Boolean, require: false, default: false, },
        requesteds: {
            type: [{
                _id: Number,
                firstName: String,
                lastName: String,
                profileImageID: String,
                typeuser: Number,
                isRemoved: { type: Boolean, default: false, },
                timeCreate: { type: Date, default: new Date() },
                timeUpdate: { type: Date, default: new Date() },
            }],
            require: true,
            default: [],
        },
        topics: {
            type: [{
                _id: String,
                isDeleted: { type: Boolean, default: false }
            }],
            required: false,
            default: [],
        },
        posts: {
            type: [{
                _id: Number,
                title: String,
                options: {
                    isShow: { type: Boolean, default: true },
                    isSchedule: { type: Boolean, default: false },
                    scopeType: { type: Number, min: 0, max: 1000, default: 10 },
                    scheduleOptions: {
                        startTime: { type: Date, default: null },
                        endTime: { type: Date, default: null },
                    },
                    members: {
                        type: [Number],
                        default: [],
                    },
                },
                // index: {type: Number, default: 0},
                timeCreate: { type: Date, default: new Date() },
                isDeleted: { type: Boolean, default: false },
            }],
            required: false,
            default: []
        },
        timeCreate: { type: Date, default: new Date(), },
        timeUpdate: { type: Date, default: new Date(), },
    }
);

GroupSchema.pre('save', function (callback) {
    let group = this;
    group.timeUpdate = new Date();
    return callback();
});

function validateGroupName(name, isRequired = true) {
    if (!name) {
        return !isRequired;
    }
    let re = /^([a-zA-Z\-0-9\.\_\ ]{1,40})$/;
    if (re.test(name)) {
        return true;
    }
    return false;
}
function validateTypeGroup(typeGroup, isRequired = false) {
    if (!typeGroup) {
        return !isRequired;
    }
    return TypeGroupEnum[typeGroup];
}
function validateTypeMember(typeMember, isRequired = false) {
    if (!typeMember) {
        return !isRequired;
    }
    return TypeMemberEnum[typeUser];
}
function validateStatus(status, isRequired = false) {
    if (!status) {
        return !isRequired;
    }
    return StatusEnum[status];
}
function validateInputInfo(inputInfo, checkRequired = false) {
    if (!inputInfo) {
        return [];
    }
    let message = [];
    //---------- REQUIRED --------------
    if (!(validateGroupName(inputInfo.name, checkRequired))) {
        message.push("Name Invalid Format");
    }
    //------------ NOT REQUIRED ----------------
    if (!Utils.validateStringLength(inputInfo.about, 0, 200, false)) {
        message.push("About Invalid Format");
    }
    if (inputInfo.tags) {
        if (!Utils.getStringArray(inputInfo.tags)) {
            message.push("Tags Invalid Format");
        }
    }
    if (inputInfo.language) {
        if (!getArrayLanguage(inputInfo.language)) {
            message.push("Language Invalid Format");
        }
    }
    if (!validateTypeGroup(inputInfo.typegroup, false)) {
        message.push("TypeGroup Invalid Format");
    }
    if (!validateStatus(inputInfo.status, false)) {
        message.push("Status Invalid Format");
    }
    return message;
}
function getTypeGroupInfo(enum_id) {
    return { enum_id: enum_id, text: TypeGroupEnum[enum_id] };
}
function getTypeMemberInfo(enum_id) {
    return { enum_id: enum_id, text: TypeMemberEnum[enum_id] };
}
function getArrayLanguage(languageString) {
    try {
        let [...languages] = JSON.parse(languageString);
        let data = [];
        for (let index = 0; index < languages.length; index++) {
            let { code = 'en-US', text = 'English(US)' } = languages[index];
            data.push({
                code: code,
                text: text,
            });
        }
        return data;
    } catch (error) {
        return null;
    }
}
function getBasicInfo() {
    return {
        id: this._id,
        name: this.name,
        about: this.about,
        location: this.location,
        memberCount: this.memberCount,
        profileImageID: this.profileImageID,
    }
}

function getMembersInfo() {
    return this.members.filter(member => member.isRemoved === false).map(member => ({
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        profileImageID: member.profileImageID,
        isAdmin: TypeMemberEnum[member.typemember] === 'Admin',
        typeuser: member.typeuser,
        dateJoin: Utils.exportDate(member.dateJoin),
    }));
}
function getMemberUser(user) {
    if (!user) return null;
    for (let index = 0; index < this.members.length; index++) {
        member = this.members[index];
        if (member._id === user._id) {
            return member;
        }
    }
    return null;
}
function getMemberById(id) {
    if (!this.members) {this.members = []};
    if (!id) return null;
    return this.members.find(member => member._id === id);
}
function isMember(user) {
    return !!getMemberUser.call(this, user);
}
function isMemberInGroupById(id) {
    return !!getMemberById.call(this, id);
}
function isAdmin(user) {
    let member = getMemberUser.call(this, user);
    if (!member) return false;
    return TypeMemberEnum[member.typemember] === 'Admin';
}
function getNewID() {
    return Date.now();
}
function addUserInArray(new_user, arrays) {
    if (!new_user) {
        return null;
    }
    let user = null;
    let timeUpdate = new Date();
    for (let index = 0; index < arrays.length; index++) {
        user = arrays[index];
        if (user._id === new_user._id) {
            user.timeUpdate = timeUpdate;
            user.firstName = new_user.firstName;
            user.lastName = new_user.lastName;
            user.profileImageID = new_user.profileImageID;
            if (user.isRemoved) {
                user.isRemoved = false;
                user.timeCreate = timeUpdate;
            }
            return user;
        }
    }
    user = {
        _id: new_user._id,
        firstName: new_user.firstName,
        lastName: new_user.lastName,
        profileImageID: new_user.profileImageID,
        typeuser: new_user.typeuser,
        isRemoved: false,
        timeCreate: timeUpdate,
        timeUpdate: timeUpdate,
    };
    arrays.push(user);
    return user;
}
function removeUserFromArray(remove_user, arrays) {
    if (!remove_user) {
        return null;
    }
    let user = null;
    for (let index = 0; index < arrays.length; index++) {
        user = arrays[index];
        if (user._id === remove_user._id) {
            user.isRemoved = true;
            return user;
        }
    }
    return null;
}
function addRequested(user) {//TODO: check member exited.
    return addUserInArray(user, this.requesteds) ? user : null;
}
function removeRequested(user, isUpdateReference = false) {
    if (!removeUserFromArray(user, this.requesteds)) {
        return null;
    }
    if (!isUpdateReference) {
        return user;
    }
    return user.removeClassRequest.call(user, this, false) ? user : null;
}
function confirmRequested(user, isUpdateReference = false) {
    let requestedUser = this.requesteds.find(u => u.isRemoved === false && u._id === user._id);
    if (!requestedUser) {
        return null;
    }
    if (!addMember.call(this, user)) {
        return null;
    }
    return removeRequested.call(this, user, isUpdateReference) ? user : null;
}

function addMember(user, typemember = 1) {//TODO: check owner.
    if (!user) { return null; }
    let timeUpdate = new Date();
    let member = this.members.find(member => member._id === user._id);
    if (!member) {
        member = {_id : user._id};
        member.dateJoin = timeUpdate;
        member.isRemoved = false;
        member.typemember = TypeMemberEnum[typemember] ? typemember : 1;
        member.firstName = user.firstName;
        member.lastName = user.lastName;
        member.profileImageID = user.profileImageID;
        member.typeuser = user.typeuser;
        member.timeUpdate = timeUpdate;
        this.members.push(member);
        this.memberCount++;
    } else {
        member.typemember = TypeMemberEnum[typemember] ? typemember : 1;
        member.firstName = user.firstName;
        member.lastName = user.lastName;
        member.profileImageID = user.profileImageID;
        member.typeuser = user.typeuser;
        member.timeUpdate = timeUpdate;
        if (member.isRemoved) {
            member.isRemoved = false;
            member.dateJoin = timeUpdate;
            this.memberCount++;
        }
    }
    return user.addToClass(this) ? user : null;
}
function addNormalMember(user) {
    return addMember.call(this, user, 1);
}
function addAdminMember(user) {
    return addMember.call(this, user, 10)
}
function updateMember(user, typemember) {//TODO: check 1 owner.
    if (!user) { return null; }
    let member = this.members.find(member => member._id === user._id);
    if (!member || member.isRemoved) { return null; }
    let timeUpdate = new Date();
    member.typemember = TypeMemberEnum[typemember] ? typemember : member.typemember;
    member.timeUpdate = timeUpdate;
    member.firstName = user.firstName;
    member.lastName = user.lastName;
    member.profileImageID = user.profileImageID;
    member.dateJoin = timeUpdate;
    return user.addToClass(this) ? user : null;
}
function removeMember(user, isUpdateReference = true) {//TODO: remove owner.
    if (!user) { return null; }
    let member = this.members.find(member => member._id === user._id);
    if (!member) { return null; }
    if (member.isRemoved) return user;
    member.isRemoved = true;
    this.memberCount--;
    return isUpdateReference ? (user.removeFromClass(this) ? user : null) : user;
}

function addTopic(topic_name) {
    if (!this.topics) this.topics = [];
    let topic = this.topics.find(t => t._id === topic_name);
    if (!topic) {
        topic = { _id: topic_name, isDeleted: false };
        this.topics.push(topic);
    } else if (topic.isDeleted) {
        topic.isDeleted = false;
    }
    return topic;
}
function addTopics(topics) {
    if (!this.topics) this.topics = [];
    if (!topics) return null;
    topics.forEach(topic => {
       let exited = this.topics.find(t => t._id === topic) ;
       if (!exited) {
           this.topics.push({_id: topic, isDeleted : false});
       } else if (exited.isDeleted) {
           exited.isDeleted = false;
       }
    });
    return topics;
}
function removeTopic(topic_name) {
    if (!this.topics) this.topics = [];
    let topic = this.topics.find(t => t._id === topic_name);
    if (topic && !topic.isDeleted) {
        topic.isDeleted = true;
    }
    return topic;
}
function getTopics() {
    if (!this.topics) return [];
    return this.topics.filter(topic => topic.isDeleted === false).map(topic => topic._id);
}

function addPost(new_post, topic_name, new_options = null) {
    if (!this.posts) { this.posts = []; }
    let post = this.posts.find(item => item._id === new_post.id);
    let timeUpdate = new Date();
    let options = null;
    if (!new_options) {
        options = {
            isShow: true,
            isSchedule: false,
            scopeType: 10,
            scheduleOptions: {
                startTime: null,
                endTime: null,
            },
            members: [],
        }
    } else {
        let isShow = new_options.isShow ? new_options.isShow : false;
        let isSchedule = new_options.isSchedule ? new_options.isSchedule : false;
        let scopeType = new_options.scopeType ? new_options.scopeType : 10;
        let scheduleOptions = new_options.scheduleOptions;
        let startTime = scheduleOptions ? scheduleOptions.startTime ? scheduleOptions.startTime : null : null;
        let endTime = scheduleOptions ? scheduleOptions.endTime ? scheduleOptions.endTime : null : null;
        let users = new_options.members ? new_options.members : [];

        users = users.filter(member_id => {
            return !!this.members.find(member => member._id === member_id);
        });
        options = {
            isShow: isShow,
            isSchedule: isSchedule,
            scopeType: scopeType,
            scheduleOptions: {
                startTime: startTime,
                endTime: endTime,
            },
            members: users,
        }
    }
    if (post) {
        post.options = options;
        post.timeCreate = timeUpdate;
        post.isDeleted = false;
    } else {
        post = {
            _id: new_post._id,
            title: new_post.title,
            options: options,
            timeCreate: timeUpdate,
            isDeleted: false,
        };
        this.posts.push(post);
    }
    if (addTopic.call(this, topic_name)) {
        // return post.addTopic.call(post, topic_name) ? post : null;
        // return new_post.addTopic(new_post, topic_name) ? post : null;
        return post;
    }
    return null;
}
function getPostIDs(user, topics = null, top = -1) {
    if (!this.posts) { return []; }
    return this.posts.filter(post => post.isDeleted === false).map(post => post._id);
}
function getPostIDForUsers(user, topics = null, top = -1) {
    if (!this.posts) { return []; }
    let publicPostIDs = getPublicScopePostID.call(this);
    if (!user || !isMember.call(this, user)) {
        return publicPostIDs;
    }
    let protectedPostID = getProtectedScopePostID.call(this);
    let privatePostID = getPrivateScopePostID.call(this, user);
    return publicPostIDs.concat(protectedPostID).concat(privatePostID);
}
function getPublicScopePostID() {
    if (!this.posts) return [];
    return this.posts.filter(post => {
        if (post.isDeleted || !post.options) return false;
        return post.options.scopeType === 0;
    }).map(post => post._id);
}
function getProtectedScopePostID() {
    if (!this.posts) return [];
    return this.posts.filter(post => {
        if (post.isDeleted || !post.options) return false;
        return post.options.scopeType === 10;
    }).map(post => post._id);
}

function getPrivateScopePostID(user) {
    if (!user) return [];
    if (!this.posts) return [];
    if (isAdmin.call(this, user)) {
        return this.posts.filter(post => {
            if (post.isDeleted || !post.options || post.options.scopeType !== 100 || !post.options.members) return false;
            return true;
        }).map(post => post._id);
    }
    return this.posts.filter(post => {
        if (post.isDeleted || !post.options || post.options.scopeType !== 100 || !post.options.members) return false;
        return !!post.options.members.find(member => member === user._id);
    }).map(post => post._id);
}

function getRequesteds() {
    let requesteds = [];
    this.requesteds.forEach(requested => {
        if (!requested.isRemoved) {
            requesteds.push({
                id: requested._id,
                firstName: requested.firstName,
                lastName: requested.lastName,
                profileImageID: requested.profileImageID,
                coverImageID: requested.coverImageID,
                timeCreate: Utils.exportDate(requested.timeCreate),
                timeUpdate: Utils.exportDate(requested.timeUpdate),
            });
        }
    });
    return requesteds;
}
/*-------------------------------------- */
GroupSchema.statics.getTypeMemberInfo = getTypeMemberInfo;
GroupSchema.statics.TypeGroupInfo = getTypeGroupInfo;
GroupSchema.statics.validateGroupName = validateGroupName;
GroupSchema.statics.validateTypeMember = validateTypeMember;
GroupSchema.statics.validateTypeGroup = validateTypeGroup;
GroupSchema.statics.validateStatus = validateStatus;
GroupSchema.statics.validateInputInfo = validateInputInfo;
GroupSchema.statics.getArrayLanguage = getArrayLanguage;
GroupSchema.methods.getBasicInfo = getBasicInfo;
GroupSchema.statics.getNewID = getNewID;

GroupSchema.methods.addMember = addMember;
GroupSchema.methods.removeMember = removeMember;
GroupSchema.methods.updateMember = updateMember;
GroupSchema.methods.getMemberUser = getMemberUser;

GroupSchema.methods.addAdminMember = addAdminMember;
GroupSchema.methods.addNormalMember = addNormalMember;

GroupSchema.methods.addRequested = addRequested;
GroupSchema.methods.removeRequested = removeRequested;
GroupSchema.methods.confirmRequested = confirmRequested;
GroupSchema.methods.getMembersInfo = getMembersInfo;
GroupSchema.methods.getMemberUser = getMemberUser;
GroupSchema.methods.getMemberById = getMemberById;
GroupSchema.methods.isMember = isMember;
GroupSchema.methods.isMemberInGroupById = isMemberInGroupById;
GroupSchema.methods.isAdmin = isAdmin;
GroupSchema.methods.addTopic = addTopic;
GroupSchema.methods.addTopics = addTopics;
GroupSchema.methods.removeTopic = removeTopic;
GroupSchema.methods.getTopics = getTopics;
GroupSchema.methods.addPost = addPost;
GroupSchema.methods.getPostIDs = getPostIDs;
GroupSchema.methods.getPostIDForUsers = getPostIDForUsers;
GroupSchema.methods.getRequesteds = getRequesteds;

GroupSchema.methods.getProtectedScopePostID = getProtectedScopePostID;
GroupSchema.methods.getPrivateScopePostID = getPrivateScopePostID;
GroupSchema.methods.getPublicScopePostID = getPublicScopePostID;

module.exports = mongoose.model('Group', GroupSchema); 