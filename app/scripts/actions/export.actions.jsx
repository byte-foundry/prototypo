import {gql} from 'react-apollo';
import JSZip from 'jszip';

import {prototypoStore} from '../stores/creation.stores';
import LocalServer from '../stores/local-server.stores';
import LocalClient from '../stores/local-client.stores';
import HoodieApi from '../services/hoodie.services';
import apolloClient from '../services/graphcool.services';

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
	'/export-family': async () => {
		const exporting = prototypoStore.get('export');

		if (exporting) {
			return;
		}

		const plan = HoodieApi.instance.plan;
		const credits = prototypoStore.get('credits');

		// forbid export without plan
		if (!exportAuthorized(plan, credits)) {
			return;
		}

		const selectedVariant = prototypoStore.get('variant');
		const selectedFamily = prototypoStore.get('family');
		const {data: {family}} = await apolloClient.query({
			query: gql`
				query getFamilyValues($id: ID!) {
					family: Family(id: $id) {
						name
						variants {
							id
							name
							values
						}
					}
				}
			`,
			variables: {id: selectedFamily.id},
		});

		if (!family) {
			localClient.dispatchAction('/exporting', {exporting: false, errorExport: true});
			return;
		}

		const blobs = family.variants.map((variant) => {
			const blob = {}; // TODO: build each font from variant.values

			return blob.then(blobContent => blobContent);
		});

		Promise.all(blobs).then((blobBuffers) => {
			const zip = new JSZip();

			blobBuffers.forEach(({buffer, variant}) => {
				const variantPatch = prototypoStore.set('exportedVariant',
					prototypoStore.get('exportedVariant') + 1).commit();

				localServer.dispatchUpdate('/prototypoStore', variantPatch);
				zip.file(`${variant}.otf`, buffer, {binary: true});
			});
			const reader = new FileReader();

			reader.onloadend = () => {
				const a = document.createElement('a');

				a.download = `${family.name}.zip`;
				a.href = reader.result;
				a.click();
			};

			reader.readAsDataURL(zip.generate({type: "blob"}));
		});
	},
};
