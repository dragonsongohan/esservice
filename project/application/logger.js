let winston = require('winston');
let Utils = require('./utils');
let config = require('config');
winston.emitErrs = true;
 
let DebugLogger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: config.get('logs.level'),
            handleExceptions: config.get('logs.handleExceptions'),
            json: false,
            colorize: false,
            timestamp: function() {
                let date = new Date();
                return Utils.exportDate(date);
            },
            formatter: function(options) {
                return 
                    options.timestamp() + ' ' + 
                    options.level.toUpperCase() +' '+ 
                    (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        }),
    ],
    exitOnError: false
});
let InfoLogger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'info',//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
            handleExceptions: false,
            json: false,
            colorize: false,
            timestamp: function() {
                let date = new Date();
                return Utils.exportDate(date);
            },
            formatter: function(options) {
                return 
                    options.timestamp() + ' ' + 
                    options.level.toUpperCase() +' '+ 
                    (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            }
        }),
    ],
    exitOnError: false
});
module.exports.Debug = DebugLogger;
module.exports.Info = InfoLogger;