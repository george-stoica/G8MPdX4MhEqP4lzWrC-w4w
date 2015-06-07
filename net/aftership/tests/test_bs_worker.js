'use strict'

var beanstalkd_config = require('../config/beanstalk.config');
//var Beanworker = require('fivebeans').worker;

var ExchangeRateConverter = require ('../worker/exchange_rate_converter');
//var ExchangeRateJobHandler = require('../handler/exchange_rate_job_handler');

var options =
{
    id: 'worker_1',
    host: beanstalkd_config.host,
    port: beanstalkd_config.port,
    //handlers:
    //{
    //    exchange_rate_handler: new ExchangeRateJobHandler ()
    //},
    ignoreDefault: true
}
var worker = new ExchangeRateConverter(options);

worker.on('info', function(info) {
	console.log('[' + info.clientid + '] ' + info.message);
}).on('warning', function(warning) {
	console.log('[' + warning.clientid + '] ' + warning.message);
}).on('started', function() {
	console.log(' STARTED');
}).on('stopped', function() {
	console.log('STOPPED');
}).on('job.reserved', function (jobId) {
	console.log('Working on job ' + jobId);
}).on('job.handled', function(payload) {
	console.log('Job handled');
});

//worker.start(['high', 'medium', 'low']);
Array.isArray(beanstalkd_config.tube) ? worker.start(beanstalkd_config.tube) : worker.start([beanstalkd_config.tube]);
//worker.start(beanstalkd_config.tube);