/* globals _ */
import FontPrecursor from '../prototypo.js/precursor/FontPrecursor.js';

let currentFont;

self.onmessage = (e) => {
	switch (e.data.type) {
		case 'createFont': {
			currentFont = new FontPrecursor(e.data.data);
			const initParam = {};

			_.forEach(e.data.data.controls, (control) => {
				control.parameters.forEach((param) => {
					initParam[param.name] = param.init;
				});
			});
			initParam.manualChanges = {};
			const font = currentFont.constructFont(initParam, ['a', 'b']);

			self.postMessage({id: e.data.id, font});
			break;
		}
		case 'constructGlyphs': {
			const font = currentFont.constructFont(e.data.data.params, e.data.data.subset);

			self.postMessage({id: e.data.id, font});
			break;
		}
		default: {
			break;
		}
	}
};
