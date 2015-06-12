( function () {
	'use strict';
	
	var LOG_INFO = 'info';
	var LOG_WARNING = 'warn';
	var LOG_DEBUG = 'debug';
	var LOG_VERBOSE = 'verbose';
	var LOG_ERROR = 'error';
	
	function Logger () {
		var winston = require ( 'winston' );
		//winston.add(winston.transports.Console, { timestamp: true});
		this.logger = new (winston.Logger) ({
			transports : [
				new (winston.transports.Console)( { timestamp: true } ),
				new (winston.transports.File)({ filename: '../logs/run.log', timestamp: true})
			]
		});	
	}
	
	Logger.prototype.logError = function ( error, errorMessage ) {
		this.logger.log ( LOG_ERROR, errorMessage + '\n' + error.stack, {pid: process.pid} );
	};
	
	Logger.prototype.logInfo = function ( info ) {
		this.logger.log ( LOG_INFO, info, {pid: process.pid} );
	};
	
	Logger.prototype.logWarning = function ( warning ) {
		this.logger.log ( LOG_WARNING, warning, {pid: process.pid} );
	};
	
	Logger.prototype.logDebug = function ( debug ) {
		this.logger.log ( LOG_DEBUG, debug, {pid: process.pid} );
	};
	
	module.exports = Logger;
	
}());