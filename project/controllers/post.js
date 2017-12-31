let PostItem = require('../models/post');
let GroupControllers = require('../controllers/group');
let UserController = require('../controllers/user');
let Utils = require('../application/utils');
let PostEvents = require('../application/application').events.posts;
async function getPostByID(id) {
    try {
        let postID = Number(id);
        if (isNaN(postID)) return null;
        return await PostItem.findOne({_id: postID});
    } catch (error) {
        return null;
    }
}

async function findPost(req) {
    let postRequest = getPostRequest(req);
    if (postRequest) {
        return postRequest;
    }
    let id = null;
    if (req.query.postID) {
        id = req.query.postID;
    } else if (req.params.postID) {
        id = req.params.postID;
    } else if (req.body.postID) {
        id = req.body.postID;
    }
    if (id) {
        return await getPostByID(id);
    }
    return null;
}

async function checkPostRequest(req, res, next) {
    let post = await findPost(req);
    if (post && !post.isDeleted) {
        req.posts.post_requested = post;
        return next();
    } else {
        req.posts.post_requested = null;
        return next(Utils.createError('Post not exited or deleted', 400));
    }
}

function getPost(req, res, next) {
    try {
        let post = getPostRequest(req);
        let user = UserController.getCurrentUser(req);
        req.responses.data = Utils.createResponse(post.getBasicInfo(user));
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function addPost(req, res, next) {
    try {
        let group = GroupControllers.getGroupRequest(req);
        let user = UserController.getCurrentUser(req);
        let currentFiles = req.fileitems.files_saved;//req.fileitems.file_saved;
        let title = req.body.title;
        let content = req.body.content;
        let topic = req.body.topic;
        if (!title || !content || !topic) {
            return next(Utils.createError('Request Invalid', 400));
        }
        let isShow = req.body.isShow ? req.body.isShow === 'true' : false;
        let isSchedule = req.body.isSchedule ? req.body.isSchedule === 'true' : false;
        let scopeType = req.body.scopeType ? req.body.scopeType : 10;
        let startTime = req.body.startTime ? Utils.parseDate(req.body.startTime) : null;
        let endTime = req.body.endTime ? Utils.parseDate(req.body.endTime) : null;
        let members = req.body.members ? Utils.getNumberArray(req.body.members) : [];
        members.push(user._id);
        let options = {
            isShow: isShow,
            isSchedule: isSchedule,
            scopeType: scopeType,
            scheduleOptions: {
                startTime: startTime,
                endTime: endTime,
            },
            members: members,
        };
        let post = createNewPost(user, group, title, content, topic, currentFiles);
        if (scopeType == 100) {
            post.setAssigmentPost();
        } else {
            post.setBasicPost();
        }
        group.addPost(post, topic, options);
        group = await group.save();
        post = await post.save();
        req.groups.group_request = group;
        req.posts.post_requested = post;
        PostEvents.emit('NewPost', group, post);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function deletePost(req, res, next) {
    try {
        let user = UserController.getCurrentUser(req);
        let post = getPostRequest(req);
        post.isDeleted = true;
        post = await post.save();
        req.posts.post_requested = post;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function updatePost(req, res, next) {
    try {
        let user = UserController.getCurrentUser(req);
        let post = getPostRequest(req);
        if (post.userCreate.id !== user._id) {
            return next(Utils.createError('User not permit', 400));
        }
        let title = req.body.title;
        let content = req.body.content;
        let isBlockComment = req.body.isBlockComment ? req.body.isBlockComment === 'true' : false;
        let topics = req.body.topics;
        if (title) post.title = title;
        if (content) post.content = content;
        post.setBlockComment(isBlockComment);
        if (req.fileitems.files_saved) {
            post.addFiles(req.fileitems.files_saved, true);
        }
        if (topics) {
            post.topics = Utils.getStringArray(topics).map(topic => ({_id: topic, isDeleted: false}));//TODO update group topic.
        }
        post = await post.save();
        req.posts.post_requested = post;
        req.responses.data = Utils.createResponse(post.getBasicInfo(user));
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function addComment(req, res, next) {
    try {
        let post = getPostRequest(req);
        let user = UserController.getCurrentUser(req);
        let file = req.fileitems.file_saved;
        let content = req.body.content;
        if (!content) {
            return next(Utils.createError('Request Invalid', 400, 400, 'Content not found'));
        }
        let comment = post.addComment(user, content, file);
        let data = null;
        if (comment) {
            post = await post.save();
            req.posts.post_requested = post;
            data = {
                id: comment._id,
                userID: comment.userID,
                content: comment.content,
                firstName: comment.firstName,
                lastName: comment.lastName,
                file: comment.file,
                profileImageID: comment.profileImageID,
                timeUpdate: Utils.exportDate(comment.timeUpdate),
            }
        } else {
            throw new Error("Add Comment error");
        }
        req.responses.data = Utils.createResponse(data);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getComments(req, res, next) {//bulk comments with index.
    try {
        let post = getPostRequest(req);
        let comments = post.getComments();
        req.responses.data = Utils.createResponse({
            post: {
                postID: post._id,
                groupID: post.group.id,
                userCreateID: post.userCreate.id,
            },
            length: comments.length,
            comments: comments,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function deleteComment(req, res, next) {
    try {
        let post = getPostRequest(req);
        let commentID = null;
        if (req.query.commentID) {
            commentID = req.query.commentID;
        } else if (req.params.commentID) {
            commentID = req.params.commentID;
        } else if (req.body.commentID) {
            commentID = req.body.commentID;
        }
        if (!commentID) {
            return next(Utils.createError('Request Invalid', 400, 400, 'CommentID not found'));
        }
        let comment = post.deleteComment(Number(commentID));
        let data = null;
        if (comment) {
            post = await post.save();
            req.posts.post_requested = post;
            data = {
                id: comment._id,
                userID: comment.userID,
                content: comment.content,
                firstName: comment.firstName,
                lastName: comment.lastName,
                file: comment.file,
                profileImageID: comment.profileImageID,
                timeUpdate: Utils.exportDate(comment.timeUpdate),
            }
        } else {
            return next(Utils.createError('Request Invalid', 400, 400, 'CommentID not exited'));
        }
        req.responses.data = Utils.createResponse(data);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function updateComment(req, res, next) {
    try {
        let post = getPostRequest(req);
        let currentUser = UserController.getCurrentUser(req);
        let file = req.fileitems.file_saved;
        let content = req.body.content;
        let commentID = null;
        if (req.query.commentID) {
            commentID = req.query.commentID;
        } else if (req.params.commentID) {
            commentID = req.params.commentID;
        } else if (req.body.commentID) {
            commentID = req.body.commentID;
        }
        if (!commentID) {
            return next(Utils.createError('Request Invalid', 400, 400, 'CommentID not found'));
        }
        let comment = post.updateComment(Number(commentID), content, file);
        let data = null;
        if (comment) {
            if (comment.userID !== currentUser._id) {
                return next(Utils.createError('Request Invalid', 400, 400, 'Only owner comment can editable.'));
            }
            post = await post.save();
            req.posts.post_requested = post;
            data = {
                id: comment._id,
                userID: comment.userID,
                content: comment.content,
                firstName: comment.firstName,
                lastName: comment.lastName,
                file: comment.file,
                profileImageID: comment.profileImageID,
                timeUpdate: Utils.exportDate(comment.timeUpdate),
            }
        } else {
            throw new Error("Update Comment error");
        }
        req.responses.data = Utils.createResponse(data);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getPostsInTopic(req, res, next) {
    try {
        let datas = [];
        let group = GroupControllers.getGroupRequest(req);
        let user = UserController.getCurrentUser(req);
        let topicName = req.query.topicname;
        if (!topicName) {
            datas = group.getTopics();
        } else {
            let posts = await PostItem.find({
                isDeleted: false,
                "group.id": group._id,
                topics: {$elemMatch: {_id: topicName}}
            });
            datas = posts.map(post => post.getBasicInfo(user));
        }
        req.responses.data = Utils.createResponse(datas);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getLikes(req, res, next) {
    try {
        let post = getPostRequest(req);
        req.responses.data = Utils.createResponse({
            post: {
                postID: post._id,
                groupID: post.group.id,
                userCreateID: post.userCreate.id,
            },
            likes: post.getLikes(),
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function addLike(req, res, next) {
    try {
        let post = getPostRequest(req);
        let currentUser = UserController.getCurrentUser(req);
        if (post.addLike(currentUser)) {
            post = await post.save();
            req.posts.post_requested = post;
            return next();
        } else {
            throw new Error("Can't add like to post");
        }
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function removeLike(req, res, next) {
    try {
        let post = getPostRequest(req);
        let user = UserController.getCurrentUser(req);
        if (post.removeLike(user)) {
            post = await post.save();
            req.posts.post_requested = post;
            return next();
        } else {
            throw new Error("Can't add like to post");
        }
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function createNewPost(user, group, title, content, topic, files = null) {
    if (!user || !group) return null;
    let now = new Date();
    let post = new PostItem({
        _id: now.getTime(),
        title: title,
        content: content,
        userCreate: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageID: user.profileImageID,
            timeUpdate: now,
        },
        group: {
            id: group._id,
            name: group.name,
            profileImageID: group.profileImageID,
            timeUpdate: now,
        },
        topics: [],
        comments: [],
        likes: [],
        options: {isBlockComment: false},
        files: [],
        countComments: 0,
        countLikes: 0,
        isDeleted: false,
        timeCreate: now,
        timeUpdate: now,
    });
    if (topic) {
        post.addTopic(topic);//TODO: Add many topic
    }
    if (Array.isArray(files)) {
        post.addFiles(files);
    } else if (files) {
        post.addFile(files)
    }
    return post;
}

function putGroupRequest(req, res, next) {
    let post = getPostRequest(req);
    req.body.groupID = post.group.id;
    return next();
}

function checkPermitForUser(req, res, next) {
    let currentUser = UserController.getCurrentUser(req);
    if (currentUser.isSystem()) {
        return next();
    }
    let post = getPostRequest(req);
    let group = GroupControllers.getGroupRequest(req);
    let postIDs = group.getPostIDForUsers(currentUser);
    let postFind = postIDs.find(p => p === post._id);
    if (postFind) {
        return next();
    }
    return next(Utils.createError('User not permit', 400));
}

function getPostRequest(req) {
    return req.posts.post_requested;
}

//------------------EXPORT---------------------
exports.checkPostRequest = checkPostRequest;
exports.addPost = addPost;
exports.deletePost = deletePost;
exports.updatePost = updatePost;

exports.addComment = addComment;
exports.getComments = getComments;
exports.deleteComment = deleteComment;
exports.updateComment = updateComment;

exports.getPost = getPost;
exports.getPostByID = getPostByID;
exports.getPostsInTopic = getPostsInTopic;

exports.getLikes = getLikes;
exports.addLike = addLike;
exports.removeLike = removeLike;

exports.putGroupRequest = putGroupRequest;
exports.checkPermitForUser = checkPermitForUser;





