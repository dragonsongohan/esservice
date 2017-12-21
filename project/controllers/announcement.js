let Announcements = require('../models/announcement');
let Utils = require('../application/utils');
let Users = require('../controllers/user');

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
    if (req.announcements.announcement_requested) {
        return req.announcements.announcement_requested;
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
            return res.status(400).send({
                status: 400,
                message: 'Announcement not exited or deleted',
                data: null
            });
        }
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error
        });
    }
}
async function getAnnouncementInfo(req, res) {
    let announcement = req.announcements.announcement_requested;
    return res.json({
        code: 200,
        message: 'Success',
        data: announcement.getBasicInfo(),
    });
}
async function getAllAnnouncements(req, res, next) {
    try {
        let announcements = await Announcements.find({isDeleted: false});
        req.announcements.announcements_requested = announcements ? announcements : [];
        return next();
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error
        });
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
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error
        });
    }
}
async function addAnnouncement(req, res, next) {
    try {
        let user = req.users.user_request;
        let title = req.body.title;
        let content = req.body.content;
        if (!user.isTeacher()) {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: 'Only teacher can create/modify/delete announcement.'
            });
        }
        if (!title || !content) {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: 'Data not exited'
            });
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
        return next();
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error
        });
    }
}
async function removeAnnouncement(req, res, next) {
    try {
        let user = req.users.user_request;
        if (!user.isTeacher()) {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: 'Only teacher can create/modify/delete announcement.'
            });
        }
        let announcement = await findAnnouncement(req);
        req.announcements.announcement_requested = announcement;
        if (!announcement) {
            return res.status(400).send({
                code: 400,
                message: 'Announcement Existed',
                data: null
            });
        }
        if (announcement.isDeleted) {
            return res.status(400).send({
                code: 400,
                message: 'Announcement deleted.',
                data: null
            });
        } else {
            announcement.isDeleted = true;
            announcement = await announcement.save();
            req.announcements.announcement_requested = announcement;
        }
        return next();
    } catch (error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error.message
        });
    }
}
async function updateAnnouncement(req, res, next) {
    try {
        let user = req.users.user_request;
        if (!user.isTeacher()) {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: 'Only teacher can create/modify/delete announcement.'
            });
        }
        let announcement = req.announcements.announcement_requested;
        let title = req.body.title;
        let content = req.body.content;
        if (title) announcement.title = title;
        if (content) announcement.content = content;
        announcement = await announcement.save();
        req.announcements.announcement_requested = announcement;
        return next();
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error
        });
    }
}
async function getAnnouncementsInfo(req, res) {
    let announcements = req.announcements.announcements_requested;
    return res.json({
        code: 200,
        message: 'Success',
        data: announcements.map(announcement => announcement.getBasicInfo()),
    });
}

exports.getAnnouncements = getAnnouncements;
exports.addAnnouncement = addAnnouncement;
exports.removeAnnouncement = removeAnnouncement;
exports.updateAnnouncement = updateAnnouncement;
exports.checkAnnouncementRequest = checkAnnouncementRequest;
exports.getAnnouncementInfo = getAnnouncementInfo;
exports.getAllAnnouncements = getAllAnnouncements;
exports.getAnnouncementsInfo = getAnnouncementsInfo;



