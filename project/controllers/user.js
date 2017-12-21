let User = require('../models/user');
let Groups = require('../models/group');
let GroupController = require('../controllers/group');
let Files = require('../models/fileitem');
let Utils = require('../application/utils');
let Posts = require('../models/post');
let authController = require('../controllers/auth');

async function getUserByID(id) {
    if (!id) {
        return null;
    }
    let _id = Number(id);
    if (_id) {
        return await User.findOne({
            _id: id,
        });
    } else {
        return null;
    }
}

async function getUserByUserName(username) {
    if (!(User.validateUserName(username, true))) {
        return null;
    }
    return await User.findOne({username: username,});
}

async function getUserByPhone(phone) {
    if (!(Utils.validatePhoneNumber(phone, true))) {
        return null;
    }
    return await User.findOne({
        phone: phone,
    });
}

async function getUserbyEmail(email) {
    if (!(Utils.validateEmail(email, true))) {
        return null;
    }
    return await User.findOne({
        email: email,
    });
}

async function getUserByIDOrUserName(info) {
    if (!info) {
        return null;
    }
    let _id = Number(info);
    if (_id) {
        return await User.findOne({
            $or: [{
                _id: _id
            },
                {
                    username: info
                },
            ],
        });
    } else {
        return getUserByUserName(info);
    }
}

async function findUser(req, isFindWithPhoneAndEmail = true) {
    if (req.users.user_request) {
        return req.users.user_request;
    }
    if (req.params.userID) {
        return await getUserByID(req.params.userID);
    }
    if (req.params.username) {
        return await getUserByUserName(req.params.username);
    }
    if (req.body.userID) {
        return await getUserByID(req.body.userID);
    }
    if (req.body.id) {
        return await getUserByID(req.body.id);
    }
    if (req.body.username) {
        return await getUserByUserName(req.body.username);
    }
    if (!isFindWithPhoneAndEmail) {
        return null;
    }
    let userFind = null;
    if (req.body.phone) {
        userFind = await getUserByPhone(req.body.phone);
        if (userFind) {
            return userFind;
        }
    }
    if (req.body.email) {
        userFind = await getUserbyEmail(req.body.email);
        if (userFind) {
            return userFind;
        }
    }
    return null;
}

async function postUsers(req, res, next) {
    try {
        //TODO: postUsers not complete
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function updateUserInfo(req, user, isCheckValidInput = true) {
    let message = [];
    if (isCheckValidInput) {
        message = User.validateInputInfo(req.body, true);
        if (!message || message.length > 0) {
            return message;
        }
    }
    if (req.body.email) {
        if (req.body.email !== user.email) {
            let checkUser = await getUserbyEmail(req.body.email);
            if (checkUser) {
                message.push('Email used.');
                return message;
            }
            user.email = req.body.email;
        }
    }
    if (req.body.phone) {
        if (req.body.phone !== user.phone) {
            if (await getUserByPhone(req.body.phone)) {
                message.push('Phone used.');
                return message;
            }
            user.phone = req.body.phone;
        }
    }
    if (req.body.lastName) {
        user.lastName = req.body.lastName;
    }
    if (req.body.firstName) {
        user.firstName = req.body.firstName;
    }
    if (req.body.birthday) {
        user.birthday = User.getBirthDate(req.body.birthday);
    }
    if (req.body.gender) {
        user.gender = req.body.gender;
    }
    if (req.body.about) {
        user.about = req.body.about;
    }
    if (req.body.quote) {
        user.quote = req.body.quote;
    }
    if (req.body.nickname) {
        user.nickname = Utils.getStringArray(req.body.nickname);
    }
    if (req.body.language) {
        user.language = User.getArrayLanguage(req.body.language);
    }
    if (req.body.location) {
        user.location = req.body.location;
    }
    if (req.body.typeuser) {
        user.typeuser = req.body.typeuser;
    }
    return message;
}

async function postUser(req, res, next) {
    try {
        req.users.user_request = null;
        let message = User.validateInputInfo(req.body, true);
        if (!message || message.length > 0) {
            return next(Utils.createError('Request Invalid', 400));
        }
        let userFind = await findUser(req);
        if (userFind) {
            return next(Utils.createError('Username/Email/Phone exited', 400));
        }
        let user = new User({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            isDeleted: false,
        });
        message = await updateUserInfo(req, user, false);
        if (!message || message.length > 0) {
            return next(Utils.createError('Request Invalid', 400, 400, message));
        }
        user = await user.save();
        req.users.user_request = user;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function putUser(req, res, next) {
    try {
        let user = req.users.user_request;
        let message = User.validateInputInfo(req.body, false);
        if (message && message.length === 0) {
            message = await updateUserInfo(req, user, false);
        }
        if (!message || message.length > 0) {
            return next(Utils.createError('Request Invalid', 400, 400, message));
        }
        user = await user.save();
        req.users.user_request = user;
        //TODO: update reference to this user.
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function deleteUser(req, res, next) {
    try {
        let user = await findUser(req);
        req.users.user_request = user;
        if (user && !user.isDeleted) {
            user.isDeleted = true;
            user = await user.save();
            req.users.user_request = user;
        } else {
            return next(Utils.createError(user ? 'User deleted' : 'User not existed', 400));
        }
        //TODO remove all request, member of this user.
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function getUser(req, res, next) {
    req.responses.data = Utils.createResponse(req.users.user_request.getBasicInfo());
    return next();
}

function getProfileImageID(req, res, next) {
    req.fileitems.file_selected_id = req.users.user_request.profileImageID;
    return next();
}

async function putProfileImage(req, res, next) {
    try {
        let user = req.users.user_request;
        let file = req.fileitems.file_saved;
        user.profileImageID = req.fileitems.file_saved._id;
        user = await user.save();
        req.users.user_request = user;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function getCoverImageID(req, res, next) {
    req.fileitems.file_selected_id = req.users.user_request.coverImageID;
    return next();
}

async function putCoverImage(req, res, next) {
    try {
        let user = req.users.user_request;
        let file = req.fileitems.file_saved;
        user.coverImageID = req.fileitems.file_saved._id;
        user = await user.save();
        req.users.user_request = user;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function getUserInfo(req, res, next) {
    req.responses.data = Utils.createResponse(req.users.user_request.getInfo(req.query));
    return next();
}

function getFriends(req, res, next) {
    req.responses.data = Utils.createResponse(req.users.user_request.getFriends());
    return next();
}

async function addFriend(req, res, next) {
    try {
        let user = req.users.user_request;
        let friendUserID = req.params.friendUserID ? req.params.friendUserID : req.body.friendUserID;
        let friendUser = await getUserByID(friendUserID);
        if (!friendUser) {
            return next(Utils.createError('friendUserID Invalid', 400));
        }
        if (user.addFriend(friendUser, true)) {
            user = await user.save();
            friendUser = await friendUser.save();
        } else {
            throw new Error();
        }
        req.users.user_request = user;
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            friend_id: friendUser._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function removeFriend(req, res, next) {
    try {
        let user = req.users.user_request;
        let friendUserID = req.params.friendUserID ? req.params.friendUserID : req.body.friendUserID;
        let friendUser = await getUserByID(friendUserID);
        if (!friendUser) {
            return next(Utils.createError('friendUserID Invalid', 400));
        }
        if (user.removeFriend(friendUser, true)) {
            friendUser = await friendUser.save();
            user = await user.save();
        }
        req.users.user_request = user;
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            friend_id: friendUser._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getClasss(req, res, next) {
    try {
        let user = req.users.user_request;
        let groups = await Groups.find({_id: {$in: user.getClasssID()}});
        let datas = groups.map(group => ({
            id: group._id,
            profileImageID: group.profileImageID,
            name: group.name,
        }));
        req.responses.data = Utils.createResponse(datas);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function removeFromClass(req, res, next) {
    try {
        let user = req.users.user_request;
        let group = req.groups.group_request;
        if (user.removeFromClass(group)) {
            group = await group.save();
            user = await user.save();
            req.users.user_request = user;
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

function getClassRequests(req, res, next) {
    try {
        req.responses.data = Utils.createResponse(req.users.user_request.getClassRequests());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function addClassRequest(req, res, next) {
    try {
        let user = req.users.user_request;
        let group = req.groups.group_request;
        if (user.addClassRequest(group, true)) {
            group = await group.save();
            user = await user.save();
            req.users.user_request = user;
            req.groups.group_request = group;
        } else {
            throw new Error('Add class request error');
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

async function removeClassRequest(req, res, next) {
    try {
        let user = req.users.user_request;
        let group = req.groups.group_request;
        if (user.removeClassRequest(group, true)) {
            group = await group.save();
            user = await user.save();
            req.users.user_request = user;
            req.groups.group_request = group;
        } else {
            throw new Error();
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

function getRequests(req, res, next) {
    try {
        req.responses.data = Utils.createResponse(req.users.user_request.getRequests());
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function addRequest(req, res, next) {
    try {
        //TODO: check same current user
        let user = req.users.user_request;
        let friendUserID = req.params.friendUserID ? req.params.friendUserID : req.body.friendUserID;
        let friendUser = await getUserByID(friendUserID);
        if (!friendUser) {
            return next(Utils.createError('friendUserID Invalid', 400));
        }
        if (user.addRequest(friendUser, true)) {
            user = await user.save();
            friendUser = await friendUser.save();
        } else {
            throw new Error();
        }
        req.users.user_request = user;
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            friend_id: friendUser._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function removeRequest(req, res, next) {
    try {
        let user = req.users.user_request;
        let friendUserID = req.params.friendUserID ? req.params.friendUserID : req.body.friendUserID;
        let friendUser = await getUserByID(friendUserID);
        if (!friendUser) {
            return next(Utils.createError('friendUserID Invalid', 400));
        }
        if (user.removeRequest(friendUser, true)) {
            friendUser = await friendUser.save();
            user = await user.save();
        }
        req.users.user_request = user;
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            friend_id: friendUser._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function getRequesteds(req, res, next) {
    req.responses.data = Utils.createResponse(req.users.user_request.getRequesteds());
    return next();
}

async function removeRequested(req, res, next) {
    try {
        let user = req.users.user_request;
        let friendUserID = req.params.friendUserID ? req.params.friendUserID : req.body.friendUserID;
        let friendUser = await getUserByID(friendUserID);
        if (!friendUser) {
            return next(Utils.createError('friendUserID Invalid', 400));
        }
        if (user.removeRequested(friendUser, true)) {
            friendUser = await friendUser.save();
            user = await user.save();
        }
        req.users.user_request = user;
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            friend_id: friendUser._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function confirmRequested(req, res, next) {
    try {
        let user = req.users.user_request;
        let friendUserID = req.params.friendUserID ? req.params.friendUserID : req.body.friendUserID;
        let friendUser = await getUserByID(friendUserID);
        if (!friendUser) {
            return next(Utils.createError('friendUserID Invalid', 400));
        }
        if (user.confirmRequested(friendUser)) {
            friendUser = await friendUser.save();
            user = await user.save();
            req.users.user_request = user;
        }
        req.responses.data = Utils.createResponse({
            user_id: user._id,
            friend_id: friendUser._id,
        });
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function checkUserLogin(req, res, next) {
    let user = req.isAuthenticated() ? req.user : null;
    if (user && !user.isDeleted) {
        req.users.user_request = user;
        return next();
    } else {
        req.users.user_request = null;
        return next(Utils.createError("User not login", 400, 400));
    }
}

function checkUserLoginIfHave(req, res, next) {
    let user = req.isAuthenticated() ? req.user : null;
    if (user && !user.isDeleted) {
        req.users.user_request = user;
        return next();
    } else {
        req.users.user_request = null;
        return next();
    }
}

async function checkUserRequest(req, res, next) {
    let user = await findUser(req);
    if (user && !user.isDeleted) {
        req.users.user_request = user;
        return next();
    } else {
        req.users.user_request = null;
        return res.status(400).send({
            status: 400,
            message: 'User not exited or deleted',
            data: null
        });
    }
}

async function checkUserRequestIfHave(req, res, next) {
    let user = await findUser(req);
    if (user && !user.isDeleted) {
        req.users.user_request = user;
    } else {
        req.users.user_request = null;
    }
    return next();
}

async function checkUserName(req, res, next) {
    try {
        let username = req.query.username ? req.query.username :
            req.params.username ? req.params.username : (req.body.username ? req.body.username : null);
        let user = await getUserByUserName(username);
        if (user) {
            req.responses.data = Utils.createResponse(user.getBasicInfo());
            return next();
        }
        return next(Utils.createError('', 400));
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function checkEmail(req, res, next) {
    try {
        let email = req.query.email ? req.query.email : req.params.email;
        let user = await getUserbyEmail(email);
        if (user) {
            req.responses.data = Utils.createResponse(user.getBasicInfo());
            return next();
        }
        return next(Utils.createError('', 400));
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function checkPhoneNumber(req, res, next) {
    try {
        let phone = req.query.phone ? req.query.phone : req.params.phone;
        let user = await getUserByPhone(phone);
        if (user) {
            req.responses.data = Utils.createResponse(user.getBasicInfo());
            return next();
        }
        return next(Utils.createError('', 400));
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function login(req, res, next) {
    if (req.isUnauthenticated()) {
        return next(Utils.createError('Login Failed'));
    }
    req.users.user_request = req.user;
    return next();
}
function logout(req, res, next) {
    req.logOut();
    req.session.destroy();
    req.responses.data = Utils.createResponse();
    return next();
}
async function getUsers(req, res, next) {
    try {
        let users = await User.find({
            isDeleted: false,
        });
        req.responses.data = Utils.createResponse(users.map(user => user.getBasicInfo()));
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getFiles(req, res, next) {
    try {
        let user = req.users.user_request;
        let files = await Files.find({
            isDeleted: false,
            'user.id': user._id,
        });
        req.fileitems.files_saved = files;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function searchUserByName(req, res, next) {
    try {
        let key = req.query.username;
        if (!key) {
            return next(Utils.createError('', 400, 400, []));
        }
        let users = await User.find({username: {$regex: key}});
        req.responses.data = Utils.createResponse(users.map(user => user.getBasicInfo()));
        return next();
    } catch (error) {
        return next(Utils.createError(error, 500, 500, null, []));
    }
}

async function getPosts(req, res, next) {
    try {
        let user = req.users.user_request;
        let groups = await Groups.find({_id: {$in: user.getClasssID()}});
        let postIDs = groups.reduce((postIDs, group) => {
            return postIDs.concat(group.getPostIDForUsers(user))
        }, []);
        let topicName = req.query.topicname;
        let posts;
        if (topicName) {
            posts = await Posts.find({isDeleted: false, _id: {$in: postIDs}, topics: {$elemMatch: {_id: topicName}}});
        } else {
            posts = await Posts.find({isDeleted: false, _id: {$in: postIDs}});
        }
        let datas = posts.map(post => post.getBasicInfo(user));
        req.responses.data = Utils.createResponse(datas);
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getManyUsers(userIDs) {
    try {
        if (!userIDs) {
            return null;
        }
        let userNumberIDs = Utils.getNumbers(userIDs);
        return await User.find({_id: {$in: userNumberIDs}});
    } catch (error) {
        return null;
    }
}
function checkTeacherAccount(req, res, next) {
    if (req.users.user_request.isTeacher()) {
        return next();
    }
    return next(Utils.createError('Not is teacher'));
}
function checkSystemAccount(req, res, next) {
    if (req.users.user_request.isSystem()) {
        return next();
    }
    return next(Utils.createError('Not is system'));
}
/*----------------EXPORT------------------ */
exports.postUser = postUser;
exports.putUser = putUser;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.getFriends = getFriends;
exports.addFriend = addFriend;
exports.removeFriend = removeFriend;
exports.getClasss = getClasss;
exports.removeFromClass = removeFromClass;
exports.getRequesteds = getRequesteds;
exports.removeRequested = removeRequested;
exports.confirmRequested = confirmRequested;
exports.getRequests = getRequests;
exports.addRequest = addRequest;
exports.removeRequest = removeRequest;

exports.checkUserName = checkUserName;
// exports.checkUserRequest = [
//     authController.isAuthenticated,
//     checkUserRequest
// ];
exports.checkUserRequest = checkUserRequest;
exports.checkUserRequestIfHave = checkUserRequestIfHave;
exports.checkEmail = checkEmail;
exports.checkPhoneNumber = checkPhoneNumber;
exports.putProfileImage = putProfileImage;
exports.putCoverImage = putCoverImage;
exports.getProfileImageID = getProfileImageID;
exports.getCoverImageID = getCoverImageID;

exports.getClassRequests = getClassRequests;
exports.addClassRequest = addClassRequest;
exports.removeClassRequest = removeClassRequest;

exports.getUserByUserName = getUserByUserName;
exports.getUserByID = getUserByID;
exports.findUser = findUser;
exports.getUserInfo = getUserInfo;
exports.getUsers = getUsers;
exports.login = login;
exports.getFiles = getFiles;
exports.searchUserByName = searchUserByName;
exports.getPosts = getPosts;
exports.getManyUsers = getManyUsers;
exports.postUsers = postUsers;
exports.checkUserLogin = checkUserLogin;
exports.checkUserLoginIfHave = checkUserLoginIfHave;
exports.logout = logout;
exports.checkTeacherAccount = checkTeacherAccount;
exports.checkSystemAccount = checkSystemAccount;