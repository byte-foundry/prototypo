import XXHash from 'xxhashjs';
import slug from 'slug';
import {prototypoStore, userStore, undoableStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';
import {graphql, gql} from 'react-apollo';

import apolloClient from '../services/graphcool.services';

let localServer;
let localClient;
let undoWatcher;

slug.defaults.mode = 'rfc3986';
slug.defaults.modes.rfc3986.remove = /[-_\/\\\.]/g;
window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
	undoWatcher = new BatchUpdate(
		undoableStore,
		'/undoableStore',
		'controlsValues',
		localClient,
		localServer.lifespan,
		name => `${name} modification`,
		(headJS) => {
			debouncedSave(headJS.controlsValues);
		},
	);
});

const hasher = XXHash(0xdeadbeef);

export default {
	'/fetch-preset': async (variantId) => {
		const {data: {Variant}} = await apolloClient.query({
			query: gql`
				query {
					Variant(id: "${variantId}") {
						id
						preset {
							baseValues
							id
							steps {
								id
								name
								description
								choices {
									name
									id
									values
								}
							}
						}
					}
				}
			`,
		});
		const patch = prototypoStore
		.set('preset', Variant.preset || {})
		.set('choice', Variant.preset.steps ? Variant.preset.steps[0].choices[0] : {})
		.set('step', Variant.preset.steps ? Variant.preset.steps[0] : {})
		.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/created-preset': async ({id, steps, baseValues}) => {
		const step = {
			id: steps[0].id,
			name: steps[0].name,
			description: steps[0].description,
		};

		const choice = {
			id: steps[0].choices[0].id,
			name: steps[0].choices[0].name,
		};

		const preset = {
			id,
			baseValues,
			steps,
		};

		const patch = prototypoStore
		.set('preset', preset)
		.set('choice', choice)
		.set('step', step)
		.set('createdStep', step)
		.set('openStepModal', false)
		.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/created-step': async (step) => {
		const newStep = {
			id: step.id,
			name: step.name,
			description: step.description,
		};

		const newChoice = {
			id: step.choices[0].id,
			name: step.choices[0].name,
		};


		const currentPreset = _.cloneDeep(prototypoStore.get('preset'));
		const fullStep = {...newStep, choices: [newChoice]};
		currentPreset.steps.push(fullStep);

		localClient.dispatchAction('/change-param', {values: currentPreset.baseValues});

		const patch = prototypoStore
		.set('choice', newChoice)
		.set('preset', currentPreset)
		.set('step', newStep)
		.set('createdStep', newStep)
		.set('openStepModal', false)
		.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/created-choice': async (choice) => {
		const newChoice = {
			id: choice.id,
			name: choice.name,
		};


		const currentPreset = _.cloneDeep(prototypoStore.get('preset'));
		const currentStep = _.cloneDeep(prototypoStore.get('step'));
		const presetStep = currentPreset.steps.find(i => i.id === currentStep.id);

		currentStep.choices.push(newChoice);
		presetStep.choices.push(newChoice);

		const patch = prototypoStore
		.set('preset', currentPreset)
		.set('step', currentStep)
		.set('choice', newChoice)
		.set('createdChoice', newChoice)
		.set('openChoiceModal', false)
		.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		localClient.dispatchAction('/change-param', {values: currentPreset.baseValues});

		saveAppValues();
	},
	'/edit-step': async (step) => {
		const newStep = {
			id: step.id,
			name: step.name,
			decription: step.description,
		};


		const currentPreset = _.cloneDeep(prototypoStore.get('preset'));
		const currentStep = _.cloneDeep(prototypoStore.get('step'));
		const presetStep = currentPreset.steps.find(i => i.id === currentStep.id);

		currentStep.name = newStep.name;
		currentStep.description = newStep.description;
		presetStep.name = newStep.name;
		presetStep.description = newStep.description;

		const patch = prototypoStore
		.set('preset', currentPreset)
		.set('step', currentStep)
		.set('createdStep', newStep)
		.set('openStepModal', false)
		.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/select-choice': ({choice, step}) => {
		const preset = prototypoStore.get('preset');
		const steps = preset.steps;
		// check if values key in choice
		// if values load values
		// if no values load prototypoLite > default values
		let newChoice = choice;

		if (!newChoice) {
			newChoice = step.choices[0] || undefined;
		}
		const newChoiceValues = newChoice.values || {}
		const baseValues = preset.baseValues || {};

		const patchChoice = prototypoStore.set('choice', newChoice).set('step', step).commit();
		if (choice) {
			console.log('New choice values : ');
			console.log(newChoice);
			console.log('====================================');
			console.log(newChoiceValues);
			console.log('====================================');

			// change choice : load choice values and if none : load base values
			if (Object.keys(newChoiceValues).length > 0) {
				localClient.dispatchAction('/change-param', {values: _.extend({}, baseValues, newChoiceValues)});
			}
			else {
				localClient.dispatchAction('/change-param', {values: baseValues});
			}
		}


		else {
			console.log('New step values : ');
			console.log(step);

			// change step : load first choice values if any and if none : load base values
			if (newChoiceValues && Object.keys(newChoiceValues).length > 0) {
				localClient.dispatchAction('/change-param', {values: _.extend({}, baseValues, newChoiceValues)});
			}
			else {
				localClient.dispatchAction('/change-param', {values: baseValues});
			}
		}
		localServer.dispatchUpdate('/prototypoStore', patchChoice);
		saveAppValues();
	},
	'/edit-choice': async (choice) => {
		const newChoice = {
			id: choice.id,
			name: choice.name,
		};


		const currentPreset = _.cloneDeep(prototypoStore.get('preset'));
		const currentStep = _.cloneDeep(prototypoStore.get('step'));
		const presetStep = currentPreset.steps.find(i => i.id === currentStep.id);
		const presetChoice = presetStep.choices.find(i => i.id === newChoice.id);

		currentStep.name = newChoice.name;
		presetChoice.name = newChoice.name;

		const patch = prototypoStore
		.set('preset', currentPreset)
		.set('choice', presetChoice)
		.set('createdChoice', presetChoice)
		.set('openChoiceModal', false)
		.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/save-choice-values': async () => {
		const currentPreset = prototypoStore.get('preset');
		let currentStep = prototypoStore.get('step');

		if (!currentStep.name) {
			currentStep = currentPreset.steps[0];
		}
		const step = currentPreset.steps.find(elem => elem.id === currentStep.id);
		let currentChoice = _.cloneDeep(prototypoStore.get('choice'));

		if (!currentChoice.name) {
			currentChoice = currentPreset.steps[0].choices[0];
		}

		const baseValues = currentPreset.baseValues;
		const currentValues = _.cloneDeep(undoableStore.get('controlsValues'));

		console.log('==========Current font values===========');
		console.log(currentValues);
		console.log('====================================');

		// Get differences between base and current values
		const allkeys = _.union(_.keys(baseValues), _.keys(currentValues));
		const difference = _.reduce(
			allkeys,
			(result, key) => {
				if (!_.isEqual(baseValues[key], currentValues[key])) {
					result[key] = {baseValues: baseValues[key], currentValues: currentValues[key]};
				}
				return result;
			},
			{},
		);

		// keep all current values
		const newValues = {};
		Object.keys(difference).map(key => newValues[key] = difference[key].currentValues);
		console.log('Saved changes : ');
		console.log(newValues);
		currentChoice.values = newValues;
		const stepChoice = step.choices.find(elem => elem.id === currentChoice.id);
		stepChoice.values = newValues;


		console.log('==========Values to save===========');
		console.log(newValues);
		console.log('====================================');
		try {
			const {data: {updateChoice}} = await apolloClient.mutate({
				mutation: gql`
					mutation updateChoice($id: ID!, $values: Json!) {
						updateChoice(id: $id, values: $values) {
							id
						}
					}
				`,
				variables: {
					id: currentChoice.id,
					values: JSON.parse(JSON.stringify(newValues)),
				},
			});

			console.log('==========Query result===========');
			console.log(updateChoice);
			console.log('====================================');

			const patch = prototypoStore
				.set('preset', currentPreset)
				.set('choice', currentChoice)
				.set('step', step)
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);

			saveAppValues();
		}
		catch (err) {
			console.log('============SAVING ERROR==========');
			console.log(err.message);
			console.log('====================================');
		}
	},
	'/update-base-font-values': async () => {
		const currentPreset = _.cloneDeep(prototypoStore.get('preset'));
		const currentValues = _.cloneDeep(undoableStore.get('controlsValues'));

		currentPreset.baseValues = currentValues;

		console.log('=========Values to update==========');
		console.log(currentValues);
		console.log('====================================');

		try {
			const {data: {updatePreset}} = await apolloClient.mutate({
				mutation: gql`
					mutation updatePreset($id: ID!, $values: Json!) {
						updatePreset(id: $id, baseValues: $values) {
							id
						}
					}
				`,
				variables: {
					id: currentPreset.id,
					values: JSON.parse(JSON.stringify(currentValues)),
				},
			});

			console.log('==========Query result===========');
			console.log(updatePreset);
			console.log('====================================');

			const patch = prototypoStore
				.set('preset', currentPreset)
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);

			saveAppValues();
		}
		catch (err) {
			console.log('============SAVING ERROR==========');
			console.log(err.message);
			console.log('====================================');
		}
	},
	'/deleted-current-step': async (deletedStep) => {
		const currentPreset = _.cloneDeep(prototypoStore.get('preset'));
		let currentStep = prototypoStore.get('step');

		// failsafe if deleting at app start
		if (!currentStep.name) {
			currentStep = currentPreset.steps[0];
		}

		const stepIndex = currentPreset.steps.findIndex(elem => elem.id === deletedStep.id);

		if (stepIndex === -1) {
			return;
		}

		currentPreset.steps.splice(stepIndex, 1);

		let newStep;
		let newChoice;


		if (stepIndex === 0) {
			newStep = {};
			newChoice = {};

			// Load base values
			localClient.dispatchAction('/change-param', {values: currentPreset.baseValues});
		}
		else {
			newStep = currentPreset.steps[stepIndex - 1];
			newChoice = currentPreset.steps[stepIndex - 1].choices[0];
			// Load choice values
			if (Object.keys(newChoice.values).length > 0) {
				localClient.dispatchAction('/change-param', {values: _.extend({}, currentPreset.baseValues, newChoice.values)});
			}
			else {
				localClient.dispatchAction('/change-param', {values: currentPreset.baseValues});
			}
		}

		const patch = prototypoStore
			.set('preset', currentPreset)
			.set('choice', newChoice)
			.set('step', newStep)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/deleted-current-choice': async (deletedChoice) => {
		const currentPreset = _.cloneDeep(prototypoStore.get('preset'));
		let currentStep = prototypoStore.get('step');

		// failsafe if deleting at app start
		if (!currentStep.name) {
			currentStep = currentPreset.steps[0];
		}
		const step = currentPreset.steps.find(elem => elem.id === currentStep.id);
		let currentChoice = prototypoStore.get('choice');

		// failsafe if deleting at app start
		if (!currentChoice.name) {
			currentChoice = currentPreset.steps[0].choices[0];
		}
		const choiceIndex = step.choices.findIndex(elem => elem.id === currentChoice.id);
		if (choiceIndex === -1) {
			return;
		}
		step.choices.splice(choiceIndex, 1);
		let newChoice;

		if (choiceIndex === 0) {
			newChoice = {};
			localClient.dispatchAction('/change-param', {values: currentPreset.baseValues});
		}
		else {
			newChoice = step.choices[choiceIndex - 1];
			if (Object.keys(newChoice.values).length > 0) {
				localClient.dispatchAction('/change-param', {values: _.extend({}, currentPreset.baseValues, newChoice.values)});
			}
			else {
				localClient.dispatchAction('/change-param', {values: currentPreset.baseValues});
			}
		}

		const patch = prototypoStore
			.set('preset', currentPreset)
			.set('choice', newChoice)
			.set('step', step)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues();
	},
};
