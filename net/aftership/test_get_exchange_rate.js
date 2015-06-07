const promise = require ('bluebird');
const ExchangeRateService = require ('./ws/ExchangeRateService');
const ExchangeRateResponseHandler = require ('./ws/handler/ExchangeRateResponseHandler');

var handler = new ExchangeRateResponseHandler ();
var exch_rate_service = new ExchangeRateService (handler);

promise.promisifyAll (exch_rate_service);

exch_rate_service.getCurrencyRateAsync ({from: 'USD', to: 'HKD'}).then ( function (rate) {
	console.log ('1 USD is ' + rate + ' HKD');
}).catch (function (error) {
	console.log (error);
});