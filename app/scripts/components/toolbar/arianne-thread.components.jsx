import React from 'react';
import {graphql, gql} from 'react-apollo';
import Lifespan from 'lifespan';
import classNames from 'classnames';

import HoodieApi from '~/services/hoodie.services.js';

import LocalClient from '~/stores/local-client.stores.jsx';

import {libraryQuery} from '../collection/collection.components';

const voidStateObject = {};
const voidStateArray = [];

class ArianneThread extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			selectedFamily: {},
			selectedVariant: {},
			family: {},
			variant: {},
			steps: [],
			step: {},
			choice: {},
			indivCurrentGroup: {},
			groups: [],
		};

		this.toggleIndividualize = this.toggleIndividualize.bind(this);
		this.selectVariant = this.selectVariant.bind(this);
		this.selectFamily = this.selectFamily.bind(this);
		this.selectChoice = this.selectChoice.bind(this);
		this.addChoice = this.addChoice.bind(this);
		this.selectStep = this.selectStep.bind(this);
		this.addStep = this.addStep.bind(this);
		this.addFamily = this.addFamily.bind(this);
		this.addVariant = this.addVariant.bind(this);
		this.showCollection = this.showCollection.bind(this);
		this.selectGroup = this.selectGroup.bind(this);
		this.addIndividualizeGroup = this.addIndividualizeGroup.bind(this);
		this.editIndivualizeGroup = this.editIndivualizeGroup.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const store = await this.client.fetch('/prototypoStore');
		const memoizedListSelector = (list = [], selectedValue, oldValue, oldCriteria) => {
			if (list.length > 0 && (selectedValue.name !== oldCriteria.name || selectedValue.name === undefined)) {
				return list.filter((element) => { return selectedValue.name !== element.name; });
			}
			return oldValue || voidStateArray;
		};
		const familySelector = (families, family) => { return families.find((f) => { return f.name === family.name; }); };
		const stepSelector = (steps, step) => { return steps.find((s) => { return s.name === step.name; }); };

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				const family = familySelector(this.props.families, head.toJS().d.family) || (
					this.props.families.length > 0
						? this.props.families[0]
						: voidStateObject
				);

				let steps;
				let step;
				let choice;

				if (head.toJS().d.variant.ptypoLite) {
					step = stepSelector(head.toJS().d.variant.ptypoLite.steps || [], head.toJS().d.step || {}) || (
						this.state.steps.length > 0
							? this.state.steps[0]
							: voidStateObject
					);
					steps = head.toJS().d.variant.ptypoLite.steps;
					if (head.toJS().d.choice && head.toJS().d.choice.name) {
					    choice = head.toJS().d.choice;
					}
                    else if (this.state.steps.length > 0) {
                        choice = step.choices[0];
                    } else choice = {};
				}
				else {
					steps = [];
					step = {};
					choice = {};
				}

				const isFree = HoodieApi.instance && HoodieApi.instance.plan.indexOf('free_') !== -1;
				const isFreeWithCredits = (head.toJS().d.credits && head.toJS().d.credits > 0) && isFree;

				this.setState({
					selectedFamily: head.toJS().d.family,
					selectedVariant: head.toJS().d.variant,
					variant: head.toJS().d.variant,
					groups: memoizedListSelector(head.toJS().d.indivGroups, head.toJS().d.indivCurrentGroup || voidStateObject, this.state.groups, this.state.indivCurrentGroup || voidStateObject),
					indivCreate: head.toJS().d.indivCreate,
					indivMode: head.toJS().d.indivMode,
					indivCurrentGroup: head.toJS().d.indivCurrentGroup || voidStateObject,
					steps,
                    step,
                    choice,
					isFree,
					isFreeWithCredits,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.setState({
			family: familySelector(this.props.families, store.head.toJS().family),
			variant: store.head.toJS().variant,
			groups: memoizedListSelector(store.head.toJS().indivGroups, {}, this.state.groups, voidStateObject),
			steps: store.head.toJS().variant.ptypoLite ? memoizedListSelector(store.head.toJS().variant.ptypoLite.steps, store.head.toJS().step, this.state.steps, voidStateObject) : [],
			step: store.head.toJS().variant.ptypoLite && store.head.toJS().step.name ? stepSelector(store.head.toJS().variant.ptypoLite.steps, store.head.toJS().step) : {},
			choice: store.head.toJS().variant.ptypoLite && store.head.toJS().step.name ? stepSelector(store.head.toJS().variant.ptypoLite.steps, store.head.toJS().step).choices[0] : {},
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectVariant(variant, family) {
		this.client.dispatchAction('/select-variant', {variant, family});
	}

	selectFamily(family) {
		this.client.dispatchAction('/select-variant', {variant: undefined, family});
	}

	addFamily() {
		this.client.dispatchAction('/store-value', {openFamilyModal: true});
	}

	addVariant() {
		this.client.dispatchAction('/store-value', {
			openVariantModal: true,
			familySelectedVariantCreation: this.state.selectedFamily,
		});
	}

	showCollection() {
		this.client.dispatchAction('/store-value', {
			uiShowCollection: true,
			collectionSelectedFamily: this.state.selectedFamily,
			collectionSelectedVariant: this.state.selectedVariant,
		});
	}

	selectStep(step) {
		this.client.dispatchAction('/select-choice', {choice: undefined, step});
	}

	addStep() {
		this.client.dispatchAction('/store-value', {openStepModal: true});
	}

	selectChoice(choice) {
		this.client.dispatchAction('/select-choice', {choice, step: this.state.step});
	}

	addChoice() {
		this.client.dispatchAction('/store-value', {
 			openChoiceModal: true,
			stepSelectedChoiceCreation: this.state.step,
		});
	}

	toggleIndividualize() {
		// if (this.state.isFree && !this.state.isFreeWithCredits) {
		// 	this.client.dispatchAction('/store-value', {openRestrictedFeature: true,
		// 												restrictedFeatureHovered: 'indiv'});
		// }
		// else {
			this.client.dispatchAction('/toggle-individualize');
		// }

	}

	selectGroup(group) {
		this.client.dispatchAction('/store-value', {indivMode: true, indivCurrentGroup: group, indivEditingParams: true});
	}

	addIndividualizeGroup() {
		this.client.dispatchAction('/toggle-individualize', {targetIndivValue: true});
		this.client.dispatchAction('/store-value', {
			indivCreate: true,
		});
	}

	editIndivualizeGroup() {
		this.client.dispatchAction('/toggle-individualize', {targetIndivValue: true});
		this.client.dispatchAction('/store-value', {indivCurrentGroup: this.state.indivCurrentGroup});
		this.client.dispatchAction('/store-value', {indivEdit: !!this.state.indivCurrentGroup.name});
	}

	groupToElement(group) {
		const glyphs = _.map(group.glyphs, (glyph) => {
			return String.fromCharCode(glyph);
		}).join('');

		return (
			<div>
				<span>{group.name}</span> - <span className="indiv-group-infos-glyphs-list">{glyphs}</span>
			</div>
		);
	}

	render() {
		const {selectedFamily, selectedVariant} = this.state;
		const {families} = this.props;

		if (families.length === 0) {
			// TODO: use <Redirect /> when migrating over React Router 4
			return <p>Loading...</p>;
		}

		const family = families.find(({name}) => name === selectedFamily.name) || families[0];
		const variant = family.variants.find(({name}) => name === selectedVariant.name) || family.variants[0];

		const addFamily = <ArianneDropMenuItem item={{name: 'Add new family...'}} click={this.addFamily}/>;
		const familyItem = (
			<DropArianneItem
				label={family.name}
				list={families}
				add={addFamily}
				click={this.selectFamily}
				toggleId="arianne-item-family"
			/>
		);

		const addVariant = <ArianneDropMenuItem item={{name: 'Add new variant...'}} click={this.addVariant}/>;
		const variantItem = (
				<DropArianneItem
					label={variant.name}
					family={family}
					variant={variant}
					list={family.variants ? family.variants.filter(({name}) => { return name !== this.state.variant.name; }) : []}
					add={addVariant}
					click={this.selectVariant}
					toggleId="arianne-item-variant"/>
		);

		const addGroup = [
			<ArianneDropMenuItem key="edit" item={{name: 'Edit groups...'}} click={this.editIndivualizeGroup}/>,
			<ArianneDropMenuItem key="add" item={{name: 'Add new group...'}} click={this.addIndividualizeGroup}/>,
		];

		const addStep = <ArianneDropMenuItem item={{name: 'Add new step...'}} click={this.addStep}/>;
		const stepItem = (
				<DropArianneItem
					label={this.state.step ? this.state.step.name : ''}
					list={this.state.steps || []}
					add={addStep}
					click={this.selectStep}
					toggleId="arianne-item-step"/>
		);

		const addChoice = <ArianneDropMenuItem item={{name: 'Add new choice...'}} click={this.addChoice}/>;
		const choiceItem = (
				<DropArianneItem
					label={this.state.choice ? this.state.choice.name : ''}
					step={this.state.step || {}}
					list={this.state.step && this.state.step.choices ? this.state.step.choices.filter(({name}) => { return name !== this.state.choice.name; }) : []}
					add={addChoice}
					click={this.selectChoice}
					toggleId="arianne-item-choice"/>
		);

		const groupClasses = classNames({
			'arianne-item': true,
			'is-active': this.state.indivMode,
			'is-creating': this.state.indivCreate,
			// 'is-demo': isFreeWithoutCredits,
		});
		const groupLabel = this.state.indivCreate
			? 'Creating new group...'
			: 'All glyphs';
		const groupName = this.state.indivCurrentGroup.name || groupLabel;
		const group = this.state.groups && (this.state.groups.length > 0 || this.state.indivCurrentGroup.name)
			? <DropArianneItem
				label={groupName}
				list={this.state.groups}
				itemToEl={this.groupToElement}
				add={addGroup}
				click={this.selectGroup}
				toggleId="arianne-item-group"
			/>
			: <ActionArianneItem
				className={groupClasses}
				label={groupLabel}
				img="assets/images/arianne-plus.svg"
				click={this.toggleIndividualize}
				toggleId="arianne-item-group"/>;

		return (
			<div className="arianne-thread">
				<RootArianneItem click={this.showCollection}/>
				{familyItem}
				{variantItem}
				{stepItem}
				{choiceItem}
				{group}
			</div>
		);
	}
}

ArianneThread.propTypes = {
};

ArianneThread.defaultProps = {
	families: [],
};

export default graphql(libraryQuery, {
	options: {
		fetchPolicy: 'cache-first', // this prevents any empty state for now
	},
	props: ({data}) => {
		if (data.loading) {
			return {loading: true};
		}

		return {
			families: data.user.library,
		};
	},
})(ArianneThread);

class RootArianneItem extends React.Component {
	render() {
		return (
			<div className="arianne-item" onClick={this.props.click}>
				<div className="arianne-item-action">
					<span className="arianne-item-action-collection">My projects</span>
				</div>
				<div className="arianne-item-arrow"></div>
			</div>
		);
	}
}

class DropArianneItem extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			arianneItemDisplayed: undefined,
		};

		this.toggleDisplay = this.toggleDisplay.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const {head} = await this.client.fetch('/prototypoStore');

		this.setState({
			arianneItemDisplayed: head.toJS().arianneItemDisplayed,
		});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((store) => {
				this.setState({
					arianneItemDisplayed: store.toJS().d.arianneItemDisplayed,
				});
			})
			.onDelete(() => {
				this.setState({
					arianneItemDisplayed: undefined,
				});
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleDisplay() {

		if (this.state.arianneItemDisplayed === this.props.toggleId) {
			this.client.dispatchAction('/store-value', {
				arianneItemDisplayed: undefined,
			});
		}
		else {
			this.client.dispatchAction('/store-value', {
				arianneItemDisplayed: this.props.toggleId,
			});

			const selector = '#topbar, #workboard';
			const outsideClick = () => {
				this.client.dispatchAction('/store-value', {
					arianneItemDisplayed: undefined,
				});
				_.each(document.querySelectorAll(selector), (item) => {
					item.removeEventListener('click', outsideClick);
				});
			};

			_.each(document.querySelectorAll(selector), (item) => {
				item.addEventListener('click', outsideClick);
			});
		}
	}

	render() {
		const classes = classNames({
			'arianne-item': true,
			'arianne-item-displayed': this.state.arianneItemDisplayed === this.props.toggleId,
		});

		return (
			<div className={classes} onClick={this.toggleDisplay}>
				<div className="arianne-item-action" >
					<span className="arianne-item-action-label">{this.props.label}</span>
					<span className="arianne-item-action-drop arianne-item-action-img"></span>
				</div>
				<div className="arianne-item-arrow"></div>
				<ArianneDropMenu
					list={this.props.list}
					click={this.props.click}
					family={this.props.family}
					add={this.props.add}
					itemToEl={this.props.itemToEl}
				/>
			</div>
		);
	}
}

class ArianneDropMenu extends React.PureComponent {
	render() {
		const items = this.props.list.map((item) => {
			return <ArianneDropMenuItem
				item={item}
				key={item.name}
				click={this.props.click}
				family={this.props.family}
				itemToEl={this.props.itemToEl}/>;
		});

		return (
			<ul className="arianne-drop-menu">
				{items}
				{this.props.add}
			</ul>
		);
	}
}

class ArianneDropMenuItem extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.click(this.props.item, this.props.family);
	}

	render() {
		const item = this.props.itemToEl
			? this.props.itemToEl(this.props.item)
			: this.props.item.name;

		return (
			<li className="arianne-drop-menu-item" onClick={this.handleClick}>
				{item}
			</li>
		);
	}
}

class ActionArianneItem extends React.Component {
	render() {
		const classes = this.props.className || 'arianne-item';

		return (
			<div className={classes} onClick={this.props.click}>
				<div className="arianne-item-action">
					{this.props.label}
					<img className="arianne-item-action-plus arianne-item-action-img" src={this.props.img}/>
				</div>
				<div className="arianne-item-arrow"></div>
			</div>
		);
	}
}
