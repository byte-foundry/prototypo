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
import GoProModal from './go-pro-modal.components.jsx';
//import NpsMessage from './nps-message.components.jsx';

import {buildTutorialSteps, handleNextStep, handleClosed} from '../helpers/joyride.helpers.js';

export default class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			joyrideSteps: [],
			uiJoyrideTutorialValue: false,
			firstTimeFile: undefined,
			firstTimeCollection: undefined,
			firstTimeIndivCreate: undefined,
			firstTimeIndivEdit: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.joyrideCallback = this.joyrideCallback.bind(this);
	}

	async componentWillMount() {
		pleaseWait.instance.finish();

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			joyrideSteps: [],
			firstTimeFile: prototypoStore.head.toJS().firstTimeFile,
			firstTimeCollection: prototypoStore.head.toJS().firstTimeCollection,
			firstTimeIndivCreate: prototypoStore.head.toJS().firstTimeIndivCreate,
			firstTimeIndivEdit: prototypoStore.head.toJS().firstTimeIndivEdit,
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
					openGoProModal: head.toJS().openGoProModal,
					step: head.toJS().uiOnboardstep,
					collection: head.toJS().uiShowCollection,
					indiv: head.toJS().indivMode,
					exportAs: head.toJS().exportAs,
					uiJoyrideTutorialValue: head.toJS().uiJoyrideTutorialValue,
					firstTimeFile: head.toJS().firstTimeFile,
					firstTimeCollection: head.toJS().firstTimeCollection,
					firstTimeIndivCreate: head.toJS().firstTimeIndivCreate,
					firstTimeIndivEdit: head.toJS().firstTimeIndivEdit,
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
		const joyrideSteps = buildTutorialSteps(prevState, this.state);

		if (joyrideSteps.length) {
			this.addSteps(joyrideSteps);
			this.refs.joyride.start(true);
		}
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
				case 'next':
					handleNextStep(this, joyrideEvent);
					break;
				case 'close':
					handleClosed(this);
					this.refs.joyride.stop();
					break;
				case 'esc':
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
			&& <Collection collectionTransitionTimeout={collectionTransitionTimeout}/>;
		const newFamily = this.state.openFamilyModal
			&& <CreateFamilyModal propName="openFamilyModal"/>;
		const newVariant = this.state.openVariantModal
			&& <CreateVariantModal family={this.state.familySelectedVariantCreation} propName="openVariantModal"/>;
		const changeNameFamily = this.state.openChangeFamilyNameModal
			&& <ChangeNameFamily family={this.state.familySelectedVariantCreation} propName="openChangeFamilyNameModal"/>;
		const changeNameVariant = this.state.openChangeVariantNameModal
			&& <ChangeNameVariant family={this.state.familySelectedVariantCreation} variant={this.state.collectionSelectedVariant} propName="openChangeVariantNameModal"/>;
		const duplicateVariant = this.state.openDuplicateVariantModal
			&& <DuplicateVariant family={this.state.familySelectedVariantCreation} variant={this.state.collectionSelectedVariant} propName="openDuplicateVariantModal"/>;
		const buyCredits = this.state.openBuyCreditsModal
			&& <CreditsExport propName="openBuyCreditsModal"/>;
		const goPro = this.state.openGoProModal
			&& <GoProModal propName="openGoProModal"/>;

		const exportAs = this.state.exportAs
			&& <ExportAs propName="exportAs"/>;

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
					{goPro}
					{exportAs}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}
