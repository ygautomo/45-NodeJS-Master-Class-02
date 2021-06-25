// Filename: 11-config.js
// Course: Pirple Node JS Master Class
// Description: Module 0311 Building RESTful API- Adding configuration
// Create and export configuration variables
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

let environments = {};

// Production environment
environments.production = {
	'port' : 5000,
	'envName' : 'production'
};

// Staging (default) environment
environments.staging = {
	'port' : 3000,
	'envName' : 'staging'
};

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : "";

// Check that the current environment is one of the environments above, if not, default to staging
let environtmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environtmentToExport;