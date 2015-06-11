'use strict';

var beanstalk_config = require('./net/aftership/config/beanstalk.config');
var ExchangeRateConverter = require ('./net/aftership/worker/exchange_rate_converter');

var options =
{
    id: 'worker_1',
    host: beanstalk_config.host,
    port: beanstalk_config.port,
    ignoreDefault: true
};
var worker = new ExchangeRateConverter(options);

worker.on('info', function ( info ) {
	console.log('[' + info.clientid + '] ' + info.message);
}).on('warning', function ( warning ) {
	console.log('[' + warning.clientid + '] ' + warning.message);
});

Array.isArray(beanstalk_config.tube) ? worker.start(beanstalk_config.tube) : worker.start([beanstalk_config.tube]);