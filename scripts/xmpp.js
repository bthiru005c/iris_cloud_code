"use strict";

var env = process.env.NODE_ENV || 'development'
	, config = require('../configuration/config')[env]
	, logger = require('../lib/logwinston.js')
	, irisEventTriggers = require('../server/iriseventtriggers')
	, request = require('request')
	, http = require('http')
	, fetch = require('node-fetch');

function firstXmppParticipantJoined(payload) {
	
	logger.info(payload);
	if (payload && payload.root_node_id)  { 
		var em_options = {
			url: "https://" + config.event_manager + "/events/rooteventinfo/rootnodeid/" + payload.root_node_id,
			headers: {
    		'Authorization': config.jwt
			}
		};
 		request(em_options, function (error, response, em_resp_body) {
			if (!error && response.statusCode == 200) {
				var em_resp ;
				try {
					em_resp = JSON.parse(em_resp_body); 
				} catch (e) {
					logger.error("JSON.parse() exception when parsing : ", em_resp_body);
					return;
				}
				if ( (!em_resp.room_id) 
							|| (!em_resp.rtc_server) 
							|| (!em_resp.to_routing_ids) 
							|| (!em_resp.to_routing_ids instanceof Array)
							|| (!em_resp.userdata) ) {
					logger.error("Invalid Payload Received");
					return
				}
				var user_data ;
				try {
					user_data = JSON.parse(em_resp.userdata); 
				} catch (e) {
					logger.error("JSON.parse() exception when parsing : ", em_resp.userdata);
					return;
				}
				if (!user_data.notification) {
					logger.error("No notification object available");
					return
				}
				
				for (var i = 0; i < em_resp.to_routing_ids.length; i++) {
					if (em_resp.to_routing_ids[i].routing_id === em_resp.from_routing_id) {
						// Do not publish to caller via NM
						continue
					}
					var topic = encodeURIComponent(user_data.notification.topic + "/" + em_resp.to_routing_ids[i].routing_id);
					logger.info(topic);
					var nm_request_body = { 
						payload : {
							routing_id: em_resp.to_routing_ids[i].routing_id,
							room_id: em_resp.room_id,
							rtc_server: em_resp.rtc_server,
							xmpp_token: em_resp.to_routing_ids[i].xmpp_token,
							xmpp_token_expiry_time: em_resp.to_routing_ids[i].xmpp_token_expiry_time,
							user_data: em_resp.userdata
						}
					}
//					var nm_options_path = "/v1/topic/" + topic;
//					var nm_body  = JSON.stringify(nm_request_body)
//					var nm_options = {
//						hostname: config.notification_manager,
//						port: 443,
//						path: nm_options_path,
//						method: 'POST',
//						headers: {
//							'Content-Type': 'application/json; charset=utf-8',
//							'Content-Length': Buffer.byteLength(nm_body),
//							'Authorization': 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsIng1dSI6Imh0dHBzOi8vc3QtaXJpc2F1dGgtd2NkY2MtMDAxLnBvYy5zeXMuY29tY2FzdC5uZXQvand0a2V5cy9iSmplWEVwaXFYTUJBSnB1RHIwa3NnN3BrVUNRbE5sVi5wdWIifQ.eyJhcHBfa2V5IjoiYkpqZVhFcGlxWE1CQUpwdURyMGtzZzdwa1VDUWxObFYiLCJkb21haW4iOiJJcmlzVmlkZW9DaGF0LmNvbWNhc3QuY29tIiwiZXhwIjoxNDY4Mjc0NjAxLCJpYXQiOjE0NjgyNjc0MDEsImlkIjoic2Vhc29uczIwMTQiLCJpc3MiOiJpcmlzYXV0aCIsIm5hbWUiOiJhbm9ueW1vdXMiLCJzdWIiOiJzZWFzb25zMjAxNCIsInR5cGUiOiJBbm9ueW1vdXMiLCJ1c2VyX2lkIjoic2Vhc29uczIwMTQifQ.cvFua3YAjvXr85poVBonTuV4O6e6MSvqRFK6jaGdgQ9VcczfKqfoTTJ-5s_xbBjGtBmdZCc2uN4nGiIE-Qj3sQ'
//						}
//					};
//					var req = http.request(nm_options, function(res) {
//					  res.on('data', function (body) {
//					    logger.info('Body: ' + body);
//					  });
//					});
//					req.on('error', function(e) {
//					  logger.error('problem with request: ' + e.message);
//					});
//					// write data to request body
//					req.write(nm_body);
//					req.end();
					fetch("https://" + config.notification_manager + '/v1/topic/' + topic, {
						method: 'POST',
			      headers: {
							'Content-Type': 'application/json; charset=utf-8',
							'Authorization': 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsIng1dSI6Imh0dHBzOi8vc3QtaXJpc2F1dGgtd2NkY2MtMDAxLnBvYy5zeXMuY29tY2FzdC5uZXQvand0a2V5cy9iSmplWEVwaXFYTUJBSnB1RHIwa3NnN3BrVUNRbE5sVi5wdWIifQ.eyJhcHBfa2V5IjoiYkpqZVhFcGlxWE1CQUpwdURyMGtzZzdwa1VDUWxObFYiLCJkb21haW4iOiJJcmlzVmlkZW9DaGF0LmNvbWNhc3QuY29tIiwiZXhwIjoxNDY4Mjc0NjAxLCJpYXQiOjE0NjgyNjc0MDEsImlkIjoic2Vhc29uczIwMTQiLCJpc3MiOiJpcmlzYXV0aCIsIm5hbWUiOiJhbm9ueW1vdXMiLCJzdWIiOiJzZWFzb25zMjAxNCIsInR5cGUiOiJBbm9ueW1vdXMiLCJ1c2VyX2lkIjoic2Vhc29uczIwMTQifQ.cvFua3YAjvXr85poVBonTuV4O6e6MSvqRFK6jaGdgQ9VcczfKqfoTTJ-5s_xbBjGtBmdZCc2uN4nGiIE-Qj3sQ'
						},
						body: JSON.stringify(nm_request_body)
					})
					.then (function(res) {
						logger.info(res.status);
					})
					.catch(function(err) {
						logger.info(err);
					});
				}
			} else {
				logger.error(response.statusCode);
			}
		});
	}
};

module.exports = function(scripts_modules) {
	// the key in this dictionary can be whatever you want
	// just make sure it won't override other modules
	scripts_modules['../scripts/xmpp.js'] = firstXmppParticipantJoined;
};

