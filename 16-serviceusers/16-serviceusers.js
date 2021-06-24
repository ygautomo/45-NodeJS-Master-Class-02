// Filename: 16-serviceusers.js
// Description: Module 0316 Service 02 Users
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const config = require('./lib/16-config');
const fs = require('fs');
const handlers = require('./lib/16-handlers');
const helpers = require('./lib/16-helpers');
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

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
			// res.end("Hello World! 16-serviceusers.js \nwith payload:", payloadString);

			// Log the requests
			console.log("Returning this response", statusCode, payloadString);
			console.log("Request received with this payload:", buffer);
			// console.log("Request received with these headers:", headers);
			// console.log("Request received on path:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
		});
	});
};

// Define a request router
let router = {
	'ping' : handlers.ping,
	'sample' : handlers.sample,
	'users' : handlers.users
};

// Running command
// cd ./Apps 03 -- RESTful API
// NODE_ENV=staging node 16-serviceusers.js
// NODE_ENV=production node 16-serviceusers.js

// Test HTTP Server
// Test HTTP Server on port 3000 with http methods GET, header none, set routing 'ping', querystring none and payload none
// http://{{IP_ADDRESS}}:3000/ping
// Postman POST (http://{{IP_ADDRESS}}:3000/ping)						// Postman 16-serviceusers ping
// curl -X POST 'http://{{IP_ADDRESS}}:3000/ping'

// Test HTTP Server and create new user with payload valid (new) phone
// Test HTTP Server on port 3000 with http methods POST, header none, set routing 'users', querystring none and payload valid (new) phone
// Postman POST (http://{{IP_ADDRESS}}:3000/users)						// Postman 16-serviceusers post users
// curl -X POST 'http://{{IP_ADDRESS}}:3000/users' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"firstName" : "John",
//		"lastName" : "Smith",
//		"phone" : "5551234560",
//		"password" : "ThisIsAPassword",
//		"tosAgreement" : true
//	}'

// Test HTTP Server and read user with querystring valid (existing) phone
// Test HTTP Server on port 3000 with http methods GET, header none, set routing 'users', querystring valid (existing) phone and payload none
// Postman GET (http://{{IP_ADDRESS}}:3000/users?phone=5551234560)		// Postman 16-serviceusers get users
// curl -X GET 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560'

// Test HTTP Server and update user with payload valid (existing) phone
// Test HTTP Server on port 3000 with http methods PUT, header none, set routing 'users', querystring none and payload valid (existing) phone & updated fields
// Postman PUT (http://{{IP_ADDRESS}}:3000/users)						// Postman 16-serviceusers put users
// curl -X PUT 'http://{{IP_ADDRESS}}:3000/users' \
//	--header 'Content-Type: application/json' \
//	--data-raw '{
//		"firstName" : "Jim",
//		"phone" : "5551234560"
//	}'

// Test HTTP Server and delete user with querystring valid (existing) phone
// Test HTTP Server on port 3000 with http methods DEL, header none, set routing 'users', querystring valid (existing) phone and payload none
// Postman DEL (http://{{IP_ADDRESS}}:3000/users?phone=5551234560)		// Postman 16-serviceusers del users
//	curl -X DELETE 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560'