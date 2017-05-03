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
	, validateJwt = require('./server/validate-jwt')
	, scripts_modules = {};

var app = express();

var iris_server_jwt;

// read jwt file periodically
(function get_iris_server_jwt() {
	try {
		data = fs.readFileSync(config.jwt_file, "utf8");
		var lines = data.split(/\r\n|\r|\n/);
		if (lines.length != 2) {
			logger.error("Type=JwtFile, Message=jwt file " + config.jwt_file + " has " + lines.length + " lines - should contain only one line ; Iris CloudCode Exiting...." );
			process.exit(1);	
		} 
		// else do nothing
		// copy the JWT
		iris_server_jwt = lines[0];
		// Call the same function again every 30 seconds
		setTimeout(function () {
			get_iris_server_jwt();
		}, 30*1000);
	} catch (err) {
	  	logger.error("Type=ntmJwtFileReadFailure, Message=" + err + " ; Unable to read jwt file " +  config.jwt_file + " ; Iris CloudCode Exiting...." );
	  	process.exit(1);	
	}
})();

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

try {
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
		logger.error("./configuration/triggers.json does not contain array of JSON objects");
	}
} catch (err) {
	logger.error("Type=clcTriggersJsonFileReadFailure, Message=" + err + " ; Unable to read triggers.json file " +  config.jwt_file + " ; Iris CloudCode Exiting...." );
	process.exit(1);	
}

// 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/v1/version', api.version);

// ALL APIs below must be validated 
app.use(validateJwt.verify);
// APIs
app.post('/v1/event', api.processEvent);

// GET

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
app.all('/.git/', function (req,res, next) {
   res.status(403).send({
      message: 'Access Forbidden'
   });
});

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
exports.config = config;
/* 
 *  The following SO link
 *  http://stackoverflow.com/questions/7381802/node-modules-exporting-a-variable-versus-exporting-functions-that-reference-it
 *  explains why passing by reference (not value) is correct
 */
Object.defineProperty(exports, "scripts_modules", {
  get: function() { return scripts_modules; }
});
Object.defineProperty(exports, "iris_server_jwt", {
  get: function() { return iris_server_jwt; }
});