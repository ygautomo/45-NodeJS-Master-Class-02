// Filename: 06-parsingquerystrings.js
// Description: Module 0306 Parsing Query Strings
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

	// Get the query strings as an object
	let queryStringObject = parsedUrl.query;

	// Get the HTTP methods
	let method = req.method.toLowerCase();

	// Send the response
	res.end("Hello World! 06-parsingquerystrings.js \n");

	// Log the requests
	console.log("Request received on path:", trimmedPath, "with method:", method, "and with these query string paramaters", queryStringObject);
});

// Start the server, and have it listen on port 3000
server.listen(3000, function(){
	console.log("The server is listening on port 3000 now");
});

// Running command
// cd ./Apps 03 -- RESTful API
// node 06-parsingquerystrings.js
// http://{{IP_ADDRESS}}:3000/path?month=March&year=2021
// Postman [POST/GET/PUT/PATCH/DELETE] (http://{{IP_ADDRESS}}:3000/path?month=March&year=2021)
// curl [-X POST/GET/PUT/PATCH/DELETE] "http://{{IP_ADDRESS}}:3000/path?month=March&year=2021"
// Reff: https://stackoverflow.com/questions/9100099/why-is-curl-truncating-this-query-string
// Reff: https://stackoverflow.com/questions/56008469/i-am-new-in-programming-i-am-learning-node-js-but-while-doing-parsedurl-i-am-ge