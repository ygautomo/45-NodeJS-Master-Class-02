// Filename: 20-helpers.js
// Description: Module 0320 Background Workers
// Library for helpers function
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Depedencies
const crypto = require('crypto');
const config = require('./20-config');
const https = require('https');
const querystring = require('querystring');

// Container for all the helpers
let helpers = {};

// Create a string of random alphanumeric characters, at given length
helpers.createRandomString = function(strLength){
	strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
	if(strLength){
		// Define all the possible characters that could go into a string
		let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

		// Start the final string
		let str = '';
		for(i = 1; i <= strLength; i++){
			// Get  a random character from the possibleCharacters string
			let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
			
			// Append this character to the final string
			str += randomCharacter;
		}

		// Return the final string
		return str;
	} else {
		return false;
	}
};

// Create a SHA256 hash
helpers.hash = function(str){
	if(typeof(str) == 'string' && str.length > 0){
		let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
	try {
		let obj = JSON.parse(str);
		return obj;
	} catch(e) {
		return {};
	}
};

// Send an SMS message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback){
	// Validate parameters
	phone = typeof(phone) == 'string' && phone.trim().length < 15 ? phone.trim() : false;
	msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 160 ? msg.trim() : false;

	// console.log(phone, msg);
	if(phone && msg){
		// Configure the request payload
		let payload = {
			'From' : config.twilio.fromPhone,
			'To' : '+62'+phone,
			'Body' : msg
		};

		// Configure the payload
		let stringPayload = querystring.stringify(payload);

		// Configure the request details
		let requestDetails = {
			'protocol' : 'https:',
			'hostname' : 'api.twilio.com',
			'method' : 'POST',
			'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
			'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
			'headers' : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : Buffer.byteLength(stringPayload)
			}
		};

		// console.log(requestDetails);
		// Instatiate the request object
		let req = https.request(requestDetails, function(res){
			//Grab the status od the sent request
			let status = res.statusCode;
			// console.log(status);

			// Callback successfully if the request sent through
			if(status == 200 || status == 201){
				callback(false);
			} else {
				callback("Status code returned was ",status);
			}
		});

		// Bind to the error event so it doesn't get thrown
		req.on('error', function(e){
			callback(e);
		});

		// Add the payload
		req.write(stringPayload);

		// End the request
		req.end();
	} else {
		callback("Given parameters were missing or invalid");
	}
};

// Export the module
module.exports = helpers;