//'use strict';

var Logger = require ('../logging/Logger');
var myLogger = new Logger ();

myLogger.logInfo ('info message');
myLogger.logWarning ('some warning');
myLogger.logDebug ('debug');

try {
	throw new Error ('test error');
} catch (err) {
	myLogger.logError ( err, 'error');	
}

  //var winston = require('winston');

 // winston.log('info', 'Hello distributed log files!');
 // winston.info('Hello again distributed logs');