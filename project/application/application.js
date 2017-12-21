module.exports = {
    manager: require('./manager'),
    utils: require('./utils'),
    //Init extends object, log request.
    initialize: function (req, res, next) {
        req.posts = req.posts ? req.posts : {};
        req.fileitems = req.fileitems ? req.fileitems : {};
        req.users = req.users ? req.users : {};
        req.groups = req.groups ? req.groups : {};
        req.events = req.events ? req.events : {};
        req.comments = req.comments ? req.comments : {};
        req.announcements = req.announcements ? req.announcements : {};
        req.responses = req.responses ? req.responses: {};
        // console.log("Request:" + req.path + "[" + req.method + "]");
        next();
    },
    corsConfig: function (req, res, next) {
        // CORS headers
        res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        // Set custom headers for CORS
        res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        } else {
            return next();
        }
    },
    defaultHandler: function(req, res) {
        if (req.responses.data) {
            if (Array.isArray(req.responses.data.data)) {
                req.responses.data.length = req.responses.data.data.length;
            }
            return res.send(req.responses.data);
        } else {
            res.end('Not support path: \'' + req.path + '\'');
        }
    },
    errorHandler: function (err, req, res, next) {
        let httpstatus = 500;
        let logicCode = 500;
        let details = "Server Error";
        let data = null;
        let message = err ? err.message : 'Server error';
        if (err) {
            httpstatus = err.httpstatus ? err.httpstatus : 500;
            logicCode = err.logicCode ? err.logicCode : httpstatus;
            details = err.details ? err.details : message;
            data = err.data ? err.data : null;
        }
        return res.status(httpstatus).send({
            code: logicCode,
            message: message,
            data: data,
            error: details,
        })
    }
};