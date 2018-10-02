import _forOwn from 'lodash/forOwn';

import LocalClient from '../../stores/local-client.stores';

import FontPrecursor from '../precursor/FontPrecursor';

import WorkerPool from '../../worker/worker-pool';

import {fontToSfntTable} from '../../opentype/font';

const MERGE_URL = process.env.MERGE
	? 'http://localhost:3000'
	: 'https://merge.prototypo.io/v1';
const GLYPHR_URL = 'http://www.glyphrstudio.com/online';

const oldFont = {};
let localClient;
let mergeTimeoutRef;
let instance;

const getfsSelection = (weight, italic) =>
	(weight > 500
		? 0b0000000000100000
		: 0b0000000001000000)
	| (italic ? 0b0000000000000001 : 0b0000000000000000);

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

window.fontResult = undefined;
window.glyph = undefined;

function getUuid(email, familyName, styleName) {
	const stringForId = `${new Date().getTime()}${familyName}${email}${styleName}`;
	let id = '';

	for (let i = 0; i < 16; i++) {
		if (i < stringForId.length) {
			id += (stringForId.charCodeAt(i) * Math.random() * 32)
				.toFixed(0)
				.toString(16)
				.padStart(2, '0');
		}
		else {
			id += (Math.random() * 100)
				.toFixed(0)
				.toString(16)
				.padStart(2, '0');
		}

		if (i === 3 || i === 5 || i === 7 || i === 9) {
			id += '-';
		}
	}

	return id;
}

function getComponentIdAndGlyphPerClass(typedata) {
	const fontComponentIdAndGlyphPerClass = {};

	Object.keys(typedata.json.glyphs).forEach((key) => {
		const glyph = typedata.json.glyphs[key];

		if (glyph.outline.component) {
			glyph.outline.component.forEach((component) => {
				if (component.class) {
					fontComponentIdAndGlyphPerClass[component.class] = [
						...(fontComponentIdAndGlyphPerClass[component.class] || []),
						[glyph.name, component.id],
					];
				}
			});
		}
	});

	return fontComponentIdAndGlyphPerClass;
}

async function mergeFont(url, action, params, arrayBuffer, mime = 'otf') {
	const response = await fetch([url, action, ...params].join('/'), {
		method: 'POST',
		headers: {'Content-Type': `application/${mime}`},
		body: arrayBuffer,
	});

	return response.arrayBuffer();
}

export default class FontMediator {
	static async init(typedatas, workerPoolSize, noCanvas) {
		instance = new FontMediator(workerPoolSize, noCanvas);

		await instance.workerPool.workerReady;

		if (typedatas) {
			return instance
				.addTemplate(typedatas)
				.then((componentIdAndGlyphPerClass) => {
					if (!process.env.LIBRARY) {
						localClient.dispatchAction('/store-value-font', {
							componentIdAndGlyphPerClass,
						});
					}
				});
		}

		return Promise.resolve();
	}

	static instance() {
		if (!instance) {
			throw new Error('cannot return an instance before init');
		}

		return instance;
	}

	constructor(workerPoolSize, noCanvas = false) {
		this.noCanvas = noCanvas;
		this.workerPool = new WorkerPool(workerPoolSize);
	}

	addTemplate(typedatas) {
		return new Promise((resolve) => {
			this.workerPool.eachJob({
				action: {
					type: 'createFont',
					data: typedatas,
				},
				callback: () => {
					this.initValues = {};
					this.glyphList = {};
					this.fontMakers = {};
					const componentIdAndGlyphPerClass = {};

					if (!this.noCanvas) {
						typedatas.forEach((typedata) => {
							if (!process.env.LIBRARY) {
								const font = new FontPrecursor(typedata.json);

								this.fontMakers[typedata.name] = font;
							}

							this.glyphList[typedata.name] = typedata.json.glyphs;

							componentIdAndGlyphPerClass[
								typedata.name
							] = getComponentIdAndGlyphPerClass(typedata);

							const initValues = {};

							typedata.json.controls.forEach((group) => {
								group.parameters.forEach((param) => {
									initValues[param.name] = param.init;
								});
							});

							this.initValues[typedata.name] = initValues;
						});
						resolve(componentIdAndGlyphPerClass);
					}
					else {
						resolve();
					}
				},
			});
		});
	}

	setupInfo({family, style, email, template}) {
		if (!instance) {
			throw new Error('cannot return an instance before init');
		}

		this.family = family || this.family;
		this.style = style || this.style;
		this.email = email || this.email;
		this.template = template || this.template;
	}

	reset(fontName, template, subset, glyphCanvasUnicode) {
		return this.getFont(
			fontName,
			template,
			this.initValues[template],
			subset,
			glyphCanvasUnicode,
		);
	}

	reloadFont(fontName, json) {
		return new Promise((resolve) => {
			this.workerPool.eachJob({
				action: {
					type: 'reloadFont',
					data: {
						name: fontName,
						json,
					},
				},
				callback: () => {
					this.fontMakers[fontName] = new FontPrecursor(json);
					resolve(this);
				},
			});
		});
	}

	addToFont(buffer, fontName) {
		const fontFace = new FontFace(fontName, buffer);

		if (fontFace.status === 'error') {
			console.warn(`error in fontface ${fontName}`); // eslint-disable-line no-console
			return;
		}

		if (oldFont[fontName]) {
			document.fonts.delete(oldFont[fontName]);
		}

		document.fonts.add(fontFace);
		oldFont[fontName] = fontFace;
	}

	getFontFile(
		fontName,
		template,
		params,
		subset,
		designer,
		designerUrl,
		foundry,
		foundryUrl,
		weight,
		width,
		italic,
		merged = true,
	) {
		if (!this.workerPool) {
			return undefined;
		}
		const familyName = fontName.family;
		const styleName = fontName.style || 'REGULAR';

		return new Promise((resolve) => {
			const job = {
				action: {
					type: 'constructFont',
					data: {
						name: template,
						familyName,
						styleName,
						params: {
							...params,
						},
						subset,
						forExport: true,
						designer,
						designerUrl,
						foundry,
						foundryUrl,
						weight,
						width,
						italic,
					},
				},
				callback: async (arrayBuffer) => {
					const id = getUuid(this.email, familyName, styleName);

					const mergedFont = await mergeFont(
						MERGE_URL,
						'fontfile',
						[id, familyName, styleName, true],
						arrayBuffer,
					);

					await mergeFont(
						MERGE_URL,
						'fontinfo',
						[id],
						JSON.stringify({
							template,
							family: familyName,
							style: styleName,
							date: new Date().getTime(),
							email: this.email,
							params,
						}),
						'json',
					);

					resolve(merged ? mergedFont : arrayBuffer);
				},
			};

			this.workerPool.doJob(job, fontName);
		});
	}

	async mergeFont(arrayBuffer) {
		const buffer = await mergeFont(
			MERGE_URL,
			'mergefont',
			[this.email],
			arrayBuffer,
		);

		return buffer;
	}

	mergeFontWithoutTimeout(arrayBuffer) {
		return this.mergeFont(arrayBuffer);
	}

	mergeFontWithTimeout(arrayBuffer) {
		clearTimeout(mergeTimeoutRef);

		return new Promise((resolve) => {
			const timeout = setTimeout(() => {
				resolve(this.mergeFont(arrayBuffer));
			}, 300);

			mergeTimeoutRef = timeout;
		});
	}

	openInGlyphr(fontName, template, params, subset) {
		return new Promise((resolve) => {
			this.getFontObject(
				fontName.family,
				fontName.style,
				template,
				params,
				subset,
			).then(({fontBuffer}) => {
				window.open(GLYPHR_URL);
				window.addEventListener(
					'message',
					(e) => {
						e.source.postMessage(fontBuffer, e.origin, [fontBuffer]);
						resolve();
					},
					{once: true},
				);
			});
		});
	}

	getFontObjectNoWorker(
		familyName,
		styleName = 'Regular',
		template,
		params,
		subset,
	) {
		const constructedGlyph = this.fontMakers[template].constructFont(
			{
				...params,
			},
			subset,
		);

		const arrayBuffer = fontToSfntTable({
			...font,
			fontFamily: {en: e.data.data.familyName || 'Prototypo web font'},
			fontSubfamily: {en: e.data.data.styleName || 'Regular'},
			postScriptName: {},
			unitsPerEm: 1024,
			usWeightClass: weight,
			usWidthClass: width,
			manufacturer: foundry,
			manufacturerURL: foundryUrl,
			designer,
			designerURL: designerUrl,
			fsSelection: getfsSelection(e.data.data.weight, e.data.data.italic),
		});

		return arrayBuffer;
	}

	getFontObject(familyName, styleName = 'Regular', template, params, subset) {
		if (!this.workerPool) {
			return false;
		}

		return new Promise((resolve) => {
			const job = {
				action: {
					type: 'constructFont',
					data: {
						name: template,
						familyName,
						styleName,
						params: {
							...params,
						},
						subset,
					},
				},
				callback: (arrayBuffer) => {
					const glyphsListLengthView = new DataView(arrayBuffer, 0, 4);
					const glyphsListLength = glyphsListLengthView.getInt32(0, true);

					const glyphListArray = new Int32Array(
						arrayBuffer,
						4,
						glyphsListLength * 6, // each value is 32bits and there is 4
					);
					const glyphValues = [];

					for (let i = 0; i < glyphsListLength * 6; i += 6) {
						const unicode = glyphListArray[i];
						const advanceWidth = glyphListArray[i + 1];
						const spacingLeft = glyphListArray[i + 2];
						const baseSpacingLeft = glyphListArray[i + 3];
						const spacingRight = glyphListArray[i + 4];
						const baseSpacingRight = glyphListArray[i + 5];

						glyphValues.push({
							unicode,
							advanceWidth,
							spacingLeft,
							spacingRight,
							baseSpacingLeft,
							baseSpacingRight,
						});
					}
					const fontBuffer = arrayBuffer.slice(
						4 + glyphsListLength * 4 * 6,
						arrayBuffer.length,
					);

					resolve({
						glyphValues,
						fontBuffer,
					});
				},
			};

			this.workerPool.doJob(job, familyName + styleName);
		});
	}

	getFont(fontName, template, params, subset, glyphCanvasUnicode) {
		if (glyphCanvasUnicode && !this.noCanvas) {
			const glyphForCanvas = this.fontMakers[template].constructFont(
				{
					...params,
				},
				[glyphCanvasUnicode],
			);

			[window.glyph] = glyphForCanvas.glyphs;
			localClient.dispatchAction('/store-value-font', {
				glyph: Math.random(),
			});
		}

		return this.getFontObject(fontName, 'Regular', template, params, subset)
			.then(({glyphValues, fontBuffer}) => {
				this.addToFont(fontBuffer, fontName);

				window.fontResult = {glyphs: glyphValues};
				localClient.dispatchAction('/store-value-font', {
					font: Math.random(),
				});

				return this.mergeFontWithTimeout(fontBuffer, fontName);
			})
			.then((mergedBuffer) => {
				this.addToFont(mergedBuffer, fontName);
			});
	}

	getAllGlyphForCanvas(template, params = this.initValues[template]) {
		const glyphArray = [];

		_forOwn(this.glyphList[template], (glyph) => {
			if (glyph.unicode && !this.noCanvas) {
				try {
					const constructedGlyph = this.fontMakers[template].constructFont(
						{
							...params,
						},
						[glyph.unicode],
					).glyphs[0];

					glyphArray.push(constructedGlyph);
				}
				catch (error) {
					glyphArray.push({error, unicode: glyph.unicode});
				}
			}
		});

		window.glyphArray = glyphArray;
		localClient.dispatchAction('/store-value-font', {
			glyphArray: Math.random(),
		});
	}
}
