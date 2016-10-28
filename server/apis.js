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
	if ( (!req.body.app_domain) || (!req.body.event_type) ) {
		res.status(400).send('Incomplete request')
		return
	}
	logger.info(req.body);
	// process.nextTick() defers the function to  a completely new stack
	// Also allows the process to process other I/O bound requests
	if (typeof irisEventTriggers.getTrigger(req.body.app_domain, req.body.event_type) != 'undefined') {
		process.nextTick(irisEventTriggers.fireTrigger, req.body);
	}
	res.sendStatus(200);              
};
                                                                       