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
    if (req.groups.group_request) {
        return req.groups.group_request;
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

async function addMember(req, res) {
    try {
        let group = req.groups.group_request;
        let userID = req.params.userID ? req.params.userID : req.body.userID;
        let user = await UserControllers.getUserByID(userID);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        let typeMember = req.body.typeMember ? req.body.typeMember : 1;
        if (group.addMember(user, typeMember)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        } else {
            throw new Error("Add member error");
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            error: error.message
        });
    }
}

async function removeMember(req, res) {
    try {
        let group = req.groups.group_request;
        let userID = req.params.userID ? req.params.userID : req.body.userID;
        let user = await UserControllers.getUserByID(userID);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        if (group.removeMember(user)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            error: error.message
        });
    }
}

async function updateMember(req, res) {
    try {
        let group = req.groups.group_request;
        let userID = req.params.userID ? req.params.userID : req.body.userID;
        let user = await UserControllers.getUserByID(userID);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        let typeMember = req.body.typeMember ? req.body.typeMember : 1;
        if (group.updateMember(user, typeMember)) {
            group = await group.save();
            user = await user.save();
            req.groups.group_request = group;
        } else {
            throw new Error("UpdateMember Error, user is Remove");//
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function getRequesteds(req, res) {
    try {
        //TODO: Check current user.
        let group = req.groups.group_request;
        if (!group) throw new Error();
        return res.send({
            code: 200,
            message: 'Success',
            data: group.getRequesteds()
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function removeRequested(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let user = await UserControllers.findUser(req, false);
        //req.users.user_request = user;
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        if (group.removeRequested(user, true)) {
            group = await group.save();
            user = await user.save();
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function confirmRequested(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let user = await UserControllers.findUser(req, false); //req.users.user_request = user;
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: 'UserID Invalid',
                data: null,
            });
        }
        if (group.confirmRequested(user)) {
            group = await group.save();
            user = await user.save();
        } else {
            //throw new Error();
        }
        return res.status(200).send({
            code: 200,
            message: 'Success',
            data: {
                user_id: user._id,
                group_id: group._id,
            },
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
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
        let userCreate = req.users.user_request;
        if (!userCreate.isTeacher()) {
            return res.status(400).send({
                code: 400,
                data: null,
                error: 'Only teacher can create group.'
            });
        }
        req.groups.group_request = null;
        let message = Group.validateInputInfo(req.body, true);
        if (!message || message.length > 0) {
            return res.status(400).send({
                code: 400,
                message: message,
                data: null,
                error: 'Request Invalid'
            });
        }
        let group = new Group({
            name: req.body.name,
            isDeleted: false,
            dateCreated: new Date(),
        });
        message = updateGroupInfo(req, group, false);
        if (!message || message.length > 0) {
            return res.status(400).send({
                code: 400,
                message: message,
                data: null,
                error: 'Request Invalid',
            });
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
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function putGroup(req, res, next) {
    try {
        let group = req.groups.group_request;
        let user = await UserControllers.findUser(req);
        if (!user || !group.isAdmin(user)) {
            return res.status(400).send({
                code: 400,
                message: '',
                data: null,
                error: 'User not permit '
            });
        }
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
        return res.status(400).send({
            code: 400,
            message: message,
            data: null,
            error: 'Request Invalid',
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function deleteGroup(req, res, next) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        let user = await UserControllers.findUser(req);
        if (!user || !group.isAdmin(user)) {
            return res.status(400).send({
                code: 400,
                message: '',
                data: null,
                error: 'User not permit '
            });
        }
        group.isDeleted = true;
        group = await group.save();
        //TODO: Remove all member in group.
        req.groups.group_request = group;
        return next();
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function getGroup(req, res, next) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        return res.send({
            code: 200,
            message: 'Success',
            data: group.getBasicInfo()
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function getProfileImageID(req, res, next) {
    let group = req.groups.group_request;
    req.fileitems.file_selected_id = group ? group.profileImageID : null;
    return next();
}

async function putProfileImage(req, res, next) {
    try {
        let group = req.groups.group_request;
        let currentFile = req.fileitems.file_saved;
        group.profileImageID = currentFile._id;
        group = await group.save();
        req.groups.group_request = group;
        return next();
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function getCoverImageID(req, res, next) {
    req.fileitems.file_selected_id = req.groups.group_request ? req.groups.group_request.coverImageID : null;
    return next();
}

async function putCoverImage(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        if (!req.fileitems.file_saved) {
            throw new Error("Upload file Error");
        }
        let currentFile = req.fileitems.file_saved;
        group.coverImageID = String(currentFile._id);
        group = await group.save();
        return res.json({
            code: 200,
            message: 'Success',
            data: currentFile.getBasicInfo(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function getMembers(req, res) {
    try {
        let group = req.groups.group_request;
        if (!group) throw new Error();
        return res.send({
            code: 200,
            message: '',
            data: group.getMembersInfo()
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function checkGroupRequest(req, res, next) {
    let group = await findGroup(req);
    if (group && !group.isDeleted) {
        req.groups.group_request = group;
        return next();
    } else {
        req.groups.group_request = null;
        return res.status(400).send({
            status: 400,
            message: 'Group not exited or deleted',
            data: null
        });
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

async function getGroups(req, res) {
    try {
        let groups = await Group.find({
            isDeleted: false,
        });
        return res.json({
            code: 200,
            message: 'Success',
            count: groups.length,
            data: groups.map(group => group.getBasicInfo())
        });
    } catch (error) {
        return res.status(500).send(error);
    }
};

async function getFiles(req, res, next) {
    try {
        let group = req.groups.group_request;
        let files = await Files.find({
            isDeleted: false,
            'group.id': group._id,
        });
        req.fileitems.files_saved = files;
        return next();
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: 'Server Error',
            data: null
        });
    }
}

async function searchGroupByName(req, res) {
    try {
        let key = req.query.groupname;
        if (!key) {
            return res.status(400).json({code: 400, message: '', data: []});
        }
        let groups = await Group.find({name: {$regex: key}});
        return res.status(200).json({
            code: 200,
            message: '',
            data: groups.map(group => group.getBasicInfo())
        });
    } catch (error) {
        return res.status(500).json({code: 500, message: '', data: []});
    }
}
async function getAllPosts(req, res) {
    try {
        //TODO page paging : top, start...
        let group = req.groups.group_request;
        let user = req.users.user_request;
        let postIDs = group.getPostIDs();
        let posts = await Post.find({isDeleted: false, _id: {$in: postIDs}});
        let datas = posts.map(post => post.getBasicInfo(user));
        return res.status(200).json({
            code: 200,
            message: '',
            data: datas,
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function getPosts(req, res) {
    try {
        //TODO page paging : top, start...
        let group = req.groups.group_request;
        let user = req.users.user_request;
        let postIDs = group.getPostIDForUsers(user);
        let topicName = req.query.topicname;
        let posts;
        if (topicName) {
            posts = await Post.find({isDeleted: false, _id: {$in: postIDs}, topics: {$elemMatch: {_id: topicName}}});
        } else {
            posts = await Post.find({isDeleted: false, _id: {$in: postIDs}});
        }
        let datas = posts.map(post => post.getBasicInfo(user));
        return res.status(200).json({
            code: 200,
            message: '',
            length: datas.length,
            data: datas,
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

function getTopics(req, res) {
    try {
        let group = req.groups.group_request;
        return res.status(200).json({
            code: 200,
            message: '',
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
function checkMemberInGroup(req, res, next) {
    let group = req.groups.group_request;
    let user = req.users.user_request;
    if (!group.isMember(user)) {
        return res.status(400).send({
            code: 400,
            message: 'User not member',
            data: null,
            error: error.message
        });
    }
    return next();
}
async function addTopic(req, res) {
    try {
        let group = req.groups.group_request;
        let topic = null;
        if (req.query.topicname) {
            topic = req.query.topicname;
        } else if (req.param.topicname) {
            topic = req.param.topicname;
        } else if (req.body.topicname) {
            topic = req.body.topicname;
        }
        if (!topic) return res.status(400).json({code: 400, error: 'Topic name not exit'});
        if (!group.addTopic(topic)) {
            throw new Error("Add topic error");
        } else {
            group = await group.save();
            req.groups.group_request = group;
        }
        return res.status(200).json({
            code: 200,
            message: "",
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}

async function addTopics(req, res) {
    try {
        let group = req.groups.group_request;
        if (!req.body.topics) {
            return res.status(400).json({code: 400, error: 'Topic name not exit'})
        }
        let topics = Utils.getStringArray(req.body.topics);
        if (!group.addTopics(topics)) {
            throw new Error("Add topic error");
        } else {
            group = await group.save();
            req.groups.group_request = group;
        }
        return res.status(200).json({
            code: 200,
            message: "",
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function removeTopic(req, res) {
    try {
        let group = req.groups.group_request;
        let topic = req.query.topicname;
        if (!topic) return res.status(400).json({code: 200, error: 'Topic name not exit'})
        if (group.removeTopic(topic)) {
            group = await group.save();
            req.groups.group_request = group;
        }
        return res.status(200).json({
            code: 200,
            message: "",
            data: group.getTopics(),
        });
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
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