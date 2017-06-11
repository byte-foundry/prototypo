import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {FontValues} from '../services/values.services.js';
import HoodieApi from '../services/hoodie.services.js';
import JSZip from 'jszip';

let localServer;
let localClient;
let exportingError;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

/**
*	Checks for export authorization for a given (plan,credits) couple
*	@param {string} the current user's plan
*	@param {number} the current user's credit amount
*	@return {boolean} wether the user is authorized to export or not
*/
function exportAuthorized(plan, credits) {
	const currentCreditCost = prototypoStore.get('currentCreditCost');
	const paidPlan = plan.indexOf('free_') === -1;
	const enoughCredits = credits && credits > 0 && currentCreditCost <= credits;

	if (!paidPlan && !enoughCredits) {
		localClient.dispatchAction('/store-value', {
			errorExport: {
				message: 'Not enough credits',
			},
		});
	}

	return paidPlan || enoughCredits;
}

/**
*	Dispatches an event that will spend credits (to be done on export success callback)
*/
function spendCreditsAction() {
	const plan = HoodieApi.instance.plan;

	if (plan.indexOf('free_') !== -1) {
		const currentCreditCost = prototypoStore.get('currentCreditCost');

		localClient.dispatchAction('/spend-credits', {amount: currentCreditCost});
	}
}

export default {
	'/exporting': ({exporting, errorExport}) => {
		const patch = prototypoStore.set('export', exporting).set('errorExport', errorExport).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/export-otf': ({merged, familyName = 'font', variantName = 'regular', exportAs}) => {
		const exporting = prototypoStore.get('export');

		if (exporting) {
			return;
		}

		const plan = HoodieApi.instance.plan;
		const credits = prototypoStore.get('credits');

		//forbid export without plan
		if (!exportAuthorized(plan, credits)) {
			return false;
		}

		localClient.dispatchAction('/exporting', {exporting: true});

		let family;
		let style;

		if (exportAs) {
			family = familyName;
			style = variantName;
		}
		else {
			family = prototypoStore.get('family').name ? prototypoStore.get('family').name.replace(/\s/g, '-') : familyName;
			style = prototypoStore.get('variant').name ? prototypoStore.get('variant').name.replace(/\s/g, '-') : variantName;
		}

		const name = {
			family,
			style: `${style.toLowerCase()}`,
		};

		exportingError = setTimeout(() => {
			localClient.dispatchAction('/exporting', {exporting: false, errorExport: true});
		}, 10000);

		localClient.dispatchAction('/store-value-font', {
			exportPlease: true,
			exportName: name,
			exportMerged: merged,
			exportValues: undefined,
			exportEmail: HoodieApi.instance.email,
		});
	},
	'/end-export-otf': () => {
			localClient.dispatchAction('/store-value-font', {exportPlease: false});
			localClient.dispatchAction('/store-value', {uiOnboardstep: 'end'});
			clearTimeout(exportingError);
			window.Intercom('trackEvent', 'export-otf');
			spendCreditsAction();
			localClient.dispatchAction('/exporting', {exporting: false});
	},
	'/set-up-export-otf': ({merged, exportAs = true}) => {
		const plan = HoodieApi.instance.plan;
		const credits = prototypoStore.get('credits');

		//forbid export without plan
		if (!exportAuthorized(plan, credits)) {
			return false;
		}

		const patch = prototypoStore.set('exportAs', exportAs).set('mergedExportAs', merged).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/export-glyphr': () => {
		const exporting = prototypoStore.get('export');

		if (exporting) {
			return;
		}

		const family = prototypoStore.get('family').name ? prototypoStore.get('family').name.replace(/\s/g, '-') : 'font';
		const style = prototypoStore.get('variant').name ? prototypoStore.get('variant').name.replace(/\s/g, '-') : 'regular';

		const plan = HoodieApi.instance.plan;
		const credits = prototypoStore.get('credits');

		//forbid export without plan
		if (!exportAuthorized(plan, credits)) {
			return false;
		}

		const name = {
			family,
			style: `${style.toLowerCase()}`,
		};

		localClient.dispatchAction('/store-value-font', {
			exportGlyphrTag: true,
			exportName: name,
			exportMerged: false,
			exportValues: undefined,
			exportEmail: HoodieApi.instance.email,
		});
	},
	'/end-export-glyphr': () => {
			spendCreditsAction();
	},
	// TODO add a spend credit action
	'/export-family-from-reader': ({result, familyToExport, template, oldDb}) => {
		const a = document.createElement('a');
		const _URL = window.URL || window.webkitURL;

		a.download = `${familyToExport.name}.zip`;
		a.href = result;
		a.dispatchEvent(new MouseEvent('click'));

		setTimeout(() => {
			a.href = '#';
			_URL.revokeObjectURL(result);
		}, 100);

		fontInstance.exportingZip = false;

		localClient.dispatchAction('/change-font', {
			templateToLoad: template,
			db: oldDb,
		});

		const cleanupPatch = prototypoStore
			.set('variantToExport', undefined)
			.set('exportedVariant', 0)
			.set('familyExported', undefined)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', cleanupPatch);
	},
	'/export-family-from-blob': ({familyToExport, oldDb, blobBuffers, template}) => {
		const zip = new JSZip();

		_.each(blobBuffers, ({buffer, variant}) => {
			const variantPatch = prototypoStore.set('exportedVariant',
				prototypoStore.get('exportedVariant') + 1).commit();

			localServer.dispatchUpdate('/prototypoStore', variantPatch);
			zip.file(`${variant}.otf`, buffer, {binary: true});
		});
		const reader = new FileReader();

		reader.onloadend = () => {
			localClient.dispatchAction('/export-family-from-reader', {
				result: reader.result,
				familyToExport,
				template,
				oldDb,
			});
		};

		reader.readAsDataURL(zip.generate({type: "blob"}));
	},
	'/export-family-from-values': ({familyToExport, valueArray, oldDb, template}) => {
		const blobs = [];

		_.each(valueArray, (value) => {
			const blob = fontInstance.getBlob(
				null, {
					family: familyToExport.name,
					style: value.currVariant.name,
				},
				false,
				value.fontValues.values
			);

			blobs.push(blob.then((blobContent) => {
				return blobContent;
			}));
		});

		Promise.all(blobs).then((blobBuffers) => {
			localClient.dispatchAction('/export-family-from-blob', {
				familyToExport,
				oldDb,
				blobBuffers,
				template,
			});
		});
	},
	'/export-family-after-load': ({familyToExport, variants, oldDb, template}) => {
		const values = [];

		for (let i = 0; i < variants.length; i++) {
			const currVariant = variants[i];

			values.push(FontValues.get({typeface: currVariant.db, variantId: currVariant.id})
				.then((fontValues) => {
					return {
						currVariant,
						fontValues,
					};
				})
			);
		}


		Promise.all(values).then((valueArray) => {
			localClient.dispatchAction('/export-family-from-values', {
				familyToExport,
				valueArray,
				oldDb,
				template,
			});
		});
	},
	'/export-family': async ({familyToExport, variants}) => {
		const exporting = prototypoStore.get('export');

		if (exporting) {
			return;
		}

		const oldVariant = prototypoStore.get('variant');
		const family = prototypoStore.get('family');

		const plan = HoodieApi.instance.plan;
		const credits = prototypoStore.get('credits');

		//forbid export without plan
		if (!exportAuthorized(plan, credits)) {
			return false;
		}

		const setupPatch = prototypoStore
			.set('familyExported', familyToExport.name)
			.set('variantToExport', variants.length)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', setupPatch);

		fontInstance.exportingZip = true;
		fontInstance._queue = [];

		localClient.dispatchAction('/change-font', {
			templateToLoad: familyToExport.template,
			db: 'default',
		});

		fontInstance.addOnceListener('worker.fontLoaded', () => {
			localClient.dispatchAction('/export-family-after-load', {
				variants,
				familyToExport,
				oldDb: oldVariant.db,
				template: family.template,
			});

		});
	},
};
