# iris_cloud_code

## Configuration

The following is the template for configuration file (in JSON format) that is read by the application, at startup. The file
name *MUST* be *config.js* and *MUST* reside in the directory named *configuration*.

```sh
module.exports = {
	development: {},
	test: {},
	production: {
		port : '443',                                	                              <--- MUST specify port if ssl_enabled is false. If true, this value is ignored
		fqdn : '',                                                                  <--- FQDN/IP OF THE HOST WHERE THIS APPLICATION IS GOING TO RUN 
		ssl_enabled : true,	                                                        <--- if true, the port is ALWAYS 443
		ssl_private_key: '/opt/certs/rtc.key',                                      <--- absolute/relative PATH + key file - relative PATH starts from the base directory
		ssl_certificate: '/opt/certs/rtc.crt',                                      <--- absolute/relative PATH + cert file - relative PATH starts from the base directory		
		event_manager: 'https://<CNAME/FQDN>',                                      <--- CNAME/FQDN OF EVENT MANAGER - MUST START WITH SCHEME (HTTP:// or HTTPS://)
		notification_manager: 'https://<CNAME/FQDN>',                               <--- CNAME/FQDN OF NOTIFICATION MANAGER - MUST START WITH SCHEME (HTTP:// or HTTPS://)
		jwt_file: '/usr/local/iris_cloud_code/configuration/core_jwt.txt'           <--- FILE MUST CONTAIN A JWT WITH TYPE "Core". ALTHOUGH NOT MANDATORY, DO NOT CHANGE THE PATH AND FILE NAME
		aum: "https://<CNAME/FQDN>/jwtkeys",                                        <-- CNAME/FQDN OF AUTH MANAGER - MUST START WITH SCHEME (HTTP:// or HTTPS://)
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
		}
	}	
};
```

## Triggers & Scripts

All triggers and scripts should be pulled from [here](https://github.com/Comcast/iris_clc_scripts). The orchestration process
*MUST* create folders *scripts* and *triggers* in */usr/local/iris_cloud_code*, download the script files to *scripts* folder 
and triggers.json file to *triggers* folder

### Triggers

When cloudcode receives a [HTTP request](#post-v1event), cloudcode looks up the *triggers* list to determine if a 
script has to be executed. The combination of app domain and event type determines a trigger. Each trigger is associated 
with a script that gets executed. 

*NOTE: THE TRIGGERS FILE MUST BE NAMED *triggers.json**

On startup, cloudcode reads the triggers file */usr/local/iris_cloud_code/triggers/triggers.json*.
The content of **triggers.json** file should be an array of JSON objects - each JSON object has the following keys

 - **appDomain**  
 - **eventType**
 - **scriptFile** - This is a javascript file that gets executed when cloudcode receives the HTTP request with the same
                    app domain ad event type it is associated with.
 

Here's an example of the contents of *triggers.json* file

```sh
[{
    "appDomain": "xfinityhome.comcast.com",
    "eventType": "firstxmppparticipantjoined",
    "scriptFile": "/usr/local/iris_cloud_code/scripts/xmpp.js"
},
{
    "appDomain": "iristest.comcast.com",
    "eventType": "firstxmppparticipantjoined",
    "scriptFile": "/usr/local/iris_cloud_code/scripts/xmpp.js"
},
{
    "appDomain": "iristest.comcast.com",
    "eventType": "pstnparticipantjoined",
    "scriptFile": "/usr/local/iris_cloud_code/scripts/xmpp.js"
},
{
    "appDomain": "xfinityvoice.comcast.com",
    "eventType": "firstxmppparticipantjoined",
    "scriptFile": "/usr/local/iris_cloud_code/scripts/xmpp.js"
},
{
    "appDomain": "xfinityvoice.comcast.com",
    "eventType": "pstnparticipantjoined",
    "scriptFile": "/usr/local/iris_cloud_code/scripts/xmpp.js"
}]
``` 

### Scripts

On startup, cloudcode uploads ALL script files associated with the triggers in the triggers file */usr/local/iris_cloud_code/triggers/triggers.json*
from */usr/local/iris_cloud_code/scripts* directory

## APIS

### POST /v1/event

#### Description
```sh
	This API is called by authorized entities to execute custom JS scripts
```

#### Request

```sh
	----------------------------------------------------------------------------------------------
	Property          Type       Description
	----------------------------------------------------------------------------------------------
	app_domain        string     (MANDATORY) Application domain (Ex: xfinityvoice.comcast.com,....)
	event_type        string     (MANDATORY) This event in combination with the app_domain acts as a trigger
	                                         to execute a custom JS script
	data              string     (OPTIONAL)  Possibly a stringified JSON - serves as input to the 
	                                         script to be executed
```

#### Response

200 OK 

### GET /v1/version

#### Description
```sh
	This API serves 2 purposes
	1. Health Check - A 200 OK response indicates if Cloud Code is running.
	2. Version - Returns version in response body
```

#### Request

```sh
	No request parameters.
```

#### Response

200 OK and the following JSON object.

```sh
	----------------------------------------------------------------------------------------------
	Property          Type          Description
	----------------------------------------------------------------------------------------------
	version           string        IRIS Cloud Code version.
```

