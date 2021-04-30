// Filename: 04-parsingrequestpaths.js
// Description: Module 0304 Parsing Request Paths
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
	res.end("Hello World! 04-parsingrequestpaths.js \n");

	// Log the request path
	console.log("Request received on path:", trimmedPath);
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("The server is listening on port 3000 now");
});

// Running command
// cd ./Apps 03 -- RESTful API
// node 04-parsingrequestpaths.js
// http://{{IP_ADDRESS}}:3000/path
// Postman GET (http://{{IP_ADDRESS}}:3000/path)
// curl http://{{IP_ADDRESS}}:3000/path