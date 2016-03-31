import PrototypoCanvas from 'prototypo-canvas';

const workerDeps = document.querySelector('script[src*=prototypo\\.]').src;
let workerUrl;

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
	const font = window.fontInstance = data;
	data.worker.port.addEventListener('message', function(e) {
		if (e.data[0] instanceof ArrayBuffer) {
			if (window.parent) {
				window.parent.postMessage(e.data, '*');
			}
			else {
				document.fonts.add(new FontFace(e.data[1], e.data[0]));
			}
		}
	});
});
