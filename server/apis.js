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
	logger.info(req.body); 
	if ( (!req.body.app_domain) || (!req.body.event_type) ) {
		logger.error("processEvent - Invalid request");
		res.status(400).send('Incomplete request')
	}
	// process.nextTick() defers the function to  a completely new stack
	// Also allows the process to process other I/O bound requests
	logger.info(irisEventTriggers.getTrigger(req.body.app_domain, req.body.event_type));
	process.nextTick(irisEventTriggers.fireTrigger, req.body);
	res.sendStatus(200);              
};
                                                                       