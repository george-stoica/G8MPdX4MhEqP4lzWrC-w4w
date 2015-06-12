/**
* FiveBeans worker. Gets the current exchange rate from web service then saves it to DB.
* @typedef {object} ExchangeRateConverter
*/
( function () {
	'use strict';
	
	var fivebeans = require ( 'fivebeans' );
	var util = require ( 'util' );
//	var co = require ( 'co' );
//	var promise = require ( 'bluebird' );
	var ExchangeRateJobHandler = require ( '../handler/exchange_rate_job_handler' );
	//var config = require ( '../config/exchange_rate_worker.config' );

	var FiveBeansWorker = fivebeans.worker;
	//var self = this;

	/**
	* @constructor
	* Creates a new ExchangeRateConverter instance.
	* @ param {object} params - worker options.
	* @constructor
	*/
	function ExchangeRateConverter ( params ) {

		// initialize FiveBeansWorker
		var init_options = {
		    id : params.id || 'Generic worker',
		    host : params.host,
		    port : params.port,
		};

		// set fivebeans handler used to process the jobs
		this.handler = new ExchangeRateJobHandler ();
		this.handlers = undefined;
		//this.self = this;

		FiveBeansWorker.call ( this, init_options );
	}

	/**
	 * do initial setup.
	 */
	( function () {

		util.inherits ( ExchangeRateConverter, FiveBeansWorker );
		ExchangeRateConverter.prototype.callHandler = undefined;
		ExchangeRateConverter.prototype.lookupHandler = undefined;
	} () );

	/**
	* Override FiveBeansWorker's runJob method to process specific cases.
	*/
	ExchangeRateConverter.prototype.runJob = function ( jobID, job ) {

		var self = this;
		var start_time = new Date ().getTime ();

		/**
		* put job on the tube with low priority
		*/
		function putJobOnTube ( delay ) {
			
			self.client.put ( fivebeans.client.LOWEST_PRIORITY, delay, 60, JSON.stringify ( job ), function ( err, new_job_id ) {

				if ( err ) self.emitWarning ( {
				    message : 'Error while attempting to put job back',
				    id : jobID,
				    error : err
				} );
			} );
		}

		try {

			// start processing the job
			self.handler.work ( job, function ( result, delay ) {

				var time_elapsed = new Date ().getTime () - start_time;

				self.emit ( 'job.handled', {
				    id : jobID,
				    elapsed : time_elapsed,
				    result : result
				} );

				console.log('current job result ' + result);
				switch ( result ) {
				case 'sucess':

					self.emitInfo ( 'Successfully handled job: ' + jobID );
					self.deleteAndMoveOn ( jobID );
					break;

				case 'release':
				
					self.emitInfo ( 'Released Job: ' + jobID );
					// if delay is provided, put job back with the specified delay.
					if ( delay ) {
						putJobOnTube ( parseInt ( delay ) );
					}
					
					self.deleteAndMoveOn(jobID);
					break;

				default:

					self.buryAndMoveOn ( jobID );
					break;
				}
			} );

		} catch ( err ) {
			self.emitWarning ( {
			    message : 'Exception occurred in job handler',
			    id : jobID,
			    error : err
			} );
			
			self.buryAndMoveOn ( jobID );
		}
	};

	module.exports = ExchangeRateConverter;
}());
