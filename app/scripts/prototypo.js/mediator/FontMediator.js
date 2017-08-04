/* global _ */
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


					this.fontMakers = {};

					typedatas.forEach((typedata) => {
						this.fontMakers[typedata.name] = new FontPrecursor(typedata.json);

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

	getFont(fontName, template, params, subset, glyphCanvasUnicode) {
		if (!this.workerPool) {
			return;
		}

		const jobs = [];
		const fontPromise = _.chunk(
			subset,
			Math.ceil(subset.length / this.workerPool.workerArray.length),
		).map((subsubset) => {
			return new Promise((resolve) => {
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
			});
		});

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
}
