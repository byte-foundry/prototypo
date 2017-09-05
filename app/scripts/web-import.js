import {PrototypoCanvas} from 'prototypo-canvas';
import {gql} from 'react-apollo';

import apolloClient from './services/graphcool.services';

const workerDeps = document.querySelector('script[src*=prototypo\\.]').src;
let workerUrl;

apolloClient.query({
	query: gql`
		query getUserLibrary {
			user {
				library {
					id
					name
					template
					variants {
						id
						name
					}
				}
			}
		}
	`,
})
.then(({data}) => {
	if (!data.user) {
		Promise.reject(new Error("You're not logged into Prototypo"));
	}

	if (window.parent) {
		const message = {
			type: 'library',
			values: data.user.library,
		};

		window.parent.postMessage(message, '*');
	}
})
.catch((e) => {
	trackJs.track(e);
	window.parent.postMessage({
		type: 'error',
		message: e.message,
	}, '*');
});

// The worker will be built from URL during development, and from
// source in production.
//console.log(process.env.NODE_ENV);
//if (process.env.NODE_ENV !== 'production') {
	workerUrl = '/prototypo-canvas/src/worker.js';
	//}

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
		case 'close':
			if (worker) {
				worker.port.close();
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
		if (e.data.action && e.data.action === 'close') {
			return worker.port.close();
		}

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
