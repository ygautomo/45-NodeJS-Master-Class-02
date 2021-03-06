// Filename: 08-parsingpayloads.js
// Course: Pirple Node JS Master Class
// Description: Module 0308 Building RESTful API- Parsing payloads
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

		// Send the response
		res.end("Hello World! 08-parsingpayloads.js \
		\n" + "Request received with these headers: " + JSON.stringify(headers) + " \
		\n" + "Request received with these payloads: " + JSON.stringify(buffer) + " \
		\n" + "Request received on route: " + trimmedPath + " with method: " + method + " and with these querystring paramaters " + JSON.stringify(queryStringObject));


		// Log the requests
		console.log("Request received with these headers:", headers);
		console.log("Request received with this payload:", buffer);
		console.log("Request received on route:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
	});
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("Hello World! 08-parsingpayloads.js \n" + "The server is listening on port 3000 now");
});

// Running command
// node 08-parsingpayloads.js

// Endpoint with HTTP method, headers, route, querystrings and payloads
// Headers { foo: 'bar',  fizz: 'buzz',  apple: 'orange',  red: 'blue' }
// Payloads "This is the body we are sending." 
// [POST/PUT] `http://{{IP_ADDRESS}}:3000/route?month=March&year=2021`

// Test endpoint status with HTTP method, headers, route ('path', 'route'), querystrings and payloads- returns the status of the API
// http://{{IP_ADDRESS}}:3000/path?month=March&year=2021
// Postman POST (http://{{IP_ADDRESS}}:3000/path?month=March&year=2021)		// Postman 08-parsingpayloads

// curl [-X POST/PUT] \
//	-H "header:No" -H "foo:bar" -H "fizz:buzz" -H "apple:orange" -H "red:blue" \
//	-d "This is the body we are sending." \
//	"http://{{IP_ADDRESS}}:3000/path?month=March&year=2021"

// curl [-X POST/PUT] \
//	--header "header:Yes" --header "foo:bar" --header "fizz:buz" --header "apple:orange" --header "red:blue" \
//	-d "This is the body we are sending." \
//	"http://{{IP_ADDRESS}}:3000/path?month=March&year=2021"

// Reff: https://stackoverflow.com/questions/9100099/why-is-curl-truncating-this-query-string
// Reff: https://stackoverflow.com/questions/56008469/i-am-new-in-programming-i-am-learning-node-js-but-while-doing-parsedurl-i-am-ge

// Note: Sending body/payload in a GET request may cause some existing implementations to reject the request ??? while not prohibited by the specification, the semantics are undefined. It is better to just avoid sending payloads in GET requests.
// Reff: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET