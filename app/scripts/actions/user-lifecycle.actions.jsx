import Lifespan from 'lifespan';

import hashHistory from '../services/history.services';
import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import getCurrency from '../helpers/currency.helpers.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localServer = LocalServer.instance;

	localClient = LocalClient.instance();
	localClient.lifespan = new Lifespan();
});

/**
 *	Spend credits via hoodie api
 *	@param {object} options - the options of the transaction
 *	@param {number} options.amout - amount of credits to be spent
 *	@returns {promise} promise containing response from hoodie credits spending or an error
 */
function spendCredits({amount}) {
	return new Promise(async (resolve, reject) => {
		if (parseInt(amount) > 0) {
			const {metadata: {credits}} = await HoodieApi.spendCredits({amount});

			const patch = prototypoStore.set('credits', credits).commit();

			localServer.dispatchUpdate('/prototypoStore', patch);

			return resolve({credits});
		}
		reject();
	});
}

export default {
	'/spend-credits': async (options) => {
		const {credits} = await spendCredits(options);

		localClient.dispatchAction('/store-value', {
			spendCreditsNewCreditAmount: credits,
		});
		window.Intercom('update', {
			export_credits: credits,
		});
	},
};
