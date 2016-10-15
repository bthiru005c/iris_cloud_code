# iris_cloud_code

## APIS

### PUT /v1/event

#### Description
```sh
	This API is called, mostly, by the Event Manager. Depending on the app_domain and evnet_type
	a specific script (javascript) is executed.
	Separately, cloud code will maintain a repository of scripts associated with app domain
	and event type. When comsumers call this API, the script associated with app_domain and
	event_type, if present, is executed.
	The main use case is the scripts will process the user_data and publish topics to the 
	Notification Manager which inturn will post a notification to the subscriber.
```

#### Request

```sh
	----------------------------------------------------------------------------------------------
	Property          Type          Description
	----------------------------------------------------------------------------------------------
	app_domain        string        (MANDATORY) Application domain (Ex: share.comcast.net")
	event_type        string        (MANDATORY) Depends on the application (Ex: firstxmppparticipantjoined)
	root_node_id      string        (MANDATORY) Refers to a root event (managed by Event Manager)
	user_data         string        (OPTIONAL) user_data belonging to a child event, if present
```

#### Response

200 OK 

