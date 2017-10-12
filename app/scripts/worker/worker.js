import FontPrecursor from '../prototypo.js/precursor/FontPrecursor';
import {fontToSfntTable} from '../opentype/font';

const fonts = {};

self.onmessage = (e) => {
	switch (e.data.type) {
	case 'createFont': {
		e.data.data.forEach((typedata) => {
			fonts[typedata.name] = new FontPrecursor(typedata.json);
		});

		self.postMessage({id: e.data.id});
		break;
	}
	case 'reloadFont': {
		fonts[e.data.data.name] = new FontPrecursor(e.data.data.json);

		self.postMessage({id: e.data.id});
		break;
	}
	case 'constructGlyphs': {
		const font = fonts[e.data.data.name].constructFont(e.data.data.params, e.data.data.subset);

		self.postMessage({id: e.data.id, font});
		break;
	}
	case 'makeOtf': {
		const arrayBuffer = fontToSfntTable({
			...e.data.data.fontResult,
			fontFamily: {en: e.data.data.fontName || 'Prototypo web font'},
			fontSubfamily: {en: 'Regular'},
			postScriptName: {},
			unitsPerEm: 1024,
		});

		self.postMessage({id: e.data.id, arrayBuffer});
		break;
	}
	default: {
		break;
	}
	}
};

self.onerror = () => {
	self.postMessage();
};
