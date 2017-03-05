"use strict";

var config = require('../cloudcode')
	, logger = require('../lib/logwinston.js')
	, irisEventTriggers = require('../server/iriseventtriggers')
	, request = require('request')
	, http = require('http')
	, fetch = require('node-fetch')
	, cc = require('../cloudcode');

function firstXmppParticipantJoined(payload) {
	logger.info("Traceid=" + payload.trace_id + ", Trigger=TRUE, Message=app_domain=" + payload.app_domain + " event_type=" + payload.event_type + " event_triggered_by=" + payload.event_triggered_by + " root_event_room_id=" + payload.root_event_room_id);
	if (payload && payload.root_event_room_id && payload.event_triggered_by)  { 
		var em_options = {
			url: config.config.event_manager + "/v1/notification/participants/roomid/" + payload.root_event_room_id + "/routingid/" + payload.event_triggered_by,
			headers: {
    		'Authorization': "Bearer " + cc.iris_server_jwt,
    		'Trace-Id': payload.trace_id
			}
		};
 		request(em_options, function (error, response, em_resp_body) {
			if (!error && response.statusCode == 200) {
				var em_resp ;
				try {
					em_resp = JSON.parse(em_resp_body); 
				} catch (e) {
					logger.error("JSON.parse() exception when parsing responce body: ", em_resp_body);
					return;
				}
				if ( (!em_resp.to_routing_ids) || (!em_resp.to_routing_ids instanceof Array) ) {
					logger.error("Traceid=" + payload.trace_id + ", Message=Invalid Payload Received");
					return
				}
				// parse payload.root_event_userdata to extract notification JSON blob
				var root_event_user_data ;
				try {
					root_event_user_data = JSON.parse(payload.root_event_userdata); 
				} catch (e) {
					logger.error("JSON.parse() exception when parsing userdata : ", payload.root_event_userdata + "; " + e);
					return;
				}
				if (!root_event_user_data.notification) {
					logger.error("Traceid=" + payload.trace_id + ", Message=No notification object available");
					return
				}

				// parse payload.root_event_eventdata to extract rtc_server info
				var root_event_event_data ;
				try {
					root_event_event_data = JSON.parse(payload.root_event_eventdata); 
				} catch (e) {
					logger.error("JSON.parse() exception when parsing eventdata: ", payload.root_event_eventdata + "; " + e);
					return;
				}
				if (!root_event_event_data.rtc_server) {
					logger.error("Traceid=" + payload.trace_id + ", Message=No RTC server object available");
					return
				}
				
				for (var i = 0; i < em_resp.to_routing_ids.length; i++) {
					if (em_resp.to_routing_ids[i].routing_id === em_resp.from_routing_id) {
						// Do not publish to caller via NM
						continue
					}
					var topic = encodeURIComponent(root_event_user_data.notification.topic + "/" + em_resp.to_routing_ids[i].routing_id);
					logger.info("Traceid=" + payload.trace_id + ", Message=" + topic);
					var nm_request_body = { 
						payload : {
							trace_id: payload.trace_id,
							routing_id: em_resp.to_routing_ids[i].routing_id,
							room_id: payload.root_event_room_id,
							rtc_server: root_event_event_data.rtc_server,
							xmpp_token: em_resp.to_routing_ids[i].xmpp_token,
							xmpp_token_expiry_time: em_resp.to_routing_ids[i].xmpp_token_expiry_time,
							room_token: em_resp.to_routing_ids[i].room_token,
							room_token_expiry_time: em_resp.to_routing_ids[i].room_token_expiry_time,
							user_data: payload.root_event_userdata
						}
					}
					// publish to notification manager
					fetch(config.config.notification_manager + '/v1/topic/' + topic, {
						method: 'POST',
			      headers: {
							'Content-Type': 'application/json; charset=utf-8',
							'Authorization': "Bearer " + cc.iris_server_jwt
						},
						body: JSON.stringify(nm_request_body)
					})
					.then (function(res) {
						logger.info("Traceid=" + payload.trace_id + ", Message=Response from Notification Manager=" + res.status);
					})
					.catch(function(err) {
						logger.info("Traceid=" + payload.trace_id + ", Message=Error in attempt to send request to Notification Manager=" + err);
					});
				}
			} else {
				if (error) {
					logger.error("Traceid=" + payload.trace_id + ", Message=" + error);
				} else {
					if ( (response.statusCode > 200) && (response.statusCode < 500) ) {
						logger.error("Traceid=" + payload.trace_id + ", Message=Response from Event Manager=" + response.statusCode);
					} else {
						logger.error("Traceid=" + payload.trace_id + ", Message=status code =" + response.statusCode);
					}
				}
			}
		});
	}
};

module.exports = function(scripts_modules) {
	// the key in this dictionary can be whatever you want
	// just make sure it won't override other modules
	scripts_modules['/usr/local/iris_cloud_code/scripts/xmpp.js'] = firstXmppParticipantJoined;
};

