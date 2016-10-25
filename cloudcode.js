var env = process.env.NODE_ENV || 'development'
	, config = require('./configuration/config')[env]
	, express = require('express')
	, logger = require('./lib/logwinston.js')
	, path = require('path')
	, bodyParser = require('body-parser')
	, fs = require('fs')
	, cors = require('cors')
	, irisEventTriggers = require('./server/iriseventtriggers')
	, api = require('./server/apis')
	, scripts_modules = {};

var app = express();

app.set('ssl_enabled', config.ssl_enabled);
if (config.ssl_enabled) {
	app.set('ssl_private_key', config.ssl_private_key);
	app.set('ssl_certificate', config.ssl_certificate);
}

// certificates
app.set('ssl_enabled', config.ssl_enabled);
if (config.ssl_enabled) {
	app.set('port', 443);
	app.set('ssl_private_key', config.ssl_private_key);
	app.set('ssl_certificate', config.ssl_certificate);
} else {
	// default port is 9000
	app.set('port', process.env.PORT || 9000);
}

// read triggers file
var triggers = fs.readFileSync("./triggers/triggers.json")
// unmarshall to JSON type
var jsonTriggers = JSON.parse(triggers);
if (jsonTriggers instanceof Array) {
	for(var i = 0 , len = jsonTriggers.length ; i < len ; i++){
		require(jsonTriggers[i].scriptFile)(scripts_modules);
		irisEventTriggers.addTrigger(jsonTriggers[i].appDomain, jsonTriggers[i].eventType, jsonTriggers[i].scriptFile);
	}
} else {
	logger.error("./triggers/triggers.json does not contain array of JSON objects");
}

// 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// APIs
app.post('/v1/event', api.processEvent);

var handleShutdown = function() {
	logger.info('IRIS Cloud Code server shutting down...');
	process.exit(0);
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send();
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send();
});


module.exports = app;
/* 
 *  export the current value of best_xmpp_server
 *  The following SO link
 *  http://stackoverflow.com/questions/7381802/node-modules-exporting-a-variable-versus-exporting-functions-that-reference-it
 *  explains why passing by reference (not value) is correct
 *  The line "export.best_xmpp_server  best_xmpp_server" will ensure that
 *  best_xmpp_server will always remain same, in the module that uses it
 */
Object.defineProperty(exports, "scripts_modules", {
  get: function() { return scripts_modules; }
});
