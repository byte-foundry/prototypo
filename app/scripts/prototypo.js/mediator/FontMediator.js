import _chunk from 'lodash/chunk';
import _forOwn from 'lodash/forOwn';

import LocalClient from '../../stores/local-client.stores';

import FontPrecursor from '../precursor/FontPrecursor';

import WorkerPool from '../../worker/worker-pool';

const MERGE_URL = 'https://merge.prototypo.io';

let oldFont;
let localClient;
let mergeTimeoutRef;
let instance;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

window.fontResult = undefined;
window.glyph = undefined;

async function mergeFont(url, name, user, arrayBuffer, merged) {
	const response = await fetch(
		[
			url,
			name.family,
			name.style,
			user,
			name.template || 'unknown',
		].join('/')
		+ (merged ? '/overlap' : ''), {
			method: 'POST',
			headers: {'Content-Type': 'application/otf'},
			body: arrayBuffer,
		},
	);

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

					typedatas.forEach((typedata) => {
						this.fontMakers[typedata.name] = new FontPrecursor(typedata.json);
						this.glyphList[typedata.name] = typedata.json.glyphs;

						const initValues = {};

						typedata.json.controls.forEach((group) => {
							group.parameters.forEach((param) => {
								initValues[param.name] = param.init;
							});
						});

						this.initValues[typedata.name] = initValues;
					});

					resolve(this);
				},
			});
		});
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

	getFontFile(fontName, template, params, subset, merge) {
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
				}),
			);

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
						if (params.trigger) {
							 triggerDownload(arrayBuffer.buffer, 'hello');
						}

						if (merge) {
							const mergedFont = await mergeFont(
								MERGE_URL,
								{
									style: 'forbrowserdisplay',
									template: 'noidea',
									family: 'forbrowserdisplay',
								},
								'plumin',
								arrayBuffer.buffer,
								true,
							);

							resolve(mergedFont);
						}
						else {
							resolve(arrayBuffer.buffer);
						}
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
			}),
		);

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
							{
								style: 'forbrowserdisplay',
								template: 'noidea',
								family: 'forbrowserdisplay',
							},
							'plumin',
							arrayBuffer.buffer,
							true,
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

		window.glyph = glyphForCanvas.glyphs[0];
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
		module.hot.accept('john-fell.ptf',
			async () => {
				const fontJson = require('john-fell.ptf');

				await FontMediator.instance().reloadFont('john-fell.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('john-fell.ptf');
			},
		);
		module.hot.accept('venus.ptf',
			async () => {
				const fontJson = require('venus.ptf');

				await FontMediator.instance().reloadFont('venus.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('venus.ptf');
			},
		);
		module.hot.accept('elzevir.ptf',
			async () => {
				const fontJson = require('elzevir.ptf');

				await FontMediator.instance().reloadFont('elzevir.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('elzevir.ptf');
			},
		);
		module.hot.accept('gfnt.ptf',
			async () => {
				const fontJson = require('gfnt.ptf');

				await FontMediator.instance().reloadFont('gfnt.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('gfnt.ptf');
			},
		);
		module.hot.accept('antique.ptf',
			async () => {
				const fontJson = require('antique.ptf');

				await FontMediator.instance().reloadFont('antique.ptf', fontJson);
				FontMediator.instance().getAllGlyphForCanvas('antique.ptf');
			},
		);
		module.hot.accept('../precursor/FontPrecursor.js',
			async () => {
				const prototypoStore = window.prototypoStores['/prototypoStore'];
				const templates = await Promise.all(
					prototypoStore.get('templateList').map(async ({templateName}) => {
						const typedataJSON = await import(/* webpackChunkName: "ptfs" */`../../../../dist/templates/${templateName}/font.json`);

						return {
							name: templateName,
							json: typedataJSON,
						};
					}),
				);

				await FontMediator.init(templates);
				FontMediator.instance().getAllGlyphForCanvas('john-fell.ptf');
			},
		);
	}
}
/* eslint-enable global-require */
