"use strict";
var em = require('../emcloudcode')
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

function fireTrigger(payLoad) {
	var key = payLoad.app_domain + payLoad.event_type;
	if (triggerStore && triggerStore[key]) {
		var script = triggerStore[key];
		logger.info("script is " + script);
		em.scripts_modules[script]();
	} else {
		logger.info(payLoad);
	}
}

module.exports = {
	addTrigger: addTrigger,
	getTrigger: getTrigger,
	fireTrigger: fireTrigger
};
