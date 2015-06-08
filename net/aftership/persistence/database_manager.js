/**
 * Facilitates performing database operations. Acts as an interface between the
 * main application code and the MongoDB implementation.
 * 
 * @typedef {object} DatabaseManager
 */
( function () {

	'use strict'

	 var db_config = require ('../config/persistence.config');
	 var co = require ('co');
	 var promise = require ('bluebird');
	 var MongooseDbManager = require ('./impl/mongoose_db_manager');

	/**
	 * @constructor
	 * DatabaseManager constructor.
	 * @constructor
	 */
	function DatabaseManager () {

		// initialize - read config
		this.manager = new MongooseDbManager ( db_config );

		promise.promisifyAll ( this.manager );
	}

	/**
	* Save exchange rate to database.
	* Make this run synchronously.
	* @param {object} exchangeRateEntry - exchange rate details.
	* @callback - @FIXME should this be removed ?
	*/
	DatabaseManager.prototype.save = co.wrap(function *(exchangeRateEntry, callback) {
		// make sure the db connection has been initialized
		//yield this.manager.initializeAsync().then ( function () {
		//	console.log( 'initialized' );
		//}).catch(function ( err ) {
		//	console.log ( err.stack );
			
		//	// close current connection on error
		//	this.manager.closeConnectionAsync ().catch( function ( err ) {
		//		console.log ( err.stack );
		//		return err;
		//	});
		//	console.log('BEFORE SAVE');
		//	//callback ( err );
		//	return err;
		//});

		//callback ( null, this.manager.saveAsync ( exchangeRateEntry ) );
		return  yield this.manager.saveAsync ( exchangeRateEntry );
	});

	/**
	* Close connection to DB.
	* Should be used with caution as this procedure is normally done inside the save() operation.
	*/
	DatabaseManager.prototype.closeConnection = function () {
		this.manager.closeConnectionAsync().then ( function () {
			console.log ('Closed DB connection...');
			return true;
		}).catch ( function ( err ) {
			console.log ( err.stack );
			return false;
		});
	}

	module.exports = DatabaseManager;

}())
