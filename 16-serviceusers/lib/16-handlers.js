// Filename: 16-handlers.js
// Description: Module 0316 Service 02 Users
// Library for handling requests
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Depedencies
const _data = require('./16-data');
const helpers = require('./16-helpers');

// Define the handlers
let handlers = {};

// Define ping handlers
handlers.ping = function(data, callback){
	// Callback a http status code
	callback(200);
};

// Define sample handlers
handlers.sample = function(data, callback){
	// Callback a http status code, and a payload
	callback(406, {'name' : 'sample handler'});
};

// Define users handlers
handlers.users = function(data, callback){
	let acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for all the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback){
	//Check that all required field are filled out
	let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	if(firstName && lastName && phone && password && tosAgreement){
		// Make sure that the user doesn't already exist
		_data.read('users', phone, function(err, data){
			if(err){
				// Hash the password
				let hashedPassword = helpers.hash(password);

				// Create the user object
				if(hashedPassword){
					let userObject = {
						'firstName' : firstName,
						'lastName' : lastName,
						'phone' : phone,
						'hashedPassword' : hashedPassword,
						'tosAgreement' : true
					};

					// Store the user
					_data.create('users', phone, userObject, function(err){
						if(!err){
							callback(200, userObject);
						} else {
							callback(500, {'Error' : 'Couldn\'t create the new user'});
						}
					});
				} else {
					callback(500, {'Error' : 'Couldn\'t hash the user\'s password'});
				}
			} else {
				// User already exists
				callback(400, {'Error' : 'A user with that phone number already exists'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let authenticated user access their object. Don't let them access anyone else's
handlers._users.get = function(data, callback){
	// Check that the phone number is valid
	let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	if(phone){
		// Lookup the user
		_data.read('users', phone, function(err, data){
			if(!err && data){
				// Remove the hashed password from the user object before returning it to the requester
				delete data.hashedPassword;
				callback(200, data);
			} else {
				callback(404);
			} 
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let authenticated user update their object. Don't let them update anyone else's
handlers._users.put = function(data, callback){
	// Check the required fiedls
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

	// Check for the optional field
	let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	// Error if the phone is invalid
	if(phone){
		// Error if nothing is sent to update
		if(firstName || lastName || password){
			// Lookup the user
			_data.read('users', phone, function(err, userData){
				if(!err && userData){
					// Update the fields necessary
					if(firstName){
						userData.firstName = firstName;
					}
					if(lastName){
						userData.lastName = lastName;
					}
					if(password){
						userData.hashedPassword = helpers.hash(password);
					}

					// Store the new updates
					_data.update('users', phone, userData, function(err){
						if(!err){
							callback(200)
						} else {
							callback(500, {'Error' : 'Couldn\'t update the user'});
						}
					});
				} else {
					callback(400, {'Error' : 'The specified user doesn\'t exist'});
				}
			});
		} else {
			callback(400, {'Error' : 'Missing field(s) to update'});
		}
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Users - delete
// Required data: phone
// Optional data: none
// @TODO Only let authenticated user delete their object. Don't let them delete anyone else's
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function(data, callback){
	// Check that the phone number is valid
	let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	if(phone){
		// Lookup the user
		_data.read('users', phone, function(err, data){
			if(!err && data){
				_data.delete('users', phone, function(err){
					if(!err){
						callback(200);
					} else {
						callback(500, {'Error' : 'Couldn\'t delete the specified user'});
					}
				});
			} else {
				callback(400, {'Error' : 'Couldn\'t find the specified user'});
			} 
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Define notFound handlers
handlers.notFound = function(data, callback){
	callback(404);
};

// Export the module
module.exports = handlers;