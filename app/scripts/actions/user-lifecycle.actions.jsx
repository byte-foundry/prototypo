import {hashHistory} from 'react-router';

import {userStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import {loadStuff} from '../helpers/appSetup.helpers.js';
import {AccountValues} from '../services/values.services.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/sign-out': () => {
		const signinLocation = {
			pathname: '/signin',
		}

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
		}
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

		HoodieApi.signUp(username, password)
			.then(() => {
				const curedLastname = lastname ? ` ${lastname}` : '';

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
					'buyer_email': username,
				});
			})
			.then((data) => {
				console.log(data);
				const accountValues = {firstname, lastname: curedLastname};
				const patch = userStore.set('infos', {accountValues}).commit();

				localServer.dispatchUpdate('/userStore', patch);
				AccountValues.save({typeface: 'default', values: accountValues});

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
	}
};
