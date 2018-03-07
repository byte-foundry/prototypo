import {gql} from 'react-apollo';

import _cloneDeep from 'lodash/cloneDeep';
import _union from 'lodash/union';
import _isEqual from 'lodash/isEqual';

import {prototypoStore, undoableStore} from '../stores/creation.stores';
import LocalServer from '../stores/local-server.stores';
import LocalClient from '../stores/local-client.stores';
import {saveAppValues} from '../helpers/loadValues.helpers';

import apolloClient from '../services/graphcool.services';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

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

		if (Variant.preset) {
			const patch = prototypoStore
				.set('preset', Variant.preset)
				.set('choice', Variant.preset.steps[0].choices[0])
				.set('step', Variant.preset.steps[0])
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
		}
		else {
			const patch = prototypoStore
				.set('preset', {})
				.set('choice', {})
				.set('step', {})
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
		}
		saveAppValues();
	},
	'/created-preset': async ({id, steps}) => {
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
			baseValues: _cloneDeep(undoableStore.get('controlsValues')),
			steps,
		};

		console.log('====================================');
		console.log('Created preset');
		console.log(preset);
		console.log('====================================');

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

		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		const fullStep = {...newStep, choices: [newChoice]};

		currentPreset.steps.push(fullStep);

		console.log('====================================');
		console.log('New step:');
		console.log(newStep);
		console.log('New choice');
		console.log(newChoice);
		console.log('Preset base values');
		console.log(currentPreset.baseValues);
		console.log('====================================');

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


		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		const currentStep = _cloneDeep(prototypoStore.get('step'));
		const presetStep = currentPreset.steps.find(i => i.id === currentStep.id);

		console.log('====================================');
		console.log('New choice');
		console.log(newChoice);
		console.log('Preset base values');
		console.log(currentPreset.baseValues);
		console.log('====================================');

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
	'/show-base-values': async () => {
		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		const patch = prototypoStore.set('choice', undefined).set('step', undefined).commit();
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


		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		const currentStep = _cloneDeep(prototypoStore.get('step'));
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
		// check if values key in choice
		// if values load values
		// if no values load prototypoLite > default values
		let newChoice = choice;

		if (!newChoice) {
			newChoice = step.choices[0] || undefined;
		}
		const newChoiceValues = newChoice.values || {};
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
				localClient.dispatchAction('/change-param', {values: {...baseValues, ...newChoiceValues}});
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
				localClient.dispatchAction('/change-param', {values: {...baseValues, ...newChoiceValues}});
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


		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		const currentStep = _cloneDeep(prototypoStore.get('step'));
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
		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		let currentStep = prototypoStore.get('step');

		if (!currentStep.name) {
			[currentStep] = currentPreset.steps;
		}
		const step = currentPreset.steps.find(elem => elem.id === currentStep.id);
		let currentChoice = _cloneDeep(prototypoStore.get('choice'));

		if (!currentChoice.name) {
			[currentChoice] = currentPreset.steps[0].choices;
		}

		const choice = step.choices.find(elem => elem.id === currentChoice.id);

		const {baseValues} = currentPreset;
		const currentValues = _cloneDeep(undoableStore.get('controlsValues'));

		console.log('==========Current font values===========');
		console.log(currentValues);
		console.log('====================================');

		// Get differences between base and current values
		const allkeys = _union(Object.keys(baseValues), Object.keys(currentValues));
		const difference = allkeys.reduce(
			(result, key) => {
				if (!_isEqual(baseValues[key], currentValues[key])) {
					result[key] = {baseValues: baseValues[key], currentValues: currentValues[key]};
				}
				return result;
			},
			{},
		);

		// keep all current values
		const newValues = {};

		Object.keys(difference).forEach((key) => {
			newValues[key] = difference[key].currentValues;
		});
		console.log('Saved changes : ');
		console.log(newValues);
		choice.values = newValues;

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
					id: choice.id,
					values: JSON.parse(JSON.stringify(newValues)),
				},
			});

			console.log('==========Query result===========');
			console.log(updateChoice);
			console.log('====================================');

			const patch = prototypoStore
				.set('preset', currentPreset)
				.set('choice', choice)
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
		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		const currentValues = _cloneDeep(undoableStore.get('controlsValues'));

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
		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		let currentStep = prototypoStore.get('step');

		// failsafe if deleting at app start
		if (!currentStep.name) {
			[currentStep] = currentPreset.steps;
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
			[newChoice] = currentPreset.steps[stepIndex - 1].choices;
			// Load choice values
			if (Object.keys(newChoice.values).length > 0) {
				localClient.dispatchAction('/change-param', {values: {...currentPreset.baseValues, ...newChoice.values}});
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
	'/deleted-current-choice': async () => {
		const currentPreset = _cloneDeep(prototypoStore.get('preset'));
		let currentStep = prototypoStore.get('step');

		// failsafe if deleting at app start
		if (!currentStep.name) {
			[currentStep] = currentPreset.steps;
		}
		const step = currentPreset.steps.find(elem => elem.id === currentStep.id);
		let currentChoice = prototypoStore.get('choice');

		// failsafe if deleting at app start
		if (!currentChoice.name) {
			[currentChoice] = currentPreset.steps[0].choices;
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
				localClient.dispatchAction('/change-param', {values: {...currentPreset.baseValues, ...newChoice.values}});
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
