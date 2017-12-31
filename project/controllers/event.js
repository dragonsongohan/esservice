let UserController = require('../controllers/user');
let GroupController = require('../controllers/group');
let Groups = require('../models/group');
let EventItem = require('../models/event');
let Utils = require('../application/utils');

async function getEventByID(id) {
    try {
        let eventID = Number(id);
        if (isNaN(eventID)) return null;
        return await EventItem.findOne({_id: eventID});
    } catch (error) {
        return null;
    }
}

async function importEvent(req, res, next) {
    //TODO: ImportEvent
    req.events.events_requested = [];
    return next();
}

async function findEvent(req) {
    let eventRequest = getEventRequest(req);
    if (eventRequest) {
        return eventRequest;
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
            return next(Utils.createError('Event not exited or deleted', 400));
        }
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getEventsInfo(req, res, next) {
    let events = req.events.events_requested;
    req.responses.data = Utils.createResponse(events ? events.map(event => event.getBasicInfo()) : []);
    return next();
}

async function getEventInfo(req, res, next) {
    let event = getEventRequest(req);
    req.responses.data = Utils.createResponse(event.getBasicInfo());
    return next();
}

async function getAllEvents(req, res, next) {
    try {
        let currentUser = UserController.getCurrentUser(req);
        let findObject = {isDeleted: false};
        let events = await EventItem.find(findObject);
        req.events.events_requested = events;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getSystemEvents(req, res, next) {
    try {
        let events = await EventItem.find({isDeleted: false, context: 100});
        req.events.events_requested = events ? events : [];
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getGroupEvents(req, res, next) {
    try {
        let group = GroupController.getGroupRequest(req);
        let findObject = {isDeleted: false, context: 10};
        if (group) {
            findObject['contextData.id'] = group._id;
        }
        let events = await EventItem.find(findObject);
        req.events.events_requested = events ? events : [];
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getUserEvents(req, res, next) {
    try {
        let requestUser = UserController.getRequestUser(req);
        let events = await EventItem.find({isDeleted: false, context: 1, 'userCreate.id': requestUser._id});
        req.events.events_requested = events ? events : [];
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function getGroupEvent(req, res, next) {
    try {
        if (!req.params.groupEventID) {
            return next(Utils.createError('GroupEventID not define', 400));
        }
        let groupEventID = Number(req.params.groupEventID);
        if (isNaN(groupEventID)) {
            return next(Utils.createError('GroupEventID invalid format', 400));
        }
        let currentUser = UserController.getCurrentUser(req);
        let findObject = {isDeleted: false, groupEventID: groupEventID};
        let events = await EventItem.find(findObject);
        req.events.events_requested = events;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
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
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function addEvent(req, res, next) {
    try {
        let user = UserController.getCurrentUser(req);
        let group = GroupController.getGroupRequest(req);
        let context = req.body.context ? Number(req.body.context) : 100;
        if (!EventItem.isInvalidContext(context)) {
            return next(Utils.createError('Request Invalid', 400, 400, 'context, contextID invalid'));
        }
        let contextData = null;
        if (context === EventItem.getGroupContext()) {
            if (!group) {
                if (!group) {
                    return next(Utils.createError('Request Invalid', 400, 400, 'contextData invalid for groupContext'));
                }
            }
            if (!group.isMember(user)) {
                return next(Utils.createError('User not permit', 400));
            }
            contextData = {
                profileImageID: group.profileImageID,
                memberCount: group.memberCount,
                location: group.location,
                about: group.about,
                name: group.name,
                id: group._id,
            };
        }
        let title = req.body.title;
        let content = req.body.content;
        let eventImageID = req.fileitems.file_selected_id ? String(req.fileitems.file_selected_id) : null;
        let location = req.body.location ? req.body.location : '';
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
            return next(Utils.createError('Request Invalid', 400, 400, 'Data not exited'));
        }
        let now = new Date();
        let userCreate = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageID: user.profileImageID,
            timeUpdate: now,
        };
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
            userCreate: userCreate,
            context: context,
            contextData: contextData,
        });
        event = await event.save();
        req.events.event_requested = event;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function addEvents(req, res, next) {
    try {
        let user = UserController.getCurrentUser(req);
        let group = GroupController.getGroupRequest(req);
        let context = req.body.context ? Number(req.body.context) : 100;
        if (!EventItem.isInvalidContext(context)) {
            return next(Utils.createError('Request Invalid', 400, 400, 'context, contextID invalid'));
        }
        let contextData = null;
        if (context === EventItem.getGroupContext()) {
            if (!group) {
                if (!group) {
                    return next(Utils.createError('Request Invalid', 400, 400, 'contextData invalid for groupContext'));
                }
            }
            if (!group.isMember(user)) {
                return next(Utils.createError('User not permit', 400));
            }
            contextData = {
                profileImageID: group.profileImageID,
                memberCount: group.memberCount,
                location: group.location,
                about: group.about,
                name: group.name,
                id: group._id,
            };
        }
        let title = req.body.title;
        let content = req.body.content;
        let eventImageID = req.fileitems.file_selected_id ? String(req.fileitems.file_selected_id) : null;
        let location = req.body.location ? req.body.location : '';
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
            return next(Utils.createError('Request Invalid', 400, 400, 'Data not exited'));
        }
        let now = new Date();
        let userCreate = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageID: user.profileImageID,
            timeUpdate: now,
        };
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
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function removeEvent(req, res, next) {
    try {
        let event = getEventRequest(req);
        let currentUser = UserController.getCurrentUser(req);
        if (!currentUser.isSystem()
            || (currentUser._id !== event.userCreate.id)) {
            return next(Utils.createError('User not permit', 400));
        }
        event.isDeleted = true;
        event = await event.save();
        req.events.event_requested = event;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

async function updateEvent(req, res, next) {
    try {
        let event = getEventRequest(req);
        let currentUser = UserController.getCurrentUser(req);
        if (currentUser._id !== event.userCreate.id) {
            return next(Utils.createError('User not permit', 400));
        }
        let title = req.body.title;
        let content = req.body.content;
        let eventImageID = req.fileitems.file_selected_id ? String(req.fileitems.file_selected_id) : null;
        let location = req.body.location ? req.body.location : null;
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
        event = await event.save();
        req.events.event_requested = event;
        return next();
    } catch (error) {
        return next(Utils.createError(error));
    }
}

function checkPermitForEvent(req, res, next) {
    let currentUser = UserController.getCurrentUser(req);
    let eventRequest = getEventRequest(req);
    if (!currentUser.isSystem()) {
        if (eventRequest.context === 1) {
            if (eventRequest.userCreate.id === currentUser._id) {
                return next();
            }
            return next(Utils.createError('User not permit', 400));
        }
    }
    return next();
}

function filterEventsWithPermit(req, res, next) {
    let currentUser = UserController.getCurrentUser(req);
    let events = getEventsRequest(req);
    if (!events) events = [];
    if (!currentUser.isSystem()) {
        events = events.filter(event => {
            if (event.context === 1) {
                return event.userCreate.id === currentUser._id;
            }
            return true;
        });
    }
    req.events.events_requested = events;
    return next();
}

function getEventRequest(req) {
    return req.events.event_requested;
}

function getEventsRequest(req) {
    return req.events.events_requested;
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
exports.getEventRequest = getEventRequest;
exports.checkPermitForEvent = checkPermitForEvent;
exports.filterEventsWithPermit = filterEventsWithPermit;