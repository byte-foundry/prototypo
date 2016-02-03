import HoodieApi from '../services/hoodie.services.js';

export default {
	'/login': async () => {
		await loadStuff();
		location.href = '#/dashboard';
	},
	'/logout': async () => {
		try {
			await HoodieApi.logout();
			location.href = '#/signin';
		}
		catch (error) {
			console.warn(`You probably don't have internet`);
			console.log(error);
			location.href = '#/signin';
		}
	},
};
