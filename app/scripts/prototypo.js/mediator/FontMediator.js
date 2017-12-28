import _chunk from 'lodash/chunk';
import _forOwn from 'lodash/forOwn';
/* eslint-disable no-unused-vars, import/extensions */
import johnfell from 'john-fell.ptf';
import venus from 'venus.ptf';
import elzevir from 'elzevir.ptf';
import spectral from 'gfnt.ptf';
import antique from 'antique.ptf';
/* eslint-enable no-unused-vars, import/extensions */

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
	static async init(typedatas) {
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

					localClient.dispatchAction('/store-value-font', {
						componentIdAndGlyphPerClass,
					});

					resolve(this);
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

	getFont(fontName, template, params, subset, glyphCanvasUnicode) {
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
				callback: ({arrayBuffer}) => {
					if (params.trigger) {
						 triggerDownload(arrayBuffer.buffer, 'hello');
					}

					this.addToFont(arrayBuffer.buffer, fontName);

					// eslint-disable-next-line no-multi-assign
					const timeout = mergeTimeoutRef = setTimeout(async () => {
						const buffer = await mergeFont(
							MERGE_URL,
							'mergefont',
							[
								this.email,
							],
							arrayBuffer.buffer,
						);

						if (timeout === mergeTimeoutRef) {
							this.addToFont(buffer, fontName);
						}
					}, 300);
				},
			});

			window.fontResult = fontResult;
			localClient.dispatchAction('/store-value-font', {
				font: Math.random(),
			});
		});

		const glyphForCanvas = this.fontMakers[template].constructFont({
			...params,
		}, [glyphCanvasUnicode]);

		[window.glyph] = glyphForCanvas.glyphs;
		localClient.dispatchAction('/store-value-font', {
			glyph: Math.random(),
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

/* eslint-disable global-require */
if (process.env.TESTING_FONT === 'yes') {
	if (module.hot) {
		module.hot.accept(
			'john-fell.ptf',
			async () => {
				const fontJson = require('john-fell.ptf');

				await FontMediator.instance().reloadFont('john-fell.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('john-fell.ptf');
			},
		);
		module.hot.accept(
			'venus.ptf',
			async () => {
				const fontJson = require('venus.ptf');

				await FontMediator.instance().reloadFont('venus.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('venus.ptf');
			},
		);
		module.hot.accept(
			'elzevir.ptf',
			async () => {
				const fontJson = require('elzevir.ptf');

				await FontMediator.instance().reloadFont('elzevir.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('elzevir.ptf');
			},
		);
		module.hot.accept(
			'gfnt.ptf',
			async () => {
				const fontJson = require('gfnt.ptf');

				await FontMediator.instance().reloadFont('gfnt.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('gfnt.ptf');
			},
		);
		module.hot.accept(
			'antique.ptf',
			async () => {
				const fontJson = require('antique.ptf');

				await FontMediator.instance().reloadFont('antique.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('antique.ptf');
			},
		);
		module.hot.accept(
			'../precursor/FontPrecursor.js',
			async () => {
				const prototypoStore = window.prototypoStores['/prototypoStore'];
				const templates = await Promise.all(prototypoStore.get('templateList').map(async ({templateName}) => {
					const typedataJSON = await import(/* webpackChunkName: "ptfs" */`../../../../dist/templates/${templateName}/font.json`);

					return {
						name: templateName,
						json: typedataJSON,
					};
				}));

				await FontMediator.init(templates);
				FontMediator.instance().getAllGlyphForCanvas('john-fell.ptf');
			},
		);
	}
}
/* eslint-enable global-require */
