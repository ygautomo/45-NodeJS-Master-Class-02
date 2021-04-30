// Filename: 20-backgroundworkers.js
// Description: Module 0320 Background Workers
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const server = require('./lib/20-server');
const workers = require('./lib/20-workers');

// Declare the app
let app = {};

// Init function
app.init = function(){
	// Start the server
	server.init();

	// Start the workers
	workers.init();
};

// Execute
app.init();

// Export the app
module.exports = app;

// Running command
// cd ./Apps 03 -- RESTful API
// NODE_ENV=staging node 20-backgroundworkers.js
// NODE_ENV=production node 20-backgroundworkers.js

// Test HTTP Server
// http://{{IP_ADDRESS}}:3000/users
// Postman GET (http://{{IP_ADDRESS}}:3000/users)
// curl -X GET 'http://{{IP_ADDRESS}}:3000/users'

// TESTING MODULE
// 01 Create new user
// Test HTTP Server and create new user with body phone doesn't exist (new)
// Postman POST (http://{{IP_ADDRESS}}:3000/users) with body
// curl -X POST 'http://{{IP_ADDRESS}}:3000/users' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//		"firstName" : "John",
//		"lastName" : "Smith",
//		"phone" : "5551234560",
//		"password" : "ThisIsAPassword",
//		"tosAgreement" : true
// }'

// 02 Create new token for new user
// Test HTTP Server and create new token with body phone does exist & password valid
// Postman POST (http://{{IP_ADDRESS}}:3000/tokens) with body
// curl -X POST 'http://{{IP_ADDRESS}}:3000/tokens' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "phone" : "5551234560",
//     "password" : "ThisIsAPassword"
// }'

// 03 Get the created new user
// Test HTTP Server and read user with header token does exists & not expired; querystring phone does exists
// Postman GET http://{{IP_ADDRESS}}:3000/users?phone=5551234560 with header
// curl -X GET 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560' \
// --header 'token: q1pfxof4wuhuu8btpmk9'

// 04A Create new check for created new user
// Test HTTP Server and create new check with header token does exist & not expired; body valid
// Postman POST (http://{{IP_ADDRESS}}:3000/checks) with header & body
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks' \
// --header 'token: q1pfxof4wuhuu8btpmk9' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "protocol" : "https",
//     "url" : "google.com",
//     "method" : "get",
//     "successCodes" : [200, 201, 301, 302],
//     "timeoutSeconds" : 3
// }'

// 04B Create new check for created new user
// Test HTTP Server and create new check with header token does exist & not expired; body valid
// Postman POST (http://{{IP_ADDRESS}}:3000/checks) with header & body
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks' \
// --header 'token: q1pfxof4wuhuu8btpmk9' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "protocol" : "https",
//     "url" : "yahoo.com",
//     "method" : "get",
//     "successCodes" : [200, 201, 301, 302],
//     "timeoutSeconds" : 3
// }'