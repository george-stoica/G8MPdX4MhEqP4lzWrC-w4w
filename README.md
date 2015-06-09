## Worker implementation
---
##### Package structure
```
[net]
    |_ [aftership]
            |
            |_  [config]
            |_______   beanstalk.config
            |_______   persistence.config
            |_  [handler]
            |_______   exchange_rate_job_handler.js
            |_  [persistence]
            |_______   database_manager.js
            |_______   [impl]
                            |_____ mongoose_db_manager.js
            |_  [tests]
            |_  [worker]
            |_______   exchange_rate_converter.js
            |_  [ws]
            |_______   exchange_rate_service.js
            |_______   [handler]
                            |_____ exchange_rate_response_handler.js
```
`config` - worker configuration files

`handler` - fivebeans worker handler implementation

`persistence` - database communication implementations

`worker` - fivebeans worker implementation

`ws` - Exchange rate web service implementation

`ws/handler` - web service response handler

##### Dependencies
The following dependencies are required:
* co
* bluebird
* fivebeans
* accounting
* mongoose


#### Job payload

```
{
    from: 'USD',
    to: 'HKD',
	succeeded_attempts: 0,
	failed_attempts: 0
}
```
The `succeeded_attempts` and `failed_attempts` properties are used to persist the attempts counter values when working in a distributed environment.

Different workers can process the same job but the success and fail counters should not be reset.

#### Currency Exchange API
The API used to get the currency is the one provided by https://currencylayer.com/ .
The request must include a unique key provided after signing up. The response comes in JSON form. The free service only allows getting exchange rates from USD to an array of others among which HKD.

`Note`: a secondary API key is included in the exchange_rate_service.js file if the 1000 monthly request limit is reached.

#### Installation
Run the following command to install dependencies.
```
npm install
```

#### Note
The worker should be executed using the `--harmony` command line parameter because of the use of generators in the source code:

```
node --harmony start_worker_cluster.js.js
```
#### Run workers

##### Run single worker
```
node --harmony start_worker.js
```

#####Run as cluster

```
node --harmony start_worker_cluster.js [number of workers]
```

If the `[number of workers]` parameter is not specified the number of workers to be initialized will be the number of processors available on the machine.


## The challenge
---

* DOWNLOAD this repository to your own Github public repository.
* Create a new repo, name it by using this shortGUID generator
* Do NOT fork, as other candidates would be able to see your solution easily.
* Use [beanstalkd](http://kr.github.io/beanstalkd/), mongodb, nodejs
* Get the xe.com exchange rate, store it in mongodb for every 1 min.


## Goal
----
Code a currency exchagne rate `worker`

1. Input currency from USD, to HKD
2. Get USD to HKD currency every 1 min, save 10 successful result to mongodb.
3. If any problem during the get rate attempt, retry it delay with 3s
4. If failed more than 3 times, give up the job.

## Requirements

- Scale horizontally (can run in more than 1 process in many different machines)
- Using [co](https://github.com/tj/co) + [bluebird](https://github.com/petkaantonov/bluebird)


## FAQ
- `consumer worker` is the script to take the job from the queue, in this case is the scraper to get the exchange rate.
- `seed` is the first data input, say HKD to USD to the queue.
- `producer worker` is used to `SEED` the data only, it is optional in this challenge.
- If you don't have xe.com api key, use your own way to get the answer.


## How it work?
---

1. Seed your job in beanstalkd, tube_name = your_github_username

##### Sample beanstalk payload for getting HKD to USD currency, you can use any format or modify the payload to fit your need.
```
{
  "from": "HKD",
  "to": "USD"
}
```

2. Code a nodejs worker, get the job from beanstalkd, get the data from xe.com and save it to mongodb. Exchange rate need to be round off to `2` decmicals in `STRING` type.
	
	a. If request is failed, reput to the tube and delay with 3s.

	b. If request is succeed, reput to the tube and delay with 60s.

##### mongodb data:
```
{
	"from": "HKD",
	"to": "USD",
	"created_at": new Date(1347772624825),
	"rate": "0.13"
}

```

3. Stop the task if you tried 10 succeed attempts or 3 failed attempts.

4. Scale horizontally: NOTICE that the above bs payload is just an example, you should make sure your script can be run as `distributed` system (in multiple instances / servers. Using CLUSER mode in NODE.JS DO NOT help)

5. You are coding the `consumer worker`, NEVER use your `consumer worker` to `SEED` the data.

6. You can seed the data to the tube with bs console or coding another `producer worker` to `SEED` the data.


## Tools you need
---
1. beanstalkd server is setup for you already, make a JSON request to this:

	/POST http://challenge.aftership.net:9578/v1/beanstalkd
	
	header: aftership-api-key: a6403a2b-af21-47c5-aab5-a2420d20bbec

2. Get a free mongodb server at [mongolab](https://mongolab.com/welcome/)


3. You may also need [Beanstalk console](https://github.com/ptrofimov/beanstalk_console) or any tools u like.

4. *MUST* follow [coding guideline](https://github.com/AfterShip/coding-guideline-javascript)

5. *MUST* follow [coding documentation](https://github.com/AfterShip/jsdoc)

## Help?
---
am9ic0BhZnRlcnNoaXAuY29t
