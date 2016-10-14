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
	if (config.interface === 'lo') {
		logger.error("Interface cannot be localhost if ssl is enabled in config. IRIS Cloud Code Server Exiting....");
		process.exit(1);
	} else {
		app.set('port', 443);
		app.set('ssl_private_key', config.ssl_private_key);
		app.set('ssl_certificate', config.ssl_certificate);
	}
} else {
	// default port is 9000
	app.set('port', process.env.PORT || 9000);
}
// Server address
var intf; // undefined 
var localInterfaces = require('os').networkInterfaces();
var interface = eval('localInterfaces.' + config.interface);
var ipv4_address = 0;
var ipv6_address = 0;
if (interface) {
	// Getting the IPv4 and IPv6 address of an interface in separate 
	// loops. It has been observed that multiple IPv6 addresses can be specified
	// for an interface, in dual stack environments
	// Get the IPv4 address of the specific interface
	for (var i=0; i< interface.length; i++) {
		if (interface[i].family.toLowerCase() == "ipv4") {
			ipv4_address = interface[i].address;
			logger.info("ipv4_address: " + ipv4_address);
			break;
		}
	}
	// Get the IPv6 address of the specific interface
	for (var i=0; i< interface.length; i++) {
		if (interface[i].family.toLowerCase() == "ipv6") {
			ipv6_address = interface[i].address;
			logger.info("ipv6_address: " + ipv6_address);
			break;
		}
	}
	app.set('port', config.port);
	app.set('ipv4_addr', ipv4_address);
	app.set('ipv6_addr', ipv6_address);
} else {
	logger.error("Interface name " + config.interface + " in config file does not exist. IRIS Cloud Code Server Exiting....");
	process.exit(2);
}

// read triggers file
if (config.triggers_file) {	
	var triggers = fs.readFileSync(config.triggers_file)
	// unmarshall to JSON type
	var jsonTriggers = JSON.parse(triggers);
	if (jsonTriggers instanceof Array) {
		for(var i = 0 , len = jsonTriggers.length ; i < len ; i++){
			logger.info(jsonTriggers[i].scriptFile);
			require(jsonTriggers[i].scriptFile)(scripts_modules);
			irisEventTriggers.addTrigger(jsonTriggers[i].appDomain, jsonTriggers[i].eventType, jsonTriggers[i].scriptFile);
			scripts_modules[jsonTriggers[i].scriptFile]();
		}
	} else {
		logger.error(config.triggers_file + "does not contain array of JSON objects");
	}
}

// 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// APIs
app.post('/event', api.processEvent);

var handleShutdown = function() {
	logger.info('IRIS Cloud Code server shutting down...');
	process.exit(0);
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

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
