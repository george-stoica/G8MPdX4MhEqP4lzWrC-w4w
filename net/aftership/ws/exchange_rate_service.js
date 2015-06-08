/**
* Calls web service to retrieve current exchange rate.
* @typedef {object} ExchangeRateService
*/
( function () {

	'use strict'

	// web service
	var WEB_SERVICE_URI = 'http://apilayer.net/api/live?access_key=';
	var API_KEY = '925fc1eb1e30523a9b472acea5d6c219';
	var WEB_SERVICE_API_URL = WEB_SERVICE_URI + API_KEY;
	
	var request = require ( 'request' );
	var response_handler;

	/**
	* @constructor
	* Creates a new ExchangeRateService object.
	* @param {object} response_handler - web service response handler
	* @constructor
	*/
	function ExchangeRateService ( response_handler ) {
		console.log ('creating XR service with handler ' + response_handler);
		this.response_handler = response_handler;
	}

	/**
	* Returns the requested exchange rate.
	* @param {object} quoteRequest - exchange rate request data.
	* @callback callback - return info
	*/
	ExchangeRateService.prototype.getCurrencyRate = function ( quoteRequest, callback ) {
		var self = this;
		
		console.log ( 'sending request...' );

		// send request to get exchange rate
		request ( WEB_SERVICE_API_URL, function ( error, response, body ) {

			// check for response error
			if ( error || response.statusCode != 200 ) {
			
				//console.log ( 'error:' + error.stack );
				return callback ( error );
				
			}

			// parse response
			var computedRate = self.response_handler.getRate ( quoteRequest, body );
			
			if ( !computedRate ) {
				return callback ( new Error ( ' Error parsing the web service response' ) );
			}

			// return exchange rate
			callback ( null, self.response_handler.getRate ( quoteRequest, body ) );

		} );
	}

	module.exports = ExchangeRateService;
}())
