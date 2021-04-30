// Filename: 14-assignment.js
// Description: Module 0314 Home Assignment
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should response to all requests with a string
const server = http.createServer(function(req, res){
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

			// Log the requests
			console.log("Returning this response", statusCode, payloadString);
			console.log("Request received with this payload:", buffer);
			console.log("Request received with these headers:", headers);
			console.log("Request received on path:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
		});
	});
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("The server is listening on port 3000 now");
});

// Define the handlers
let handlers = {};

// Define hello handlers
handlers.hello = function(data, callback){
	// Callback a http status code, and a payload
	callback(406, {'message' : 'Hello World!'});
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
	'hello' : handlers.hello,
	'sample' : handlers.sample
};

// Running command
// cd ./Apps 03 -- RESTful API
// node 14-assignment.js

// Test HTTP Server and set routing 'path'
// http://{{IP_ADDRESS}}:3000/path?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3000/path?month=March&year=2021)
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	-H "header:No" -H "foo:bar" -H "fizz:buzz" -H "apple:orange" -H "red:blue" \
//	-d "This is the body we are sending." \
//	"http://{{IP_ADDRESS}}:3000/path?month=March&year=2021"

// Test HTTP Server and set routing 'hello'
// http://{{IP_ADDRESS}}:3000/hello?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3000/hello?month=March&year=2021)
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	--header "header:Yes" --header "foo:bar" --header "fizz:buz" --header "apple:orange" --header "red:blue" \
//	-d "This is the body we are sending." \
//	"{{IP_ADDRESS}}:3000/hello?month=March&year=2021"
// return {'name' : 'sample handler'}

// Reff: https://stackoverflow.com/questions/9100099/why-is-curl-truncating-this-query-string
// Reff: https://stackoverflow.com/questions/56008469/i-am-new-in-programming-i-am-learning-node-js-but-while-doing-parsedurl-i-am-ge