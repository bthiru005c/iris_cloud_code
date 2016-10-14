"use strict";

var request = require('request')
	, logger = require('../lib/logwinston.js')
	, irisEventTriggers = require('../server/iriseventtriggers');


function firstXmppParticipantJoined(payload) {
	logger.info("Processing afterSave trigger for Event_type");
};

module.exports = function(scripts_modules) {
	// the key in this dictionary can be whatever you want
	// just make sure it won't override other modules
	scripts_modules['/home/centos/iris_cloud_code/scripts/xmpp.js'] = firstXmppParticipantJoined;
};

