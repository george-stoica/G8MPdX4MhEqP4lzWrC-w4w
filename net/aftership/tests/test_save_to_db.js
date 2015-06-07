const DatabaseManager = require ('./persistence/database_manager');

// var self = this;
const manager = new DatabaseManager();

manager.save ({from: 'USD', to: 'HKD', rate: '4.23',}).then (function () {
			console.log ('Saved !!!');
			manager.closeConnection();
		}).catch (function (err) {
			console.log (err);
		});
