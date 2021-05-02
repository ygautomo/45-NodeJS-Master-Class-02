// Filename: 05-parsinghttpmethods.js
// Description: Module 0305 Parsing HTTP Methods
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
	res.end("Hello World! 05-parsinghttpmethods.js \n");

	// Log the requests
	console.log("Request received on path:", trimmedPath, "with method:", method);
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("The server is listening on port 3000 now");
});

// Running command
// cd ./Apps 03 -- RESTful API
// node 05-parsinghttpmethods.js

// Test HTTP Server with http methods and routing path
// http://{{IP_ADDRESS}}:3000/path
// Postman [POST/GET/PUT/PATCH/DELETE] (http://{{IP_ADDRESS}}:3000/path)		// Postman 05-parsinghttpmethods
// curl [-X POST/GET/PUT/PATCH/DELETE] http://{{IP_ADDRESS}}:3000/path