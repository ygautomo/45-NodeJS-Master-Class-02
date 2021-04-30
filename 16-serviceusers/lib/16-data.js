// Filename: 16-data.js
// Description: Module 0316 Service 02 Users
// Library for storing and editing data
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Depedencies
const fs = require('fs');
const helpers = require('./16-helpers');
const path = require('path');

// Container for the module (to be exported)
let lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback){
	// Open the file for writing
	fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
		if(!err && fileDescriptor){
			// Convert data to string
			let stringData = JSON.stringify(data);

			// Write to file and close it
			fs.writeFile(fileDescriptor, stringData, function(err){
				if(!err){
					fs.close(fileDescriptor, function(err){
						if(!err){
							callback(false);
						} else {
							callback("Error: closing new file");
						}
					});
				} else {
					callback("Error: writing to new file");
				}
			});
		} else {
			callback("Error: Couldn\'t create new file, it may already exist");
		}
	});
};

// Read data from a file
lib.read = function(dir, file, callback){
	fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err, data){
		if(!err && data){
			let parsedData = helpers.parseJsonToObject(data);
			callback(false, parsedData);
		} else {
			callback(err, data);
		}
	});
};

// Update data inside the file
lib.update = function(dir, file, data, callback){
	//open the file for writing
	fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
		if(!err && fileDescriptor){
			// Convert data to string
			let = stringData = JSON.stringify(data);

			// Truncate the file
			fs.truncate(fileDescriptor, function(err){
				if(!err){
					// Write to the file and close it
					fs.writeFile(fileDescriptor, stringData, function(err){
						if(!err){
							fs.close(fileDescriptor, function(err){
								if(!err){
									callback(false);
								} else {
									callback("Error: closing existing file");
								}
							});
						} else {
							callback("Error: writing to existing file");
						}
					});
				} else {
					callback("Error: truncating file");
				}
			});
		} else {
			callback("Error: Couldn\'t open the file for updating, it may not exist yet");
		}
	});
};

// Delete a file
lib.delete = function(dir, file, callback){
	// Unlink the file
	fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
		if(!err){
			callback(false);
		} else {
			callback("Error: deleting file");
		}
	});
};

// Export the module
module.exports = lib;