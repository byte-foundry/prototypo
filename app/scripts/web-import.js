import PrototypoCanvas from 'prototypo-canvas';
import HoodieApi from './services/hoodie.services.js';
import {AppValues} from './services/values.services.js';

const workerDeps = document.querySelector('script[src*=prototypo\\.]').src;
let workerUrl;

HoodieApi.setup()
.then(() => {
	return AppValues.get({typeface: 'default'});
})
.then((values) => {
	if (window.parent) {
		const message = {
			type: 'library',
			values: values.values.library,
		};

		window.parent.postMessage(message, '*');
	}
})
.catch(() => {
	window.parent.postMessage({
		type: 'error',
		message: `You're not logged into Prototypo`,
	}, '*');
});

// The worker will be built from URL during development, and from
// source in production.
if (process.env.NODE_ENV !== 'production') {
	workerUrl = '/prototypo-canvas/src/worker.js';
}

const canvas = document.getElementById('prototypo-canvas');
let worker;
let font;

const fontPromise = PrototypoCanvas.init({
	canvas,
	workerUrl,
	workerDeps,
	jQueryListeners: false,
	export: true,
});

window.addEventListener('message', function(e) {
	switch (e.data.type) {
		case 'fontData':
			if (worker) {
				worker.port.postMessage(e.data);
			}
			break;
		case 'subset':
			if (worker) {
				worker.port.postMessage(e.data);
			}
			break;
		default:
			break;
	}
});

fontPromise.then(function(data) {
	font = data;
	worker = data.worker;
	data.worker.port.addEventListener('message', function(e) {
		const message = {
			type: 'font',
			font: e.data,
		};

		if (e.data[0] instanceof ArrayBuffer) {
			if (window.parent) {
				window.parent.postMessage(message, '*');
			}
			else {
				document.fonts.add(new FontFace(e.data[1], e.data[0]));
			}
		}
	});
});
