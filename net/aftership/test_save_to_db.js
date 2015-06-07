const DatabaseManager = require ('./persistence/DatabaseManager');

//var self = this;
const manager = new DatabaseManager();

manager.save ({from: 'USD', to: 'HKD', rate: '4.23',}).then (function () {
			console.log ('Saved !!!');
			manager.closeConnection();
		}).catch (function (err) {
			console.log (err);
		});

//manager.save ({source_currency: 'USD', target_currency: 'HKD', rate: '9.23',});
		
//manager.closeConnection();