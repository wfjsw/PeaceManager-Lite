#!/usr/bin/env node

// Handler 

var controller = require('./controller.js');
var executor = require('./executor.js');

// First Init
executor.init(config); // Missing config
controller.init(config); // Missing config, either
