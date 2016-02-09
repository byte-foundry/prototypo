import {exportStore, fontVariant} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {FontValues} from '../services/values.services.js';
import JSZip from 'jszip';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

export default {
	'/exporting': ({exporting, errorExport}) => {
		const patch = exportStore.set('export', exporting).set('errorExport', errorExport).commit();

		localServer.dispatchUpdate('/exportStore', patch);
	},
	'/export-otf': ({merged}) => {
		localClient.dispatchAction('/exporting', {exporting: true});

		const family = fontVariant.get('family').name ? fontVariant.get('family').name.replace(/\s/g, '-') : 'font';
		const style = fontVariant.get('variant').name ? fontVariant.get('variant').name.replace(/\s/g, '-') : 'regular';

		const name = {
			family: `Prototypo-${family}`,
			style: `${style.toLowerCase()}`,
		};

		const exportingError = setTimeout(() => {
			localClient.dispatchAction('/exporting', {exporting: false, errorExport: true});
		}, 10000);

		fontInstance.download(() => {
			localClient.dispatchAction('/store-panel-param', {onboardstep: 'end'});
			localClient.dispatchAction('/exporting', {exporting: false});
			window.Intercom('trackEvent', 'export-otf');
			clearTimeout(exportingError);
		}, name, merged);
	},
	'/export-family': async ({familyToExport, variants}) => {
		const variant = fontVariant.get('variant');
		const family = fontVariant.get('family');
		const zip = new JSZip();
		const a = document.createElement('a');

		const setupPatch = exportStore
			.set('familyExported', familyToExport.name)
			.set('variantToExport', variants.length)
			.commit();

		localServer.dispatchUpdate('/exportStore', setupPatch);

		fontInstance.exportingZip = true;
		fontInstance._queue = [];

		localClient.dispatchAction('/change-font', {
			templateToLoad: familyToExport.template,
			db: 'default',
		});

		const values = [];

		for (let i = 0; i < variants.length; i++) {
			const currVariant = variants[i];

			values.push(FontValues.get({typeface: currVariant.db}));
		}

		const blobs = [];

		Promise.all(values).then((valueArray) => {
			_.each(valueArray, (value) => {
				const blob = fontInstance.getBlob(
					null, {
						family: familyToExport.name,
						style: currVariant.name,
					},
					false,
					value.values
				);

				blobs.push(blob);
			});
		});

		Promise.all(blobs).then((blobBuffers) => {
			_.each(blobBuffers, ({buffer, variantName}) => {
				const variantPatch = exportStore.set('exportedVariant',
					exportStore.get('exportedVariant') + 1).commit();

				localServer.dispatchUpdate('/exportStore', variantPatch);
				zip.file(`${variantName}.otf`, buffer, {binary: true});

				const reader = new FileReader();
				const _URL = window.URL || window.webkitURL;

				reader.onloadend = () => {
					a.download = `${familyToExport.name}.zip`;
					a.href = reader.result;
					a.dispatchEvent(new MouseEvent('click'));

					setTimeout(() => {
						a.href = '#';
						_URL.revokeObjectURL(reader.result);
					}, 100);

					fontInstance.exportingZip = false;

					localClient.dispatchAction('/change-font', {
						templateToLoad: family.template,
						db: variant.db,
					});

					const cleanupPatch = exportStore
						.set('variantToExport', undefined)
						.set('exportedVariant', 0)
						.set('familyExported', undefined)
						.commit();

					localServer.dispatchUpdate('/exportStore', cleanupPatch);
				};

				reader.readAsDataURL(zip.generate({type: "blob"}));
			});
		});

	},
};
