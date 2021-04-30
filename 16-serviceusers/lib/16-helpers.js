// Filename: 16-helpers.js
// Description: Module 0316 Service 02 Users
// Library for helpers function
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Depedencies
const config = require('./16-config');
const crypto = require('crypto');

// Container for all the helpers
let helpers = {};

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