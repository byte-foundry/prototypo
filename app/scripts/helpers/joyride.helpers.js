import React from 'react';
// define possible labels for current tutorial (uiJoyrideValue)
const fileTutorialLabel = 'fileTutorial';
const collectionsTutorialLabel = 'collectionsTutorial';
const indivGroupsCreationTutorialLabel = 'indivGroupsCreationTutorial';
const indivGroupsEditionTutorialLabel = 'indivGroupsEditionTutorial';
const academyTutorialLabel = 'academyTutorial';

export const getSteps = (tutorialName) => {
	const normalColor = '#24d390';
	const indivColor = '#f5e462';
	// const currentColor = currentState.indiv ? indivColor : normalColor;
	const currentColor = normalColor;

	switch (tutorialName) {
	case fileTutorialLabel:
		return [
			{
				title: 'Export',
				text: 'Will export your font on your device.',
				selector: '#export-to-merged-otf',
				position: 'right',
				style: {
					mainColor: currentColor,
				},
			},
			{
				title: 'Glyphr export',
				text: 'Will export your font into the Glyphr online editor.',
				selector: '#export-to-glyphr-studio',
				position: 'right',
				style: {
					mainColor: currentColor,
				},
			},
				/*{
				title: 'Export family',
				text: 'Will export the all family in a compressed folder.',
				selector: '#export-family',
				position: 'right',
				style: {
					mainColor: currentColor,
				},
			},*/
		];
	case collectionsTutorialLabel:
		return [
			{
				title: 'Families',
				text: (
					<div>
						<p>This is your project list!</p>
						<p>
								From here, you can inspect and manage your existing font families, or create a new
								one.
							</p>
					</div>
					),
				selector: '.collection-content',
				position: 'right',
				style: {
					mainColor: normalColor,
				},
			},
			{
				title: 'Variants',
				text: (
					<div>
						<p>This is the project column</p>
						<p>From here you can manage your projects. Click on one to select it</p>
					</div>
					),
				selector: '.family-list',
				position: 'left',
				style: {
					mainColor: normalColor,
				},
			},
			{
				title: 'Variant panel',
				text: (
					<div>
						<p>This is the variant column</p>
						<p>
								These are all the fonts variants for your project. You can add choose to open one in
								Prototypo, create a new one or edit one by clicking on the wheel icon.
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
		];
	case indivGroupsCreationTutorialLabel:
		return [
			{
				title: 'Individualization Groups',
				text: (
					<div>
						<p>
								Individualization groups are awesome if you want to tweak the shape of a specific
								set of glyphs.
							</p>
						<p>Name your group and select the glyphs that will be part of it.</p>
						<p>Note that glyphs can only be part of one individualization group.</p>
					</div>
					),
				selector: '.create-param-group',
				position: 'right',
				style: {
					mainColor: indivColor,
				},
			},
		];
	case indivGroupsEditionTutorialLabel:
		return [
			{
				title: 'Proportional individualization',
				text:
						'There are two modes for individualization. The first one is proportional (&times;). It will multiply the global parameter by this individualization factor.',
				selector: '.indiv-switch-relative',
				position: 'bottom',
				style: {
					mainColor: indivColor,
				},
			},
			{
				title: 'Absolute individualization',
				text:
						'The second mode of individualization is absolute (+). It will add or subtract this individualization value to the global parameter.',
				selector: '.indiv-switch-delta',
				position: 'bottom',
				style: {
					mainColor: indivColor,
				},
			},
		];
	case academyTutorialLabel:
		return [
			{
				title: 'Academy',
				text: (
					<div>
						<p>You can access the academy anytime by clicking here! (or on the academy icon)</p>
					</div>
					),
				selector: '#access-academy',
				position: 'right',
				style: {
					mainColor: normalColor,
				},
			},
		];
	default:
		return null;
	}
};

export function getTutoEndLabels(tutorialName) {
	switch (tutorialName) {
	case fileTutorialLabel:
		return {
			store: 'firstTimeFile',
			intercom: 'endedFileTuto',
		};
	case collectionsTutorialLabel:
		return {
			store: 'firstTimeCollection',
			intercom: 'endedCollectionTuto',
		};
	case indivGroupsCreationTutorialLabel:
		return {
			store: 'firstTimeIndivCreate',
			intercom: 'endedIndivGroupTuto',
		};
	case indivGroupsEditionTutorialLabel:
		return {
			store: 'firstTimeIndivEdit',
			intercom: 'endedIndivParamTuto',
		};
	case academyTutorialLabel:
		return {
			store: 'firstTimeAcademyJoyride',
			intercom: 'endedAcademyTuto',
		};
	default:
		return {};
	}
}

export {
	// labels
	fileTutorialLabel,
	collectionsTutorialLabel,
	indivGroupsCreationTutorialLabel,
	indivGroupsEditionTutorialLabel,
	academyTutorialLabel,
};
