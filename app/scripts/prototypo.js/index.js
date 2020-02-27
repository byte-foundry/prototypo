import 'core-js/stable';
import 'regenerator-runtime/runtime';
import _uniq from 'lodash/uniq';
import _cloneDeep from 'lodash/cloneDeep';

import FontMediator from './mediator/FontMediator';
import isProduction from '../helpers/is-production.helpers';

export const templateNames = {
	ELZEVIR: 'elzevir.ptf?new',
	GROTESK: 'venus.ptf?new',
	FELL: 'john-fell.ptf?new',
	SPECTRAL: 'gfnt.ptf?new',
	ANTIQUE: 'antique.ptf?new',
};

const awsUrl = isProduction()
	? 'https://67phw2at83.execute-api.eu-west-3.amazonaws.com/prod/fonts/'
	: 'https://mnhdjpr7jc.execute-api.eu-west-3.amazonaws.com/dev/fonts/';

const validTemplates = [
	...Object.values(templateNames),
	'T.ptf?website',
	'TP.ptf?website',
	'EM.ptf?website',
	'AAndText.ptf?website',
	'E.ptf?website',
];

export default class Ptypo {
	constructor(token) {
		this.token = token;
		this.precursor = {};
	}

	async init(
		templates = Object.values(templateNames),
		workerPoolSize,
		url = awsUrl,
		noCanvas = true,
	) {
		const typedataPromises = templates.map(
			fontTemplate =>
				new Promise(async (resolve, reject) => {
					if (validTemplates.indexOf(fontTemplate) === -1) {
						throw new Error(
							'template not found, please use a correct template Name',
						);
					}

					const data = await fetch(url + fontTemplate, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${this.token}`,
						},
					});

					if (!data.ok && data.status === 403) {
						throw new Error(
							"The domain from where you're using the Prototypo library is not authorized. You can manage authorized domains in the developers page on your account. See https://app.prototypo.io/#/account/prototypo-library",
						);
					}
					else if (!data.ok) {
						reject('Failed to retrieve templates');
					}

					const json = await data.json();

					this.precursor[fontTemplate] = json;

					resolve({
						name: fontTemplate,
						json,
					});
				}),
		);

		let typedatas;

		try {
			typedatas = await Promise.all(typedataPromises);
		}
		catch (e) {
			throw new Error('Failed to retrieve template');
		}

		if (!this.token /* || TODO: check if AWS returned a free font */) {
			console.warn(
				"You're using the free version of the Prototypo library. Get a pro account now and access the entire glyphset. https://app.prototypo.io/#/account/subscribe",
			); // eslint-disable-line no-console
		}

		await FontMediator.init(typedatas, workerPoolSize, noCanvas);

		this.mediator = FontMediator.instance();

		this.mediator.setupInfo({
			email: `${navigator.languages.length}-${navigator.userAgent.replace(
				/\D+/g,
				'',
			)}-${navigator.plugins.length}-${navigator.hardwareConcurrency}-${
				navigator.deviceMemory
			}`,
		});
	}

	async createFont(fontName, fontTemplate, alwaysMerge) {
		if (!this.mediator) {
			await this.init();
			this.mediator = FontMediator.instance();
			console.warn(
				'you should initialize your font factory before creating a font',
			);
		}

		if (validTemplates.indexOf(fontTemplate) === -1) {
			throw new Error('template not found, please use a correct template Name');
		}

		return Promise.resolve(
			new PtypoFont(
				this.mediator,
				fontTemplate,
				this.precursor[fontTemplate],
				fontName,
				alwaysMerge,
			),
		);
	}
}

export class PtypoFont {
	constructor(mediator, fontTemplate, json, fontName, alwaysMerge) {
		this.mediator = mediator;
		this.json = json;
		this.values = {};
		this.tweens = {};
		this.shouldDownload = false;
		this.init = {};
		this.fontName = fontName;
		this.fontTemplate = fontTemplate;
		this.alwaysMerge = alwaysMerge;

		json.controls.forEach((control) => {
			control.parameters.forEach((param) => {
				this.init[param.name] = param.init;
				this.values[param.name] = param.init;
			});
		});

		this.glyphsSet = _uniq(
			Object.keys(json.glyphs)
				.map(key => json.glyphs[key].unicode)
				.filter(unicode => unicode !== undefined),
		);
	}

	changeParams(paramObj, subset) {
		Object.keys(paramObj).forEach((key) => {
			this.values[key] = paramObj[key];
		});

		return this.createFont(subset);
	}

	async createFontWithNoWorker(subset) {
		const unicodeSubset = subset
			? _uniq(subset.split('').map(char => char.charCodeAt(0)))
			: undefined;

		const {fontBuffer} = await this.mediator.getFontObjectNoWorker(
			this.fontName,
			'Regular',
			this.fontTemplate,
			this.values,
			unicodeSubset || this.glyphsSet,
		);

		return this.mediator.mergeFontWithoutTimeout(fontBuffer, this.fontName);
	}

	async createFont(subset) {
		const unicodeSubset = subset
			? _uniq(subset.split('').map(char => char.charCodeAt(0)))
			: undefined;
		const {fontBuffer} = await this.mediator.getFontObject(
			this.fontName,
			'Regular',
			this.fontTemplate,
			this.values,
			unicodeSubset || this.glyphsSet,
		);

		if (this.alwaysMerge) {
			this.mediator
				.mergeFontWithoutTimeout(fontBuffer, this.fontName)
				.then((mergedBuffer) => {
					this.mediator.addToFont(mergedBuffer, this.fontName);
				});
		}
		else {
			this.mediator.addToFont(fontBuffer, this.fontName);
			this.mediator
				.mergeFontWithoutTimeout(fontBuffer, this.fontName)
				.then((mergedBuffer) => {
					this.mediator.addToFont(mergedBuffer, this.fontName);
				});
		}

		const {xHeight, capDelta, ascender, descender} = this.values;

		this.globalHeight = xHeight + Math.max(capDelta, ascender) - descender;
	}

	changeParam(paramName, paramValue, subset, isTween = false) {
		if (!isTween) {
			if (this.tweens[paramName]) {
				clearInterval(this.tweens[paramName].intervalId);
				delete this.tweens[paramName];
			}
		}
		this.values[paramName] = paramValue;
		this.createFont(subset);
	}

	tween(paramName, paramValue, steps, aDuration, cb, subset) {
		if (
			paramName === 'glyphSpecialProps'
			|| paramName === 'manualChanges'
			|| paramName === 'postDepManualChanges'
		) {
			this.changeParam(paramName, paramValue, subset);
			return;
		}
		const duration = aDuration * 1000;
		const start = this.values[paramName];
		let elapsed = 0;

		if (!this.values[paramName]) {
			return;
		}
		if (this.tweens[paramName]) {
			clearInterval(this.tweens[paramName].intervalId);
			delete this.tweens[paramName];
		}
		this.tweens[paramName] = {
			target: paramValue,
		};

		const id = setInterval(() => {
			if (elapsed >= duration) {
				clearInterval(id);
				if (cb) {
					cb(paramName);
				}
				return;
			}
			const newValue
				= (start * (duration - elapsed) + paramValue * elapsed) / duration;

			this.changeParam(paramName, newValue, subset);
			elapsed += duration / steps;
		}, duration / steps);

		this.tweens[paramName].intervalId = id;
	}

	async getArrayBuffer({merge, familyName, styleName} = {merge: true}) {
		const {fontBuffer} = await this.mediator.getFontObject(
			familyName || this.fontName,
			styleName || 'Regular',
			this.fontTemplate,
			this.values,
			this.glyphsSet,
		);

		if (merge) {
			const mergedBuffer = await this.mediator.mergeFont(fontBuffer);

			return mergedBuffer;
		}

		return fontBuffer;
	}

	reset() {
		this.values = _cloneDeep(this.init);
		return this.createFont();
	}
}
