import PrototypoCanvas from 'prototypo-canvas';
import {Typefaces} from '../services/typefaces.services.js';

export async function setupFontInstance(appValues) {
		const template = appValues.values.familySelected ? appValues.values.familySelected.template : undefined;
		const typedataJSON = await Typefaces.getFont(template || 'venus.ptf');
		const typedata = JSON.parse(typedataJSON);

		// const prototypoSource = await Typefaces.getPrototypo();
		const workerDeps = document.querySelector('script[src*=prototypo\\.]').src;
		let workerUrl;

		// The worker will be built from URL during development, and from
		// source in production.
		if (process.env.NODE_ENV !== 'production') {
			workerUrl = '/prototypo-canvas/src/worker.js';
		}

		const fontPromise = PrototypoCanvas.init({
			canvas: window.canvasElement,
			workerUrl,
			workerDeps,
			jQueryListeners: false,
		});

		const font = window.fontInstance = await fontPromise;
		const subset = appValues.values.text + appValues.values.word;

		await font.loadFont(typedata.fontinfo.familyName, typedataJSON);
		font.subset = typeof subset === 'string' ? subset : '';
		font.displayChar(appValues.values.selected);
		return {font, subset, typedata};
}
