let mongoose = require('mongoose');
let Utils = require('../application/utils');
let postTypeEnum = {
    10: 'Basic',
    100: "Assigment",
};
let PostSchema = new mongoose.Schema({
    _id: { type: Number, default: getNewID },
    title: { type: String, required: true, default: 'No Title' },
    content: { type: String, required: true, default: 'No Content' },//short_content
    userCreate: {
        type: {
            id: Number,
            firstName: String,
            lastName: String,
            profileImageID: String,
            timeUpdate: { type: Date, default: new Date(), required: true },
        },
        required: true,
        default: null
    },
    group: {
        type: {
            id: Number,
            name: String,
            profileImageID: String,
            timeUpdate: { type: Date, default: new Date(), required: true },
        },
        required: true,
        default: null
    },
    topics: {
        type: [{
            _id: String,
            isDeleted: {type: Boolean, default: false}
        }],
        required: false,
        default: [],
    },
    comments: {
        type: [{
            _id: Number,
            userID: Number,
            content: String,
            firstName: String,
            lastName: String,
            profileImageID: String,
            file: {
                type: {},
                required: false,
            },
            timeUpdate: { type: Date, default: new Date(), required: true },
            isDeleted: { type: Boolean, default: false }
        }],
        required: false,
        default: [],
    },
    likes: {
        type: [{
            _id: Number,
            isDeleted: { type: Boolean, default: false }
        }],
        required: false,
        default: [],
    },
    options: {
        type: {
            isBlockComment: Boolean,
        },
        required: true,
        default: {
            isBlockComment: false
        }
    },
    files: {
        type: [{
            _id: String,
            name: { type: String, required: true, default: 'NoName' },
            type: { type: String, required: true, default: 'application/octet-stream', },
            size: { type: Number, required: true, default: 0, },
            isDeleted: { type: Boolean, required: true, default: false, },
        }],
        required: false,
        default: [],
    },
    postType: {type: Number, default: 10},
    countComments: { type: Number, required: true, default: 0 },
    countLikes: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, required: true, default: false, },
    timeCreate: { type: Date, required: false, default: new Date(), },
    timeUpdate: { type: Date, required: false, default: new Date(), },
});

PostSchema.pre('save', function (callback) {
    let post = this;
    post.timeUpdate = new Date();
    return callback();
});

function getBasicInfo(user = null) {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        timeCreate: Utils.exportDate(this.timeCreate),
        userCreate: this.userCreate,
        group: this.group,
        files: this.files.map(file => ({
            id: file._id,
            name: file.name,
            type: file.type,
            size: file.size,
        })),
        topics: this.topics.filter(topic => topic.isDeleted === false).map(topic => topic._id),
        postType: this.postType,
        isUserLiked: this.isUserLiked(user),
        isAssigmentPost: this.postType === 100,
        countComments: this.countComments,
        countLikes: this.countLikes,
    }
}
function getNewID() {
    return Date.now();
}

function addLike(user) {
    if (!this.likes) this.likes = [];
    let like = this.likes.find(like => like._id === user._id);
    if (!like) {
        like = {_id: user._id, isDeleted: false };
        this.likes.push(like);
        this.countLikes++;
    } else if (like.isDeleted) {
        like.isDeleted = false;
        this.countLikes++;
    }
    return like;
}
function addLikes(users) {
    if (!this.likes) this.likes = [];
    if (!users) return null;
    users.forEach(user => {
        let exited = this.likes.find(t => t._id === user) ;
        if (!exited) {
            this.likes.push({_id: user._id, isDeleted : false});
            this.countLikes++;
        } else if (exited.isDeleted) {
            exited.isDeleted = false;
            this.countLikes++;
        }
    });
    return users;
}
function removeLike(user) {
    if (!this.likes) this.likes = [];
    let like = this.likes.find(like => like._id === user._id);
    if (like && !like.isDeleted) {
        like.isDeleted = true;
        this.countLikes--;
    }
    return like;
}
function getLikes() {
    if (!this.likes) this.likes = [];
    return this.likes.filter(like => like.isDeleted === false).map(like => like._id);

}

function isUserLiked(user) {
    if (!user) return false;
    if (!this.likes) return false;
    return !!this.likes.find(like => like.isDeleted === false && like._id === user._id);
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

function getComments(top = -1) {
    if (!this.comments) this.commands = [];
    return this.comments.filter(comment => comment.isDeleted === false).map(comment => ({
            id: comment._id,
            userID: comment.userID,
            // post: {
            //     id: this._id,
            //     group: {
            //         id: this.group.id,
            //         name: this.group.name,
            //         profileImageID: this.group.profileImageID,
            //         timeUpdate: Utils.exportDate(this.group.timeUpdate),
            //     },
            //     userCreate: {
            //         timeUpdate: Utils.exportDate(this.userCreate.timeUpdate),
            //         profileImageID: this.userCreate.profileImageID,
            //         lastName: this.userCreate.lastName,
            //         firstName: this.userCreate.firstName,
            //         id: this.userCreate.id,
            //     },
            // },
            content: comment.content,
            firstName: comment.firstName,
            lastName: comment.lastName,
            file : comment.file,
            profileImageID: comment.profileImageID,
            timeUpdate: Utils.exportDate(comment.timeUpdate),
        }));
}
function addComment(user, content, file = null) {
    let now = new Date();
    let comment = {
        _id: now.getTime(),
        userID: user._id,
        index: this.countComments,
        content: content,
        firstName: user.firstName,
        lastName: user.lastName,
        file : null,
        profileImageID: user.profileImageID,
        timeUpdate: now,
        isDeleted: false,
    };
    if (file) {
        let fileItem = {
            // _id: file._id,
            id: file._id,
            type: file.type,
            size: file.size,
            name: file.name,
        };
        comment.file = fileItem;
    }
    this.comments.push(comment);
    this.countComments++;
    return comment;
}
function updateComment(id, content, file = null) {
    let comment = this.comments.find(item => item._id === id);
    if (!comment) {
        return null;
    }
    comment.content = content;
    if (file) {
        let fileItem = {
            // _id: file._id,
            id: file._id,
            type: file.type,
            size: file.size,
            name: file.name,
        };
        comment.file = fileItem;
    }
    comment.timeUpdate = new Date();
    if (comment.isDeleted) {
        comment.isDeleted = false;
        this.countComments++;
    }
    return comment;
}
function deleteComment(id) {
    let comment = this.comments.find(item => item._id === id);
    if (comment && !comment.isDeleted) {
        comment.isDeleted = true;
        this.countComments--;
    }
    return comment;
}

function getFiles() {
    return this.files.filter(file => file.isDeleted === false);
}
function addFile(new_fileItem) {
    if (!this.files) this.files = [];
    let fileItem = this.files.find(item => item._id === new_fileItem._id);
    if (!fileItem) {
        fileItem = {
            _id: new_fileItem._id,
            type: new_fileItem.type,
            size: new_fileItem.size,
            name: new_item.name,
            isDeleted : false,
        };
        this.files.push(fileItem);
    } else if(file.isDeleted) {
        fileItem.isDeleted = false;
    }
    return fileItem;
}
function addFiles(files, isClearBefore = false) {
    if (!this.files) this.files = [];
    if (!files) return null;
    if (isClearBefore) {
        this.files = [];
        files.forEach(file => {
            this.files.push({
                _id: file._id,
                type: file.type,
                size: file.size,
                name: file.name,
                isDeleted : false,
            });
        });
    } else {
        files.forEach(file => {
            let exited = this.files.find(t => t._id === file._id) ;
            if (!exited) {
                this.files.push({
                    _id: file._id,
                    type: file.type,
                    size: file.size,
                    name: file.name,
                    isDeleted : false,
                });
            } else if (exited.isDeleted) {
                exited.isDeleted = false;
            }
        });
    }
    return files;
}
function removeFile(file) {
    let fileItem = this.files.find(item => item._id = file._id);
    if (fileItem && !fileItem.isDeleted) {
        fileItem.isDeleted = true;
    }
    return fileItem;
}

function setBlockComment(isBlockComment) {
    if (!this.options) this.options = {};
    this.options.isBlockComment = isBlockComment;
}

function setBasicPost() {
    this.postType = 10;
}

function setAssigmentPost() {
    this.postType = 100;
}

function isBasicPost() {
    return this.postType === 10;
}

function isAssigmentPost() {
    return this.postType === 100;
}

PostSchema.methods.getBasicInfo = getBasicInfo;
PostSchema.statics.getNewID = getNewID;

PostSchema.methods.addLike = addLike;
PostSchema.methods.addLikes = addLikes;
PostSchema.methods.removeLike = removeLike;
PostSchema.methods.getLikes = getLikes;

PostSchema.methods.addTopic = addTopic;
PostSchema.methods.removeTopic = removeTopic;
PostSchema.methods.addTopics = addTopics;
PostSchema.methods.getTopics = getTopics;

PostSchema.methods.getComments = getComments;
PostSchema.methods.addComment = addComment;
PostSchema.methods.updateComment = updateComment;
PostSchema.methods.deleteComment = deleteComment;

PostSchema.methods.getFiles = getFiles;
PostSchema.methods.removeFile = removeFile;
PostSchema.methods.addFile = addFile;
PostSchema.methods.addFiles = addFiles;
PostSchema.methods.setBlockComment = setBlockComment;
PostSchema.methods.isUserLiked = isUserLiked;
PostSchema.methods.setBasicPost = setBasicPost;
PostSchema.methods.setAssigmentPost = setAssigmentPost;
PostSchema.methods.isBasicPost = isBasicPost;
PostSchema.methods.isAssigmentPost = isAssigmentPost;

module.exports = mongoose.model('Post', PostSchema);