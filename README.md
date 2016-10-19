# iris_cloud_code

## Configuration

The following is the template for configuration file (in JSON format) that is read by the application, at startup. The file
name *MUST* be *config.js* and *MUST* reside in the directory named *configuration*.

If 

```sh
module.exports = {
	development: {
		interface : 'eth0',                                                         <--- ethernet interface. ex: eth0, eth1, lo...
		port : '443',                                	                              <--- MUST specify port if ssl_enabled is false, If true, the port is ALWAYS 443
		fqdn : '',                                                                  <--- FQDN/IP OF THE HOST WHERE THIS APPLICATION IS GOING TO RUN 
		ssl_enabled : true,	                                                        <--- interface CANNOT be 'lo'
		ssl_private_key: '/opt/certs/rtc.key',                                      <--- absolute/relative PATH + key file - relative PATH starts from the base directory
		ssl_certificate: '/opt/certs/rtc.crt',                                      <--- absolute/relative PATH + cert file - relative PATH starts from the base directory		
		event_manager: '<FQDN>',                                                    <--- FQDN OF EVENT MANAGER - DO NOT START WITH SCHEME (HTTP:// or HTTPS://)
		notification_manager: '<FQDN>',                                             <--- FQDN OF NOTIFICATION MANAGER - DO NOT START WITH SCHEME (HTTP:// or HTTPS://)
		triggers_file: '/usr/local/iris_cloud_code/triggers/triggers.json',    <--- DO NOT CHANGE
		jwt: ''                                                                     <--- DEFAULT JWT USED TO CALL EM AND NM APIS. FOR TESTING PURPOSES ONLY
		// Logging configuration
		log: {                                                                      <--- DO NOT TOUCH. LEAVE THIS ENTIRE OBJECT AS IS
			console: {
				enabled: true,
				level: 'info',
				colorize: false
			},
			plaintext: {
				enabled: true,
				level: 'info',
				filename: 'iriscc.log',
				dirname: './log',
				maxsize: 10485760    // 10mb before rotating to another file
			}
		},
	},
	test: {},
	production: {}
};
```

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

