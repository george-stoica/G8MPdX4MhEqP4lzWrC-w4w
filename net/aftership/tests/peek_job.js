var fivebeans = require('fivebeans');
var beanstalkd_config = require('../config/beanstalk.config');

var client = new fivebeans.client(beanstalkd_config.host, beanstalkd_config.port);

client.on('connect', function(){
	client.use(Array.isArray(beanstalkd_config.tube) ? beanstalkd_config.tube[0] : beanstalkd_config.tube, function(err, tube) {
		if (err) throw err;

		client.peek_ready(function(err, jobid, payload) {
			if(err) {
				console.log(err);
			}
			else{			
				console.log(jobid);
				console.log(payload.toString());
			}
			client.end();
		});
		
	});
});

client.connect();