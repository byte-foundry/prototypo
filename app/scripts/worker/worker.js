import FontPrecursor from '../prototypo.js/precursor/FontPrecursor';
import {fontToSfntTable} from '../opentype/font';

const fonts = {};

/* eslint-disable no-restricted-globals */

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
	case 'constructFont': {
		const font = fonts[e.data.data.name].constructFont(e.data.data.params, e.data.data.subset);

		const arrayBuffer = fontToSfntTable({
			...font,
			fontFamily: {en: e.data.data.fontName || 'Prototypo web font'},
			fontSubfamily: {en: 'Regular'},
			postScriptName: {},
			unitsPerEm: 1024,
		});

		const textEncoder = new TextEncoder('utf-8');
		const encodedId = textEncoder.encode(e.data.id);

		const resultBuffer = new Uint8Array(1 + encodedId.byteLength + arrayBuffer.byteLength);

		resultBuffer.set([encodedId.byteLength, ...encodedId, ...arrayBuffer], 0);

		self.postMessage(resultBuffer.buffer);
		break;
	}
	default: {
		break;
	}
	}
};

self.onerror = () => {
	self.postMessage(true);
};

/* eslint-enable no-restricted-globals */
