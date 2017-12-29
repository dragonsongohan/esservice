let express = require('express');
let userController = require('../controllers/user');
let clientController = require('../controllers/client');
let authController = require('../controllers/auth');
let oauth2Controller = require('../controllers/oauth2');
let router = express.Router();

router.route('/clients')
    .get(authController.basicAuthenticated, clientController.getClients)
    .post(authController.basicAuthenticated, clientController.postClient)
    .delete(authController.basicAuthenticated, clientController.deleteClient);
router.route('/authorize')
    .get(authController.basicAndBearerAuthenticated, oauth2Controller.authorization)
    .post(authController.basicAndBearerAuthenticated, oauth2Controller.decision);
router.route('/token').post(authController.isClientAuthenticated, oauth2Controller.token);
router.route('/login').post(authController.localAuthenticated, userController.login);
module.exports = router;
