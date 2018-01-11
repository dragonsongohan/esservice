let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');
let authController = require('../controllers/auth');
let Utils = require('../application/utils');
let ConfigController = require('../controllers/config');
let Configs = require('../models/config');
let User = require('../models/user');

router.route('/upload').post(fileController.fileUpload, fileController.postFile, fileController.putContentBody, function(req, res) {
    res.send(req.body);
});
// router.route('/upload').post(fileController.fileUpload, fileController.postFile, fileController.getInfoFile);
router.route('/init')
    .get(async function (req, res, next) {
        try {
            let config = await Configs.findOne({isDeleted: false});
            if (!config) {
                config = new Configs({
                    _id: Date.now(),
                    userID: 0,
                    timeCreate: new Date(),
                    config: Configs.getDefaultConfig(),
                    isDeleted: false,
                });
                config.setInited(false);
            }
            if (!config.getInited()) {
                let user = createSystemUser('system', 'system', 'esservice', 'system');
                user = await user.save();
                config.setInited(true);
                await config.save();
            }
            res.send({code: 200, message: 'Success', data: config});
        } catch (error) {
            return next(Utils.createError(error));
        }
    });

function createSystemUser(username, password, firstName, lastName) {
    let user = new User({
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        isDeleted: false,
    });
    user.setSystemUser();
    return user;
}

module.exports = router;