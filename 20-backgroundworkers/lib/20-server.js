// Filename: 20-server.js
// Description: Module 0320 Background Workers
// Server related tasks
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const config = require('./20-config');
const fs = require('fs');
const handlers = require('./20-handlers');
const helpers = require('./20-helpers');
const http = require('http');
const https = require('https');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');

// // @TODO Get rid of this
// helpers.sendTwilioSms('81288766668', 'Hello! Sent from Pirple', function(err){
// 	console.log("This was the error", err);
// });

// Instatiate the server module object
let server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res){
	server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
	'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
	'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
	server.unifiedServer(req, res);
});

// All the the server logic for both the http and https createServer
server.unifiedServer = function (req, res){
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
		let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

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
			// res.end("Hello World! 20-backgroundworkers.js \nwith payload:", payloadString);

			// Log the requests
			console.log("Returning this response", statusCode, payloadString);
			// console.log("Request received with this payload:", buffer);
			// console.log("Request received with these headers:", headers);
			// console.log("Request received on path:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
		});
	});
};

// Define a request router
server.router = {
	'checks' : handlers.checks,
	'ping' : handlers.ping,
	'sample' : handlers.sample,
	'tokens' : handlers.tokens,
	'users' : handlers.users
};

// Init script
server.init = function(){
	// Start the HTTP server, and have it listen on designated port
	server.httpServer.listen(config.httpPort, function(){
		console.log("The server is listening on port", config.httpPort, "in", config.envName, "now");
	});

	// Start the HTTPS server, and have it listen on designated port
	server.httpsServer.listen(config.httpsPort, function(){
		console.log("The server is listening on port", config.httpsPort, "in", config.envName, "now");
	});
};

// Export the module
module.exports = server;