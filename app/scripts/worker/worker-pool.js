/* global require, _ */
import LocalClient from '../stores/local-client.stores.jsx';

const RANDOM_LENGTH = 10000;
let randomValues = new Uint32Array(RANDOM_LENGTH);
let randomIndex = 0;
let idleCallbackHandle;
let ric;

crypto.getRandomValues(randomValues);

if (requestIdleCallback) {
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
		const numberOfWorker = navigator.hardwareConcurrency;
		const ProtoWorker = require(`worker-loader!./worker.js`);
		let eachJobList = [];

		this.workerArray = [];
		this.jobCallback = {};

		/* #if dev */
		localClient.dispatchAction('/store-value', {
			workers: Array(numberOfWorker).fill(false),
		});
		/* #end */

		for (let i = 0; i < numberOfWorker; i++) {

			const worker = new ProtoWorker();

			this.workerArray.push({
				worker,
				working: false,
			});

			worker.addEventListener('message', (e) => {
				if (e.data.id.indexOf('each') === 0) {
					//TODO(franz): think about timing out
					if (eachJobList.length < numberOfWorker - 1) {
						eachJobList.push(1);
					}
					else {
						eachJobList = [];
						this.jobCallback[e.data.id](e.data);
					}
				}
				else {
					this.jobCallback[e.data.id](e.data);
				}

				this.workerArray[i].working = false;

				/* #if dev */
				localClient.dispatchAction('/store-value', {
					workers: _.map(this.workerArray, (worker) => {return worker.working}),
				});
				/* #end */

				if (!this.areWorkerBusy() && this.jobQueue) {
					const jobToDo = this.jobQueue;
					this.jobQueue = undefined;
					this.doJobs(jobToDo);
				}
			});
		}
	}

	areWorkerBusy() {
		return _.reduce(this.workerArray, (acc, worker) => {
			return acc || worker.working;
		}, false);
	}

	//jobs should be of this form
	//{
	//	action: {
	//		type: 'computeWhatever',
	//		data: data,
	//	},
	//	callback: Function,
	//}
	doJobs(jobs) {
		const jobPerWorker = Math.ceil(jobs.length / this.workerArray.length);
		const time = window.performance.now();
		const uuid = getRandomUuid();

		if (this.areWorkerBusy()) {
			this.jobQueue = jobs;
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

					/* #if dev */
					localClient.dispatchAction('/store-value', {
						workers: _.map(this.workerArray, (worker) => {return worker.working}),
					});
					/* #end */
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
				workers: _.map(this.workerArray, (worker) => {return worker.working}),
			});
			/* #end */
		}
	}
}
