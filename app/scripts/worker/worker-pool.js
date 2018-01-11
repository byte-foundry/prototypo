/* global require */
import _reduce from 'lodash/reduce';
import LocalClient from '../stores/local-client.stores';

const RANDOM_LENGTH = 10000;
let randomValues = new Uint32Array(RANDOM_LENGTH);
let randomIndex = 0;
let idleCallbackHandle;
let ric;

crypto.getRandomValues(randomValues);

if (window.requestIdleCallback) {
	ric = requestIdleCallback;
}
else {
	ric = (fn) => {
		fn();
		return 1;
	};
}

let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

function getRandomUuid() {
	let uuid;

	if (randomIndex + 1 > RANDOM_LENGTH - 1) {
		const values = crypto.getRandomValues(new Uint32Array(2));

		uuid = `${values[0]}${values[1]}`;
		if (!idleCallbackHandle) {
			idleCallbackHandle = ric(() => {
				randomValues = new Uint32Array(RANDOM_LENGTH);
				randomIndex = 0;
				crypto.getRandomValues(randomValues);
				idleCallbackHandle = undefined;
			});
		}
	}
	else {
		uuid = `${randomValues[randomIndex]}${randomValues[randomIndex + 1]}`;
	}

	return uuid;
}

export default class WorkerPool {
	constructor() {
		 // Workers for every thread available including a fast lane worker for the canvas
		const numberOfWorker = navigator.hardwareConcurrency - 1;
		const ProtoWorker = require('worker-loader?inline!./worker.js'); // eslint-disable-line global-require, no-webpack-loader-syntax
		let eachJobList = [];

		this.workerArray = [];
		this.jobCallback = {};
		this.jobQueue = {};
		this.fastJobQueue = [];

		/* #if dev */
		localClient.dispatchAction('/store-value', {
			workers: Array(numberOfWorker).fill(false),
		});
		/* #end */

		for (let i = 0; i < numberOfWorker; i++) {
			const worker = new ProtoWorker();

			if (i === numberOfWorker - 1) {
				this.workerFastLane = {
					worker,
					working: false,
				};

				worker.addEventListener('message', (e) => {
					this.jobCallback[e.data.id](e.data);
					this.jobCallback[e.data.id] = undefined;

					this.workerFastLane.working = false;

					/* #if dev */
					localClient.dispatchAction('/store-value', {
						workerFast: this.workerFastLane.working,
					});
					/* #end */

					if (this.fastJobQueue) {
						const jobToDo = this.fastJobQueue.shift();

						this.doFastJob(jobToDo);
					}
				});
			}
			else {
				this.workerArray.push({
					worker,
					working: false,
				});

				worker.addEventListener('message', (e) => {
					if (e.data.id.indexOf('each') === 0) {
						// TODO(franz): think about timing out
						if (eachJobList.length < numberOfWorker - 2) {
							eachJobList.push(1);
						}
						else {
							eachJobList = [];
							this.jobCallback[e.data.id](e.data);
							this.jobCallback[e.data.id] = undefined;
						}
					}
					else {
						this.jobCallback[e.data.id](e.data);
						this.jobCallback[e.data.id] = undefined;
					}

					this.workerArray[i].working = false;

					/* #if dev */
					localClient.dispatchAction('/store-value', {
						workers: this.workerArray.map(w => w.working),
					});
					/* #end */

					if (!this.areWorkerBusy() && this.jobQueue) {
						const pipelineNames = Object.keys(this.jobQueue);

						for (let j = 0; j < pipelineNames.length; j++) {
							const jobToDo = this.jobQueue[pipelineNames[j]];

							delete this.jobQueue[pipelineNames[j]];
							this.doJobs(jobToDo);
							break;
						}
					}
				});
			}
		}
	}

	areWorkerBusy() {
		return _reduce(this.workerArray, (acc, worker) => acc || worker.working, false);
	}

	doFastJob(job) {
		const time = window.performance.now();
		const uuid = getRandomUuid();

		if (this.workerFastLane.working) {
			this.fastJobQueue.push(job);
		}
		else if (job) {
			const jobId = `${time}-${uuid}`;

			job.action.id = jobId;
			this.jobCallback[jobId] = job.callback;

			this.workerFastLane.worker.postMessage(job.action);
			this.workerFastLane.working = true;
		}
	}

	// jobs should be of this form
	// {
	//	action: {
	//		type: 'computeWhatever',
	//		data: data,
	//	},
	//	callback: Function,
	// }
	doJobs(jobs, pipeline) {
		const jobPerWorker = Math.ceil(jobs.length / this.workerArray.length);
		const time = window.performance.now();
		const uuid = getRandomUuid();

		if (this.areWorkerBusy()) {
			this.jobQueue[pipeline] = jobs;
		}
		else {
			for (let i = 0; i < jobs.length; i++) {
				const job = jobs[i];

				if (job) {
					const jobId = `${time}-${uuid}-${i}`;

					job.action.id = jobId;
					this.jobCallback[jobId] = job.callback;

					this.workerArray[Math.floor(i / jobPerWorker)].worker.postMessage(job.action);
					this.workerArray[Math.floor(i / jobPerWorker)].working = true;
				}
			}
		}
	}

	eachJob(job) {
		const time = window.performance.now();
		const uuid = getRandomUuid();

		for (let i = 0; i < this.workerArray.length; i++) {
			const jobId = `each-${time}-${uuid}`;

			job.action.id = jobId;

			this.jobCallback[jobId] = job.callback;

			this.workerArray[i].worker.postMessage(job.action);
			/* #if dev */
			localClient.dispatchAction('/store-value', {
				workers: this.workerArray.map(worker => worker.working),
			});
			/* #end */
		}
	}
}
