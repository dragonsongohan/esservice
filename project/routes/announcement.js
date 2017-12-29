let express = require('express');
let userController = require('../controllers/user');
let AnnouncementController = require('../controllers/announcement');
let authController = require('../controllers/auth');
let router = express.Router();
//--------------------------API---------------------------//
router.use(authController.isAuthenticated);
router.route('/')
    .get(AnnouncementController.getAllAnnouncements, AnnouncementController.getAnnouncementsInfo)
    .post(userController.checkSystemOrTeacherAccount, AnnouncementController.addAnnouncement, AnnouncementController.getAnnouncementInfo);

router.route('/info/:announcementID').get(AnnouncementController.checkAnnouncementRequest, AnnouncementController.getAnnouncementInfo);
router.route('/update/:announcementID').put(userController.checkSystemOrTeacherAccount, AnnouncementController.checkAnnouncementRequest, AnnouncementController.updateAnnouncement, AnnouncementController.getAnnouncementInfo);
router.route('/delete/:announcementID').delete(userController.checkSystemOrTeacherAccount, AnnouncementController.removeAnnouncement, AnnouncementController.getAnnouncementInfo);
router.route('/filter').get(AnnouncementController.getAnnouncements, AnnouncementController.getAnnouncementsInfo);

module.exports = router;