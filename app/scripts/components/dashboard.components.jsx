import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

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

export default class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	async componentWillMount() {
		pleaseWait.instance.finish();

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

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
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

	}

	componentWillUnmount() {
		this.lifespan.release();
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

		const collection = this.state.collection
			&& <Collection />;
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
				<Topbar />
				<Toolbar />
				<Workboard />
				<ReactCSSTransitionGroup transitionName="collection" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{collection}
				</ReactCSSTransitionGroup>
				<ReactCSSTransitionGroup
					component="span"
					transitionName="modal"
					transitionEnterTimeout={200}
					transitionLeaveTimeout={200}>
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
