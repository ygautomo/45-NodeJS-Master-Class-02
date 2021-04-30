// Filename: 03-webserver.js
// Description: Module 0303 Starting a Server
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Dependencies
const http = require('http');

// The server should response to all requests with a string
const server = http.createServer(function(req, res){
	res.end("Hello World! 03-webserver.js \n");
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("The server is listening on port 3000 now");
});

// Running command
// cd ./Apps 03 -- RESTful API
// node 03-webserver.js
// http://{{IP_ADDRESS}}:3000
// Postman GET (http://{{IP_ADDRESS}}:3000)
// curl [-X GET] http://{{IP_ADDRESS}}:3000