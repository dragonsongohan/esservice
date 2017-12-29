let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');
let authController = require('../controllers/auth');
/*----------------CHECK_API--------------------- */
router.use(authController.isAuthenticated);
router.route('/username').get(userController.checkUserName);
router.route('/username/:username').get(userController.checkUserName);
router.route('/email').get(userController.checkEmail);
router.route('/phone').get(userController.checkPhoneNumber);

module.exports = router;