'use strict';

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var beanstalk_config = require('./net/aftership/config/beanstalk.config');
var ExchangeRateConverter = require ('./net/aftership/worker/exchange_rate_converter');
var args = process.argv;

var options =
{
	id: 'worker_1',
	host: beanstalk_config.host,
	port: beanstalk_config.port,
	ignoreDefault: true
}

if ( args.length > 2 ) {
	// first argument is number of workers
	try {
		var num_workers = parseInt ( args [2] );
	} catch ( err ) {
		// ignore
	}
}
if ( cluster.isMaster ) {
	var max_count = num_workers || numCPUs;
	
	// Fork workers.
	for (var i = 0; i < max_count; i++) {
		cluster.fork();
	}

	Object.keys ( cluster.workers ).forEach ( function ( id ) {
		console.log("Worker is running with id : " + cluster.workers[id].process.pid);
	});

	cluster.on ( 'exit', function ( worker, code, signal ) {
	console.log ( 'worker ' + worker.process.pid + ' died' );
  });
} else {
	// start new worker
	var worker = new ExchangeRateConverter(options);

	worker.on('info', function ( info ) {
		console.log('[' + info.clientid + '] ' + info.message);
	}).on('warning', function ( warning ) {
		console.log('[' + warning.clientid + '] ' + warning.message);
	});

	Array.isArray(beanstalk_config.tube) ? worker.start(beanstalk_config.tube) : worker.start([beanstalk_config.tube]);
}