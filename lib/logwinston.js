
var env = process.env.NODE_ENV || 'development'
  , config = require('../configuration/config')[env]
  , winston = require('winston')
  , logRotate = require('winston-filerotatedate')
  , path = require('path')
  , fs = require('fs');

var transports = [];

// Logging levels: 
// silly: 0,
// debug: 1,
// verbose: 2,
// info: 3,
// warn: 4,
// error: 5

// Console stdout
if (config.log.console.enabled) {
    transports.push(new (winston.transports.Console)({
        level: config.log.console.level,
        prettyPrint: true,
        json: false,
        timestamp: true,
        handleExceptions: true,
        // Console specific:
        colorize: config.log.console.colorize
    }));
}

// Rotating file - always write to one set filename but start a fresh file 
// every "maxsize" bytes
//                  and rename previous file with a timestamp
if (config.log.plaintext.enabled) {
    var logdir = config.log.plaintext.dirname
        || path.normalize(__dirname + '/../..');
    if (!fs.existsSync(logdir)){
        fs.mkdirSync(logdir);   // Initialize and export logger module
    }    
    transports.push(new winston.transports.DailyRotateFile ({
        level: config.log.plaintext.level,
        prettyPrint: true,
        json: false,
        timestamp: true,
        handleExceptions: true,
        // File specific:
        filename: config.log.plaintext.filename,
        dirname: logdir,
        maxsize: config.log.plaintext.maxsize
    }));
}

// Initialize and export logger module
var logger = new (winston.Logger)({
    transports: transports,
    exitOnError: true
});

module.exports = logger;

