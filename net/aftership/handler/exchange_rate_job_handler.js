( function () {	'use strict';	//var type = 'Exchange Rate Worker - processes exchange rate requests';		var RESPONSE_FAIL = 'fail';	var RESPONSE_SUCCESS = 'success';
	var RESPONSE_RELEASE = 'release';
	var RESPONSE_BURY = 'bury';	
	var config = require ( '../config/exchange_rate_worker.config' );	var promise = require ( 'bluebird' );	var ExchangeRateService = require ( '../ws/exchange_rate_service' );	var ExchangeRateResponseHandler = require ( '../ws/handler/exchange_rate_response_handler' );	function ExchangeRateJobHandler () {		var handler = new ExchangeRateResponseHandler ();
		this.exch_rate_service = promise.promisifyAll ( new ExchangeRateService ( handler ) );
		var DatabaseManager = require ('../persistence/database_manager');
		this.manager = new DatabaseManager();
	}	/**	 * Fivebeans Handler.	 * job: { from: 'USD', to: 'HKD', succeeded_attempts: 5, failed_attempts: 1 }	 */	ExchangeRateJobHandler.prototype.work = function ( job, callback )	{
		console.log (' JOB TO WORK ON: ' + job );
		var self = this;
				if ( !job || !job.from || !job.to ) {						//callback( RESPONSE_FAIL, new Error( 'Job missing information' ) );
			callback ( RESPONSE_BURY );			return;					}				//var self = this;		// send request to ws		//var handler = new ExchangeRateResponseHandler ();		//var exch_rate_service = promise.promisifyAll ( new ExchangeRateService ( handler ) );				console.log('before http req: ' + self.exch_rate_service);		self.exch_rate_service.getCurrencyRateAsync ( job ).then ( function ( exchange_rate ) {						console.log ('1 USD is ' + exchange_rate + ' HKD');						// save to db			//var DatabaseManager = require ('../persistence/database_manager');			//var manager = new DatabaseManager();			var job_to_save = {from: job.from, to: job.to, rate: exchange_rate,};			
			console.log('manager: ' + self.manager);			self.manager.save ( job_to_save ).then (function () {								console.log ('Saved !!!');				
				self.manager.closeConnection();							}).then ( function () {
				console.log('current job' + JSON.stringify(job));
				
				// increment successful attempts
				job.succeeded_attempts += 1;
				
				//callback ( null, job_to_save );
				if ( self.shoudPutJobBackWithDelay ( null, job ) ) {
					callback ( RESPONSE_RELEASE, 60);
				} else {
					callback ( RESPONSE_SUCCESS );
				}
			}).catch ( function ( error ) {				//console.log (error);				//callback ( RESPONSE_FAIL, error );
				job.failed_attempts += 1;
				
				if ( self.shoudPutJobBackWithDelay ( error, job ) ) {
					callback ( RESPONSE_RELEASE, 3);
				} else {
					callback ( RESPONSE_BURY );
				}
			});					}).catch ( function ( error ) {						//console.log (error);			//callback ( RESPONSE_FAIL, error );
			job.failed_attempts += 1;
			
			if ( self.shoudPutJobBackWithDelay ( error, job ) ) {
				callback ( RESPONSE_RELEASE, 3);
			} else {
				callback ( RESPONSE_BURY );
			}					});	}
	ExchangeRateJobHandler.prototype.shoudPutJobBackWithDelay = function ( error, job) {
		console.log('shoudPutJobBackWithDelay: ');
		console.log('error: ' + error);
		console.log('job' + JSON.stringify(job));
		
		return ( ( error && job.failed_attempts <= config.max_job_failed_attempts ) || 
				 ( !error && job.succeeded_attempts <= config.max_job_successful_attempts))
	}
		module.exports = ExchangeRateJobHandler;}())