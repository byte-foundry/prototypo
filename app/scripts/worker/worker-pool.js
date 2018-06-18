/* global require */
import _reduce from 'lodash/reduce';
import _find from 'lodash/find';
import LocalClient from '../stores/local-client.stores';

const RANDOM_ID_POOL_LENGTH = 10000;
const randomUuid = [];
let randomUuidIndex = 0;

for (let i = 0; i < RANDOM_ID_POOL_LENGTH; i++) {
	const uuid = Math.random() * 10000 + Math.random() * 100 + Math.random();

	randomUuid.push(uuid);
}

let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

function getRandomUuid() {
	return randomUuid[randomUuidIndex++ % randomUuid.length];
}

export default class WorkerPool {
	constructor(
		workerPoolSize = Math.min(4, navigator.hardwareConcurrency - 1 || 2),
	) {
		// Workers for every thread
		const numberOfWorker = workerPoolSize;
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

			this.workerArray.push({
				worker,
				working: false,
			});

			worker.addEventListener('message', (e) => {
				if (e.data instanceof ArrayBuffer) {
					const data = e.data;

					const idLengthView = new DataView(data, 0, 1);
					const idLength = idLengthView.getUint8(0);

					const idView = new DataView(data, 1, idLength);
					const idDecoder = new TextDecoder('utf-8');
					const id = idDecoder.decode(idView);

					const fontBuffer = data.slice(1 + idLength, data.byteLength);

					this.jobCallback[id](fontBuffer);
					this.jobCallback[id] = undefined;
				}
				else if (e.data.id.indexOf('each') === 0) {
					// TODO(franz): think about timing out
					if (eachJobList.length < numberOfWorker - 1) {
						eachJobList.push(1);
					}
					else {
						eachJobList = [];
						this.jobCallback[e.data.id](e.data);
						this.jobCallback[e.data.id] = undefined;
					}
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
						this.doJob(jobToDo);
						break;
					}
				}
			});
		}
	}

	getFreeWorker() {
		return _find(this.workerArray, worker => !worker.working);
	}

	areWorkerBusy() {
		return _reduce(
			this.workerArray,
			(acc, worker) => acc && worker.working,
			true,
		);
	}

	// jobs should be of this form
	// {
	//	action: {
	//		type: 'computeWhatever',
	//		data: data,
	//	},
	//	callback: Function,
	// }
	doJob(job, pipeline) {
		const time = window.performance.now();
		const uuid = getRandomUuid();

		if (this.areWorkerBusy()) {
			this.jobQueue[pipeline] = job;
		}
		else if (job) {
			const jobId = `${time}${uuid}`;

			job.action.id = jobId;
			this.jobCallback[jobId] = job.callback;

			const worker = this.getFreeWorker();

			worker.worker.postMessage(job.action);
			worker.working = true;
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
