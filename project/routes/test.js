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
// router.route('/files').get(fileController.getFiles);
// router.route('/users').get(userController.getUsers)
//     .post(userController.checkUserRequestIfHave, userController.postUser, userController.getUser);
// router.route('/groups').get(groupController.getGroups);

///////////////////////////////////////////////////////////////
// router.route('/login')
//     .get(function (req, res) {
//         if (req.isAuthenticated()) {
//             res.render('logout', {user: req.user});
//         } else {
//             res.render('login', {});
//         }
//     })
//     .post(authController.isAuthenticated, function (req, res) {
//         res.render('logout', {user: req.user});
//     });
// router.route('/logout').all(function (req, res) {
//     // if (req.isAuthenticated()) {
//     req.logOut();
//     req.session.destroy();
//     req.session = null;
//     // }
//     res.render('login', {});
// });
// router.route('/logins').get(authController.isAuthenticated, function (req, res) {
//     console.log(req.user);
//     res.end();
// }).post(authController.isAuthenticated, function (req, res) {
//     console.log(req.user);
//     res.end();
// });

router.route('/init')
    .post(async function (req, res, next) {
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