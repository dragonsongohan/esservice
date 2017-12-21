let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');
let authController = require('../controllers/auth');
let Utils = require('../application/utils');

router.route('/files').get(fileController.getFiles);
router.route('/users').get(userController.getUsers)
    .post(userController.checkUserRequestIfHave, userController.postUser, userController.getUser);
router.route('/groups').get(groupController.getGroups);

///////////////////////////////////////////////////////////////
router.route('/login')
    .get(function(req, res){
        if (req.isAuthenticated()) {
            res.render('logout', {user: req.user});
        } else {
            res.render('login', {});
        }
    })
    .post(authController.isAuthenticated, function(req, res) {
        res.render('logout', {user: req.user});
    });
router.route('/logout').all(function(req, res){
    // if (req.isAuthenticated()) {
        req.logOut();
        req.session.destroy();
        req.session = null;
    // }
    res.render('login', {});
});
router.route('/logins').get(authController.isAuthenticated, function(req, res){
    console.log(req.user);
    res.end();
}).post(authController.isAuthenticated, function(req, res) {
    console.log(req.user);
    res.end();
});

router.route('/abc').get(function(req, res){
    res.redirect('logins');
});
module.exports = router;