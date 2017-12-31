let Announcements = require('../models/announcement');
let Utils = require('../application/utils');
let UserControllers = require('../controllers/user');
let AnnouncementEvents = require('../application/application').events.announcements;

async function getAnnouncementByID(id) {
    try {
        let announcementID = Number(id);
        if (isNaN(announcementID)) return null;
        return await Announcements.findOne({_id: announcementID});
    } catch(error) {
        return null;
    }
}
async function findAnnouncement(req) {
    let announcementRequest = getAnnouncementRequest(req);
    if (announcementRequest) {
        return announcementRequest;
    }
    let id = null;
    if (req.query.announcementID) {
        id = req.query.announcementID;
    } else if (req.params.announcementID) {
        id = req.params.announcementID;
    } else if (req.body.announcementID) {
        id = req.body.announcementID;
    }
    if (id) {
        return await getAnnouncementByID(id);
    }
    return null;
}

async function checkAnnouncementRequest(req, res, next) {
    try {
        let announcement = await findAnnouncement(req);
        if (announcement && !announcement.isDeleted) {
            req.announcements.announcement_requested = announcement;
            return next();
        } else {
            req.announcements.announcement_requested = null;
            return next(Utils.createError('Announcement not exited or deleted', 400));
        }
    } catch(error) {
        return next(Utils.createError(error));
    }
}
async function getAnnouncementInfo(req, res, next) {
    let announcement = getAnnouncementRequest(req);
    req.responses.data = Utils.createResponse(announcement.getBasicInfo());
    return next();
}
async function getAllAnnouncements(req, res, next) {
    try {
        let announcements = await Announcements.find({isDeleted: false});
        req.announcements.announcements_requested = announcements ? announcements : [];
        return next();
    } catch(error) {
        return next(Utils.createError(error));
    }
}

async function getAnnouncements(req, res, next) {
    try {
        let userID = req.query.userID;
        let startTime = req.query.startTime ? Utils.parseDate(req.query.startTime) : null;
        let endTime = req.query.endTime ? Utils.parseDate(req.query.endTime) : null;
        let title = req.query.title;
        let findObject = {isDeleted: false};
        if (userID) findObject['userCreate.id'] = Number(userID);
        if (startTime) {
            findObject.timeCreate = {$gte: startTime};
        }
        if (endTime) {
            findObject.timeCreate = {$lte: endTime};
        }
        if (title) {
            findObject.title = {$regex: title};
        }
        let announcements = await Announcements.find(findObject);
        req.announcements.announcements_requested = announcements ? announcements : [];
        return next();
    } catch(error) {
        return next(Utils.createError(error));
    }
}
async function addAnnouncement(req, res, next) {
    try {
        let user = UserControllers.getCurrentUser(req);
        let title = req.body.title;
        let content = req.body.content;
        if (!title || !content) {
            return next(Utils.createError('Request Invalid', 400, 400, 'Data not exited'));
        }
        let now = new Date();
        let announcement = new Announcements({
            _id: now.getTime(),
            title: title,
            content: content,
            timeCreate: now,
        });
        announcement.userCreate = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageID: user.profileImageID,
            timeUpdate: now,
            timeCreate: now,
        };
        announcement = await announcement.save();
        req.announcements.announcement_requested = announcement;
        AnnouncementEvents.emit('NewAnnouncement', announcement);
        return next();
    } catch(error) {
        return next(Utils.createError(error));
    }
}
async function removeAnnouncement(req, res, next) {
    try {
        let user = UserControllers.getCurrentUser(req);
        let announcement = await findAnnouncement(req);
        req.announcements.announcement_requested = announcement;
        if (!announcement) {
            return next(Utils.createError('Announcement not existed', 400));
        }
        if (announcement.isDeleted) {
            return next(Utils.createError('Announcement deleted', 400));
        } else {
            announcement.isDeleted = true;
            announcement = await announcement.save();
            req.announcements.announcement_requested = announcement;
        }
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}
async function updateAnnouncement(req, res, next) {
    try {
        let user = UserControllers.getCurrentUser(req);
        let announcement = getAnnouncementRequest(req);
        if (user._id !== announcement.userCreate.id) {
            return next(Utils.createError('User not permit', 400));
        }
        let title = req.body.title;
        let content = req.body.content;
        if (title) announcement.title = title;
        if (content) announcement.content = content;
        announcement = await announcement.save();
        req.announcements.announcement_requested = announcement;
        return next();
    } catch(error) {
        return next(Utils.createError(error));
    }
}
async function getAnnouncementsInfo(req, res, next) {
    let announcements = req.announcements.announcements_requested;
    req.responses.data = Utils.createResponse(announcements.map(announcement => announcement.getBasicInfo()));
    return next();
}

function getAnnouncementRequest(req) {
    return req.announcements.announcement_requested;
}

exports.getAnnouncements = getAnnouncements;
exports.addAnnouncement = addAnnouncement;
exports.removeAnnouncement = removeAnnouncement;
exports.updateAnnouncement = updateAnnouncement;
exports.checkAnnouncementRequest = checkAnnouncementRequest;
exports.getAnnouncementInfo = getAnnouncementInfo;
exports.getAllAnnouncements = getAllAnnouncements;
exports.getAnnouncementsInfo = getAnnouncementsInfo;
exports.getAnnouncementRequest = getAnnouncementRequest;



