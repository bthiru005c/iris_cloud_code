'use strict';

var config = require('../cloudcode')
 , jwt = require('jsonwebtoken')
 , logger = require('../lib/logwinston')
 , request = require('request');

exports.verify = function(req, res, next) {
	const token = getBearerToken(req.headers['authorization']);
	if (token) {
		const decoded = jwt.decode(token, {complete: true});
		if (decoded === null) {
			logger.error('error saving subscription info :' +  err);
			return res.status(401).send({status: "error saving subscription info", reason: err});
		}
		const appKey = decoded.payload.app_key;
		                             
		request(config.config.aum + '/' + appKey + '.pub', function(error, response, body) {   
			if (!error && response.statusCode == 200) {
	 			// body contains the public key; This should be a synchronous operation
	 			jwt.verify(token, body, function(err, signed_payload) {
	 				if (err) {
	 					logger.error('Authentication failed :' +  err.message);
	 					res.status(401).send({ message: 'Authentication failed: ' + err.message });
	 				} else {
	 					req.decoded = signed_payload;
	 					next()
	 				}
	 			});
	 		} else {
	 			if (error) {
	 				logger.error('Could not verify token because auth manager :' +  error);
	 				res.status(401).send({status: "Could not verify token :  ", reason: error});
	 			} else {
	 				logger.error('Could not verify token because auth manager returned :' +  response.statusCode);
	 				res.status(401).send({status: "Could not verify token because auth manager returned ; ", reason: response.statusCode});
	 			}
	 		}
		});
	} else {
		res.status(401).send({status: "No Token or Invalid format in authorization header"});
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
