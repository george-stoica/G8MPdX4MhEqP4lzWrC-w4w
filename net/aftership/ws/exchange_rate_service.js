( function () {

	'use strict'

	var WEB_SERVICE_URI = 'http://apilayer.net/api/live?access_key=';
	var API_KEY = '925fc1eb1e30523a9b472acea5d6c219';
	var WEB_SERVICE_API_URL = WEB_SERVICE_URI + API_KEY; // performance reasons
	var request = require ( 'request' );

	var response_handler;

	function ExchangeRateService ( response_handler ) {
		console.log ('creating XR service with handler ' + response_handler);
		this.response_handler = response_handler;
	}

	ExchangeRateService.prototype.getCurrencyRate = function ( quoteRequest, callback ) {
		var self = this;
		
		console.log ( 'sending request...' );
		request ( WEB_SERVICE_API_URL, function ( error, response, body ) {

			if ( error || response.statusCode != 200 ) {
				console.log ( 'error:' + error );
				//console.log ( 'resp:' + response );
				return callback ( error );
			}

			// parse response
			var computedRate = self.response_handler.getRate ( quoteRequest, body );
			
			if ( !computedRate ) {
				return callback ( new Error ( ' Error parsing the web service response' ) );
			}
			callback ( null, self.response_handler.getRate ( quoteRequest, body ) );
		} );
	}

	module.exports = ExchangeRateService;
}())
