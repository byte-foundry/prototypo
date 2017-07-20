import XXHash from 'xxhashjs';
import slug from 'slug';
import {prototypoStore, userStore, undoableStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

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
	'/create-step': async ({name, description, choice}) => {
		// check if everything correct with the form
		if (name === undefined || name === '' || String(name).trim() === '') {
			const patch = prototypoStore
				.set('errorAddStep', 'You must choose a name for your step')
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			return;
		}
		// done checking if everything is correct with the form

		// create new step
		const newStep = {
			name,
			description,
			choices: [
				{
					id: hasher.update(`${choice}${new Date().getTime()}`).digest().toString(16),
					name: choice,
					db: slug(`${name}${choice}`, ''),
					values: {},
				},
			],
		};
		// done creating new step

		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = _.find(fonts, item => item.name === currentFamily.name);
		const patchedVariant = _.find(family.variants || [], item => currentVariant.id === item.id);

		// check if there is a ptypoLite object stored in the variant
		if (!patchedVariant.ptypoLite) {
			// if there is no such object, create it and populate it
			const baseValues = _.cloneDeep(undoableStore.get('controlsValues'));
			const ptypoLite = {
				baseValues,
				steps: [newStep],
			};

			patchedVariant.ptypoLite = ptypoLite;
		}
		else {
			// end if no ptypolite object
			// else patch the variant with new step
			const already = _.find(patchedVariant.ptypoLite.steps, step => step.name === name);

			if (already) {
				const patch = prototypoStore
					.set('errorAddStep', 'A Step with this name already exists')
					.commit();

				localServer.dispatchUpdate('/prototypoStore', patch);
				return;
			}
			patchedVariant.ptypoLite.steps.push(newStep);
		}

		const patch = prototypoStore
			.set('errorAddStep', undefined)
			.set('fonts', fonts)
			.set('variant', patchedVariant)
			.set('choice', newStep.choices[0])
			.set('step', {name: newStep.name})
			.set('createdStep', newStep)
			.set('openStepModal', false)
			.commit();

		// Load base values
		localClient.dispatchAction('/change-param', {
			values: patchedVariant.ptypoLite.baseValues,
			force: true,
			label: 'lite',
		});

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/edit-step': async ({baseName, name, description}) => {
		// check if everything correct with the form
		if (name === undefined || name === '' || String(name).trim() === '') {
			const patch = prototypoStore
				.set('errorAddStep', 'You must choose a name for your step')
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			return;
		}
		// done checking if everything is correct with the form

		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = _.find(fonts, item => item.name === currentFamily.name);
		const patchedVariant = _.find(family.variants || [], item => currentVariant.id === item.id);
		const already = _.find(patchedVariant.ptypoLite.steps, step => step.name === name);

		if (already) {
			const patch = prototypoStore
				.set('errorAddStep', 'A Step with this name already exists')
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			return;
		}

		const updatedStep = patchedVariant.ptypoLite.steps.find(step => step.name === baseName);
		let choice;

		if (prototypoStore.get('choice').name) {
			choice = prototypoStore.get('choice');
		}
		else {
			choice = updatedStep.choices[0] || {};
		}

		updatedStep.name = name;
		updatedStep.description = description;

		const patch = prototypoStore
			.set('errorAddStep', undefined)
			.set('fonts', fonts)
			.set('variant', patchedVariant)
			.set('choice', choice)
			.set('step', updatedStep)
			.set('createdStep', updatedStep)
			.set('openStepModal', false)
			.set('stepModalEdit', false)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/select-choice': ({choice, step}) => {
		const fonts = prototypoStore.get('fonts');
		const currentFamily = prototypoStore.get('family');
		const currentVariant = prototypoStore.get('variant');
		const family = fonts.find(item => item.name === currentFamily.name);
		const variant = (family.variants || []).find(item => currentVariant.id === item.id);
		const steps = variant.ptypoLite.steps;
		// check if values key in choice
		// if values load values
		// if no values load prototypoLite > default values
		let newChoice = choice;
		const newStep = Array.from(steps).find(s => s.name === step.name);

		if (!newChoice) {
			newChoice = newStep.choices[0] || undefined;
		}

		const patchChoice = prototypoStore.set('choice', newChoice).set('step', newStep).commit();
		if (choice) {
			console.log('New choice values : ');
			console.log(newChoice);

			// change choice : load choice values and if none : load base values
			if (Object.keys(newChoice.values).length > 0) {
				localClient.dispatchAction('/change-param', {
					values: _.extend({}, variant.ptypoLite.baseValues, newChoice.values),
					force: true,
					label: 'lite',
				});
			}
			else {
				localClient.dispatchAction('/change-param', {
					values: variant.ptypoLite.baseValues,
					force: true,
					label: 'lite',
				});
			}
		}
		else {
			console.log('New step values : ');
			console.log(newStep);

			// change step : load first choice values if any and if none : load base values
			if (Object.keys(newChoice.values).length > 0) {
				localClient.dispatchAction('/change-param', {
					values: _.extend({}, variant.ptypoLite.baseValues, newChoice.values),
					force: true,
					label: 'lite',
				});
			}
			else {
				localClient.dispatchAction('/change-param', {
					values: variant.ptypoLite.baseValues,
					force: true,
					label: 'lite',
				});
			}
		}
		localServer.dispatchUpdate('/prototypoStore', patchChoice);
		saveAppValues();
	},
	'/create-choice': async ({name, stepName}) => {
		// check if everything correct with the form
		if (name === undefined || name === '' || String(name).trim() === '') {
			const patch = prototypoStore
				.set('errorAddChoice', 'You must choose a name for your step')
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			return;
		}
		// done checking if everything is correct with the form

		// create new choice
		const newChoice = {
			id: hasher.update(`${name}${new Date().getTime()}`).digest().toString(16),
			name,
			db: slug(`${stepName}${name}`, ''),
			values: {},
		};
		// done creating new step

		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = fonts.find(item => item.name === currentFamily.name);
		const patchedVariant = (family.variants || []).find(item => currentVariant.id === item.id);
		const step = patchedVariant.ptypoLite.steps.find(i => i.name === stepName);
		const already = step.choices.find(choice => choice.name === name);

		if (already) {
			const patch = prototypoStore
				.set('errorAddChoice', 'A Choice with this name already exists')
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			return;
		}

		step.choices.push(newChoice);

		const patch = prototypoStore
			.set('errorAddChoice', undefined)
			.set('fonts', fonts)
			.set('variant', patchedVariant)
			.set('choice', newChoice)
			.set('step', step)
			.set('createdChoice', step)
			.set('openChoiceModal', false)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		// Load base values
		localClient.dispatchAction('/change-param', {
			values: patchedVariant.ptypoLite.baseValues,
			force: true,
			label: 'lite',
		});

		saveAppValues();
	},
	'/edit-choice': async ({baseName, name}) => {
		// check if everything correct with the form
		if (name === undefined || name === '' || String(name).trim() === '') {
			const patch = prototypoStore
				.set('errorAddChoice', 'You must choose a name for your step')
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			return;
		}
		// done checking if everything is correct with the form

		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = fonts.find(item => item.name === currentFamily.name);
		const patchedVariant = (family.variants || []).find(item => currentVariant.id === item.id);
		let currentStep = prototypoStore.get('step');

		if (!currentStep.name) {
			currentStep = patchedVariant.ptypoLite.steps[0];
		}
		const step = patchedVariant.ptypoLite.steps.find(i => i.name === currentStep.name);
		const already = step.choices.find(choice => choice.name === name);

		if (already) {
			const patch = prototypoStore
				.set('errorAddChoice', 'A Choice with this name already exists')
				.commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
			return;
		}

		const updatedChoice = step.choices.find(choice => choice.name === baseName);

		updatedChoice.name = name;

		const patch = prototypoStore
			.set('errorAddChoice', undefined)
			.set('fonts', fonts)
			.set('variant', patchedVariant)
			.set('choice', updatedChoice)
			.set('step', step)
			.set('createdChoice', step)
			.set('openChoiceModal', false)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/save-choice-values': async () => {
		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = fonts.find(item => item.name === currentFamily.name);
		const variant = (family.variants || []).find(item => currentVariant.id === item.id);
		let currentStep = prototypoStore.get('step');

		if (!currentStep.name) {
			currentStep = variant.ptypoLite.steps[0];
		}
		const step = variant.ptypoLite.steps.find(elem => elem.name === currentStep.name);
		let currentChoice = prototypoStore.get('choice');

		if (!currentChoice.name) {
			currentChoice = variant.ptypoLite.steps[0].choices[0];
		}
		const choice = step.choices.find(elem => elem.id === currentChoice.id);

		const baseValues = variant.ptypoLite.baseValues;
		const currentValues = _.cloneDeep(undoableStore.get('controlsValues'));

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
		choice.values = newValues;

		const patch = prototypoStore
			.set('fonts', fonts)
			.set('variant', variant)
			.set('choice', choice)
			.set('step', step)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		saveAppValues();
	},
	'/update-base-font-values': async () => {
		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = fonts.find(item => item.name === currentFamily.name);
		const variant = (family.variants || []).find(item => currentVariant.id === item.id);
		const currentValues = _.cloneDeep(undoableStore.get('controlsValues'));

		variant.ptypoLite.baseValues = currentValues;

		const patch = prototypoStore
			.set('fonts', fonts)
			.set('variant', variant)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		console.log('base font values updated!');

		saveAppValues();
	},
	'/delete-current-step': async () => {
		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = fonts.find(item => item.name === currentFamily.name);
		const variant = (family.variants || []).find(item => currentVariant.id === item.id);
		let currentStep = prototypoStore.get('step');

		// failsafe if deleting at app start
		if (!currentStep.name) {
			currentStep = variant.ptypoLite.steps[0];
		}

		const stepIndex = variant.ptypoLite.steps.findIndex(elem => elem.name === currentStep.name);
		console.log(`deleting ${currentStep.name} at index ${stepIndex}`);
		variant.ptypoLite.steps.splice(stepIndex, 1);

		let newStep;
		let newChoice;

		if (stepIndex === -1) {
			return;
		}

		if (stepIndex === 0) {
			newStep = {};
			newChoice = {};

			// Load base values
			localClient.dispatchAction('/change-param', {
				values: variant.ptypoLite.baseValues,
				force: true,
				label: 'lite',
			});
		}
		else {
			newStep = variant.ptypoLite.steps[stepIndex - 1];
			newChoice = variant.ptypoLite.steps[stepIndex - 1].choices[0];
			// Load choice values
			if (Object.keys(newChoice.values).length > 0) {
				localClient.dispatchAction('/change-param', {
					values: _.extend({}, variant.ptypoLite.baseValues, newChoice.values),
					force: true,
					label: 'lite',
				});
			}
			else {
				localClient.dispatchAction('/change-param', {
					values: variant.ptypoLite.baseValues,
					force: true,
					label: 'lite',
				});
			}
		}

		const patch = prototypoStore
			.set('fonts', fonts)
			.set('variant', variant)
			.set('choice', newChoice)
			.set('step', newStep)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		console.log('current step deleted');

		saveAppValues();
	},
	'/delete-current-choice': async () => {
		const fonts = _.cloneDeep(prototypoStore.get('fonts') || []);
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');
		const family = fonts.find(item => item.name === currentFamily.name);
		const variant = (family.variants || []).find(item => currentVariant.id === item.id);
		let currentStep = prototypoStore.get('step');

		// failsafe if deleting at app start
		if (!currentStep.name) {
			currentStep = variant.ptypoLite.steps[0];
		}
		const step = variant.ptypoLite.steps.find(elem => elem.name === currentStep.name);
		let currentChoice = prototypoStore.get('choice');

		// failsafe if deleting at app start
		if (!currentChoice.name) {
			currentChoice = variant.ptypoLite.steps[0].choices[0];
		}
		const choiceIndex = step.choices.findIndex(elem => elem.id === currentChoice.id);
		console.log(`deleting ${currentChoice.name} from ${currentStep.name} at index ${choiceIndex}`);
		step.choices.splice(choiceIndex, 1);
		let newChoice;

		if (choiceIndex === -1) {
			return;
		}

		if (choiceIndex === 0) {
			newChoice = {};
			localClient.dispatchAction('/change-param', {
				values: variant.ptypoLite.baseValues,
				force: true,
				label: 'lite',
			});
		}
		else {
			newChoice = step.choices[choiceIndex - 1];
			if (Object.keys(newChoice.values).length > 0) {
				localClient.dispatchAction('/change-param', {
					values: _.extend({}, variant.ptypoLite.baseValues, newChoice.values),
					force: true,
					label: 'lite',
				});
			}
			else {
				localClient.dispatchAction('/change-param', {
					values: variant.ptypoLite.baseValues,
					force: true,
					label: 'lite',
				});
			}
		}

		const patch = prototypoStore
			.set('fonts', fonts)
			.set('variant', variant)
			.set('choice', newChoice)
			.set('step', step)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		console.log('current choice deleted');

		saveAppValues();
	},
};
