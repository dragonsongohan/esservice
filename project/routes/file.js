let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let authController = require('../controllers/auth');

//-------------------------FILE API---------------------//
router.use(authController.isAuthenticated);
router.route('/upload').post(fileController.fileUpload, fileController.postFile, fileController.getInfoFile);
router.route('/image').post(fileController.imageUpload, fileController.postFile, fileController.getInfoFile);
router.route('/uploads').post(fileController.arrayFileUpload, fileController.postFiles, fileController.getInfoFiles);
router.route('/uploadall').post(fileController.anyFileUpload, fileController.postFiles, fileController.getInfoFiles);
router.route('/images').post(fileController.arrayImageUpload, fileController.postFiles, fileController.getInfoFiles);
router.route('/update/:fileID').put(fileController.fileUpload, fileController.checkFileRequest, fileController.updateFile, fileController.getInfoFile);
router.route('/get/:fileID').get(fileController.checkFileRequest, fileController.getFile);
router.route('/attach/:fileID').get(fileController.checkFileRequest, fileController.attachFile);
router.route('/delete/:fileID').delete(fileController.checkFileRequest, fileController.deleteFile, fileController.getInfoFile);
router.route('/info/:fileID').get(fileController.checkFileRequest, fileController.getInfoFile);
module.exports = router;