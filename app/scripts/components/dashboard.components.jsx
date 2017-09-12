import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import {withRouter} from 'react-router';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';
import classNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Joyride from 'react-joyride';

import LocalClient from '../stores/local-client.stores.jsx';

import Topbar from './topbar/topbar.components.jsx';
import Toolbar from './toolbar/toolbar.components.jsx';
import Workboard from './workboard.components.jsx';
import ExportAs from './export-as.components.jsx';
import Collection from './collection/collection.components.jsx';
import CreateFamilyModal from './familyVariant/create-family-modal.components.jsx';
import CreateVariantModal from './familyVariant/create-variant-modal.components.jsx';
import CreateAcademyModal from './academy/create-academy-modal.components.jsx';
import CreateStepModal from './lite/create-step-modal.components.jsx';
import CreateChoiceModal from './lite/create-choice-modal.components.jsx';
import CreateExportLiteModal from './lite/create-export-lite-modal.components.jsx';
import ChangeNameFamily from './familyVariant/change-name-family.components.jsx';
import ChangeNameVariant from './familyVariant/change-name-variant.components.jsx';
import DuplicateVariant from './familyVariant/duplicate-variant.components.jsx';
import CreditsExport from './credits-export.components.jsx';
import GoProModal from './go-pro-modal.components.jsx';

import {buildTutorialSteps, handleNextStep, handleClosed} from '../helpers/joyride.helpers.js';

class Dashboard extends React.PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			joyrideSteps: [],
			uiJoyrideTutorialValue: false,
			firstTimeFile: undefined,
			firstTimeCollection: undefined,
			firstTimeIndivCreate: undefined,
			firstTimeIndivEdit: undefined,
			firstTimeAcademyModal: undefined,
			firstTimeAcademyJoyride: undefined,
		};

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
			firstTimeAcademyModal: prototypoStore.head.toJS().firstTimeAcademyModal,
			firstTimeAcademyJoyride: prototypoStore.head.toJS().firstTimeAcademyJoyride,
		});

		let firstContactTimeoutMade = false;

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				if (this.props.library.length <= 0) {
					this.props.router.push('/start');
					return;
				}

				if (!firstContactTimeoutMade && !this.props.firstContactMade) {
					firstContactTimeoutMade = true;
					setTimeout(() => {
						window.Intercom('update', {
							first_session_at: new Date(),
						});
						this.props.setFirstContact();
					}, 300000);
				}

				this.setState({
					openFamilyModal: head.toJS().d.openFamilyModal,
					openVariantModal: head.toJS().d.openVariantModal,
					openStepModal: head.toJS().d.openStepModal,
                    openChoiceModal: head.toJS().d.openChoiceModal,
					openExportLiteModal: head.toJS().d.openExportLiteModal,
                    stepModalEdit: head.toJS().d.stepModalEdit,
					choiceModalEdit: head.toJS().d.choiceModalEdit,
					variant: head.toJS().d.variant,
					familySelectedVariantCreation: head.toJS().d.familySelectedVariantCreation,
                    stepSelectedChoiceCreation: head.toJS().d.stepSelectedChoiceCreation,
					collectionSelectedVariant: head.toJS().d.collectionSelectedVariant,
					openChangeFamilyNameModal: head.toJS().d.openChangeFamilyNameModal,
					openChangeVariantNameModal: head.toJS().d.openChangeVariantNameModal,
					openDuplicateVariantModal: head.toJS().d.openDuplicateVariantModal,
					openBuyCreditsModal: head.toJS().d.openBuyCreditsModal,
					openGoProModal: head.toJS().d.openGoProModal,
					step: head.toJS().d.uiOnboardstep,
					collection: head.toJS().d.uiShowCollection,
					indiv: head.toJS().d.indivMode,
					exportAs: head.toJS().d.exportAs,
					uiJoyrideTutorialValue: head.toJS().d.uiJoyrideTutorialValue,
					firstTimeFile: head.toJS().d.firstTimeFile,
					firstTimeCollection: head.toJS().d.firstTimeCollection,
					firstTimeIndivCreate: head.toJS().d.firstTimeIndivCreate,
					firstTimeIndivEdit: head.toJS().d.firstTimeIndivEdit,
					firstTimeAcademyModal: head.toJS().d.firstTimeAcademyModal,
					firstTimeAcademyJoyride: head.toJS().d.firstTimeAcademyJoyride,
					preset: head.toJS().d.preset,
					liteStep: head.toJS().d.step,
					liteChoice: head.toJS().d.choice,
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
			setTimeout(function() {
				this.addSteps(joyrideSteps);
				this.refs.joyride.start(true);
			}.bind(this), 400);
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

		const classes = classNames({
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
		const newStep = this.state.openStepModal
		&& <CreateStepModal propName="openStepModal" step={this.state.liteStep} variant={this.state.variant} preset={this.state.preset} edit={this.state.stepModalEdit} />;
        const newChoice= this.state.openChoiceModal
			&& <CreateChoiceModal step={this.state.liteStep} choice={this.state.liteChoice} preset={this.state.preset} propName="openChoiceModal" edit={this.state.choiceModalEdit} />;
		const exportLite= this.state.openExportLiteModal
			&& <CreateExportLiteModal propName="exportLiteModal" />;
		const explainAcademy = this.state.firstTimeAcademyModal
			&& <CreateAcademyModal propName="openAcademyModal"/>;
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

		if (this.props.location.query.showModal) {
			this.client.dispatchAction('/store-value', {
				openGoProModal: true,
				goProModalBilling: this.props.location.query.showModal,
			});
		}

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
					{newStep}
                    {newChoice}
					{exportLite}
					{changeNameFamily}
					{changeNameVariant}
					{duplicateVariant}
					{buyCredits}
					{goPro}
					{exportAs}
					{explainAcademy}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

const getUserFontsAndFirstContactMadeQuery = gql`
	query getUserFonts {
		user {
			id
			firstContactMade
			library {
				id
			}
		}
	}
`;

const setFirstContactMadeMutation = gql`
	mutation setFirstContact($id: ID!) {
		updateUser(
			id: $id,
			firstContactMade: true
		) {
		id
		}
	}
`;

export default compose(
	graphql(getUserFontsAndFirstContactMadeQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props({data}) {
			if (data.loading) {
				return {loading: true};
			}
			return {
				library: data.user.library || [],
				firstContactMade: data.user.firstContactMade,
				userID: data.user.id,
			};
		},
	}),
	graphql(setFirstContactMadeMutation, {
		props: ({mutate, ownProps}) => ({
			setFirstContact: () =>
				mutate({
					variables: {
						id: ownProps.userID,
					},
				}),
		}),
	}),
)(withRouter(Dashboard));
