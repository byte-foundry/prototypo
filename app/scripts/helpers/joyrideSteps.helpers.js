/**
 *	build every step of a tutorial according to previous and current state
 *	@param {object} previousState
 *	@param {object} currentState
 *	@return {array} steps - an array of states, possibly empty
 */
const buildTutorialSteps = function (previousState, currentState) {
	// "steps" is an array of tutorial steps
	const steps = [];

	// if we are transitioning from a tutorial value to another
	if (
		// the values are differing from last state
		previousState.uiJoyrideTutorialValue
			!== currentState.uiJoyrideTutorialValue
		// the new value exists
		&& currentState.uiJoyrideTutorialValue
		// and we have at least one tutorial to display
		&& (currentState.firstTimeFile
			|| currentState.firstTimeCollection
			|| currentState.firstTimeIndivCreate
			|| currentState.firstTimeIndivEdit
			|| currensState.firstTimeAcademyJoyride)
	) {
		const mainColor = currentState.indiv ? '#f5e462' : '#24d390';
		const predefinedSteps = {
			// "file" steps
			fileStep1: {
				title: 'Merged export',
				text: 'Will export your font without overlapping shapes',
				selector: '#export-to-merged-otf',
				position: 'right',
				style: {
					mainColor,
				},
			},
			fileStep2: {
				title: 'Unmerged export',
				text: 'Will export your font as is',
				selector: '#export-to-otf',
				position: 'right',
				style: {
					mainColor,
				},
			},

			// "collection" steps
			collectionStep1: {
				title: 'Families',
				text: 'A list of the font families you have created',
				selector: '.family-list',
				position: 'right',
				style: {
					mainColor,
				},
			},
			collectionStep2: {
				title: 'Variants',
				text:
					'Here you can perfom actions on the selected font family and select a variant',
				selector: '.variant-list',
				position: 'right',
				style: {
					mainColor,
				},
			},
			collectionStep3: {
				title: 'Variant panel',
				text: 'Here is a list of action you can perfom on the selected variant',
				selector: '.variant-info',
				position: 'left',
				style: {
					mainColor,
				},
			},

			// "indiv group create" steps
			indivGroupCreateStep1: {
				title: 'Individualisation Groups',
				text:
					'You might want to create individualisation groups because reasons',
				selector: '.create-param-group',
				position: 'right',
				style: {
					mainColor,
				},
			},

			// "indiv group edit" steps
			indivGroupEditStep1: {
				title: 'Relative modifications',
				text:
					'Toggle this button to make your changes relative to the other glyphs',
				selector: '.indiv-switch-relative',
				position: 'bottom',
				style: {
					mainColor,
				},
			},
			indivGroupEditStep2: {
				title: 'Absolute modifications',
				text: 'Toggle this button to make your changes absolute',
				selector: '.indiv-switch-delta',
				position: 'bottom',
				style: {
					mainColor,
				},
			},
			// "academy" steps
			academyStep1: {
				title: 'Academy',
				text: 'Here is the academy',
				selector: '#show-academy',
				position: 'right',
				style: {
					mainColor,
				},
			},
		};

		// populate steps according to the new tutorial values
		switch (currentState.uiJoyrideTutorialValue) {
		case 'fileTutorial': {
			// only if this is the first time the user is doing the action
			if (currentState.firstTimeFile) {
				steps.push(predefinedSteps.fileStep1, predefinedSteps.fileStep2);
			}
			break;
		}
		case 'collectionsTutorial': {
			if (currentState.firstTimeCollection) {
				steps.push(
					predefinedSteps.collectionStep1,
					predefinedSteps.collectionStep2,
					predefinedSteps.collectionStep3,
				);
			}
			break;
		}
		case 'indivGroupsCreationTutorial': {
			if (currentState.firstTimeIndivCreate) {
				steps.push(predefinedSteps.indivGroupCreateStep1);
			}
			break;
		}
		case 'indivGroupsEditionTutorial': {
			if (currentState.firstTimeIndivEdit) {
				steps.push(
					predefinedSteps.indivGroupEditStep1,
					predefinedSteps.indivGroupEditStep2,
				);
			}
			break;
		}
		case 'academyTutorial': {
			if (currentState.firstTimeAcademyJoyride) {
				steps.push(predefinedSteps.academyStep1);
			}
			break;
		}
		default: {
			break;
		}
		}
	}

	return steps;
};

export default buildTutorialSteps;
