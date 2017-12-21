let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');

/*----------------CHECK_API--------------------- */
router.route('/username').get(userController.checkUserName);
router.route('/username/:username').get(userController.checkUserName);
router.route('/email').get(userController.checkEmail);
router.route('/phone').get(userController.checkPhoneNumber);

module.exports = router;