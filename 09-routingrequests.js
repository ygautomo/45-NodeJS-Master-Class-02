// Filename: 09-routingrequests.js
// Course: Pirple Node JS Master Class
// Description: Module 0309 Building RESTful API- Routing Requests
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const http = require('http');
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');

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
		console.log(chosenHandler);

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

			console.log(payload);
			// Use the payload called back by the handler, or default to an empty object
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload to a string
			let payloadString = JSON.stringify(payload);

			// Return the response
			res.writeHead(statusCode);
			res.end(payloadString);
			/* res.end("Hello World! 09-routingrequests.js \
			\n" + "Request received with these headers: " + JSON.stringify(data['headers']) + " \
			\n" + "Request received with these payloads: " + data['payload'] + " \
			\n" + "Request received on route: " + data['trimmedPath'] + " with method: " + data['method'] + " and with these querystring paramaters " + JSON.stringify(data['queryStringObject']) + " \
			\n" + "Request received with handler: " + payloadString); */
	

			// Log the requests
			console.log("Returning this response", statusCode, payloadString);
			console.log("Request received with these headers:", data['headers']);
			console.log("Request received with this payload:", data['payload']);
			console.log("Request received on route:", data['trimmedPath'], "with method:", data['method'], "and with these query string paramaters", data['queryStringObject']);
		});
	});
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("Hello World! 09-routingrequests.js \n" + "The server is listening on port 3000 now");
});

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
// node 09-routingrequests.js

// Endpoint with HTTP method, headers, route handler, querystrings and payloads
// Headers { foo: 'bar',  fizz: 'buzz',  apple: 'orange',  red: 'blue' }
// Payloads "This is the body we are sending." 
// [POST/PUT] `http://{{IP_ADDRESS}}:3000/route?month=March&year=2021`

// Test endpoint status with HTTP method, headers, route ('path', 'route', 'sample'), querystrings and payloads- returns the status of the API
// http://{{IP_ADDRESS}}:3000/path?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3000/path?month=March&year=2021)			// Postman 09-routingrequests
// curl [-X POST/PUT] \
//	-H "header:No" -H "foo:bar" -H "fizz:buzz" -H "apple:orange" -H "red:blue" \
//	-d "This is the body we are sending." \
//	"http://{{IP_ADDRESS}}:3000/path?month=March&year=2021"

// http://{{IP_ADDRESS}}:3000/sample?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3000/sample?month=March&year=2021)		// Postman 09-routingrequests
// curl [-X POST/PUT] \
//	--header "header:Yes" --header "foo:bar" --header "fizz:buz" --header "apple:orange" --header "red:blue" \
//	-d "This is the body we are sending." \
//	"{{IP_ADDRESS}}:3000/sample?month=March&year=2021"
// return {'name' : 'sample handler'}

// Reff: https://stackoverflow.com/questions/9100099/why-is-curl-truncating-this-query-string
// Reff: https://stackoverflow.com/questions/56008469/i-am-new-in-programming-i-am-learning-node-js-but-while-doing-parsedurl-i-am-ge

// Note: Sending body/payload in a GET request may cause some existing implementations to reject the request — while not prohibited by the specification, the semantics are undefined. It is better to just avoid sending payloads in GET requests.
// Reff: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET