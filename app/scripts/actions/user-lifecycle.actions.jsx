import {hashHistory} from 'react-router';
import Lifespan from 'lifespan';

import {userStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import {loadStuff} from '../helpers/appSetup.helpers.js';
import {AccountValues} from '../services/values.services.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localServer = LocalServer.instance;

	localClient = LocalClient.instance();
	localClient.lifespan = new Lifespan();

	localClient.getStore('/userStore', localClient.lifespan)
		.onUpdate(({head}) => {
			saveAccountValues(head.toJS().infos);
		})
		.onDelete(() => {
			return;
		});
});

function saveAccountValues(values) {
	AccountValues.save({typeface: 'default', values});
}

export default {
	'/sign-out': () => {
		const signinLocation = {
			pathname: '/signin',
		};

		HoodieApi.logout()
			.then(() => {
				hashHistory.push(signinLocation);
			})
			.catch(() => {
				hashHistory.push(signinLocation);
			});
	},
	'/sign-in': ({username, password}) => {
		const dashboardLocation = {
			pathname: '/dashboard',
		};
		const form = userStore.get('signinForm');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('signinForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		if (!username || !password) {
			form.inError = {
				username: !username,
				password: !password,
			};
			form.errors.push('Fields with a * are required');
			form.loading = false;
			const patch = userStore.set('signinForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		HoodieApi.login(username, password)
			.then(async () => {
				await loadStuff();
				hashHistory.push(dashboardLocation);

				window.Intercom('boot', {
					app_id: 'mnph1bst',
					email: username,
					widget: {
						activator: '#intercom-button',
					},
				});

				form.errors = [];
				form.inError = {};
				form.loading = false;
				const endPatch = userStore.set('signinForm', form).commit();

				localServer.dispatchUpdate('/userStore', endPatch);
			})
			.catch((err) => {
				form.errors.push(
					/incorrect/i.test(err.message)
						? 'Incorrect email or password'
						: 'An unexpected error occured, please contact contact@prototypo.io and mention your current email'
				);
				form.loading = false;
				const patch = userStore.set('signinForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);
			});
	},
	'/sign-up': ({username, password, firstname, lastname, to}) => {
		const toLocation = {
			pathname: to || '/dashboard',
		};
		const form = userStore.get('signupForm');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('signupForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		//Check each input for error
		if (!username || !password || !firstname) {
			form.inError = {
				username: !username,
				password: !password,
				firstname: !firstname,
			};
			form.errors.push('Fields with a * are required');
			form.loading = false;
			const patch = userStore.set('signupForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}
		if (!/\S+?@\S+?\.\S+?/.test(username)) {
			form.inError = {
				username: true,
			};
			form.errors.push('Your email is invalid');
		}

		if (password.length < 8) {
			//password is not long enough
			form.inError = {
				password: true,
			};
			form.errors.push('Your password must be at least 8 character long');
		}

		if (form.errors.length > 0) {
			form.loading = false;
			const patch = userStore.set('signupForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		const curedLastname = lastname ? ` ${lastname}` : '';

		HoodieApi.signUp(username, password)
			.then(() => {

				window.Intercom('boot', {
					app_id: 'mnph1bst',
					email: username,
					name: firstname + curedLastname,
					widget: {
						activator: '#intercom-button',
					},
				});


				return HoodieApi.createCustomer({
					email: username,
					'buyer_email': firstname + curedLastname,
				});
			})
			.then((data) => {
				console.log(data);
				const accountValues = {username, firstname, lastname: curedLastname, buyerName: firstname + curedLastname};
				const patch = userStore.set('infos', {accountValues}).commit();

				localServer.dispatchUpdate('/userStore', patch);

				form.errors = [];
				form.inError = {};
				form.loading = false;
				const endPatch = userStore.set('signupForm', form).commit();

				hashHistory.push(toLocation);
				return localServer.dispatchUpdate('/userStore', endPatch);
			})
			.catch((err) => {
				form.errors.push(err.message);
				form.loading = false;
				const patch = userStore.set('signupForm', form).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			});
	},
	'/choose-plan': (plan) => {
		const form = userStore.get('choosePlanForm');

		form.error = undefined;
		form.selected = plan;
		const patch = userStore.set('choosePlanForm', form).commit();

		return localServer.dispatchUpdate('/userStore', patch);
	},
	'/confirm-plan': ({plan}) => {
		const form = userStore.get('choosePlanForm');

		form.error = undefined;
		form.loading = true;
		const cleanPatch = userStore.set('choosePlanForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		if (!plan) {
			form.error = 'You must select a plan';
			form.loading = false;
			const patch = userStore.set('choosePlanForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		const infos = userStore.get('infos');

		infos.plan = plan;
		form.loading = false;
		const patch = userStore.set('infos', infos).set('choosePlanForm', form).commit();

		localServer.dispatchUpdate('/userStore', patch);

		hashHistory.push({
			pathname: '/account/create/add-card',
		});
	},
	'/add-card': ({card: {fullname, number, expMonth, expYear, cvc}, vat}) => {
		const form = userStore.get('addcardForm');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('addcardForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		if (!fullname || !number || !expMonth || !expYear || !cvc) {
			form.errors.push('These fields are required');
			form.inError = {
				fullname: !fullname,
				number: !number,
				expMonth: !expMonth,
				expYear: !expYear,
				cvc: !cvc,
			};
			form.loading = false;
			const patch = userStore.set('addcardForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		window.Stripe.card.createToken({
			number,
			cvc,
			exp_month: expMonth,
			exp_year: expYear,
			name: fullname,
		}, (status, data) => {
			if (data.error) {
				form.errors.push(data.error.message);
				form.loading = false;
				const patch = userStore.set('addcardForm', form).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			}

			HoodieApi.updateCustomer({
				source: data.id,
				buyer_credit_card_prefix: number.substr(0, 9),
			})
			.then(() => {
				const infos = userStore.get('infos');

				infos.card = data.card;
				infos.vat = vat;
				form.loading = false;
				const patch = userStore.set('infos', infos).set('addcardForm', form).commit();

				localServer.dispatchUpdate('/userSotre', patch);

				hashHistory.push({
					pathname: '/account/create/billing-address',
				});
			})
			.catch((err) => {
				form.errors.push(err.message);
				form.loading = false;
				const patch = userStore.set('addcardForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);
			});
		});
	},
	'/add-billing-address': ({buyerName, address}) => {
		const form = userStore.get('billingForm');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('billingForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		if (!buyerName || !address.building_number || !address.street_name || !address.city || !address.postal_code || !address.country) {
			form.errors.push('These fields are required');
			form.inError = {
				buyerName: !buyerName,
				buildingNumber: !address.building_number,
				streetName: !address.street_name,
				city: !address.city,
				postalCode: !address.postal_code,
				country: !address.country,
			};
			form.loading = false;
			const patch = userStore.set('billingForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		HoodieApi.updateCustomer({
			invoice_address: address,
			buyer_name: buyerName,
		})
		.then(() => {
			const infos = userStore.get('infos');

			infos.address = address;
			infos.buyerName = buyerName;
			form.loading = false;
			const patch = userStore.set('infos', infos).set('billingForm', form).commit();

			localServer.dispatchUpdate('/userStore', patch);

			hashHistory.push({
				pathname: '/account/create/confirmation',
			});
		});
	},
};
