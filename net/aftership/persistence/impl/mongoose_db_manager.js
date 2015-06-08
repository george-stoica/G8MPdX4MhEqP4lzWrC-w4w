/**
* Specific DB manager implementation for MongoDB using mongoose.
* @typedef {object} MongooseDbManager
*/
( function () {

	'use strict'

	var db_config = require ( '../../config/persistence.config' );
	var promise = require ( 'bluebird' );
	var mongoose = require ( 'mongoose' );
	//var conn;
	var ExchangeRateModel;
	
	/**
	* @constructor
	* Creates a new DB Manager.
	* @param {object} db_config - database configuration
	* @constructor
	*/
	function MongooseDbManager ( db_config ) {

		this.db_config = db_config;

	}

	/**
	* Opens a new connection to DB.
	* @deprecated - initialization done on each save now.
	*/
	MongooseDbManager.prototype.initialize = function ( callback ) {
		console.log ( 'Initializing DB...' );
		
		mongoose.connect ( this.db_config.db_uri, function ( error ) {
			return callback ( error );
		} );

		this.conn = mongoose.connection;
		
		
		console.log('return');
		callback ( null );
	}

	/**
	* Saves Exchange rate response to DB.
	* @param {object} exchangeRateEntry - exchange rate response data.
	* @callback callback ( error, data )
	*/
	MongooseDbManager.prototype.save = function ( exchangeRateEntry, callback ) {
		var self = this;
		
		// open db connection
		console.log ( 'Initializing DB...' );
		
		mongoose.connect ( this.db_config.db_uri, function ( error ) {
			return callback ( error );
		} );
		
		var connection = mongoose.connection;
		
		connection.on ( 'error', function ( error ) {
			return callback( error );
		});
		
		connection.on ( 'open', function ( cb ) {
			console.log ( ' connected to DB ... ' );
			
			console.log ( 'Saving to collection: ' + self.db_config.collection_id );
			
			//@FIXME - this might be unnecessary since the DB connection is closed after each save now.
			if ( !this.ExchangeRateModel ) {
			
				// create schema
				var dbSchema = mongoose.Schema ( {
					from: String,
					to: String,
					created_at: { type: Date, default: Date.now },
					rate: String,
				});
				
				// initialize model
				this.ExchangeRateModel = mongoose.model ( self.db_config.collection_id, dbSchema );
			}
			
			// initialize the use of promises with mongoose model.
			promise.promisifyAll ( this.ExchangeRateModel );
			promise.promisifyAll ( this.ExchangeRateModel.prototype );

			var exchRateEntry = new this.ExchangeRateModel ( {
														from: exchangeRateEntry.from,
														to: exchangeRateEntry.to,
														rate: exchangeRateEntry.rate,
													});
			// save data to DB
			// @FIXME - should this run async?
			exchRateEntry.saveAsync ().spread ( function ( exchRate ) {

				console.log( 'Saved to db rate: ' + exchRate.rate );

			}).then( function () { // do additional maintenance after successful save

				// close connection to DB
				self.closeConnection ();

				// return with success
				callback (null, 'done');
			}).catch ( function ( error ) {
				// return with error
				callback (error);
			});		
		});
	}

	/**
	* Closes connection to the DB.
	* Use with caution.
	* @callback callback ( error, data ) - enables use of promises.
	*/
	MongooseDbManager.prototype.closeConnection = function ( callback ) {
		
		// check if 
		if ( mongoose ) {
		
			mongoose.disconnect();
	
			callback ( null );
		}

		callback ( new Error ( 'Error while attempting to close DB connection...' ) );
	}

	module.exports = MongooseDbManager;
} () )
