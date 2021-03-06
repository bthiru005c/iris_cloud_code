"use strict";
var em = require('../cloudcode')
	, logger = require('../lib/logwinston.js');

let triggerStore = {};

const addTrigger = function(appDomain, eventType, scriptFile) {
	var key = appDomain + eventType;
	triggerStore[key] = scriptFile;
};

function getTrigger(appDomain, eventType) {
	var key = appDomain + eventType;
	if (triggerStore && triggerStore[key]) {
		return triggerStore[key];
	}
	return undefined;
}

function fireTrigger(traceID, payLoad) {
	var key = payLoad.app_domain + payLoad.event_type;
	if (triggerStore && triggerStore[key]) {
		var script = triggerStore[key];
		logger.debug("script is " + script);
		em.scripts_modules[script](traceID, payLoad);
	} else {
		logger.info(payLoad);
	}
}

module.exports = {
	addTrigger: addTrigger,
	getTrigger: getTrigger,
	fireTrigger: fireTrigger
};
