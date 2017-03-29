import FontPrecursor from '../prototypo.js/precursor/FontPrecursor.js';

let currentFont;

self.onmessage = (e) => {
	switch (e.data.type) {
		case 'createFont': {
			currentFont = new FontPrecursor(e.data.data);
			self.postMessage({id: e.data.id});
			break;
		}
		case 'constructGlyphs': {
			const glyphs = currentFont.constructFont(e.data.data.params, e.data.data.subset);

			self.postMessage({id: e.data.id, glyphs});
			break;
		}
		default: {
			break;
		}
	}
};
