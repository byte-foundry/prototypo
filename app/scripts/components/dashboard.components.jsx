import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Joyride from 'react-joyride';

import LocalClient from '../stores/local-client.stores.jsx';

import Topbar from './topbar/topbar.components.jsx';
import Toolbar from './toolbar/toolbar.components.jsx';
import Workboard from './workboard.components.jsx';
import ExportAs from './export-as.components.jsx';
import Collection from './collection/collection.components.jsx';
import CreateFamilyModal from './familyVariant/create-family-modal.components.jsx';
import CreateVariantModal from './familyVariant/create-variant-modal.components.jsx';
import ChangeNameFamily from './familyVariant/change-name-family.components.jsx';
import ChangeNameVariant from './familyVariant/change-name-variant.components.jsx';
import DuplicateVariant from './familyVariant/duplicate-variant.components.jsx';
import CreditsExport from './credits-export.components.jsx';
//import NpsMessage from './nps-message.components.jsx';

import {buildTutorialSteps, handleNextStep, handleClosed} from '../helpers/joyride.helpers.js';

export default class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			joyrideSteps: [],
			uiJoyrideTutorialValue: false,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.joyrideCallback = this.joyrideCallback.bind(this);
	}

	async componentWillMount() {
		pleaseWait.instance.finish();

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.setState({
			joyrideSteps: [],
		});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					openFamilyModal: head.toJS().openFamilyModal,
					openVariantModal: head.toJS().openVariantModal,
					familySelectedVariantCreation: head.toJS().familySelectedVariantCreation,
					collectionSelectedVariant: head.toJS().collectionSelectedVariant,
					openChangeFamilyNameModal: head.toJS().openChangeFamilyNameModal,
					openChangeVariantNameModal: head.toJS().openChangeVariantNameModal,
					openDuplicateVariantModal: head.toJS().openDuplicateVariantModal,
					openBuyCreditsModal: head.toJS().openBuyCreditsModal,
					step: head.toJS().uiOnboardstep,
					collection: head.toJS().uiShowCollection,
					indiv: head.toJS().indivMode,
					exportAs: head.toJS().exportAs,
					uiJoyrideTutorialValue: head.toJS().uiJoyrideTutorialValue,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	componentDidUpdate(prevProps, prevState) {
		const steps = [];
		const mainColor = this.state.indiv ? '#f5e462' : '#24d390';

		if (
			(prevState.uiJoyrideTutorialValue !== this.state.uiJoyrideTutorialValue)
			&& this.state.uiJoyrideTutorialValue
		) {
			switch (this.state.uiJoyrideTutorialValue) {
				case 'fileTutorial': {
					const position = 'right';

					steps.push(
						{
							title: 'Merged export',
							text: 'Will export your font without overlapping shapes',
							selector: '#export-to-merged-otf',
							position,
							style: {
								mainColor,
							},
						},
						{
							title: 'Unmerged export',
							text: 'Will export your font as is',
							selector: '#export-to-otf',
							position,
							style: {
								mainColor,
							},
						}
					);
					break;
				}
				case 'collectionsTutorial': {
					steps.push(
						{
							title: 'Families',
							text: 'A list of the font families you have created',
							selector: '.family-list',
							position: 'right',
							style: {
								mainColor,
							},
						},
						{
							title: 'Variants',
							text: 'Here you can perfom actions on the selected font family and select a variant',
							selector: '.variant-list',
							position: 'right',
							style: {
								mainColor,
							},
						},
						{
							title: 'Variant panel',
							text: 'Here is a list of action you can perfom on the selected variant',
							selector: '.variant-info',
							position: 'left',
							style: {
								mainColor,
							},
						}
					);
					break;
				}
				case 'indivGroupsCreationTutorial': {
					steps.push(
						{
							title: 'Individualisation Groups',
							text: 'You might want to create individualisation groups because reasons',
							selector: '.create-param-group',
							position: 'right',
							style: {
								mainColor,
							},
						}
					);
					break;
				}
				case 'indivGroupsEditionTutorial': {
					console.log('toto');
					steps.push(
						{
							title: 'Relative modifications',
							text: 'Toggle this button to make your changes relative to the other glyphs',
							selector: '.indiv-switch-relative',
							position: 'bottom',
							style: {
								mainColor,
							},
						},
						{
							title: 'Absolute modifications',
							text: 'Toggle this button to make your changes absolute',
							selector: '.indiv-switch-delta',
							position: 'bottom',
							style: {
								mainColor,
							},
						}
					);
					break;
				}
				default: {
					break;
				}
			}
			this.refs.joyride.start(true);
		}
		this.addSteps(steps);
	}

	/**
	*	adds given steps to the state
	*	@param {array} steps - an array containing joyride steps objects
	*/
	addSteps(steps) {
		const joyride = this.refs.joyride;

		if (!steps.length) {
			return false;
		}

		this.setState((currentState) => {
			if (currentState.joyrideSteps) {
				currentState.joyrideSteps = currentState.joyrideSteps.concat(joyride.parseSteps(steps));
			}
			return currentState;
		});
	}

	addTooltip(data) {
		this.refs.joyride.addTooltip(data);
	}

	joyrideCallback(joyrideEvent) {
		if (joyrideEvent) {
			switch (joyrideEvent.action) {
				case 'close':
					this.refs.joyride.stop();
				case 'next':
					handleNextStep(this, joyrideEvent);
					break;
				case 'close':
					handleClosed(this);
					this.refs.joyride.stop();
					break;
				default:
					break;
			}
		}
	}

	goToNextStep(step) {
		this.client.dispatchAction('/store-value', {uiOnboardstep: step});
	}

	exitOnboarding() {
		this.client.dispatchAction('/store-value', {uiOnboard: true});
	}

	render() {

		/* These are some guidelines about css:
		 * - All these guidelines have to be considered in the scope of SMACSS
		 * - All the first descendant of dashboard are unique layout container
		 * (i.e they have a unique id in there first element preferrably the
		 * lowercased name of the component)
		 * - Layout component should be named with a Capitalized name
		 * (i.e Sidebar, Menubar or Workboard)
		 * - All descendant of layout components are modules
		 * - the modules should have a class that is the name of the component
		 * in kebab-case (YoYoMa -> yo-yo-ma);
		 * - layout styles are prefixed with "l-"
		 * - state styles are prefixed with "is-"
		*/
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] dashboard');
		}

		const classes = ClassNames({
			'indiv': this.state.indiv && !(this.state.collection),
			'normal': !this.state.indiv || this.state.collection,
		});

		// timeouts : they are also used for tutorial triggering
		const collectionTransitionTimeout = 300;
		const panelTransitionTimeout = 200;

		// here modify ReactJoyride's labels

		const joyrideLocale = {
			back: 'Back',
			close: 'Close',
			last: 'OK',
			next: 'Next',
			skip: 'Skip',
		};

		const collection = this.state.collection
			? <Collection collectionTransitionTimeout={collectionTransitionTimeout} />
			: false;
		const newFamily = this.state.openFamilyModal
			? <CreateFamilyModal />
			: false;
		const newVariant = this.state.openVariantModal
			? <CreateVariantModal family={this.state.familySelectedVariantCreation}/>
			: false;
		const changeNameFamily = this.state.openChangeFamilyNameModal
			? <ChangeNameFamily family={this.state.familySelectedVariantCreation}/>
			: false;
		const changeNameVariant = this.state.openChangeVariantNameModal
			? <ChangeNameVariant family={this.state.familySelectedVariantCreation} variant={this.state.collectionSelectedVariant}/>
			: false;
		const duplicateVariant = this.state.openDuplicateVariantModal
			? <DuplicateVariant family={this.state.familySelectedVariantCreation} variant={this.state.collectionSelectedVariant}/>
			: false;
		const buyCredits = this.state.openBuyCreditsModal
			? <CreditsExport/>
			: false;

		const exportAs = this.state.exportAs
			? <ExportAs />
			: false;

		return (
			<div id="dashboard" className={classes}>
				<Joyride
					ref="joyride"
					type="continuous"
					scrollToFirstStep={false}
					scrollToSteps={false}
					debug={false}
					locale={joyrideLocale}
					steps={this.state.joyrideSteps}
					callback={this.joyrideCallback}/>
				<Topbar />
				<Toolbar />
				<Workboard />
				{exportAs}
				<ReactCSSTransitionGroup
					transitionName="collection"
					transitionEnterTimeout={collectionTransitionTimeout}
					transitionLeaveTimeout={collectionTransitionTimeout}>
					{collection}
				</ReactCSSTransitionGroup>
				<ReactCSSTransitionGroup
					component="span"
					transitionName="modal"
					transitionEnterTimeout={panelTransitionTimeout}
					transitionLeaveTimeout={panelTransitionTimeout}>
					{newFamily}
					{newVariant}
					{changeNameFamily}
					{changeNameVariant}
					{duplicateVariant}
					{buyCredits}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}
