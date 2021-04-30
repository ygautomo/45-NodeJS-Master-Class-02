// Filename: 16-config.js
// Description: Module 0316 Service 02 Users
// Create and export configuration variables
//
// Author: Yugo Gautomo
// Status: Final April 01, 2021

// Container for all the environments
let environments = {};

// Production environment
environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production',
	'hashingSecret' : 'thisIsASecret'
};

// Staging (default) environment
environments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging',
	'hashingSecret' : 'thisIsASecret'
};

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : "";

// Check that the current environment is one of the environments above, if not, default to staging
let environtmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environtmentToExport;