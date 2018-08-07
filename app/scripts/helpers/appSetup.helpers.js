import {gql} from 'react-apollo';
import {AppValues} from '../services/values.services.js';
import LocalClient from '../stores/local-client.stores.jsx';
import apolloClient from '../services/graphcool.services';

let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
});

const defaultValues = {
	values: {
		mode: ['glyph', 'word', 'text'],
		selected: 'A'.charCodeAt(0).toString(),
		onboard: false,
		onboardstep: 'welcome',
		word: 'Hamburgefonstiv',
		wordFontSize: 7.6,
		text:
			'Type any text here and preview your modifications in real time! Curabitur blandit tempus porttitor. Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis. Etiam porta sem malesuada magna mollis euismod. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla vitae elit libero, a pharetra augue. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Cras mattis consectetur purus sit amet fermentum. Cras mattis consectetur purus sit amet fermentum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec sed odio dui.',
		textFontSize: 1.6,
		pos: ['Point', 457, -364],
		familySelected: null,
		variantSelected: null,
		library: [],
		savedSearch: [],
		firstTimeFile: true,
		firstTimeCollection: true,
		firstTimeIndivCreate: true,
		firstTimeIndivEdit: true,
		firstTimeAcademyModal: true,
		rulerDisplayed: true,
		guides: [],
	},
};

export async function loadStuff() {
	if (!localStorage.getItem('graphcoolToken')) {
		return;
	}

	let appValues;

	try {
		// get all the fonts the user has and put them in the store
		// temporary
		const response = await apolloClient.query({
			fetchPolicy: 'network-only',
			query: gql`
				query getFonts {
					user {
						id
						library {
							id
							name
							template
							variants {
								id
								name
							}
						}
					}
				}
			`,
		});

		const allPresetsQuery = await apolloClient.query({
			fetchPolicy: 'network-only',
			query: gql`
				query {
					allPresets(filter: {published: true}) {
						id
						ownerInitials
						variant {
							name
							family {
								name
							}
						}
						template
						baseValues
					}
				}
			`,
		});

		const families = response.data.user.library;
		const allPresets = allPresetsQuery.data.allPresets;

		appValues = await AppValues.get({typeface: 'default'});

		appValues = {
			...appValues,
			values: {...defaultValues.values, ...appValues.values},
		};

		let {variantSelected, familySelected} = appValues.values;

		if (!familySelected || familySelected.id === undefined) {
			familySelected = families[0];
		}

		if (familySelected) {
			appValues.values.familySelected = {
				id: familySelected.id,
				name: familySelected.name,
				template: familySelected.template,
			};

			if (!variantSelected || variantSelected.id === undefined) {
				variantSelected = familySelected.variants[0];
			}

			appValues.values.variantSelected = {
				id: variantSelected.id,
				name: variantSelected.name,
			};
		}
	}
	catch (err) {
		appValues = defaultValues;
		console.error(err);
	}

	localClient.dispatchAction('/load-app-values', appValues);

	localClient.dispatchAction('/load-font-instance', {appValues});
}
