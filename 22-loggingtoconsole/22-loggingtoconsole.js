// Filename: 22-loggingtoconsole.js
// Description: Module 0322 Logging to Console
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const server = require('./lib/22-server');
const workers = require('./lib/22-workers');

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
// NODE_ENV=staging node 22-loggingtoconsole.js
// NODE_ENV=production node 22-loggingtoconsole.js

// Debug Node Application
// NODE_DEBUG=http node 22-loggingtoconsole.js
// NODE_DEBUG=workers node 22-loggingtoconsole.js
// NODE_DEBUG=server node 22-loggingtoconsole.js

// Test HTTP Server
// Test HTTP Server on port 3000 with http methods POST, header none, set routing 'checks', querystring none and payload none
// http://{{IP_ADDRESS}}:3000/checks
// Postman POST (http://{{IP_ADDRESS}}:3000/checks)							// Postman 22-loggingtoconsole checks
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks'

// Test HTTP Server and create new user with payload valid (new) phone
// Test HTTP Server on port 3000 with http methods POST, header none, set routing 'users', querystring none and payload valid (new) phone
// Postman POST (http://{{IP_ADDRESS}}:3000/users)							// Postman 22-loggingtoconsole post users
// curl -X POST 'http://{{IP_ADDRESS}}:3000/users' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"firstName" : "John",
//		"lastName" : "Smith",
//		"phone" : "5551234560",
//		"password" : "ThisIsAPassword",
//		"tosAgreement" : true
//	}'

// Test HTTP Server and create new token with payload valid (existing) phone & valid password
// Test HTTP Server on port 3000 with http methods POST, header none, set routing 'tokens', querystring none and payload valid (existing) phone & valid password
// Postman POST (http://{{IP_ADDRESS}}:3000/tokens)							// Postman 22-loggingtoconsole post tokens
// curl -X POST 'http://{{IP_ADDRESS}}:3000/tokens' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"phone" : "5551234560",
//		"password" : "ThisIsAPassword"
//	}'

// Create check 01 -- google.com
// Test HTTP Server and create new check with header valid (existing & not-expired) token id and payload valid (all) check fields
// Test HTTP Server on port 3000 with http methods POST, header valid (existing & not-expired) token id, set routing 'checks', querystring none and payload valid (all) check fields
// Postman POST (http://{{IP_ADDRESS}}:3000/checks)							// Postman 22-loggingtoconsole post checks 01
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks' \
//	--header 'token: i81bfwiyyms8andvomql' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"protocol" : "http",
//		"url" : "google.com",
//		"method" : "get",
//		"successCodes" : [200, 201, 301, 302],
//		"timeoutSeconds" : 3
//	}'

// Create check 02 -- yahoo.com
// Test HTTP Server and create new check with header valid (existing & not-expired) token id and payload valid (all) check fields
// Test HTTP Server on port 3000 with http methods POST, header valid (existing & not-expired) token id, set routing 'checks', querystring none and payload valid (all) check fields
// Postman POST (http://{{IP_ADDRESS}}:3000/checks)							// Postman 22-loggingtoconsole post checks 02
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks' \
//	--header 'token: i81bfwiyyms8andvomql' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"protocol" : "http",
//		"url" : "yahoo.com",
//		"method" : "get",
//		"successCodes" : [200, 201, 301, 302],
//		"timeoutSeconds" : 3
//	}'

// To check token id is valid
// Test HTTP Server and read token with querystring valid (existing) token id
// Test HTTP Server on port 3000 with http methods GET, header none, set routing 'tokens', querystring valid (existing) token id and payload none
// Postman GET (http://{{IP_ADDRESS}}:3000/tokens?id=npp5w2xbqan9x3hddz2b)	// Postman 22-loggingtoconsole get tokens	
// curl -X GET 'http://{{IP_ADDRESS}}:3000/tokens?id=npp5w2xbqan9x3hddz2b'

// To extend expire time valid token id
// Test HTTP Server and update token with payload valid (existing & not-expired) token id
// Test HTTP Server on port 3000 with http methods PUT, header none, set routing 'tokens', querystring none and payload valid (existing & not-expired) token id & update fields
// Postman PUT (http://{{IP_ADDRESS}}:3000/tokens)							// Postman 22-loggingtoconsole put tokens
// curl -X PUT 'http://{{IP_ADDRESS}}:3000/tokens' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"id" : "npp5w2xbqan9x3hddz2b",
//		"extend" : true
//	}'

// Test HTTP Server and read check with header valid (existing & not-expired) token id and querystring valid (existing) check id
// Test HTTP Server on port 3000 with http methods GET, header valid (existing & not-expired) token id, set routing 'checks', querystring valid (existing) check id and payload none
// Postman GET (http://{{IP_ADDRESS}}:3000/checks?id=7ikuh742lm8tqeapvg0h)	// Postman 22-loggingtoconsole get checks
// curl -X GET 'http://{{IP_ADDRESS}}:3000/checks?id=7ikuh742lm8tqeapvg0h'\
//	--header 'token: npp5w2xbqan9x3hddz2b'

// Test HTTP Server and update check with header valid (existing & not-expired) token id and payload valid (existing) check id & updated fields
// Test HTTP Server on port 3000 with http methods PUT, header valid (existing & not-expired) token id, set routing 'checks', querystring none and payload valid (existing) check id & updated fields
// Postman PUT (http://{{IP_ADDRESS}}:3000/checks)							// Postman 22-loggingtoconsole put checks
// curl -X PUT 'http://{{IP_ADDRESS}}:3000/checks' \
//	--header 'token: qg6il77ga1o04brehwu2' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"id" : "86uodos4izpykyqyvdua",
//		"protocol" : "https",
//		"url" : "yahoo.com",
//		"method" : "put",
//		"successCodes" : [200, 201, 403],
//		"timeoutSeconds" : 2
//	}'

// Test HTTP Server and delete check with header valid (existing & not-expired) token id and querystring valid (existing) check id
// Test HTTP Server on port 3000 with http methods DEL, header valid (existing & not-expired) token id, set routing 'checks', querystring valid (existing) check id and payload none
// Postman DEL (http://{{IP_ADDRESS}}:3000/checks?id=7o784mnf2jpjch7b30ku)	// Postman 22-loggingtoconsole del checks
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/checks?id=7o784mnf2jpjch7b30ku'\
//	--header 'token: kwztgpxbwv86jvmtanrv'

// Test HTTP Server and delete user with header valid (existing & not-expired) token id and querystring valid (existing) phone
// Test HTTP Server on port 3000 with http methods DEL, header valid (existing & not-expired) token id, set routing 'users', querystring valid (existing) phone and payload none
// Postman DEL (http://{{IP_ADDRESS}}:3000/users?phone=5551234560)			// Postman 22-loggingtoconsole del users
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560' \
//	--header 'token: q96gn9butftilibcfe07'