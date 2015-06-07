var co = require ('co');
var promise = require ( 'bluebird' );
var ExchangeRateJobHandler = require ( '../handler/exchange_rate_job_handler' );

var exch_handler = promise.promisifyAll ( new ExchangeRateJobHandler () );

var job = {from: 'USD', to: 'HKD', succeeded_attempts: 3, failed_attempts: 1,};
//console.log (' JOB TO WORK ON: ' + job);

var start = co.wrap( function *() {
	yield exch_handler.handleJobAsync ( job ).then ( function ( saved_job ) {
	console.log ( 'Saved ' + saved_job );
	job.succeeded_attempts += 1;
	}).catch ( function ( error ) {
		job.failed_attempts += 1;
		console.log ( 'WE HAVE ERRORS !!!' );
		console.log ( error.stack );
	} );
	
	console.log('Job details:');
	console.log('OK attempts: ' + job.succeeded_attempts);
	console.log('KO attempts: ' + job.failed_attempts);
});

start();
