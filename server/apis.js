"use strict";
var irisEventTriggers = require('./iriseventtriggers')
	, logger = require('../lib/logwinston.js');
                                                                      
/*                                                                                 
 * POST /event
 * @return - 200 OK with account id and auth token                                 
 *         - relevant response code for errors                                     
 */                                                                                
exports.processEvent = function(req, res) {                                      
	// 1. Assuming password is already encrypted, create a document                  
	if ( (!req.body.app_domain) || (!req.body.event_type) || (!req.body.root_event_room_id) || (!req.body.event_triggered_by) ) {
		res.status(400).send('Incomplete request')
		return
	}
	var trace_id = "-1";
	if (req.headers['Trace-Id']) {
		trace_id = req.headers['Trace-Id'];
	}
	
	// process.nextTick() defers the function to  a completely new stack
	// Also allows the process to process other I/O bound requests
	if (typeof irisEventTriggers.getTrigger(req.body.app_domain, req.body.event_type) != 'undefined') {
		process.nextTick(irisEventTriggers.fireTrigger, req.body);
	} else {
		logger.info("Traceid=" + req.body.trace_id + ", Trigger=FALSE, Message=app_domain=" + req.body.app_domain + " event_type=" + req.body.event_type + " event_triggered_by=" + req.body.event_triggered_by + " root_event_room_id=" + req.body.root_event_room_id);
	}
	res.sendStatus(200);              
};
                
// get software version
exports.version = function(req, res) {
	var ver = {
		"version": "IRIS Cloud Code v1.0.7"
	};
	res.status(200).json(JSON.stringify(ver));
};                          
                             