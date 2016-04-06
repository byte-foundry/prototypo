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
});

// The worker will be built from URL during development, and from
// source in production.
if (process.env.NODE_ENV !== 'production') {
	workerUrl = '/prototypo-canvas/src/worker.js';
}

const canvas = document.getElementById('prototypo-canvas');

const fontPromise = PrototypoCanvas.init({
	canvas,
	workerUrl,
	workerDeps,
	jQueryListeners: false,
	export: true,
});

fontPromise.then(function(data) {
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
