// Filename: 15-storingdata.js
// Description: Module 0315 Storing Data
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const _data = require('./lib/15-data')
const config = require('./15-config');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// TESTING
// @TODO delete this
// 01 Test create the data
// _data.create('test', 'newFile', {'foo' : 'bar'}, function(err){
// 	console.log('this was the error', err);
// });

// 02 Test create the data while file does exist
// _data.create('test', 'newFile', {'foo' : 'bar'}, function(err){
// 	console.log('this was the error', err);
// });

// 03 Test read the data
// _data.read('test', 'newFile', function (err, data){
// 	console.log('this was the error', err, 'and this was the data', data);
// });

// 04 Test read the data while file doesn't exist
// _data.read('test', 'newFile1', function (err, data){
// 	console.log('this was the error', err, 'and this was the data', data);
// });

// 05 Test update the data while file does exist
// _data.update('test', 'newFile', {'fizz' : 'buzz'}, function(err){
// 	console.log('this was the error', err);
// });

// 06 Test update the data while file doesn't exist
// _data.update('test', 'newFile1', {'fizz' : 'buzz'}, function(err){
// 	console.log('this was the error', err);
// });

// 07 Test delete the data while file does exist
// _data.delete('test', 'newFile', function(err){
// 	console.log('this was the error', err);
// });

// 08 Test delete the data while file doesn't exist
// _data.delete('test', 'newFile1', function(err){
// 	console.log('this was the error', err);
// });

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
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		let data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
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
			// res.end("Hello World! 15-storingdata.js \nwith payload:", payloadString);

			// Log the requests
			console.log("Returning this response", statusCode, payloadString);
			console.log("Request received with this payload:", buffer);
			console.log("Request received with these headers:", headers);
			console.log("Request received on path:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
		});
	});
};

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

// Define notFound handlers
handlers.notFound = function(data, callback){
	callback(404);
};

// Define a request router
let router = {
	'ping' : handlers.ping,
	'sample' : handlers.sample
};

// Running command
// cd ./Apps 03 -- RESTful API
// NODE_ENV=staging node 15-storingdata.js
// NODE_ENV=production node 15-storingdata.js

// TESTING MODULE