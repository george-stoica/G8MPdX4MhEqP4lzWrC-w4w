( function () {

	'use strict'

	 const WEB_SERVICE_URI = 'http://apilayer.net/api/live?access_key=';
	 const API_KEY = '925fc1eb1e30523a9b472acea5d6c219';
	 const WEB_SERVICE_API_URL = WEB_SERVICE_URI + API_KEY; // performance reasons
	var request = require ( 'request' );

	var response_handler;
	var self;

	function ExchangeRateService ( response_handler ) {

		this.response_handler = response_handler;
		self = this;
	}

	ExchangeRateService.prototype.getCurrencyRate = function ( quoteRequest, callback ) {

		console.log ( 'sending request...' );
		request ( WEB_SERVICE_API_URL, function ( error, response, body ) {

			if ( error || response.statusCode != 200 ) {
				console.log ( 'error:' + error );
				console.log ( 'resp:' + response );
				return callback ( error );
			}

			// console.log ( 'body:' + body );

			// parse response
			callback ( null, self.response_handler.getRate ( quoteRequest, body ) );
		} );
	}

	module.exports = ExchangeRateService;
}())
