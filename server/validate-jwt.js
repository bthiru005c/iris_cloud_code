'use strict';

var config = require('../cloudcode')
 , jwt = require('jsonwebtoken')
 , logger = require('../lib/logwinston')
 , request = require('request')
 , Promise = require("bluebird")
 , jwts = {};


function getAppKey(traceID, token) {	
	return new Promise(function(resolve, reject){ //Or Q.defer() in Q
		const decoded = jwt.decode(token, {complete: true});
		if (decoded === null) {
			logger.error("TraceID=" + traceID + ", Message=unable to decode token : " +  token);
			reject('unable to decode token');
		}
		const appKey = decoded.payload.app_key;
		// if JWT is cached then it saves the round trip time to fetch it from AUM
		if (jwts[appKey]) {
			resolve(decoded);
		} else {
			// we are here because the JWT for appKey is not cached		                             
			request(config.config.aum + '/' + appKey + '.pub', function(error, response, body) {   
				if (!error && response.statusCode == 200) {
		 			// body contains the public key; This should be a synchronous operation
		 			// cache JWT for future verification
		 			jwts[appKey] = body;
		 			logger.debug("TraceID=" + traceID + ", Message=" + body)
		 			resolve(decoded);
		 		} else {
		 			if (error) {
		 				logger.error("TraceID=" + traceID + ", Message=Could not retrieve public key from AUM : " +  error);
		 			} else {
		 				logger.error("TraceID=" + traceID + ", Message=Could not verify token because auth manager returned : " +  response.statusCode);
		 			}
		 			reject('Could not retrieve public key from AUM');
		 		}
			});			
		}
	});
}	

exports.verify = function(req, res, next) {
	var traceID = req.headers['trace-id'];
	if (!traceID || traceID === '') {
		traceID = "CLC-" + uuidV1();
		res.set({'Trace-Id': traceID});
	}	
	const token = getBearerToken(req.headers['authorization']);
	if (token) {
		getAppKey(traceID, token)
		.then(function(decoded) {
	 		jwt.verify(token, jwts[decoded.payload.app_key], function(err, signed_payload) {
		 		if (err) {
		 			logger.error("TraceID=" + traceID + ", Message=Authentication failed : " +  err.message);
		 			// delete cache
		 			if (jwts[decoded.payload.app_key]) {
		 				delete jwts[decoded.payload.app_key];
		 			} 
		 			res.status(401).send({ message: 'Authentication failed: ' + err.message });
		 		} else {
					// request payload validation
					if ( (!req.body.app_domain) || (!req.body.event_type) ) {
		 				logger.error("TraceID=" + traceID + ", Message=app_domain and/or event_type missing in request payload");
		 				return res.status(404).send({status: "app_domain and/or event_type missing in request payload"});
					}	 			
					// Check JWT claims type is core or server
					switch (decoded.payload.type) { 
					case "Server":
						// app domain validation
						if (decoded.payload.domain != req.body.app_domain) {
		 					logger.error("TraceID=" + traceID + ", Message=JWT claims domain " + decoded.payload.domain + " does not match app domain " + req.body.app_domain + " in request payload");
		 					res.status(403).send({status: "JWT claims domain does not match app domain in request payload"});							
						}
						// do not break - fallthrough
					case "Core":
						// Authorized if core or server JWT
						return next()
		 			default:
		 				logger.error("TraceID=" + traceID + ", Message=JWT claims type " + decoded.payload.type + "; Unauthorized " + req.method + " API access");
			 			// delete cache
			 			if (jwts[decoded.payload.app_key]) {
			 				delete jwts[decoded.payload.app_key];
			 			}
		 				res.status(401).send({status: "JWT claims type - Unauthorized API access"});
		 			}
		 		}
		 	});
		})
		.catch(err => {
			res.status(401).send({status: "API access unauthorized ", reason: err});
		}) 
	} else {
		// invalid token
		res.status(401).send({status: "API access unauthorized ", reason: "Invalid token format"});
	}						
};
 
function getBearerToken(authorizationHeader) {
	if (!authorizationHeader) {
		return null;
	}
	
	const authComponents = authorizationHeader.split(' ');
	
	if (authComponents.length !== 2) {
		return null;
	}
	
	if (authComponents[0] !== 'Bearer') {
		return null;
	}
	
	return authComponents[1];
}
