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
		jwt_file: '/usr/local/iris_cloud_code/configuration/server_jwt.txt'         <--- FILE MUST CONTAIN A JWT WITH SCOPE "iris server". ALTHOUGH NOT MANDATORY, DO NOT CHANGE THE PATH AND FILE NAME
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

