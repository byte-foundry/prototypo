import React from 'react';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ViewPanelsMenu from '../viewPanels/view-panels-menu.components.jsx';
import {ContextualMenuItem} from '../viewPanels/contextual-menu.components.jsx';
import HoodieApi from '~/services/hoodie.services.js';
import LocalClient from '~/stores/local-client.stores.jsx';
import ScrollArea from 'react-scrollbar';

import Button from '../shared/button.components.jsx';
import {collectionsTutorialLabel} from '../../helpers/joyride.helpers.js';

export default class Collection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			families: [],
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.returnToDashboard = this.returnToDashboard.bind(this);
		this.open = this.open.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');
		const creditStore = await this.client.fetch('/creditStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
			otfCreditCost: creditStore.head.toJS().exportOtf,
		});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				let selectedFamily = false;

				if (head.toJS().d.collectionSelectedFamily !== {}) {
					selectedFamily = true;
				}
				this.setState({
					families: head.toJS().d.fonts,
					selected: (
						head.toJS().d.collectionSelectedFamily || head.toJS().d.fonts[0]
					),
					selectedVariant: (
						head.toJS().d.collectionSelectedVariant || head.toJS().d.fonts[0].variants[0]
					),
					familyDeleteSplit: head.toJS().d.uiFamilyDeleteSplit,
					askSubscribeFamily: head.toJS().d.uiAskSubscribeFamily,
					askSubscribeVariant: head.toJS().d.uiAskSubscribeVariant,
					variantDeleteSplit: head.toJS().d.uiVariantDeleteSplit,
					variantToExport: head.toJS().d.variantToExport,
					exportedVariant: head.toJS().d.exportedVariant,
					credits: head.toJS().d.credits,
				});
				if (!selectedFamily) {
					this.client.dispatchAction('/select-family-collection', head.toJS().d.fonts[0]);
					this.client.dispatchAction('/select-variant-collection', head.toJS().d.fonts[0].variants[0]);
				}
			})
			.onDelete(() => {
				this.setState({
					families: undefined,
				});
			});
	}

	componentDidMount() {
		setTimeout(() => {
			this.client.dispatchAction('/store-value', {
				uiJoyrideTutorialValue: collectionsTutorialLabel,
			});
		}, (this.props.collectionTransitionTimeout + 100));
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	returnToDashboard() {
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	open(variant) {
		this.client.dispatchAction('/select-variant', {variant: variant || this.state.selectedVariant, family: this.state.selected});
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	download() {
	}

	render() {
		const selectedFamilyVariants = (_.find(this.state.families, (family) => {
			return family.name === this.state.selected.name;
		}) || {}).variants;
		const selectedVariant = (_.find(selectedFamilyVariants, (item) => {
			return item.id === this.state.selectedVariant.id;
		}) || {});
		const variant = selectedFamilyVariants
			? <VariantList
				variants={selectedFamilyVariants}
				selectedVariantId={this.state.selectedVariant.id}
				key={this.state.selected.name}
				deleteSplit={this.state.familyDeleteSplit}
				variantDeleteSplit={this.state.variantDeleteSplit}
				askSubscribe={this.state.askSubscribeFamily}
				askSubscribeVariant={this.state.askSubscribeVariant}
				variantToExport={this.state.variantToExport}
				exportedVariant={this.state.exportedVariant}
				credits={this.state.credits}
				otfCreditCost={this.state.otfCreditCost}
				family={this.state.selected}
				open={this.open}/>
			: false;

		return (
			<div className="collection">
				<div className="collection-container">
					<div className="account-dashboard-icon" onClick={this.returnToDashboard}/>
					<div className="account-dashboard-back-icon" onClick={this.returnToDashboard}/>
					<div className="account-header">
						<h1 className="account-title">My projects</h1>
					</div>
					<div className="collection-content">
						<FamilyList
							list={this.state.families}
							templateInfos={this.state.templateInfos}
							selected={this.state.selected}
							deleteSplit={this.state.familyDeleteSplit}/>
						{variant}
					</div>
				</div>
			</div>
		);
	}
}


class FamilyList extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	openFamilyModal() {
		this.client.dispatchAction('/store-value', {openFamilyModal: true});
	}

	render() {
		const families = _.map(this.props.list, (family) => {
			const templateInfo = _.find(this.props.templateInfos, (template) => {
				return template.templateName === family.template;
			}) || {name: 'Undefined'};
			let selected;

			if (this.props.selected) {
				selected = family.name === this.props.selected.name;
			}

			return (<Family
				key={family.name}
				family={family}
				selected={selected}
				class={family.template.split('.')[0]}
				templateName={templateInfo.name}
				deleteSplit={this.props.deleteSplit}/>);
		});

		return (
				<div className="family-list collection-pan">
					<ScrollArea
						horizontal={false}
						style={{overflowX: 'visible'}}>
					<Button label="Create a new project" click={this.openFamilyModal.bind(this)}/>
						{families}
					</ScrollArea>
				</div>
		);
	}
}

class Family extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showContextMenu: false,
		};
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.cancelDelete = this.cancelDelete.bind(this);
		this.prepareDeleteOrDelete = this.prepareDeleteOrDelete.bind(this);
		this.openChangeNameFamily = this.openChangeNameFamily.bind(this);
		this.downloadFamily = this.downloadFamily.bind(this);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectFamily() {
		this.client.dispatchAction('/select-family-collection', this.props.family);
	}

	openChangeNameFamily() {
		this.client.dispatchAction('/store-value', {
			openChangeFamilyNameModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	prepareDeleteOrDelete() {
		if (this.props.deleteSplit) {
			this.client.dispatchAction('/delete-family', {
				family: this.props.family,
			});
			this.client.dispatchAction('/store-value', {
				uiFamilyDeleteSplit: false,
			});
		}
		else {
			this.client.dispatchAction('/store-value', {
				uiFamilyDeleteSplit: true,
			});
		}
	}

	cancelDelete() {
		this.client.dispatchAction('/store-value', {
			uiFamilyDeleteSplit: false,
		});
	}

	downloadFamily() {
		this.client.dispatchAction('/store-value', {
			currentCreditCost: this.props.otfCreditCost,
		});
		this.client.dispatchAction('/export-family', {
			familyToExport: this.props.family,
			variants: this.props.variants,
		});
	}


	toggleContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu: !this.state.showContextMenu,
		});
	}

	render() {
		const classes = ClassNames({
			family: true,
			'is-active': this.props.selected,
		});
		const sampleClasses = ClassNames({
			'family-sample': true,
			[this.props.class]: true,
		});
		const familyActions = (
			<div>
				<ContextualMenuItem text="Change family name" click={this.openChangeNameFamily}/>
				<ContextualMenuItem
					text={this.props.deleteSplit ? 'Delete' : 'Delete family'}
					altLabel="Cancel"
					danger={true}
					splitButton={true}
					splitted={this.props.deleteSplit}
					click={this.prepareDeleteOrDelete}
					altClick={this.cancelDelete}
				/>
			</div>
		)

		return (
			<div className={classes} onClick={this.selectFamily.bind(this)} onContextMenu={this.toggleContextMenu}>
				<div className={sampleClasses}></div>
				<div className="family-info">
					<div className="family-info-name">
						{this.props.family.name}
					</div>
					<div className="family-info-base">
						FROM<span className="family-info-base-template"> {this.props.templateName}</span>
					</div>
				</div>
				<ViewPanelsMenu
					show={this.state.showContextMenu}
					toggle={this.toggleContextMenu}>
					{familyActions}
				</ViewPanelsMenu>
			</div>
		);
	}
}

class VariantList extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		// function binging in order to avoid unnecessary re-render
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			uiAskSubscribeFamily: false,
		});
	}

	openVariantModal() {
		this.client.dispatchAction('/store-value', {
			openVariantModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}


	download() {
	}

	askSubscribe() {
		if (this.props.askSubscribe) {
			document.location.href = '#/account/subscribe';
		}
		else {
			this.client.dispatchAction('/store-value', {
				uiAskSubscribeFamily: true,
			});
		}
	}

	buyCredits() {
		this.client.dispatchAction('/store-value', {
			openBuyCreditsModal: true,
		});
	}

	render() {
		const variants = _.map(this.props.variants, (variant, i) => {
			return (
				<Variant
					deleteSplit={this.props.variantDeleteSplit}
					family={this.props.family}
					askSubscribe={this.props.askSubscribeVariant}
					credits={this.props.credits}
					otfCreditCost={this.props.otfCreditCost}
					variant={variant}
					download={this.download}/>
			);
		});
		const freeUser = HoodieApi.instance.plan.indexOf('free_') !== -1;
		const hasEnoughCredits = this.props.credits !== undefined
			&& this.props.credits > 0
			&& (this.props.otfCreditCost * this.props.variants.length) < this.props.credits;
		const canExport = !freeUser || hasEnoughCredits;
		const downloadLabel = this.props.variantToExport
			? `${this.props.exportedVariant} / ${this.props.variantToExport}`
			: !canExport && this.props.askSubscribe
				? 'Subscribe'
				: `Download family${hasEnoughCredits ? ' (' + this.props.variants.length + ' credits)' : ''}`;
		const buyCreditsLabel = this.props.askSubscribe
			? 'Buy credits'
			: '';

		return (
			<div className="variant-list-container">
				<Button label="Add a new variant" click={this.openVariantModal.bind(this)}/>
				{variants}
			</div>
		);
	}
}

class Variant extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showContextMenu: false,
		};
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.open = this.open.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectVariant(variant) {
		this.client.dispatchAction('/select-variant-collection', variant);
	}

	open(variant) {
		this.client.dispatchAction('/select-variant', {variant: variant || this.state.selectedVariant, family: this.props.family});
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	toggleContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu: !this.state.showContextMenu,
		});
	}

	render() {
		const classes = ClassNames({
			'variant-list-name': true,
			'is-active': this.props.variant.id === this.props.selectedVariantId,
		});
		const variantInfo = <VariantInfo
			download={this.download}
			key={this.props.variant.id}
			deleteSplit={this.props.deleteSplit}
			family={this.props.family}
			askSubscribe={this.props.askSubscribeVariant}
			credits={this.props.credits}
			otfCreditCost={this.props.otfCreditCost}
			variant={this.props.variant}/>;

		return (
			<div className={classes} key={this.props.variant.id}
				onClick={() => {this.selectVariant(this.props.variant);}}
				onDoubleClick={() => {this.open(this.props.variant);}}
				onContextMenu={this.toggleContextMenu}>
				{this.props.variant.name}
				<ViewPanelsMenu
					show={this.state.showContextMenu}
					toggle={this.toggleContextMenu}>
					{variantInfo}
				</ViewPanelsMenu>

				<Button label="Open" click={() => {this.open(this.props.variant);}}/>
			</div>
		);
	}
}

class VariantInfo extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.edit = this.edit.bind(this);
		this.duplicate = this.duplicate.bind(this);
		this.cancelDelete = this.cancelDelete.bind(this);
		this.prepareDeleteOrDelete = this.prepareDeleteOrDelete.bind(this);
		this.askSubscribe = this.askSubscribe.bind(this);
		this.buyCredits = this.buyCredits.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			uiAskSubscribeVariant: false,
		});
	}

	edit() {
		this.client.dispatchAction('/store-value', {
			openChangeVariantNameModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	duplicate() {
		this.client.dispatchAction('/store-value', {
			openDuplicateVariantModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	prepareDeleteOrDelete() {
		if (this.props.deleteSplit) {
			this.client.dispatchAction('/delete-variant', {
				variant: this.props.variant,
				familyName: this.props.family.name,
			});
			this.client.dispatchAction('/store-value', {
				uiVariantDeleteSplit: false,
			});
		}
		else {
			this.client.dispatchAction('/store-value', {
				uiVariantDeleteSplit: true,
			});
		}
	}

	askSubscribe() {
		if (this.props.askSubscribe) {
			document.location.href = '#/account/subscribe';
		}
		else {
			this.client.dispatchAction('/store-value', {
				uiAskSubscribeVariant: true,
			});
		}
	}

	buyCredits() {
		this.client.dispatchAction('/store-value', {
			openBuyCreditsModal: true,
		});
	}

	cancelDelete() {
		this.client.dispatchAction('/store-value', {
			uiVariantDeleteSplit: false,
		});
	}

	downloadVariant() {
		this.client.dispatchAction('/store-value', {
			currentCreditCost: this.props.otfCreditCost,
		});
		this.client.dispatchAction('/export-otf', {merged});
	}

	render() {
		const freeUser = HoodieApi.instance.plan.indexOf('free_') !== -1;
		const hasEnoughCredits = this.props.credits !== undefined
			&& this.props.credits > 0
			&& this.props.otfCreditCost < this.props.credits;
		const canExport = !freeUser || hasEnoughCredits;
		const downloadLabel = this.props.variantToExport
			? `${this.props.exportedVariant} / ${this.props.variantToExport}`
			: !canExport && this.props.askSubscribe
				? 'Subscribe'
				: `Download Variant${hasEnoughCredits ? ' (1 credits)' : ''}`;
		const buyCreditsLabel = this.props.askSubscribe
			? 'Buy credits'
			: '';

		const result = this.props.variant.id
			? (
				<div className="variant-info-container">
					<ContextualMenuItem key="changevariantname" text="Change variant name" click={this.edit}/>
					<ContextualMenuItem key="duplicatevariant" text="Duplicate variant" click={this.duplicate}/>
					<ContextualMenuItem key="changevariantname"
						key="deletevariant"
						text={this.props.deleteSplit ? 'Delete' : 'Delete variant'}
						altLabel="Cancel"
						danger={true}
						splitButton={true}
						splitted={this.props.deleteSplit}
						click={this.prepareDeleteOrDelete}
						altClick={this.cancelDelete}
					/>
				</div>
			)
			: (
				<div className="variant-info-container">
				</div>
			);

		return result;
	}
}
