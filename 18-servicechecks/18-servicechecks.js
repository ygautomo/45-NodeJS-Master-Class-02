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
// http://{{IP_ADDRESS}}:3000/checks
// Postman POST (http://{{IP_ADDRESS}}:3000/checks)
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks'

// Test HTTP Server and create new check with header token does exist & not expired; body valid
// Postman POST (http://{{IP_ADDRESS}}:3000/checks) with header & body
// curl -X POST 'http://{{IP_ADDRESS}}:3000/checks' \
// --header 'token: i81bfwiyyms8andvomql' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "protocol" : "http",
//     "url" : "google.com",
//     "method" : "get",
//     "successCodes" : [200, 201],
//     "timeoutSeconds" : 3
// }'

// Test HTTP Server and read check with header token does exists & not expired; querystring id does exist
// Postman GET (http://{{IP_ADDRESS}}:3000/checks?id=7ikuh742lm8tqeapvg0h) with header
// curl -X GET 'http://{{IP_ADDRESS}}:3000/checks?id=7ikuh742lm8tqeapvg0h'\
// --header 'token: npp5w2xbqan9x3hddz2b'

// Test HTTP Server and update check with header token does exist & not expired; body valid
// Postman PUT (http://{{IP_ADDRESS}}:3000/checks) with header & body
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

// Test HTTP Server and delete check with header token does exists & not expired; querystring does not exist
// Postman DEL (http://{{IP_ADDRESS}}:3000/checks?id=7o784mnf2jpjch7b30ku) with header
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/checks?id=7o784mnf2jpjch7b30ku'\
// --header 'token: kwztgpxbwv86jvmtanrv'

// Test HTTP Server and delete user with header token does exist & not expired; querystring phone does exists
// http://{{IP_ADDRESS}}:3000/users?phone=5551234560
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560' \
// --header 'token: q96gn9butftilibcfe07'