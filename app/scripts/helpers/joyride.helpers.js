import React from 'react';
// define possible labels for current tutorial (uiJoyrideValue)
const fileTutorialLabel = 'fileTutorial';
const collectionsTutorialLabel = 'collectionsTutorial';
const indivGroupsCreationTutorialLabel = 'indivGroupsCreationTutorial';
const indivGroupsEditionTutorialLabel = 'indivGroupsEditionTutorial';
const academyTutorialLabel = 'academyTutorial';

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
			|| currentState.firstTimeAcademyJoyride)
	) {
		const normalColor = '#24d390';
		const indivColor = '#f5e462';
		const currentColor = currentState.indiv ? indivColor : normalColor;
		const predefinedSteps = {
			// "file" steps
			fileStep1: {
				title: 'Merged export',
				text:
					'Will export your font without overlapping shapes. In windows this will prevent the holes you might see in Prototypo',
				selector: '#export-to-merged-otf',
				position: 'right',
				style: {
					mainColor: currentColor,
				},
			},
			fileStep2: {
				title: 'Unmerged export',
				text: 'Will export your font as you see it in Prototypo.',
				selector: '#export-to-otf',
				position: 'right',
				style: {
					mainColor: currentColor,
				},
			},

			// "collection" steps
			collectionStep1: {
				title: 'Families',
				text: (
					<div>
						<p>This is your project list!</p>
						<p>
							From here, you can inspect and manage your existing font families,
							or create a new one.
						</p>
					</div>
				),
				selector: '.collection-content',
				position: 'right',
				style: {
					mainColor: normalColor,
				},
			},
			collectionStep2: {
				title: 'Variants',
				text: (
					<div>
						<p>This is the project column</p>
						<p>
							From here you can manage your projects. Click on one to select it
						</p>
					</div>
				),
				selector: '.family-list',
				position: 'left',
				style: {
					mainColor: normalColor,
				},
			},
			collectionStep3: {
				title: 'Variant panel',
				text: (
					<div>
						<p>This is the variant column</p>
						<p>
							These are all the fonts variants for your project. You can add
							choose to open one in Prototypo, create a new one or edit one by
							clicking on the wheel icon.
						</p>
						<p>Now go on and manage your projects :)</p>
					</div>
				),
				selector: '.variant-list-container',
				position: 'right',
				style: {
					mainColor: normalColor,
				},
			},

			// "indiv group create" steps
			indivGroupCreateStep1: {
				title: 'Individualization Groups',
				text: (
					<div>
						<p>
							Individualization groups are awesome if you want to tweak the
							shape of a specific set of glyphs.
						</p>
						<p>
							Name your group and select the glyphs that will be part of it.
						</p>
						<p>
							Note that glyphs can only be part of one individualization group.
						</p>
					</div>
				),
				selector: '.create-param-group',
				position: 'right',
				style: {
					mainColor: indivColor,
				},
			},

			// "indiv group edit" steps
			indivGroupEditStep1: {
				title: 'Proportional individualization',
				text:
					'There are two modes for individualization. The first one is proportional (&times;). It will multiply the global parameter by this individualization factor.',
				selector: '.indiv-switch-relative',
				position: 'bottom',
				style: {
					mainColor: indivColor,
				},
			},
			indivGroupEditStep2: {
				title: 'Absolute individualization',
				text:
					'The second mode of individualization is absolute (+). It will add or subtract this individualization value to the global parameter.',
				selector: '.indiv-switch-delta',
				position: 'bottom',
				style: {
					mainColor: indivColor,
				},
			},
			// "academy" steps
			academyStep1: {
				title: 'Academy',
				text: (
					<div>
						<p>
							You can access the academy anytime by clicking here! (or on the
							academy icon)
						</p>
					</div>
				),
				selector: '#access-academy',
				position: 'right',
				style: {
					mainColor: normalColor,
				},
			},
		};

		// populate steps according to the new tutorial values
		switch (currentState.uiJoyrideTutorialValue) {
		case fileTutorialLabel: {
			// only if this is the first time the user is doing the action
			if (currentState.firstTimeFile) {
				steps.push(predefinedSteps.fileStep1, predefinedSteps.fileStep2);
			}
			break;
		}
		case collectionsTutorialLabel: {
			if (currentState.firstTimeCollection) {
				steps.push(
					predefinedSteps.collectionStep1,
					predefinedSteps.collectionStep2,
					predefinedSteps.collectionStep3,
				);
			}
			break;
		}
		case indivGroupsCreationTutorialLabel: {
			if (currentState.firstTimeIndivCreate) {
				steps.push(predefinedSteps.indivGroupCreateStep1);
			}
			break;
		}
		case indivGroupsEditionTutorialLabel: {
			if (currentState.firstTimeIndivEdit) {
				steps.push(
					predefinedSteps.indivGroupEditStep1,
					predefinedSteps.indivGroupEditStep2,
				);
			}
			break;
		}
		case academyTutorialLabel: {
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

/**
 *	procedure that handles "next" step from joyride
 *	@param {object} component - "this" of the origin component
 *	@param {object} joyrideEvent - the event generated by joyride
 */
const handleNextStep = function (component, joyrideEvent) {
	switch (joyrideEvent.type) {
	case 'finished':
		handleFinished(component);
		break;
	default:
		break;
	}
};

/**
 *	procedure that handles "close" step from joyride
 *	@param {object} component - "this" of the origin component
 */
const handleClosed = function (component) {
	handleFinished(component, true);
};

/**
 *	procedure that handles "finished" type of "next" step from joyride
 *	@param {object} component - "this" of the origin component
 */
function handleFinished(component, finishEarly) {
	component.client.dispatchAction('/store-value', {
		uiJoyrideTutorialValue: undefined,
	});
	switch (component.state.uiJoyrideTutorialValue) {
	case fileTutorialLabel:
		component.client.dispatchAction('/store-value', {firstTimeFile: false});
		if (finishEarly) {
			window.Intercom('trackEvent', 'endedFileTutoEarly');
		}
		else {
			window.Intercom('trackEvent', 'endedFileTuto');
		}
		break;
	case collectionsTutorialLabel:
		component.client.dispatchAction('/store-value', {
			firstTimeCollection: false,
		});
		if (finishEarly) {
			window.Intercom('trackEvent', 'endedCollectionTutoEarly');
		}
		else {
			window.Intercom('trackEvent', 'endedCollectionTuto');
		}
		break;
	case indivGroupsCreationTutorialLabel:
		component.client.dispatchAction('/store-value', {
			firstTimeIndivCreate: false,
		});
		if (finishEarly) {
			window.Intercom('trackEvent', 'endedIndivGroupTutoEarly');
		}
		else {
			window.Intercom('trackEvent', 'endedIndivGroupTuto');
		}
		break;
	case indivGroupsEditionTutorialLabel:
		component.client.dispatchAction('/store-value', {
			firstTimeIndivEdit: false,
		});
		if (finishEarly) {
			window.Intercom('trackEvent', 'endedIndivParamTutoEarly');
		}
		else {
			window.Intercom('trackEvent', 'endedIndivParamTuto');
		}
		break;
	case academyTutorialLabel:
		component.client.dispatchAction('/store-value', {
			firstTimeAcademy: false,
		});
		if (finishEarly) {
			window.Intercom('trackEvent', 'endedAcademyTutoEarly');
		}
		else {
			window.Intercom('trackEvent', 'endedAcademyTuto');
		}
		break;
	default:
		break;
	}

	// reset joyride steps everytime a tutorial ends
	component.setState({joyrideSteps: []});
}

export {
	// methods
	buildTutorialSteps,
	handleNextStep,
	handleClosed,
	// labels
	fileTutorialLabel,
	collectionsTutorialLabel,
	indivGroupsCreationTutorialLabel,
	indivGroupsEditionTutorialLabel,
	academyTutorialLabel,
};
