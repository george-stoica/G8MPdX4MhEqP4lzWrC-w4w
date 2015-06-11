/**
 * Parses web service response and retrieves requested exchange rate.
 * @typedef {object} ExchangeRateResponseHandler
 *
 * Response format:
 * { success: true, 
 *		terms: 'https://currencylayer.com/terms', 
 *		privacy: 'https://currencylayer.com/privacy', 
 *		timestamp: 1433606348, 
 *		source: 'USD',
 *		quotes: { USDAED: 3.67295, USDAFN: 59.990002, USDALL: 125.524498, ... <b>USDHKD: 7.752704</b> } 
 * }
 */
( function () {

	'use strict';

	/**
	* @constructor
	* Creates a new ExchangeRateResponseHandler
	* @constructor
	*/
	function ExchangeRateResponseHandler () {

	}

	/**
	* Returns the requested exchange rate from the web service response.
	* @param {object} quoteRequest - request data.
	* @param {object} response - response received from web service
	*/
	ExchangeRateResponseHandler.prototype.getRate = function ( quoteRequest, response ) {
		var formatter = require ( 'accounting' );
		var currencyExch = JSON.parse ( response );

		// get USD to HKD rate
		var rateKey = '' + quoteRequest.from + quoteRequest.to;

		console.log ( 'Rate key:' + rateKey + ' and value: ' + currencyExch.quotes[rateKey] );
		var rate = parseFloat ( currencyExch.quotes[rateKey] );
		
		if ( rate !== NaN ) { //isNaN
			// format rate to 2 decimals
			rate = formatter.format ( rate, 2 );

			return rate;
		}
		
		return NaN;
	};

	module.exports = ExchangeRateResponseHandler;
}());
