( function () {

	var fivebeans = require ( 'fivebeans' );
	var util = require ( 'util' );
//	var co = require ( 'co' );
//	var promise = require ( 'bluebird' );
	var ExchangeRateJobHandler = require ( '../handler/exchange_rate_job_handler' );
	//var config = require ( '../config/exchange_rate_worker.config' );

	var FiveBeansWorker = fivebeans.worker;

	function ExchangeRateConverter ( params ) {

		//var maxSuccessAttempts = config.max_job_successful_attempts || 10;
		//var maxFailedAttempts = config.max_job_failed_attempts || 3;

		// initialize FiveBeansWorker
		var init_options = {
		    id : params.id || 'Generic worker',
		    host : params.host,
		    port : params.port,
		};

		// set fivebeans handler used to process the jobs
		this.handler = new ExchangeRateJobHandler ();

		FiveBeansWorker.call ( this, init_options );
	}

	/**
	 * do initial setup
	 */
	( function () {

		util.inherits ( ExchangeRateConverter, FiveBeansWorker );
		this.handlers = undefined;
		ExchangeRateConverter.prototype.callHandler = undefined;
		ExchangeRateConverter.prototype.lookupHandler = undefined;
	} () )

	ExchangeRateConverter.prototype.runJob = function ( jobID, job ) {

		var self = this;
		var start = new Date ().getTime ();

		function putJobBack ( delay ) {

			self.client.put ( fivebeans.client.LOWEST_PRIORITY, delay, 60, JSON.stringify ( job ), function ( err, new_job_id ) {

				if ( err ) self.emitWarning ( {
				    message : 'error putting job back',
				    id : jobID,
				    error : err
				} );
			} )
		}

		try {
			self.handler.work ( job, function ( result, response ) {

				var elapsed = new Date ().getTime () - start;

				self.emit ( 'job.handled', {
				    id : jobID,
				    elapsed : elapsed,
				    result : result
				} );

				switch ( result ) {
				case 'success':
					self.emitInfo ( 'Successfully handled a job: ' + jobID );
					self.deleteAndMoveOn ( jobID );
					break;
				// case 'bury':
				//					
				// break;
				case 'release':
					self.emitInfo ( 'Released Job: ' + jobID );
					if ( response ) {
						putJobBack ( parseInt ( response ) );
					}

					break;

				default:
					self.buryAndMoveOn ( jobID );
					break;
				}
			} );
		} catch ( e ) {
			self.emitWarning ( {
			    message : 'exception in job handler',
			    id : jobID,
			    error : e
			} );
			self.buryAndMoveOn ( jobID );
		}
	}

	module.exports = ExchangeRateConverter;
} () )
