import 'babel-polyfill';
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
	? 'https://e4jpj60rk8.execute-api.eu-west-1.amazonaws.com/prod/fonts/'
	: 'https://tc1b6vq6o8.execute-api.eu-west-1.amazonaws.com/dev/fonts/';

const validTemplates = Object.values(templateNames);

export default class Ptypo {
	constructor(token) {
		this.token = token;
		this.precursor = {};
	}

	async init(templates = Object.values(templateNames)) {
		const typedataPromises = templates.map(fontTemplate => new Promise(async (resolve) => {
			if (validTemplates.indexOf(fontTemplate) === -1) {
				throw new Error('template not found, please use a correct template Name');
			}

			const data = await fetch(awsUrl + fontTemplate, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
			});

			if (!data.ok && data.statusCode === 403) {
				throw new Error("The domain from where you're using the Prototypo library is not authorized. You can manage authorized domains in the developers page on your account. See https://app.prototypo.io/#/account/prototypo-library");
			}

			const json = await data.json();

			this.precursor[fontTemplate] = json;

			resolve({
				name: fontTemplate,
				json,
			});
		}));

		const typedatas = await Promise.all(typedataPromises);

		if (!this.token /* || TODO: check if AWS returned a free font */) {
			console.warn("You're using the free version of the Prototypo library. Get a pro account now and access the entire glyphset. https://app.prototypo.io/#/account/subscribe"); // eslint-disable-line no-console
		}

		await FontMediator.init(typedatas);

		this.mediator = FontMediator.instance();
	}

	async createFont(fontName, fontTemplate) {
		if (!this.mediator) {
			await this.init();
			this.mediator = FontMediator.instance();
			console.warn('you should initialize your font factory before creating a font');
		}

		if (validTemplates.indexOf(fontTemplate) === -1) {
			throw new Error('template not found, please use a correct template Name');
		}

		return Promise.resolve(new PtypoFont(this.mediator, fontTemplate, this.precursor[fontTemplate], fontName));
	}
}

export class PtypoFont {
	constructor(mediator, fontTemplate, json, fontName, noUnmerged) {
		this.mediator = mediator;
		this.json = json;
		this.values = {};
		this.shouldDownload = false;
		this.init = {};
		this.fontName = fontName;
		this.fontTemplate = fontTemplate;
		this.noUnmerged = noUnmerged;

		json.controls.forEach((control) => {
			control.parameters.forEach((param) => {
				this.init[param.name] = param.init;
				this.values[param.name] = param.init;
			});
		});

		this.glyphsSet
			= _uniq(Object.keys(json.glyphs)
				.map(key => json.glyphs[key].unicode)
				.filter(unicode => unicode !== undefined));
	}

	changeParams(paramObj) {
		Object.keys(paramObj).forEach((key) => {
			this.values[key] = paramObj[key];
		});

		return this.createFont();
	}

	async createFont(subset) {
		const buffer = await this.mediator.getFontObject(
			this.fontName,
			this.fontTemplate,
			this.values,
			subset || this.glyphsSet,
		);

		if (this.noUnmerged) {
			this.mediator.mergeFontWithTimeout(buffer, this.fontName);
		}
		else {
			this.mediator.addToFont(buffer, this.fontName);
			this.mediator.mergeFontWithTimeout(buffer, this.fontName);
		}

		const {
			xHeight, capDelta, ascender, descender,
		} = this.values;

		this.globalHeight = xHeight + Math.max(capDelta, ascender) - descender;
	}

	changeParam(paramName, paramValue) {
		this.values[paramName] = paramValue;
		this.createFont();
	}

	async getArrayBuffer() {
		const font = await this.mediator.getFontObject(
			this.fontName,
			this.fontTemplate,
			this.values,
			this.glyphsSet,
		);

		return this.mediator.getArrayBuffer(font);
	}

	reset() {
		this.values = _cloneDeep(this.init);
		return this.createFont();
	}
}
