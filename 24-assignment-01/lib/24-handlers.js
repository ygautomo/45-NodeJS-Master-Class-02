// Filename: 24-handlers.js
// Description: Module 0324 API for a Pizza-delivery Company
// Library for handling requests
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Depedencies
const _data = require('./19-data');
const config = require('./19-config');
const helpers = require('./19-helpers');

// Define the handlers
let handlers = {};

// Define checks handlers
handlers.checks = function(data, callback){
	let acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1){
		handlers._checks[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Container for all the checks submethods
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = function(data, callback){
	// Validate inputs
	let protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false;
	let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
	let method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;
	let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
	let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

	if(protocol && url && method && successCodes && timeoutSeconds){
		// Get the token from the headers
		let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

		// Lookup the user by reading the token
		_data.read('tokens', token, function(err, tokenData){
			if(!err && tokenData){
				let userPhone = tokenData.phone;

				// Lookup the user data
				_data.read('users', userPhone, function(err, userData){
					if(!err && userData){
						let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
						// Verify that the user has less than the number of max-checks-per-user
						if(userChecks.length < config.maxChecks){
							// Create a random id for the check
							let checkId = helpers.createRandomString(20);

							// Create the check object and include the user's phone
							let checkObject = {
								'id' : checkId,
								'userPhone' : userPhone,
								'protocol' : protocol,
								'url' : url,
								'method' : method,
								'successCodes' : successCodes,
								'timeoutSeconds' : timeoutSeconds
							};

							// Save the object
							_data.create('checks', checkId, checkObject, function(err){
								if(!err){
									// Add the check id to the user's object
									userData.checks = userChecks;
									userData.checks.push(checkId);

									// Save the new user data
									_data.update('users', userPhone, userData, function(err){
										if(!err){
											callback(200, checkObject);
										} else {
											callback(500, {'Error' : 'Couldn\'t update the user with the new check'});
										}
									});
								} else {
									callback(400, {'Error' : 'Could\'t create the new check'});
								}
							});
						} else {
							callback(400, {'Error' : 'The user already has the maximum number of checks ('+config.maxChecks+')'});
						}
					} else {
						callback(403);
					}
				});
			} else {
				callback(403);
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required inputs or inputs are invalid'});
	}
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function(data, callback){
	// Check that the id is valid
	let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(id){
		// Lookup the check
		_data.read('checks', id, function(err, checkData){
			if(!err && checkData){
				// Get the token from the headers
				let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

				// Verify that the given token is valid and belongs to the user who created the check
				handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid){
					if(tokenIsValid){
						// Return the check data
						callback(200, checkData);
					} else {
						callback(403);
						// callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
					}
				});
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Checks - put
// Required data: id
// Required data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = function(data, callback){
	// Check the required fields
	let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

	// Check for the optional field
	let protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false;
	let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
	let method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;
	let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
	let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

	if(id){
		// Check to make sure one or more optional fields has been sent
		if(protocol || url || method || successCodes || timeoutSeconds){
			_data.read('checks', id, function(err, checkData){
				if(!err && checkData){
					// Get the token from the headers
					let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

					// Verify that the given token is valid and belongs to the user who created the check
					handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid){
						if(tokenIsValid){
							// Update the check where necessary
							if(protocol){
								checkData.protocol = protocol;
							}
							if(url){
								checkData.url = url;
							}
							if(method){
								checkData.method = method;
							}
							if(successCodes){
								checkData.successCodes = successCodes;
							}
							if(timeoutSeconds){
								checkData.timeoutSeconds = timeoutSeconds;
							}

							// Store the new updates
							_data.update('checks', id, checkData, function(err){
								if(!err){
									callback(200);
								} else {
									callback(500, {'Error' : 'Couldn\'t update the check'});
								}
							});
						} else {
							callback(403);
						}
					});
				} else {
					callback(400, {'Error' : 'Check ID did not exist'});
				}
			});
		} else {
			callback(400, {'Error' : 'Missing field(s) to update'});
		}
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function(data, callback){
	// Check that the id is valid
	let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	if(id){
		// Lookup the check
		_data.read('checks', id, function(err,checkData){
			if(!err && checkData){
				// Get the token from the headers
				let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

				// Verify that the given token is valid for the phone number
				handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid){
					if(tokenIsValid){
						// Delete the check data
						_data.delete('checks', id, function(err){
							if(!err){
								// Lookup the user
								_data.read('users', checkData.userPhone, function(err, userData){
									if(!err && userData){
										let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

										// Remove the delete check from their list of checks
										let checkPosition = userChecks.indexOf(id);

										if(checkPosition > -1){
											userChecks.splice(checkPosition, 1);

											// Re-save the user's data
											_data.update('users', checkData.userPhone, userData, function(err){
												if(!err){
													callback(200);
												} else {
													callback(500, {'Error' : 'Couldn\'t update the user'});
												}
											});
										} else {
											callback(500, {'Error' : 'Couldn\'t find the check on the users object, so couldn\'t remove it'});
										}
									} else {
										callback(500, {'Error' : 'Couldn\'t find the user who created the check, so couldn\' remove the check from the list of user\'s object'});
									}
								});
							} else {
								callback(500, {'Error' : 'Couldn\'t delete the check data'});
							}
						});
					} else {
						callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
					}
				});
			} else {
				callback(400, {'Error' : 'The specified check ID doesn\'t exist'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required field(s)'});
	}
};

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
					callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
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
		// Get the token from the headers
		let token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
			if(tokenIsValid){
				// Lookup the user
				_data.read('users', phone, function(err, userData){
					if(!err && data){
						_data.delete('users', phone, function(err){
							if(!err){
								// Delete each of the checks associated with the user
								let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
								let checksToDelete = userChecks.length;
								if(checksToDelete > 0){
									let checksDeleted = 0;
									let deletionErrors = false;

									// Loop through the checks
									userChecks.forEach(function(checkId){
										// Delete the check
										_data.delete('checks', checkId, function(err){
											if(err){
												deletionErrors = true;
											}
											checksDeleted++;
											if(checksDeleted == checksToDelete){
												if(!deletionErrors){
													callback(200);
												} else {
													callback(500, {'Error' : 'Error encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the ssytem successfully'});
												}
											}
										});
									});
								} else {
									callback(200);
								}
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