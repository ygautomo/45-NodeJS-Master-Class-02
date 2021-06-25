// Filename: 05-parsinghttpmethods.js
// Course: Pirple Node JS Master Class
// Description: Module 0305 Building RESTful API- Parsing HTTP methods
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const http = require('http');
const url = require('url');

// The server should response to all requests with a string
const server = http.createServer(function(req, res){
	// Get the URL and parse it
	let parsedUrl = url.parse(req.url, true);
	
	// Get the path
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the HTTP methods
	let method = req.method.toLowerCase();

	// Send the response
	res.end("Hello World! 05-parsinghttpmethods.js \n"+ "Request received on route: " + trimmedPath + " with method: " + method);
	
	// Log the requests
	console.log("Request received on route:", trimmedPath, "with method:", method);
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("Hello World! 05-parsinghttpmethods.js \n" + "The server is listening on port 3000 now");
});

// Running command
// node 05-parsinghttpmethods.js

// Endpoint with HTTP method and route
// [POST/GET/PUT/PATCH/DELETE] `http://{{IP_ADDRESS}}:3000/route`

// Test endpoint status with HTTP method and route ('path', 'route')- returns the status of the API
// http://{{IP_ADDRESS}}:3000/path
// Postman [POST/GET/PUT/PATCH/DELETE] (http://{{IP_ADDRESS}}:3000/path)		// Postman 05-parsinghttpmethods
// curl [-X POST/GET/PUT/PATCH/DELETE] http://{{IP_ADDRESS}}:3000/path