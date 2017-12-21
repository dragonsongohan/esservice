let Users = require('../controllers/user');
let GroupControllers = require('../controllers/group');
let Groups = require('../models/group');
let EventItem = require('../models/event');
let Utils = require('../application/utils');

async function getEventByID(id) {
    try {
        let eventID = Number(id);
        if (isNaN(eventID)) return null;
        return await EventItem.findOne({_id: eventID});
    } catch(error) {
        return null;
    }
}
async function importEvent(req, res) {
//TODO: ImportEvent
}
async function findEvent(req) {
    if (req.events.event_requested) {
        return req.events.event_requested;
    }
    let id = null;
    if (req.query.eventID) {
        id = req.query.eventID;
    } else if (req.params.eventID) {
        id = req.params.eventID;
    } else if (req.body.eventID) {
        id = req.body.eventID;
    }
    if (id) {
        return await getEventByID(id);
    }
    return null;
}

async function checkEventRequest(req, res, next) {
    try {
        let event = await findEvent(req);
        if (event && !event.isDeleted) {
            req.events.event_requested = event;
            return next();
        } else {
            req.events.event_requested = null;
            return res.status(400).send({
                status: 400,
                message: 'Event not exited or deleted',
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

async function getEventsInfo(req, res) {
    let events = req.events.events_requested;
    return res.json({
        code: 200,
        message: 'Success',
        length: events ? events.length : 0,
        data: events ? events.map(event => event.getBasicInfo()) : [],
    });
}
async function getEventInfo(req, res) {
    let event = req.events.event_requested;
    return res.json({
        code: 200,
        message: 'Success',
        data: event.getBasicInfo(),
    });
}
async function getAllEvents(req, res, next) {
    try {
        let events = await EventItem.find({isDeleted: false});
        req.events.events_requested = events ? events : [];
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
async function getSystemEvents(req, res, next) {
    try {
        let events = await EventItem.find({isDeleted: false, context: 100});
        req.events.events_requested = events ? events : [];
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
async function getGroupEvents(req, res, next) {
    try {
        let group = req.groups.group_request;
        let events = await EventItem.find({isDeleted: false, context: 10, 'contextData.id': group._id});
        req.events.events_requested = events ? events : [];
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
async function getUserEvents(req, res, next) {
    try {
        let user = req.users.user_request;
        let events = await EventItem.find({isDeleted: false, 'userCreate.id': user._id});
        req.events.events_requested = events ? events : [];
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
async function getGroupEvent(req, res, next) {
    try {
        if (!req.params.groupEventID) {
            return res.status(400).send({
                code: 400,
                message: 'GroupEventID not define',
                data: null,
            });
        }
        let groupEventID = Number(req.params.groupEventID);
        if (isNaN(groupEventID)) {
            return res.status(400).send({
                code: 400,
                message: 'GroupEventID invalid format',
                data: null,
            });
        }

        let events = await EventItem.find({isDeleted: false, groupEventID: groupEventID});
        req.events.events_requested = events ? events : [];
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

async function getEvents(req, res, next) {
    try {
        let userID = req.query.userID;
        let groupID = req.query.groupID;
        let startTime = req.query.startTime ? Utils.parseDate(req.query.startTime) : null;
        let endTime = req.query.endTime ? Utils.parseDate(req.query.endTime) : null;
        let title = req.query.title;
        let findObject = {isDeleted: false};
        if (userID) findObject['userCreate.id'] = Number(userID);
        if (groupID) {
            findObject.context = 10;
            findObject['contextData.id'] = Number(groupID);
        }
        if (startTime) {
            findObject.startTime = {$gte: startTime};
        }
        if (endTime) {
            findObject.endTime = {$lte: endTime};
        }
        if (title) {
            findObject.title = {$regex: title};
        }
        let events = await EventItem.find(findObject);
        req.events.events_requested = events ? events : [];
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
async function addEvent(req, res, next) {
    try {
        let user = req.users.user_request;
        let group = req.groups.group_request;
        let title = req.body.title;
        let content = req.body.content;
        let eventImageID = req.fileitems.file_selected_id ? String(req.fileitems.file_selected_id) : null;
        let location = req.body.location ? req.body.location : '';
        let context = req.body.context ? Number(req.body.context) : 100;
        let isAllDay = req.body.isAllDay ? req.body.isAllDay === 'true' : false;
        let startTime = req.body.startTime ? Utils.parseDate(req.body.startTime) : null;
        let endTime = req.body.endTime ? Utils.parseDate(req.body.endTime) : null;
        let groupEventID = null;
        if (req.body.groupEventID) {
            let n = Number(req.body.groupEventID);
            groupEventID = isNaN(n) ? Date.now() : n;
        } else {
            groupEventID = Date.now();
        }
        if (!title || !content || !location) {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: 'Data not exited'
            });
        }
        let now = new Date();
        let event = new EventItem({
            _id: now.getTime(),
            title: title,
            content: content,
            eventImageID: eventImageID,
            location: location,
            isAllDay: isAllDay,
            startTime: startTime,
            endTime: endTime,
            groupEventID: groupEventID,
        });
        event.userCreate = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageID: user.profileImageID,
            timeUpdate: now,
        };
        if (event.setContext(context)) {//, contextID)){
            if (event.isGroupContext()) {
                event.contextData = group ? {
                    profileImageID : group.profileImageID,
                    memberCount : group.memberCount,
                    location : group.location,
                    about : group.about,
                    name : group.name,
                    id : group._id,
                } : null;
            } else if (event.isUserContext()) {
                 // event.contextData = user ? user.getBasicInfo() : null;
            } else {
                event.contextData = null;
            }
        }
        else {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: 'context, contextID invalid'
            });
        }
        event = await event.save();
        req.events.event_requested = event;
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
async function addEvents(req, res, next) {
    try {
        let user = req.users.user_request;
        let group = req.groups.group_request;
        let title = req.body.title;
        let content = req.body.content;
        let eventImageID = req.fileitems.file_selected_id ? String(req.fileitems.file_selected_id) : null;
        let location = req.body.location ? req.body.location : '';
        let context = req.body.context ? Number(req.body.context) : 100;
        let isAllDay = req.body.isAllDay ? req.body.isAllDay === 'true' : false;
        let periods = Utils.getPeriodArray(req.body.periods);
        let groupEventID = null;
        if (req.body.groupEventID) {
            let n = Number(req.body.groupEventID);
            groupEventID = isNaN(n) ? Date.now() : n;
        } else {
            groupEventID = Date.now();
        }
        if (!title || !content || !location) {
            return res.status(400).send({
                code: 400,
                message: 'Request Invalid',
                data: null,
                error: 'Data not exited'
            });
        }
        let now = Date.now();
        let userCreate = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageID: user.profileImageID,
            timeUpdate: now,
        };
        let contextData = null;
        if (context === EventItem.getGroupContext()) {
            contextData = group ? {
                profileImageID : group.profileImageID,
                memberCount : group.memberCount,
                location : group.location,
                about : group.about,
                name : group.name,
                id : group._id,
            } : null;
        }
        let createEventItem = function (_id, _startTime, _endTime) {
            let eventItem = new EventItem({
                _id: _id,
                title: title,
                content: content,
                eventImageID: eventImageID,
                location: location,
                isAllDay: isAllDay,
                startTime: _startTime,
                endTime: _endTime,
                userCreate: userCreate,
                context: context,
                contextData: contextData,
                groupEventID: groupEventID,
            });
            return eventItem;
        };
        let events = periods.map(period => {
            if (!period.startTime || !period.endTime) return null;
            return createEventItem(now++, period.startTime, period.endTime);
        }).filter(item => item !== null);
        Promise.all(events.map(event => event.save())
        ).then(eventSaveds => {
            req.events.events_requested = eventSaveds;
            next();
        }).catch(error => next(error));
    } catch(error) {
        return res.status(500).send({
            code: 500,
            message: 'Server Error',
            data: null,
            error: error
        });
    }
}
async function removeEvent(req, res, next) {
    try {
        let event = await findEvent(req);
        req.events.event_requested = event;
        if (!event) {
            return res.status(400).send({
                code: 400,
                message: 'Event Existed',
                data: null
            });
        }
        if (event.isDeleted) {
            return res.status(400).send({
                code: 400,
                message: 'Event deleted.',
                data: null
            });
        } else {
            event.isDeleted = true;
            event = await event.save();
            req.events.event_requested = event;
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
async function updateEvent(req, res, next) {
    try {
        let event = req.events.event_requested;
        let group = req.groups.group_request;
        let title = req.body.title;
        let content = req.body.content;
        let eventImageID = req.fileitems.file_selected_id ? String(req.fileitems.file_selected_id) : null;
        let location = req.body.location ? req.body.location : null;
        let context = req.body.context;
        // let contextID = req.body.contextID;
        let isAllDay = req.body.isAllDay;
        let startTime = req.body.startTime ? Utils.parseDate(req.body.startTime) : null;
        let endTime = req.body.endTime ? Utils.parseDate(req.body.endTime) : null;

        if (title) event.title = title;
        if (content) event.content = content;
        if (eventImageID) event.eventImageID = eventImageID;
        if (location) event.location = location;
        if (isAllDay) event.isAllDay = isAllDay === 'true';
        if (startTime) event.startTime = startTime;
        if (endTime) event.endTime = endTime;
        if (event.setContext(context)) {//, contextID)){
            if (event.isGroupContext()) {
                event.contextData = group ? {
                    profileImageID : group.profileImageID,
                    memberCount : group.memberCount,
                    location : group.location,
                    about : group.about,
                    name : group.name,
                    id : group._id,
                } : null;
            } else if (event.isUserContext()) {
                // event.contextData = user ? user.getBasicInfo() : null;
            } else {
                event.contextData = null;
            }
        }
        event = await event.save();
        req.events.event_requested = event;
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

// exports.getEvent = getEvent;
exports.getSystemEvents = getSystemEvents;
exports.getEvents = getEvents;
exports.addEvent = addEvent;
exports.addEvents = addEvents;
exports.removeEvent = removeEvent;
exports.updateEvent = updateEvent;
exports.checkEventRequest = checkEventRequest;
exports.importEvent = importEvent;
exports.getGroupEvents = getGroupEvents;
exports.getUserEvents = getUserEvents;
exports.getEventsInfo = getEventsInfo;
exports.getEventInfo = getEventInfo;
exports.getAllEvents = getAllEvents;
exports.getGroupEvent = getGroupEvent;


