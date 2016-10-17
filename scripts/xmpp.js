"use strict";

var env = process.env.NODE_ENV || 'development'
	, config = require('../configuration/config')[env]
	, logger = require('../lib/logwinston.js')
	, irisEventTriggers = require('../server/iriseventtriggers')
	, request = require('request');

function firstXmppParticipantJoined(payload) {
	
	if (payload && payload.root_node_id)  { 
		var options = {
			url: config.event_manager + "/events/rooteventinfo/rootnodeid/" + payload.root_node_id,
			headers: {
    		'Authorization': 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsIng1dSI6Imh0dHBzOi8vc3QtaXJpc2F1dGgtd2NkY2MtMDAxLnBvYy5zeXMuY29tY2FzdC5uZXQvand0a2V5cy9iSmplWEVwaXFYTUJBSnB1RHIwa3NnN3BrVUNRbE5sVi5wdWIifQ.eyJhcHBfa2V5IjoiYkpqZVhFcGlxWE1CQUpwdURyMGtzZzdwa1VDUWxObFYiLCJkb21haW4iOiJJcmlzVmlkZW9DaGF0LmNvbWNhc3QuY29tIiwiZXhwIjoxNDY4Mjc0NjAxLCJpYXQiOjE0NjgyNjc0MDEsImlkIjoic2Vhc29uczIwMTQiLCJpc3MiOiJpcmlzYXV0aCIsIm5hbWUiOiJhbm9ueW1vdXMiLCJzdWIiOiJzZWFzb25zMjAxNCIsInR5cGUiOiJBbm9ueW1vdXMiLCJ1c2VyX2lkIjoic2Vhc29uczIwMTQifQ.cvFua3YAjvXr85poVBonTuV4O6e6MSvqRFK6jaGdgQ9VcczfKqfoTTJ-5s_xbBjGtBmdZCc2uN4nGiIE-Qj3sQ'
			}
		};
 		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				logger.info(body);
				
			} else {
				logger.error(response.statusCode);
			}
		});
	}
};

module.exports = function(scripts_modules) {
	// the key in this dictionary can be whatever you want
	// just make sure it won't override other modules
	scripts_modules['/home/centos/iris_cloud_code/scripts/xmpp.js'] = firstXmppParticipantJoined;
};

