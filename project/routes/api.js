let express = require('express');
let router = express.Router();
let userController = require('../controllers/user');
let oauth2Controller = require('../controllers/oauth2');
let authController = require('../controllers/auth');
let clientController = require('../controllers/client');
/*---------------------------------------------*/
router.route('/').get(function (req, res) {
    return res.json({
        message: 'API Service Running!'
    });
});
router.route('/users')
    .post(userController.postUser)
    .get(authController.isAuthenticated, userController.getUsers);
router.route('/clients')
    .get(authController.isAuthenticated, clientController.getClients)
    .post(authController.isAuthenticated, clientController.postClients)
    .delete(authController.isAuthenticated, clientController.deleteClient);

// Create endpoint handlers for oauth2 authorize
router.route('/oauth2/authorize')
    .get(authController.isAuthenticated, oauth2Controller.authorization)
    .post(authController.isAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router.route('/oauth2/token').post(authController.isClientAuthenticated, oauth2Controller.token);

module.exports = router;