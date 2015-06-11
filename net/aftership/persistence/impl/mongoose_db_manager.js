/**
* Specific DB manager implementation for MongoDB using mongoose.
* @typedef {object} MongooseDbManager
*/
( function () {

	'use strict';

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
		var self = this;
		this.db_config = db_config;
		
		// open db connection
		console.log ( 'Initializing DB...' );
		
		mongoose.connect ( db_config.db_uri );
		
		var connection = mongoose.connection;
		
			connection.on ( 'open', function ( cb ) {
			console.log ( ' connected to DB ... ' );

			if ( !self.ExchangeRateModel ) {
				
				// create schema
				var dbSchema = mongoose.Schema ( {
					from: String,
					to: String,
					created_at: { type: Date, default: Date.now },
					rate: String,
				});
				
				// initialize model
				self.ExchangeRateModel = mongoose.model ( db_config.collection_id, dbSchema );

				// initialize the use of promises with mongoose model.
				promise.promisifyAll ( self.ExchangeRateModel );
				promise.promisifyAll ( self.ExchangeRateModel.prototype );
			}
		});
	}

	/**
	* Opens a new connection to DB.
	* @deprecated - initialization done on object instantiation.
	*/
	MongooseDbManager.prototype.initialize = function ( callback ) {
		console.log ( 'Initializing DB...' );
		
		mongoose.connect ( this.db_config.db_uri, function ( error ) {
			return callback ( error );
		} );

		this.conn = mongoose.connection;
		callback ( null );
		
	};

	/**
	* Saves Exchange rate response to DB.
	* @param {object} exchangeRateEntry - exchange rate response data.
	* @callback callback ( error, data )
	*/
	MongooseDbManager.prototype.save = function ( exchangeRateEntry, callback ) {
			console.log ( 'SAVING to DB...' + JSON.stringify ( exchangeRateEntry ) );

			var self = this;		
			var exchRateEntry = new this.ExchangeRateModel ( {
														from: exchangeRateEntry.from,
														to: exchangeRateEntry.to,
														rate: exchangeRateEntry.rate,
													});

			// save data to DB
			exchRateEntry.saveAsync ().spread ( function ( exchRate ) {

				console.log( 'Saved to db rate: ' + exchRate.rate );

			}).then( function () { 
				// do additional maintenance after successful save
				console.log('entry successfully saved...');
				
			}).catch ( function ( error ) {
			console.log('error saving' + error);
				// return with error
				callback (error);
			});	

			// return with success
			callback (null, 'done');
	};

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
	};

	module.exports = MongooseDbManager;
} () );
