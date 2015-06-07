(function() {
	'use strict'
	
	//const db_config = require ('../config/persistence.config');
	const promise = require('bluebird');
	const mongoose = require ('mongoose');

	var db_uri;
	var datasource_name;
	var conn;
	var db_config;
	
	function MongooseDbManager (db_config) {
		this.db_config = db_config;
	}
	
	MongooseDbManager.prototype.initialize = function (callback) {
		
		if (!this.conn) {
			// 'mongodb://george:password@ds037581.mongolab.com:37581/aftership'
			mongoose.connect (this.db_config.db_uri, function (error) {
				return callback (error);
			});
			
			this.conn = mongoose.connection;
			callback (null);
		}
	}
	
	MongooseDbManager.prototype.save = function (exchangeRateEntry, callback) {
		var self = this;
		this.conn.on ( 'error', function (error) {
			return callback(error);
		});
		
		this.conn.on ( 'open', function (cb) {
			console.log ( ' connected to DB ... ' );
			
			let dbSchema = mongoose.Schema ( {
					from: String,
					to: String,
					created_at: { type: Date, default: Date.now },
					rate: Number
			});
			
			console.log ( 'Saving to collection: ' + self.db_config.collection_id );
			
			let ExchangeRateModel = mongoose.model ( self.db_config.collection_id, dbSchema );
			
			promise.promisifyAll (ExchangeRateModel);
			promise.promisifyAll (ExchangeRateModel.prototype);
			
			let exchRateEntry = new ExchangeRateModel ( {
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
				console.log ( error );
				callback (error);
			});
		
		});
	}
	
	MongooseDbManager.prototype.closeConnection = function (callback) {
		if (this.conn) {
			this.conn.close (function (error) {
				if (error) {
					return callback (error);
				}
				
				callback (null);
			});
		}
	}
	
	module.exports = MongooseDbManager;
}())