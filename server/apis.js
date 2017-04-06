"use strict";
var irisEventTriggers = require('./iriseventtriggers')
	, logger = require('../lib/logwinston.js')
	, uuidV1 = require('uuid/v1');	
                                                                      
/*                                                                                 
 * POST /event
 * @return - 200 OK with account id and auth token                                 
 *         - relevant response code for errors                                     
 */                                                                                
exports.processEvent = function(req, res) {                                      
	var trace_id = "CLC-" + uuidV1();
	if (req.headers['trace-id']) {
		trace_id = req.headers['trace-id'];
	}
	
	// process.nextTick() defers the function to  a completely new stack
	// Also allows the process to process other I/O bound requests
	if (typeof irisEventTriggers.getTrigger(req.body.app_domain, req.body.event_type) != 'undefined') {
		process.nextTick(irisEventTriggers.fireTrigger, trace_id, req.body);
	} else {
		logger.info("Traceid=" + trace_id + ", Trigger=FALSE, Message=app_domain=" + req.body.app_domain + " event_type=" + req.body.event_type);
	}
	res.sendStatus(200);              
};
                
// get software version
exports.version = function(req, res) {
	var ver = {
		"version": "IRIS Cloud Code v1.0.19"
	};
	res.status(200).json(JSON.stringify(ver));
};                          
                             