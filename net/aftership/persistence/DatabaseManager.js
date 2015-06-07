/**
 * Facilitates performing database operations.
 * Acts as an interface between the main application code and the MongoDB implementation.
 * 
 * @typedef {object} DatabaseManager
 */
(function () {
	'use strict'
	
	const db_config = require ('../config/persistence.config');
	const co = require ('co');
	const promise = require ('bluebird');
	const MongooseDbManager = require ('./impl/MongooseDbManager');
	
	//var db_uri;
	//var datasource_name;
	//var db_connection;
	//const manager = new MongooseDbManager();
	
	/**
	 * DatabaseManager constructor.
	 * 
	 * @constructor
	 */
	function DatabaseManager () {
		// initialize - read config
		this.manager = new MongooseDbManager(db_config);
		
		promise.promisifyAll(this.manager);
	}
	
	DatabaseManager.prototype.save = co.wrap(function *(exchangeRateEntry) {
		 yield this.manager.initializeAsync().then (function () {
			console.log('initialized');
		 }).catch(function (err) {
			console.log (err);
		});

		// make sure the db connection has been initialized
		return yield this.manager.saveAsync (exchangeRateEntry);
	});
	
	DatabaseManager.prototype.closeConnection = function () {
		this.manager.closeConnectionAsync().then (function () {
			console.log ('Closed DB connection...');
			return true;
		}).catch ( function (err) {
			console.log (err);
			return false;
		});
	}
	
	module.exports = DatabaseManager;

}())