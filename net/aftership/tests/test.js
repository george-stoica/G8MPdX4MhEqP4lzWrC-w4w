'use strict'

const co = require ('co');
const promise = require ('bluebird');
const MongooseDbManager = require ('./persistence/MongooseDbManager');

const manager = new MongooseDbManager();

//manager.initialize (function (err) {
//	console.log (err);
//});

//manager.save ({from: 'USD', to: 'HKD', rate: '8.23',}, function (err, data) {
//	if (err) {
//		console.log (err);
//	}
//});

//promise.promisify (manager.save, manager);
promise.promisifyAll(manager);

co (function *() {
	manager.initializeAsync().catch(function (err) {
		console.log (err);
	});

	// make sure the db connection has been initialized
	yield manager.saveAsync ({from: 'USD', to: 'HKD', rate: '9.23',}).then(function (data) {
		console.log ('Saved !!!');
	}).catch (function (err) {
		console.log (err);
	});
	
	manager.closeConnectionAsync().then (function () {
		console.log ('Closed DB connection...');
	}).catch ( function (err) {
		console.log (err);
	});
});