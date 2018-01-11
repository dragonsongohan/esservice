let express = require('express');
let UserController = require('../controllers/user');
let GroupController = require('../controllers/group');
let FileController = require('../controllers/fileitem');
let Utils = require('../application/utils');
let PostController = require('../controllers/post');
let EventController = require('../controllers/event');
let authController = require('../controllers/auth');
let router = express.Router();

router.use(authController.isAuthenticated);
router.route('/').post(FileController.imageUpload, GroupController.checkGroupRequestIfHave,FileController.postFileIfHave, EventController.addEvent, EventController.getEventInfo)
    .get(EventController.getAllEvents, EventController.filterEventsWithPermit, EventController.getEventsInfo);
router.route('/groupevent/:groupEventID').get(EventController.getGroupEvent, EventController.filterEventsWithPermit, EventController.getEventsInfo);
router.route('/system').get(EventController.getSystemEvents, EventController.filterEventsWithPermit, EventController.getEventsInfo);
router.route('/user/:userID').get(UserController.checkSystemAccount, UserController.checkUserRequest, EventController.getUserEvents, EventController.filterEventsWithPermit, EventController.getEventsInfo);
router.route('/user').get(UserController.putCurrentUser, EventController.getUserEvents, EventController.filterEventsWithPermit, EventController.getEventsInfo);
router.route('/group/:groupID').get(GroupController.checkGroupRequest, EventController.getGroupEvents, EventController.filterEventsWithPermit, EventController.getEventsInfo);
router.route('/group').get(EventController.getGroupEvents, EventController.filterEventsWithPermit, EventController.getEventsInfo);
router.route('/filter').get(EventController.getEvents, EventController.filterEventsWithPermit, EventController.getEventsInfo);

router.route('/create').post(FileController.imageUpload, GroupController.checkGroupRequestIfHave,FileController.postFileIfHave, EventController.addEvents, EventController.getEventsInfo);
// router.route('/import').post(EventController.importEvent, EventController.getEventsInfo);
router.route('/import').post(FileController.fileUpload, FileController.postFile, FileController.putContentBody, GroupController.checkGroupRequestIfHave, EventController.importEvents, EventController.getEventsInfo);
router.route('/export/:eventID').get(EventController.checkEventRequest, EventController.checkPermitForEvent, EventController.exportEvent, FileController.outputToFile);
router.route('/info/:eventID').get(EventController.checkEventRequest, EventController.checkPermitForEvent, EventController.getEventInfo);
router.route('/update/:eventID').put(FileController.imageUpload, EventController.checkEventRequest, EventController.checkPermitForEvent, GroupController.checkGroupRequestIfHave,  FileController.postFileIfHave, EventController.updateEvent, EventController.getEventInfo)
router.route('/delete/:eventID').delete(EventController.checkEventRequest, EventController.checkPermitForEvent, EventController.removeEvent, EventController.getEventInfo);
module.exports = router;
