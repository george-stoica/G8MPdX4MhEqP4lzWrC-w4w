/**
 * { success: true, terms: 'https://currencylayer.com/terms', privacy:
 * 'https://currencylayer.com/privacy', timestamp: 1433606348, source: 'USD',
 * quotes: { USDAED: 3.67295, USDAFN: 59.990002, USDALL: 125.524498, ... USDHKD:
 * 7.752704 } }
 */

( function () {

	'use strict'

	function ExchangeRateResponseHandler () {

	}

	ExchangeRateResponseHandler.prototype.getRate = function ( quoteRequest, response ) {

		let currencyExch = JSON.parse ( response );

		//console.log ( currencyExch );

		// get USD to HKD rate
		let rateKey = '' + quoteRequest.from + quoteRequest.to;

		console.log ( 'Rate key:' + rateKey );

		return currencyExch.quotes[rateKey];
	}

	module.exports = ExchangeRateResponseHandler;
}())
