"use strict";

var request = require('request');

var EventManager = require('../server/eventmanagercloud');

EventManager.addTrigger(EventManager.Types.afterEvent, "textMessage", function(payload) {
    console.log("Processing afterSave trigger for Event_type: " + payload.Event_type);
    
    console.log(payload);
    console.log(payload.Metadata);
    if (payload && payload.Metadata) {
        //var metadata = JSON.parse(payload.Metadata);
        var metadata = payload.Metadata;
        console.log('Message: ' + metadata.message);
        console.log('User identifier: ' + metadata.userIdentifier);
    } else {
        console.log('Invalid payload or metadata');
        return;
    }

    if (payload.Room_id && payload.From_routing_id && payload.Event_type) {
        let url = "http://st-notifymgr-wcdcc-001.poc.sys.comcast.net/event/" + payload.Channel_id; //payload.Room_id;
        console.log("URL: " + url);
        request.post({url, form: {'msg': metadata.message, 'sound': 'default', 'category': 'stream',  'title': 'New message', 'data.room_id': payload.Room_id, "data.from_routing_id": payload.From_routing_id, "data.event_type": payload.Event_type}}, function(err, res, body) {
            if (err) {
                console.log('Event push failed: ', err);
            }   
            console.log('Event push successful');
        });
    } else {
        console.log('Invalid payload!  Check value of Room_id, From_routing_id or Event_type.');
        console.log(payload);
        return;
    }
});

EventManager.addTrigger(EventManager.Types.afterEvent, "pi_event", function(payload) {
    console.log("Processing afterSave trigger for Event_type: " + payload.Event_type);
    
    console.log(payload);

    if (payload && payload.Room_id && payload.Routing_id && payload.Action) {
        console.log("Push data...");
        let url = "https://st-xmpp-wcdcc-001.poc.sys.comcast.net/v1/jrevent";
        console.log("URL: " + url);
        request.put({url, json: {'room_id': payload.Room_id, 'routing_id': payload.Routing_id, 'action': payload.Action}}, function(err, res, body) {
            if (err) {
                console.log('Event push failed: ', err);
            }   
            console.log('Event push successful');
            console.log('Response: ' + res.statusCode);
            console.log('Response body:' + body);
        });
    } else {
        console.log('Invalid payload!');
        console.log(payload);
        return;
    }
});
