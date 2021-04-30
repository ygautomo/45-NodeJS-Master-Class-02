// Filename: 13-serviceping.js
// Description: Module 0313 Service 01 Ping
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const config = require('./13-config');
const fs = require('fs');
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
			// res.end("Hello World! 13-serviceping.js \nwith payload:", payloadString);

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
// NODE_ENV=staging node 13-serviceping.js
// NODE_ENV=production node 13-serviceping.js

// Test HTTP Server on port 3000 and set routing 'path'
// http://{{IP_ADDRESS}}:3000/path?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3000/path?month=March&year=2021)
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	-H "header:No" -H "foo:bar" -H "fizz:buzz" -H "apple:orange" -H "red:blue" \
//	-d "This is the body we are sending." \
//	"http://{{IP_ADDRESS}}:3000/path?month=March&year=2021"

// Test HTTPS Server on port 3001 and set routing 'ping'
// curl [-X POST/GET/PUT/PATCH/DELETE] \
// -k --cacert ca-bundle.crt \
// -H "header:No" -H "foo:bar" -H "fizz:buzz" -H "apple:orange" -H "red:blue" \
// -d "This is the body we are sending." \
// "https://{{IP_ADDRESS}}:3001/ping?month=March&year=2021"
// curl [-X POST/GET/PUT/PATCH/DELETE] \
// --insecure --cacert ca-bundle.crt \
// --header "header:Yes" --header "foo:bar" --header "fizz:buz" --header "apple:orange" --header "red:blue" \
// -d "This is the body we are sending." \
// "https://{{IP_ADDRESS}}:3001/ping?month=March&year=2021"

// Test HTTP Server on port 5000 and set routing 'ping'
// http://{{IP_ADDRESS}}:5000/ping?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:5000/ping?month=March&year=2021)
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	--header "header:Yes" --header "foo:bar" --header "fizz:buz" --header "apple:orange" --header "red:blue" \
//	-d "This is the body we are sending." \
//	"{{IP_ADDRESS}}:5000/ping?month=March&year=2021"

// Reff: https://stackoverflow.com/questions/9100099/why-is-curl-truncating-this-query-string
// Reff: https://stackoverflow.com/questions/56008469/i-am-new-in-programming-i-am-learning-node-js-but-while-doing-parsedurl-i-am-ge