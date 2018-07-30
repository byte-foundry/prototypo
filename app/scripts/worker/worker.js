import FontPrecursor from '../prototypo.js/precursor/FontPrecursor';
import {fontToSfntTable} from '../opentype/font';

const fonts = {};

/* eslint-disable no-bitwise */
/* eslint-disable prefer-numeric-literals */
const getfsSelection = (weight, italic) =>
	(weight > 500
		? parseInt('0000000000100000', 2)
		: parseInt('0000000001000000', 2))
	| (italic ? parseInt('0000000000000001', 2) : parseInt('0000000000000000', 2));

/* eslint-disable no-restricted-globals */

// Layout of array is [
//   number of glyphs,
//   unicode,
//   advanceWidth,
//   spacingLeft,
//   spacingRight,
//   unicode,...
//   ]
function getFontValuesArray(font) {
	const glyphValuesArray = [];
	let length = 0;

	for (let i = 0; i < font.glyphs.length; i++) {
		const {
			unicode,
			spacingLeft,
			baseSpacingLeft,
			spacingRight,
			baseSpacingRight,
			advanceWidth,
		} = font.glyphs[i];

		if (unicode) {
			length++;
			glyphValuesArray.push(unicode);
			glyphValuesArray.push(advanceWidth);
			glyphValuesArray.push(spacingLeft);
			glyphValuesArray.push(baseSpacingLeft);
			glyphValuesArray.push(spacingRight);
			glyphValuesArray.push(baseSpacingRight);
		}
	}

	glyphValuesArray.unshift(length);

	const intArray = new Int32Array(glyphValuesArray);

	return new Uint8Array(intArray.buffer);
}

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
		const font = fonts[e.data.data.name].constructFont(
			e.data.data.params,
			e.data.data.subset,
		);

		const arrayBuffer = fontToSfntTable({
			...font,
			fontFamily: {en: e.data.data.familyName || 'Prototypo web font'},
			fontSubfamily: {en: e.data.data.styleName || 'Regular'},
			postScriptName: {},
			unitsPerEm: 1024,
			usWeightClass: e.data.data.weight,
			usWidthClass: e.data.data.width,
			manufacturer: e.data.data.foundry,
			manufacturerURL: e.data.data.foundryUrl,
			designer: e.data.data.designer,
			designerURL: e.data.data.designerUrl,
			fsSelection: getfsSelection(e.data.data.weight, e.data.data.italic),
		});

		if (e.data.data.forExport) {
			const textEncoder = new TextEncoder('utf-8');
			const encodedId = textEncoder.encode(e.data.id);
			const resultBuffer = new Uint8Array(
				1
					+ encodedId.byteLength // ids plus length of ids
						+ arrayBuffer.byteLength,
			);

			resultBuffer.set(
				[encodedId.byteLength, ...encodedId, ...arrayBuffer],
				0,
			);

			self.postMessage(resultBuffer.buffer);
		}
		else {
			const textEncoder = new TextEncoder('utf-8');
			const encodedId = textEncoder.encode(e.data.id);
			const glyphValuesArray = getFontValuesArray(font);
			const resultBuffer = new Uint8Array(
				glyphValuesArray.byteLength
					+ 1
					+ encodedId.byteLength // ids plus length of ids
						+ arrayBuffer.byteLength,
			);

			resultBuffer.set(
				[
					encodedId.byteLength,
					...encodedId,
					...glyphValuesArray,
					...arrayBuffer,
				],
				0,
			);

			self.postMessage(resultBuffer.buffer);
		}
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
