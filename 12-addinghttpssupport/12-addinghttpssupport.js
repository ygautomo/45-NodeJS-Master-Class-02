// Filename: 12-addinghttpssupport.js
// Course: Pirple Node JS Master Class
// Description: Module 0312 Building RESTful API- Adding HTTPS support
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const config = require('./12-config');
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
	console.log("Hello World! 12-addinghttpssupport.js \n" + "The server is listening on port", config.port, "in", config.envName, "now");
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
	console.log("Hello World! 12-addinghttpssupport.js \n" + "The server is listening on port", config.port, "in", config.envName, "now");
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
			/* res.end("Hello World! 12-addinghttpssupport.js \
			\n" + "Request received with these headers: " + JSON.stringify(data['headers']) + " \
			\n" + "Request received with these payloads: " + data['payload'] + " \
			\n" + "Request received on route: " + data['trimmedPath'] + " with method: " + data['method'] + " and with these querystring paramaters " + JSON.stringify(data['queryStringObject']) + " \
			\n" + "Request received with handler: " + payloadString); */

			// Log the requests
			console.log("Listening on port", config.port, "in", config.envName);
			console.log("Returning this response", statusCode, payloadString);
			console.log("Request received with these headers:", data['headers']);
			console.log("Request received with this payload:", data['payload']);
			console.log("Request received on route:", data['trimmedPath'], "with method:", data['method'], "and with these query string paramaters", data['queryStringObject']);
		});
	});
};

// Define the handlers
let handlers = {};

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
	'sample' : handlers.sample
};

// Running command
// cd ./apps01-restfulapi/12-addinghttpssupport
// NODE_ENV=staging node 12-addinghttpssupport.js
// NODE_ENV=production node 12-addinghttpssupport.js

// Endpoint on port with HTTP or HTTPS method, headers, route handler, querystrings and payloads
// Headers { foo: 'bar',  fizz: 'buzz',  apple: 'orange',  red: 'blue' }
// Payloads "This is the body we are sending." 
// [POST/PUT] `http://{{IP_ADDRESS}}:3000/route?month=March&year=2021`

// Test HTTP Server on port 3000 with http methods, header, set routing 'path', querystring and payload
// http://{{IP_ADDRESS}}:3000/path?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3000/path?month=March&year=2021)			// Postman 12-addinghttpssupport
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	-H "header:No" -H "foo:bar" -H "fizz:buzz" -H "apple:orange" -H "red:blue" \
//	-d "This is the body we are sending." \
//	"http://{{IP_ADDRESS}}:3000/path?month=March&year=2021"

// Test HTTPS Server on port 3001 with http methods, header, set routing 'sample', querystring and payload
// https://{{IP_ADDRESS}}:3001/sample?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3001/sample?month=March&year=2021)		// Postman 12-addinghttpssupport
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	-k --cacert ca-bundle.crt \
//	-H "header:No" -H "foo:bar" -H "fizz:buzz" -H "apple:orange" -H "red:blue" \
//	-d "This is the body we are sending." \
//	"https://{{IP_ADDRESS}}:3001/sample?month=March&year=2021"
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	--insecure --cacert ca-bundle.crt \
//	--header "header:Yes" --header "foo:bar" --header "fizz:buz" --header "apple:orange" --header "red:blue" \
//	-d "This is the body we are sending." \
//	"https://{{IP_ADDRESS}}:3001/sample?month=March&year=2021"
// return {'name' : 'sample handler'}

// Test HTTP Server on port 5000 with http methods, header, set routing 'sample', querystring and payload
// http://{{IP_ADDRESS}}:5000/sample?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:5000/sample?month=March&year=2021)		// Postman 12-addinghttpssupport
// curl [-X POST/GET/PUT/PATCH/DELETE] \
//	--header "header:Yes" --header "foo:bar" --header "fizz:buz" --header "apple:orange" --header "red:blue" \
//	-d "This is the body we are sending." \
//	"{{IP_ADDRESS}}:5000/sample?month=March&year=2021"
// return {'name' : 'sample handler'}

// Reff: https://stackoverflow.com/questions/9100099/why-is-curl-truncating-this-query-string
// Reff: https://stackoverflow.com/questions/56008469/i-am-new-in-programming-i-am-learning-node-js-but-while-doing-parsedurl-i-am-ge

// Note: Sending body/payload in a GET request may cause some existing implementations to reject the request — while not prohibited by the specification, the semantics are undefined. It is better to just avoid sending payloads in GET requests.
// Reff: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET