( function () {
	var RESPONSE_RELEASE = 'release';
	var RESPONSE_BURY = 'bury';
	var config = require ( '../config/exchange_rate_worker.config' );
		console.log (' JOB TO WORK ON: ' + job );
		var self = this;
		
			callback ( RESPONSE_BURY );
				// increment successful attempts
				job.succeeded_attempts += 1;
				
				if ( self.shoudPutJobBackWithDelay ( null, job ) ) {
					callback ( RESPONSE_RELEASE, 60000);
				} else {
					callback ( RESPONSE_SUCCESS );
				}
				job.failed_attempts += 1;
				
				if ( self.shoudPutJobBackWithDelay ( error, job ) ) {
					callback ( RESPONSE_RELEASE, 3000);
				} else {
					callback ( RESPONSE_BURY );
				}

			job.failed_attempts += 1;
			
			if ( self.shoudPutJobBackWithDelay ( error, job ) ) {
				callback ( RESPONSE_RELEASE, 3000);
			} else {
				callback ( RESPONSE_BURY );
			}
	ExchangeRateJobHandler.prototype.shoudPutJobBackWithDelay = function ( error, job) {
		return ( ( error && job.failed_attempts <= config.max_job_failed_attempts ) || 
				 ( !error && job.succeeded_attempts <= config.max_job_successful_attempts))
	}
	