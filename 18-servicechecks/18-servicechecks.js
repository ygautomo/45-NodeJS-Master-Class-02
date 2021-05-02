// Filename: 18-servicechecks.js
// Description: Module 0318 Service 04 Checks
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const config = require('./lib/18-config');
const fs = require('fs');
const handlers = require('./lib/18-handlers');
const helpers = require('./lib/18-helpers');
const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');

// Instantiate the HTTP server
const httpServer = http.createServer(function(req, res){
	unifiedServer(req, res);
});

// Start the HTTP server, and have it listen on designated port
httpServer.listen(config.httpPort, function(){
	console.log("The server is listening on port", config.httpPort, "in", config.envName, "now");
});

// Instantiate the HTTPS server
const httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, function(req, res){
	unifiedServer(req, res);
});

// Start the HTTPS server, and have it listen on designated port
httpsServer.listen(config.httpsPort, function(){
	console.log("The server is listening on port", config.httpsPort, "in", config.envName, "now");
});

// All the the server logic for both the http and https createServer
const unifiedServer = function (req, res){
	// Get the URL and parse it
	let parsedUrl = url.parse(req.url, true);
	
	// Get the path
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query strings as an object
	let queryStringObject = parsedUrl.query;

	// Get the HTTP methods
	let method = req.method.toLowerCase();

	// Get the headers as an object
	let headers = req.headers;

	// Get the payloads, if any
	let decoder = new StringDecoder('utf-8');
	let buffer = "";
	req.on('data', function(data){
		buffer += decoder.write(data);
	});
	
	req.on('end', function(){
		buffer += decoder.end();

		// Choose the handler this request should go to. If one is not found, use the notFound handler
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		let data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : helpers.parseJsonToObject(buffer)
		};

		// Route the request to the handler specified in the router
		chosenHandler(data, function(statusCode, payload){
			// Use the status code called back by the handler, or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			// Use the payload called back by the handler, or default to an empty object
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload to a string
			let payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);
			// res.end("Hello World! 18-servicechecks.js \nwith payload:", payloadString);

			// Log the requests
			console.log("Returning this response", statusCode, payloadString);
			// console.log("Request received with this payload:", buffer);
			// console.log("Request received with these headers:", headers);
			// console.log("Request received on path:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
		});
	});
};

// Define a request router
let router = {
	'checks' : handlers.checks,
	'ping' : handlers.ping,
	'sample' : handlers.sample,
	'tokens' : handlers.tokens,
	'users' : handlers.users
};

// Running command
// cd ./Apps 03 -- RESTful API
// NODE_ENV=staging node 18-servicechecks.js
// NODE_ENV=production node 18-servicechecks.js

// Test HTTP Server
// Test HTTP Server on port 3000 with http methods POST, header none, set routing 'checks', querystring none and payload none
// http://{{IP_ADDRESS}}:3000/checks
// Postman POST (http://{{IP_ADDRESS}}:3000/checks)							// Postman 18-servicechecks checks
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks'

// Test HTTP Server and create new user with payload valid (new) phone
// Test HTTP Server on port 3000 with http methods POST, header none, set routing 'users', querystring none and payload valid (new) phone
// Postman POST (http://{{IP_ADDRESS}}:3000/users)							// Postman 18-servicechecks post users
// curl -X POST 'http://{{IP_ADDRESS}}:3000/users' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//		"firstName" : "John",
//		"lastName" : "Smith",
//		"phone" : "5551234560",
//		"password" : "ThisIsAPassword",
//		"tosAgreement" : true
// }'

// Test HTTP Server and create new token with payload valid (existing) phone & valid password
// Test HTTP Server on port 3000 with http methods POST, header none, set routing 'tokens', querystring none and payload valid (existing) phone & valid password
// Postman POST (http://{{IP_ADDRESS}}:3000/tokens)							// Postman 18-servicechecks post tokens
// curl -X POST 'http://{{IP_ADDRESS}}:3000/tokens' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "phone" : "5551234560",
//     "password" : "ThisIsAPassword"
// }'

// Create check 01 -- google.com
// Test HTTP Server and create new check with header valid (existing & not-expired) token id and payload valid (all) check fields
// Test HTTP Server on port 3000 with http methods POST, header valid (existing & not-expired) token id, set routing 'checks', querystring none and payload valid (all) check fields
// Postman POST (http://{{IP_ADDRESS}}:3000/checks)							// Postman 18-servicechecks post checks 01
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks' \
// --header 'token: i81bfwiyyms8andvomql' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "protocol" : "http",
//     "url" : "google.com",
//     "method" : "get",
//     "successCodes" : [200, 201, 301, 302],
//     "timeoutSeconds" : 3
// }'

// Create check 02 -- yahoo.com
// Test HTTP Server and create new check with header valid (existing & not-expired) token id and payload valid (all) check fields
// Test HTTP Server on port 3000 with http methods POST, header valid (existing & not-expired) token id, set routing 'checks', querystring none and payload valid (all) check fields
// Postman POST (http://{{IP_ADDRESS}}:3000/checks)							// Postman 18-servicechecks post checks 02
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks' \
// --header 'token: i81bfwiyyms8andvomql' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "protocol" : "http",
//     "url" : "yahoo.com",
//     "method" : "get",
//     "successCodes" : [200, 201, 301, 302],
//     "timeoutSeconds" : 3
// }'

// To check token id is valid
// Test HTTP Server and read token with querystring valid (existing) token id
// Test HTTP Server on port 3000 with http methods GET, header none, set routing 'tokens', querystring valid (existing) token id and payload none
// Postman GET (http://{{IP_ADDRESS}}:3000/tokens?id=npp5w2xbqan9x3hddz2b)	// Postman 18-servicechecks get tokens	
// curl -X GET 'http://{{IP_ADDRESS}}:3000/tokens?id=npp5w2xbqan9x3hddz2b'

// To extend expire time valid token id
// Test HTTP Server and update token with payload valid (existing & not-expired) token id
// Test HTTP Server on port 3000 with http methods PUT, header none, set routing 'tokens', querystring none and payload valid (existing & not-expired) token id & update fields
// Postman PUT (http://{{IP_ADDRESS}}:3000/tokens)							// Postman 18-servicechecks put tokens
// curl -X PUT 'http://{{IP_ADDRESS}}:3000/tokens' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "id" : "npp5w2xbqan9x3hddz2b",
//     "extend" : true
// }'

// Test HTTP Server and read check with header valid (existing & not-expired) token id and querystring valid (existing) check id
// Test HTTP Server on port 3000 with http methods GET, header valid (existing & not-expired) token id, set routing 'checks', querystring valid (existing) check id and payload none
// Postman GET (http://{{IP_ADDRESS}}:3000/checks?id=7ikuh742lm8tqeapvg0h)	// Postman 18-servicechecks get checks
// curl -X GET 'http://{{IP_ADDRESS}}:3000/checks?id=7ikuh742lm8tqeapvg0h'\
// --header 'token: npp5w2xbqan9x3hddz2b'

// Test HTTP Server and update check with header valid (existing & not-expired) token id and payload valid (existing) check id & updated fields
// Test HTTP Server on port 3000 with http methods PUT, header valid (existing & not-expired) token id, set routing 'checks', querystring none and payload valid (existing) check id & updated fields
// Postman PUT (http://{{IP_ADDRESS}}:3000/checks)							// Postman 18-servicechecks put checks
// curl -X PUT 'http://{{IP_ADDRESS}}:3000/checks' \
// --header 'token: qg6il77ga1o04brehwu2' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "id" : "86uodos4izpykyqyvdua",
//     "protocol" : "https",
//     "url" : "yahoo.com",
//     "method" : "put",
//     "successCodes" : [200, 201, 403],
//     "timeoutSeconds" : 2
// }'

// Test HTTP Server and delete check with header valid (existing & not-expired) token id and querystring valid (existing) check id
// Test HTTP Server on port 3000 with http methods DEL, header valid (existing & not-expired) token id, set routing 'checks', querystring valid (existing) check id and payload none
// Postman DEL (http://{{IP_ADDRESS}}:3000/checks?id=7o784mnf2jpjch7b30ku)	// Postman 18-servicechecks del checks
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/checks?id=7o784mnf2jpjch7b30ku'\
// --header 'token: kwztgpxbwv86jvmtanrv'

// Test HTTP Server and delete user with header valid (existing & not-expired) token id and querystring valid (existing) phone
// Test HTTP Server on port 3000 with http methods DEL, header valid (existing & not-expired) token id, set routing 'users', querystring valid (existing) phone and payload none
// Postman DEL (http://{{IP_ADDRESS}}:3000/users?phone=5551234560)			// Postman 18-servicechecks del users
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560' \
// --header 'token: q96gn9butftilibcfe07'