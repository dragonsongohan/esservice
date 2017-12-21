let express = require('express');
let UserController = require('../controllers/user');
let AnnouncementController = require('../controllers/announcement');

let router = express.Router();

router.route('/')
    .get(AnnouncementController.getAllAnnouncements, AnnouncementController.getAnnouncementsInfo)
    .post(UserController.checkUserRequest, AnnouncementController.addAnnouncement, AnnouncementController.getAnnouncementInfo);

router.route('/filter').get(AnnouncementController.getAnnouncements, AnnouncementController.getAnnouncementsInfo);
router.route('/:announcementID')
    .get(AnnouncementController.checkAnnouncementRequest, AnnouncementController.getAnnouncementInfo)
    .put(UserController.checkUserRequest, AnnouncementController.checkAnnouncementRequest, AnnouncementController.updateAnnouncement, AnnouncementController.getAnnouncementInfo)
    .delete(UserController.checkUserRequest, AnnouncementController.removeAnnouncement, AnnouncementController.getAnnouncementInfo);

module.exports = router;