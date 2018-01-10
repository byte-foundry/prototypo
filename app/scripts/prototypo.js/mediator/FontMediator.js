import _chunk from 'lodash/chunk';
import _forOwn from 'lodash/forOwn';

import LocalClient from '../../stores/local-client.stores';

import FontPrecursor from '../precursor/FontPrecursor';

import WorkerPool from '../../worker/worker-pool';

const MERGE_URL = process.env.MERGE ? 'http://localhost:3000' : 'https://merge.prototypo.io';

let oldFont;
let localClient;
let mergeTimeoutRef;
let instance;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

window.fontResult = undefined;
window.glyph = undefined;

async function mergeFont(url, action, params, arrayBuffer, mime = 'otf') {
	const response = await fetch([
		url,
		action,
		...params,
	].join('/'), {
		method: 'POST',
		headers: {'Content-Type': `application/${mime}`},
		body: arrayBuffer,
	});

	return response.arrayBuffer();
}

function triggerDownload() {
}

export default class FontMediator {
	static async init(typedatas = []) {
		instance = await new FontMediator(typedatas);
	}

	static instance() {
		if (!instance) {
			throw new Error('cannot return an instance before init');
		}

		return instance;
	}

	constructor(typedatas) {
		this.workerPool = new WorkerPool();

		this.addTemplate(typedatas).then((componentIdAndGlyphPerClass) => {
			if (!process.env.LIBRARY) {
				localClient.dispatchAction('/store-value-font', {
					componentIdAndGlyphPerClass,
				});
			}
		});
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

					typedatas.forEach((typedata) => {
						const font = new FontPrecursor(typedata.json);

						this.glyphList[typedata.name] = typedata.json.glyphs;
						this.fontMakers[typedata.name] = font;

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

						componentIdAndGlyphPerClass[typedata.name] = fontComponentIdAndGlyphPerClass;

						const initValues = {};

						typedata.json.controls.forEach((group) => {
							group.parameters.forEach((param) => {
								initValues[param.name] = param.init;
							});
						});

						this.initValues[typedata.name] = initValues;
					});

					resolve(componentIdAndGlyphPerClass);
				},
			});
		});
	}

	setupInfo({
		family, style, email, template,
	}) {
		if (!instance) {
			throw new Error('cannot return an instance before init');
		}

		this.family = family || this.family;
		this.style = style || this.style;
		this.email = email || this.email;
		this.template = template || this.template;
	}

	reset(fontName, template, subset, glyphCanvasUnicode) {
		return this.getFont(fontName, template, this.initValues[template], subset, glyphCanvasUnicode);
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
		const fontFace = new FontFace(
			fontName,
			buffer,
		);

		if (oldFont) {
			document.fonts.delete(oldFont);
		}

		document.fonts.add(fontFace);
		oldFont = fontFace;
	}

	getFontFile(fontName, template, params, subset) {
		if (!this.workerPool) {
			return undefined;
		}

		return new Promise((resolve) => {
			const jobs = [];
			const fontPromise = _chunk(
				subset,
				Math.ceil(subset.length / this.workerPool.workerArray.length),
			).map(subsubset =>
				new Promise((resolveFont) => {
					jobs.push({
						action: {
							type: 'constructGlyphs',
							data: {
								name: template,
								params: {
									...params,
								},
								subset: subsubset,
							},
						},
						callback: (font) => {
							resolveFont(font);
						},
					});
				}));

			this.workerPool.doJobs(jobs);

			Promise.all(fontPromise).then((fonts) => {
				clearTimeout(mergeTimeoutRef);

				let fontResult;

				fonts.forEach(({font}) => {
					if (fontResult) {
						fontResult.glyphs = [
							...fontResult.glyphs,
							...font.glyphs,
						];
					}
					else {
						fontResult = font;
					}
				});

				this.workerPool.doFastJob({
					action: {
						type: 'makeOtf',
						data: {
							fontResult,
						},
					},
					callback: async ({arrayBuffer}) => {
						const familyName = this.family.name;
						const styleName = this.style.name || 'REGULAR';
						const stringForId = `${new Date().getTime()}${familyName}${this.email}${styleName || 'REGULAR'}`;
						let id = '';

						for (let i = 0; i < 16; i++) {
							if (i < stringForId.length) {
								id += (stringForId.charCodeAt(i) * Math.random() * 32).toFixed(0).toString(16).padStart(2, '0');
							}
							else {
								id += (Math.random() * 100).toFixed(0).toString(16).padStart(2, '0');
							}

							if (i === 3 || i === 5 || i === 7 || i === 9) {
								id += '-';
							}
						}

						const mergedFont = await mergeFont(
							MERGE_URL,
							'fontfile',
							[
								id,
								familyName,
								styleName,
								true,
							],
							arrayBuffer.buffer,
						);

						await mergeFont(
							MERGE_URL,
							'fontinfo',
							[id],
							JSON.stringify({
								template: this.template,
								family: familyName,
								style: styleName,
								date: new Date().getTime(),
								email: this.email,
								params,
							}),
							'json',
						);

						resolve(mergedFont);
					},
				});
			});
		});
	}

	mergeFontWithTimeout(arrayBuffer, fontName) {
		clearTimeout(mergeTimeoutRef);

		return new Promise((resolve, reject) => {
			const timeout = mergeTimeoutRef = setTimeout(async () => {
				const buffer = await mergeFont(
					MERGE_URL,
					'mergefont',
					[
						this.email,
					],
					arrayBuffer,
				);

				if (timeout === mergeTimeoutRef) {
					resolve(buffer);
				}
			}, 300);
		});
	}

	getArrayBuffer(fontResult, trigger = false) {
		return new Promise((resolve, reject) => {
			this.workerPool.doFastJob({
				action: {
					type: 'makeOtf',
					data: {
						fontResult,
					},
				},
				callback: ({arrayBuffer}) => {
					if (trigger) {
						 triggerDownload(arrayBuffer.buffer, 'hello');
					}

					resolve(arrayBuffer.buffer);

					// eslint-disable-next-line no-multi-assign
				},
			});
		});
	}

	getFontObject(fontName, template, params, subset) {
		if (!this.workerPool) {
			return;
		}

		const jobs = [];
		const fontPromise = _chunk(
			subset,
			Math.ceil(subset.length / this.workerPool.workerArray.length),
		).map(subsubset =>
			new Promise((resolve) => {
				jobs.push({
					action: {
						type: 'constructGlyphs',
						data: {
							name: template,
							params: {
								...params,
							},
							subset: subsubset,
						},
					},
					callback: (font) => {
						resolve(font);
					},
				});
			}));

		this.workerPool.doJobs(jobs);

		return Promise.all(fontPromise).then((fonts) => {
			let fontResult;

			fonts.forEach(({font}) => {
				if (fontResult) {
					fontResult.glyphs = [
						...fontResult.glyphs,
						...font.glyphs,
					];
				}
				else {
					fontResult = font;
				}
			});


			return fontResult;
		});
	}

	async getFont(fontName, template, params, subset, glyphCanvasUnicode) {
		if (glyphCanvasUnicode) {
			const glyphForCanvas = this.fontMakers[template].constructFont({
				...params,
			}, [glyphCanvasUnicode]);

			[window.glyph] = glyphForCanvas.glyphs;
			localClient.dispatchAction('/store-value-font', {
				glyph: Math.random(),
			});
		}

		const fontResult = await this.getFontObject(fontName, template, params, subset);
		const arrayBuffer = await this.getArrayBuffer(fontResult, params.trigger);

		this.addToFont(arrayBuffer, fontName);

		this.mergeFontWithTimeout(arrayBuffer, fontName);

		window.fontResult = fontResult;
		localClient.dispatchAction('/store-value-font', {
			font: Math.random(),
		});
	}

	getAllGlyphForCanvas(template, params = this.initValues[template]) {
		const glyphArray = [];

		_forOwn(this.glyphList[template], (glyph) => {
			if (glyph.unicode) {
				try {
					glyphArray.push(this.fontMakers[template].constructFont({
						...params,
					}, [glyph.unicode]).glyphs[0]);
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
