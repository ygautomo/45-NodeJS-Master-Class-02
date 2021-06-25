// Filename: 04-parsingrequestpaths.js
// Course: Pirple Node JS Master Class
// Description: Module 0304 Building RESTful API- Parsing request paths
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

	// Send the response
	res.end("Hello World! 04-parsingrequestpaths.js \n" + "Request received on route: " + trimmedPath);

	// Log the request path
	console.log("Request received on route:", trimmedPath);
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("Hello World! 04-parsingrequestpaths.js \n" + "The server is listening on port 3000 now");
});

// Running command
// node 04-parsingrequestpaths.js

// Endpoint with route
// GET `http://{{IP_ADDRESS}}:3000/route`
// GET `http://{{IP_ADDRESS}}:3000/path`

// Test endpoint status with route ('path', 'route')- returns the status of the API
// http://{{IP_ADDRESS}}:3000/path
// Postman GET (http://{{IP_ADDRESS}}:3000/path)		// Postman 04-parsingrequestpaths
// curl [-X GET] `http://{{IP_ADDRESS}}:3000/path`