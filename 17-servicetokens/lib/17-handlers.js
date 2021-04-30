// Filename: 17-handlers.js
// Description: Module 0317 Service 03 Tokens
// Library for handling requests
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Depedencies
const _data = require('./17-data');
const helpers = require('./17-helpers');

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

// Define tokens handlers
handlers.tokens = function(data, callback){
	let acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for all the tokens submethods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, callback){
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if(phone && password){
		// Lookup the user who matches that phone number
		_data.read('users', phone, function(err, userData){
			if(!err && userData){
				// Hash the sent password and compare it to the password stored in the user object
				let hashedPassword = helpers.hash(password);
				if(hashedPassword == userData.hashedPassword){
					// If valid, create a new token with a random name. Set expiration date 1 hour in the future
					let tokenId = helpers.createRandomString(20);
					let expires = Date.now() + 1000 * 60 * 60;
					let tokenObject = {
						'phone' : phone,
						'id' : tokenId,
						'expires' : expires
					};

					// Store the token
					_data.create('tokens', tokenId, tokenObject, function(err){
						if(!err){
							callback(200, tokenObject);
						} else {
							callback(500, {'Error' : 'Couldn\'t create the new token'});
						}
					});
				} else {
					callback(400, {'Error' : 'Password did not match the specified user\'s stored password'});
				}
			} else {
				callback(400, {'Error' : 'Couldn\'t find the specified phone'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback){
	// Check that the id is valid
	let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(id){
		_data.read('tokens', id, function(err, tokenData){
			if(!err && tokenData){
				callback(200, tokenData);
			} else {
				callback(404);
			} 
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data, callback){
	// Check the required fields
	let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
	let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
	
	if(id && extend){
		// Lookup the token
		_data.read('tokens', id , function(err, tokenData){
			if(!err && tokenData){
				// Check to make sure the token isn't already expired
				if(tokenData.expires > Date.now()){
					// Set the expiration an hour from now
					tokenData.expires = Date.now() + 1000 * 60 *60;

					// Store the new updates
					_data.update('tokens', id, tokenData, function(err){
						if(!err){
							callback(200);
						} else {
							callback(500, {'Error' : 'Couldn\'t update the token\'s expiration'});
						}
					});
				} else {
					callback(400, {'Error' : 'The token has already expired, and cannot be exended'});
				}
			} else {
				callback (400, {'Error' : 'Specified token doesn\'t exist'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s) or field(s) are invalid'});
	}
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback){
	// Check that the id is valid
	let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(id){
		// Lookup the token
		_data.read('tokens', id, function(err, data){
			if(!err && data){
				_data.delete('tokens', id, function(err){
					if(!err){
						callback(200);
					} else {
						callback(500, {'Error' : 'Couldn\'t delete the specified token'});
					}
				});
			} else {
				callback(400, {'Error' : 'Couldn\'t find the specified token'});
			} 
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback){
	// Lookup the token
	_data.read('tokens', id, function(err, tokenData){
		if(!err && tokenData){
			// Check that the token is for the given user and not expired
			if(tokenData.phone == phone && tokenData.expires > Date.now()){
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
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
		// Get the token from the headers
		let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
			if(tokenIsValid){
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
				callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
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
	// Check the required fields
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

	// Check for the optional field
	let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	// Error if the phone is invalid
	if(phone){
		// Error if nothing is sent to update
		if(firstName || lastName || password){
			// Get the token from the headers
			let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

			// Verify that the given token is valid for the phone number
			handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
				if(tokenIsValid){
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
									callback(200);
								} else {
									callback(500, {'Error' : 'Couldn\'t update the user'});
								}
							});
						} else {
							callback(400, {'Error' : 'The specified user doesn\'t exist'});
						}
					});
				} else {
					callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
				}
			});
		} else {
			callback(400, {'Error' : 'Missing field(s) to update'});
		}
	} else {
		callback(400, {'Error' : 'Missing required field(s)'})
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
		// Get the token from the headers
		let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
			if(tokenIsValid){
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
				callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
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