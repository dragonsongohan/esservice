let express = require('express');
let router = express.Router();
let userController = require('../controllers/user');
let fileController = require('../controllers/fileitem');
let groupController = require('../controllers/group');
let authController = require('../controllers/auth');

//---------------USERS
router.route('users/').post(userController.postUser, userController.getUser);
router.route('users/profileImage/:userID').get(userController.checkUserRequest, userController.getProfileImageID, fileController.checkFileRequest, fileController.getFile);
router.route('users/all').get(userController.getUsers);
router.route('user/search').get(userController.searchUserByName);