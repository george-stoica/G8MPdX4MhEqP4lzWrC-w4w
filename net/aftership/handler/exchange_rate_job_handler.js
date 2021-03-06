/**
* Exchange Rate Handler. Retrieves the current exchange rate and saves it to DB.
* @typedef {object} ExchangeRateJobHandler
*/
( function () {

	'use strict';

	//var type = 'Exchange Rate Worker - processes exchange rate requests';

	// response types accepted by the Worker
	var RESPONSE_SUCCESS = 'success';
	var RESPONSE_RELEASE = 'release';
	var RESPONSE_BURY = 'bury';
	
	var config = require ( '../config/exchange_rate_worker.config' );
	var promise = require ( 'bluebird' );
	//var co = require ('co');
	var ExchangeRateService = require ( '../ws/exchange_rate_service' );
	var ExchangeRateResponseHandler = require ( '../ws/handler/exchange_rate_response_handler' );

	/**
	* @constructor
	* Create new job handler for FiveBeansWorker.
	* @constructor
	*/
	function ExchangeRateJobHandler () {
		// initialization
		var handler = new ExchangeRateResponseHandler ();
		this.exch_rate_service = promise.promisifyAll ( new ExchangeRateService ( handler ) );
		var DatabaseManager = require ('../persistence/database_manager');
		this.manager = new DatabaseManager();

	}

	/**
	 * Override Fivebeans Handler's work method.
	 * Job format: { from: 'USD', to: 'HKD', succeeded_attempts: 5, failed_attempts: 1, delay_success: 60, delay_fail: 3 }
	 * @param {object} job - job data
	 * @callback callback ( response_code, payload )
	 */
	ExchangeRateJobHandler.prototype.work = function ( job, callback )
	{
		var self = this;
		
		// validate job format. if invalid discard it.
		if ( !job || !job.from || !job.to ) {
			
			return callback ( RESPONSE_BURY );
			
		}
		
		// send request to ws
		self.exch_rate_service.getCurrencyRateAsync ( job ).then ( function ( exchange_rate ) {
			// received exchange rate from the web service. go on and save it to DB
			
			// save to db - only use data we need from the original job
			var job_to_save = {from: job.from, to: job.to, rate: exchange_rate,};

			// save to db
			self.manager.save ( job_to_save ).then ( function () {

				console.log ('Handler completed SAVE phase...');
				
				// increment successful attempts
				job.succeeded_attempts = ( job.succeeded_attempts || 0 ) + 1;

				// if job succeeded no more than config.max_job_successful_attempts times, put back on the tube with a specified delay.
				// otherwise release the job
				if ( self.shoudPutJobBackWithDelay ( null, job ) ) {
					console.log ( ' delay job ' + JSON.stringify ( job ) + ' by : ' + job.delay_success );
					
					callback ( RESPONSE_RELEASE, ( job.delay_success || 60 ) );

				} else {

					callback ( RESPONSE_SUCCESS );

				}
			}).catch ( function ( error ) {
				console.log ( ' ERROR occured while saving to DB: ' );
				console.log ( error.stack );
				
				// increment fail attempts counter
				job.failed_attempts = ( job.failed_attempts || 0 ) + 1;

				// if job failed no more than config.max_job_failed_attempts times, put back on the tube with a specified delay.
				// otherwise bury the job
				if ( self.shoudPutJobBackWithDelay ( error, job ) ) {
					console.log ( ' delay job ' + JSON.stringify ( job ) + ' by : ' + job.delay_fail );
					
					callback ( RESPONSE_RELEASE, ( job.delay_fail || 3 ) );
				} else {
					callback ( RESPONSE_BURY );
				}
			
			}); // end SAVE phase
			
		}).catch ( function ( error ) {
			console.log ( ' ERROR occured while accessing the web service: ' );
			console.log ( error.stack );
				
			// increment fail counter
			job.failed_attempts = ( job.failed_attempts || 0 ) + 1;

			// if job failed no more than config.max_job_failed_attempts times, put back on the tube with a specified delay.
			// otherwise bury the job
			if ( self.shoudPutJobBackWithDelay ( error, job ) ) {
				console.log ( ' delay job ' + JSON.stringify ( job ) + ' by : ' + job.delay_fail );
				
				callback ( RESPONSE_RELEASE, ( job.delay_fail || 3 ) );
			} else {
				callback ( RESPONSE_BURY );
			}
			
		}); // end Web Service Phase

	};

	/**
	* check if the job should be put back on the tube with a delay.
	* @param {object} error - if defined check conditions for failed attempt
	* @param {object} job - job to check
	*/
	ExchangeRateJobHandler.prototype.shoudPutJobBackWithDelay = function ( error, job) {
		return ( ( error && job.failed_attempts < config.max_job_failed_attempts ) || 
				 ( !error && job.succeeded_attempts < config.max_job_successful_attempts));
	};
	
	module.exports = ExchangeRateJobHandler;
}());
