// Filename: 03-webserver.js
// Course: Pirple Node JS Master Class
// Description: Module 0303 Building RESTful API- Starting a server
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const http = require('http');

// The server should response to all requests with a string
const server = http.createServer(function(req, res){
	res.end("Hello World! 03-webserver.js \n" + "The server is listening on port 3000 now");
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("Hello World! 03-webserver.js \n" + "The server is listening on port 3000 now");
});

// Running command
// node 03-webserver.js

// Endpoint
// GET `http://{{IP_ADDRESS}}:3000`

// Test endpoint status- returns the status of the API
// Web `http://{{IP_ADDRESS}}:3000`
// Postman GET `http://{{IP_ADDRESS}}:3000`		// Postman 03-webserver
// curl [-X GET] `http://{{IP_ADDRESS}}:3000`