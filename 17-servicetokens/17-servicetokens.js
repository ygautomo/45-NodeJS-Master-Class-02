// Filename: 17-servicetokens.js
// Description: Module 0317 Service 03 Tokens
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const config = require('./lib/17-config');
const fs = require('fs');
const handlers = require('./lib/17-handlers');
const helpers = require('./lib/17-helpers');
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
			// res.end("Hello World! 17-servicetokens.js \nwith payload:", payloadString);

			// Log the requests
			console.log("Returning this response", statusCode, payloadString);
			console.log("Request received with this payload:", buffer);
			console.log("Request received with these headers:", headers);
			console.log("Request received on path:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
		});
	});
};

// Define a request router
let router = {
	'ping' : handlers.ping,
	'sample' : handlers.sample,
	'tokens' : handlers.tokens,
	'users' : handlers.users
};

// Running command
// cd ./Apps 03 -- RESTful API
// NODE_ENV=staging node 17-servicetokens.js
// NODE_ENV=production node 17-servicetokens.js

// Test HTTP Server
// http://{{IP_ADDRESS}}:3000/tokens
// Postman POST (http://{{IP_ADDRESS}}:3000/tokens)
// curl -X POST 'http://{{IP_ADDRESS}}:3000/tokens'

// Test HTTP Server and create new token with body phone does exist & password valid
// Postman POST (http://{{IP_ADDRESS}}:3000/tokens) with body
// curl -X POST 'http://{{IP_ADDRESS}}:3000/tokens' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "phone" : "5551234560",
//     "password" : "ThisIsAPassword"
// }'

// Test HTTP Server and read token with querystring id does exists
// Postman GET (http://{{IP_ADDRESS}}:3000/tokens?id=lpz9bew8qo3y6pxpqeol)
// curl -X GET 'http://{{IP_ADDRESS}}:3000/tokens?id=lpz9bew8qo3y6pxpqeol'

// Test HTTP Server and read user with header token does exists & not expired; querystring phone does exists
// Postman GET http://{{IP_ADDRESS}}:3000/users?phone=5551234560 with header
// curl -X GET 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560' \
// --header 'token: lpz9bew8qo3y6pxpqeol'

// Test HTTP Server and update token with body id does exists & not expired
// Postman PUT (http://{{IP_ADDRESS}}:3000/tokens) with body
// curl -X PUT 'http://{{IP_ADDRESS}}:3000/tokens' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "id" : "lpz9bew8qo3y6pxpqeol",
//     "extend" : true
// }'

// Test HTTP Server and update user with header token does exists & not expired; body phone does exist
// Postman PUT http://{{IP_ADDRESS}}:3000/users with header & body
// curl -X PUT 'http://{{IP_ADDRESS}}:3000/users' \
// --header 'token: 96auh4py0ed9l1uwgrxq' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "firstName": "John",
//     "phone": "5551234560"
// }'

// Test HTTP Server and delete token with querystring id does exists
// Postman DEL (http://{{IP_ADDRESS}}:3000/tokens?id=lpz9bew8qo3y6pxpqeo)
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/tokens?id=lpz9bew8qo3y6pxpqeo'

// Test HTTP Server and delete user with header token does exist & not expired; querystring phone does exists
// http://{{IP_ADDRESS}}:3000/users?phone=5551234560
// curl -X DELETE 'http://{{IP_ADDRESS}}:3000/users?phone=5551234560' \
// --header 'token: q96gn9butftilibcfe07'