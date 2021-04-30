// Filename: 17-helpers.js
// Description: Module 0317 Service 03 Tokens
// Library for helpers function
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Depedencies
const config = require('./17-config');
const crypto = require('crypto');

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

// Export the module
module.exports = helpers;