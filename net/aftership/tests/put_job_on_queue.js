var fivebeans = require('fivebeans');
var beanstalkd_config = require('../config/beanstalk.config');
var job_config = {
		priority: 0,
		delay: 0,
		ttr: 60,	
		job: {
			from: 'HKD',
			to: 'USD',
			type: 'exchange_rate_handler',
		}
	};

var client = new fivebeans.client(beanstalkd_config.host, beanstalkd_config.port);

client.on('connect', function(){
	client.use(Array.isArray(beanstalkd_config.tube) ? beanstalkd_config.tube[0] : beanstalkd_config.tube, function(err, tube) {
		console.log('PUT ON TUBE ' + beanstalkd_config.tube);
		if (err) throw err;

		client.put(job_config.priority, job_config.delay, job_config.ttr, JSON.stringify(job_config.job), function(err, jobid){
			if(err) throw err;

			console.log('put job(id: ' + jobid + ') into tube ' + tube);
			client.end();
		})
		
	});
});

client.connect();