let Group = require('../models/group');
let UserControllers = require('../controllers/user');
let Users = require('../models/user');
let Files = require('../models/fileitem');
let Post = require('../models/post');
let Utils = require('../application/utils');

async function getGroupByID(id) {
    if (!id) {
        return null;
    }
    let _id = Number(id);
    if (_id) {
        return await Group.findOne({
            _id: id,
            //isDeleted: false,
        });
    } else {
        return null;
    }
}
async function findGroup(req) {
    let groupRequest = getGroupRequest(req);
    if (groupRequest) {
        return groupRequest;
    }
    let groupFind = null;
    if (req.params.groupID) {
        groupFind = await getGroupByID(req.params.groupID);
        if (groupFind) {
            return groupFind;
        }
    }
    if (req.body.groupID) {
        groupFind = await getGroupByID(req.body.groupID);
        if (groupFind) {
            return groupFind;
        }
    }
    return null;
}
async function addMember(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let user = UserControllers.getRequestUser(req);
        let typeMember = req.body.typeMember ? req.body.typeMember : 1;
        if (group.addMember(user, typeMember)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        } else {
            throw new Error("Add member error");
        }
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            group_id: group._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function removeMember(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let user = UserControllers.getRequestUser(req);
        if (group.removeMember(user)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        }
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            group_id: group._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function updateMember(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let user = UserControllers.getRequestUser(req);
        let typeMember = req.body.typeMember ? req.body.typeMember : 1;
        if (group.updateMember(user, typeMember)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        } else {
            throw new Error("UpdateMember Error, user is Remove");//
        }
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            group_id: group._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getRequesteds(req, res, next) {
    try {
        //TODO: Check current user.
        let group = getGroupRequest(req);
        if (!group) throw new Error();
        req.responses.data = Utils.createResponse(group.getRequesteds());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function removeRequested(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let user = UserControllers.getRequestUser(req);
        if (group.removeRequested(user, true)) {
            group = await group.save();
            user = await user.save();
        }
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            group_id: group._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function confirmRequested(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let user = UserControllers.getRequestUser(req);
        if (group.confirmRequested(user)) {
            group = await group.save();
            user = await user.save();
        } else {
            throw new Error('user not requested to group');
        }
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            group_id: group._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
function updateGroupInfo(req, group, isCheckValidInput = true) {
    let message = [];
    if (isCheckValidInput) {
        message = Group.validateInputInfo(req.body, true);
        if (!message || message.length > 0) {
            return message;
        }
    }
    if (req.body.name) {
        group.name = req.body.name;
    }
    if (req.body.dateCreated) {
        group.birthday = Group.getCreateDate(req.body.dateCreated);
    }
    if (req.body.about) {
        group.about = req.body.about;
    }
    if (req.body.tags) {
        group.tags = Utils.getStringArray(req.body.tags);
    }
    if (req.body.language) {
        group.language = Group.getArrayLanguage(req.body.language);
    }
    if (req.body.location) {
        group.location = req.body.location;
    }
    if (req.body.typegroup) {
        group.typegroup = req.body.typegroup;
    }
    return message;
}
async function postGroup(req, res, next) {
    try {
        let userCreate = UserControllers.getCurrentUser(req);
        req.groups.group_request = null;
        let message = Group.validateInputInfo(req.body, true);
        if (!message || message.length > 0) {
            return next(Utils.createError('Request Invalid', 400));
        }
        let group = new Group({
            _id: Date.now(),
            name: req.body.name,
            isDeleted: false,
            dateCreated: new Date(),
        });
        message = updateGroupInfo(req, group, false);
        if (!message || message.length > 0) {
            return next(Utils.createError('Request Invalid', 400));
        }
        if (!group.addAdminMember(userCreate)) {
            throw new Error("Add member to class error");
        }
        userCreate = await userCreate.save();
        req.users.user_request = userCreate;
        if (req.body.members) {
            let userIDs = Utils.getStringArray(req.body.members);
            let users = await UserControllers.getManyUsers(userIDs);
            if (!users) {
                return next();
            }
            users.forEach(usermember => {
                if (usermember.isTeacher()) {
                    group.addAdminMember(usermember);
                } else {
                    group.addNormalMember(usermember);
                }
            });
            Promise.all(users.map(user => user.save())).then(async usersaved => {
                try {
                    group = await group.save();
                    req.groups.group_request = group;
                    req.users.users_request = usersaved;
                    next();
                } catch (error) {
                    next(error);
                }
            }).catch(error => next(error));
        } else {
            group = await group.save();
            req.groups.group_request = group;
            return next();
        }
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function putGroup(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let user = UserControllers.getCurrentUser(req);
        let message = Group.validateInputInfo(req.body, false);
        if (message && message.length === 0) {
            message = updateGroupInfo(req, group, false);
            if (message && message.length === 0) {
                group = await group.save();
                req.groups.group_request = group;
                return next();
            }
        }
        //TODO update reference to this group.
        return next(Utils.createError('Request Invalid', 400));
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function deleteGroup(req, res, next) {
    try {
        let group = getGroupRequest(req);
        group.isDeleted = true;
        group = await group.save();
        //TODO: Remove all member in group.
        req.groups.group_request = group;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getGroup(req, res, next) {
    try {
        let group = getGroupRequest(req);
        req.responses.data = Utils.createResponse(group.getBasicInfo());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getProfileImageID(req, res, next) {
    let group = getGroupRequest(req);
    if (group) {
        req.fileitems.file_selected_id = group.profileImageID;
    } else {
        //TODO default gorupProfileID
        req.fileitems.file_selected_id = null;
    }
    return next();
}
async function putProfileImage(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let currentFile = req.fileitems.file_saved;
        group.profileImageID = currentFile._id;
        group = await group.save();
        req.groups.group_request = group;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getCoverImageID(req, res, next) {
    let group = getGroupRequest(req);
    if (group) {
        req.fileitems.file_selected_id = group.coverImageID;
    } else {
        //TODO setGroupDefaultCoverImage
        req.fileitems.file_selected_id = null;
    }
    return next();
}
async function putCoverImage(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let currentFile = req.fileitems.file_saved;
        group.coverImageID = currentFile._id;
        group = await group.save();
        req.responses.data = Utils.createResponse(currentFile.getBasicInfo());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getMembers(req, res, next) {
    try {
        let group = getGroupRequest(req);
        req.responses.data = Utils.createResponse(group.getMembersInfo());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function checkGroupRequest(req, res, next) {
    let group = await findGroup(req);
    if (group && !group.isDeleted) {
        req.groups.group_request = group;
        return next();
    } else {
        req.groups.group_request = null;
        return next(Utils.createError('Group not exited or deleted', 400));
    }
}
async function checkGroupRequestIfHave(req, res, next) {
    let group = await findGroup(req);
    if (group && !group.isDeleted) {
        req.groups.group_request = group;
    } else {
        req.groups.group_request = null;
    }
    return next();
}
async function getGroups(req, res, next) {
    try {
        let groups = await Group.find({
            isDeleted: false,
        });
        req.responses.data = Utils.createResponse(groups.map(group => group.getBasicInfo()));
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getFiles(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let files = await Files.find({
            isDeleted: false,
            'group.id': group._id,
        });
        req.fileitems.files_saved = files;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function searchGroupByName(req, res, next) {
    try {
        let key = req.query.groupname;
        if (!key) {
            return next(Utils.createError('', 400, 400, '', []));
        }
        let groups = await Group.find({isDeleted: false, name: {$regex: key}});
        req.responses.data = Utils.createResponse(groups.map(group => group.getBasicInfo()));
        return next();
    } catch (error) {
        return next(Utils.createError(error, 400, 400, '', []));
    }
}
async function getAllPosts(req, res, next) {
    try {
        //TODO page paging : top, start...
        let group = getGroupRequest(req);
        let user = req.users.user_request;
        let postIDs = group.getPostIDs();
        let posts = await Post.find({isDeleted: false, _id: {$in: postIDs}});
        let datas = posts.map(post => post.getBasicInfo(user));
        req.responses.data = Utils.createResponse(datas);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function getPosts(req, res, next) {
    try {
        //TODO page paging : top, start...
        let group = getGroupRequest(req);
        let user = UserControllers.getRequestUser(req);
        let postIDs = group.getPostIDForUsers(user);
        let topicName = req.query.topicname;
        let posts;
        if (topicName) {
            posts = await Post.find({isDeleted: false, _id: {$in: postIDs}, topics: {$elemMatch: {_id: topicName}}});
        } else {
            posts = await Post.find({isDeleted: false, _id: {$in: postIDs}});
        }
        let datas = posts.map(post => post.getBasicInfo(user));
        req.responses.data = Utils.createResponse(datas);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
function getTopics(req, res, next) {
    try {
        let group = getGroupRequest(req);
        req.responses.data = Utils.createResponse(group.getTopics());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
function checkSystemOrMemberInGroupAccount(req, res, next) {
    let group = getGroupRequest(req);
    let user = UserControllers.getCurrentUser(req);
    if (!group.isMember(user) && !user.isSystem()) {
        return next(Utils.createError('User not permit', 400));
    }
    return next();
}
function checkMemberInGroup(req, res, next) {
    let group = getGroupRequest(req);
    let user = UserControllers.getCurrentUser(req);
    if (!group.isMember(user)) {
        return next(Utils.createError('User not member', 400));
    }
    return next();
}
function checkSystemOrAdminInGroupAccount(req, res, next) {
    let group = getGroupRequest(req);
    let user = UserControllers.getCurrentUser(req);
    if (!group.isAdmin(user) && !user.isSystem()) {
        return next(Utils.createError('User not permit', 400));
    }
    return next();
}
function checkAdminInGroupAccount(req, res, next) {
    let group = getGroupRequest(req);
    let user = UserControllers.getCurrentUser(req);
    if (!group.isAdmin(user)) {
        return next(Utils.createError('User not permit', 400));
    }
    return next();
}
async function addTopic(req, res, next) {
    try {
        let user = UserControllers.getCurrentUser(req);
        let group = getGroupRequest(req);
        let topic = null;
        if (req.query.topicname) {
            topic = req.query.topicname;
        } else if (req.param.topicname) {
            topic = req.param.topicname;
        } else if (req.body.topicname) {
            topic = req.body.topicname;
        }
        if (!topic) return next(Utils.createError('Topic name not exit', 400));
        if (!group.addTopic(topic)) {
            throw new Error("Add topic error");
        } else {
            group = await group.save();
            req.groups.group_request = group;
        }
        req.responses.data = Utils.createResponse(group.getTopics());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function addTopics(req, res, next) {
    try {
        let group = getGroupRequest(req);
        if (!req.body.topics) {
            return next(Utils.createError('Topic name not exit', 400));
        }
        let topics = Utils.getStringArray(req.body.topics);
        if (!group.addTopics(topics)) {
            throw new Error("Add topic error");
        } else {
            group = await group.save();
            req.groups.group_request = group;
        }
        req.responses.data = Utils.createResponse(group.getTopics());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function removeTopic(req, res, next) {
    try {
        let group = getGroupRequest(req);
        let topic = req.query.topicname;
        if (!topic) return next(Utils.createError('Topic name not exit', 400));
        if (group.removeTopic(topic)) {
            group = await group.save();
            req.groups.group_request = group;
        }
        req.responses.data = Utils.createResponse(group.getTopics());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function getGroupRequest(req) {
    return req.groups.group_request;
}

function getCurrentGroup(req) {
    return req.groups.group_request;
}

/*----------------EXPORT------------------ */
exports.postGroup = postGroup;
exports.putGroup = putGroup;
exports.getGroup = getGroup;
exports.deleteGroup = deleteGroup;
exports.getMembers = getMembers;
exports.checkGroupRequest = checkGroupRequest;
exports.checkGroupRequestIfHave = checkGroupRequestIfHave;
exports.putProfileImage = putProfileImage;
exports.putCoverImage = putCoverImage;
exports.getProfileImageID = getProfileImageID;
exports.getCoverImageID = getCoverImageID;
exports.addMember = addMember;
exports.removeMember = removeMember;
exports.updateMember = updateMember;
exports.getRequesteds = getRequesteds;
exports.removeRequested = removeRequested;
exports.confirmRequested = confirmRequested;
exports.getGroups = getGroups;
exports.findGroup = findGroup;
exports.getGroupByID = getGroupByID;
exports.getFiles = getFiles;
exports.searchGroupByName = searchGroupByName;
exports.getPosts = getPosts;
exports.getTopics = getTopics;
exports.addTopic = addTopic;
exports.addTopics = addTopics;
exports.removeTopic = removeTopic;
exports.getAllPosts = getAllPosts;
exports.checkMemberInGroup = checkMemberInGroup;
exports.getGroupRequest = getGroupRequest;
exports.getCurrentGroup = getCurrentGroup;
exports.checkSystemOrAdminInGroupAccount = checkSystemOrAdminInGroupAccount;
exports.checkSystemOrMemberInGroupAccount = checkSystemOrMemberInGroupAccount;
exports.checkAdminInGroupAccount = checkAdminInGroupAccount;