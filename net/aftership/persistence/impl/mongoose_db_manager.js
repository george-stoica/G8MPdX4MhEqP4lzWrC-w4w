( function () {

	'use strict'

	var db_config = require ( '../../config/persistence.config' );
	var promise = require ( 'bluebird' );
	var mongoose = require ( 'mongoose' );
	var conn;
	var ExchangeRateModel;

	function MongooseDbManager ( db_config ) {

		this.db_config = db_config;
	}

	MongooseDbManager.prototype.initialize = function ( callback ) {
		console.log ( 'Initializing DB...' );
		
		mongoose.connect ( this.db_config.db_uri, function ( error ) {
			return callback ( error );
		} );
		//console.log('MONGOOSE: ' + mongoose.connection);
		//console.log('MONGOOSE2: ' + this.conn);
		this.conn = mongoose.connection;
		
		
		console.log('return');
		callback ( null );
	}

	MongooseDbManager.prototype.save = function ( exchangeRateEntry, callback ) {
		var self = this;
		this.conn.on ( 'error', function ( error ) {
			return callback( error );
		});
		
		this.conn.on ( 'open', function ( cb ) {
			console.log ( ' connected to DB ... ' );
			
			console.log ( 'Saving to collection: ' + self.db_config.collection_id );
			
			if ( !this.ExchangeRateModel ) {
				var dbSchema = mongoose.Schema ( {
					from: String,
					to: String,
					created_at: { type: Date, default: Date.now },
					rate: String,
				});
				
				this.ExchangeRateModel = mongoose.model ( self.db_config.collection_id, dbSchema );
			}
			
			promise.promisifyAll ( this.ExchangeRateModel );
			promise.promisifyAll ( this.ExchangeRateModel.prototype );
			
			var exchRateEntry = new this.ExchangeRateModel ( {
														from: exchangeRateEntry.from,
														to: exchangeRateEntry.to,
														rate: exchangeRateEntry.rate,
													});
													
			exchRateEntry.saveAsync ().spread ( function ( exchRate ) {
				console.log( 'Saved to db rate: ' + exchRate.rate );
			}).then( function () {
				//self.conn.close ();
				
				callback (null, 'done');
			}).catch ( function ( error ) {
				callback (error);
			});		
		});
	}

	/**
	* @deprecated
	* Use with caution.
	*/
	MongooseDbManager.prototype.closeConnection = function ( callback ) {
		var self = this;
		
		if ( self.conn ) {
		
			mongoose.disconnect();
		//	self.conn.close ( function ( error ) {

		//		if ( error ) {
		//			return callback ( error );
		//		}
				
		//		self.conn = null;
		//		self.exchange_rate_model = null;
				
				callback ( null );
		//	} );
		}
	}

	module.exports = MongooseDbManager;
} () )
