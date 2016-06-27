import React from 'react';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ClassNames from 'classnames';

import LocalClient from '~/stores/local-client.stores.jsx';

export default class ArianneThread extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			families: [],
			family: {},
			variant: {},
		};
		this.toggleIndividualize = this.toggleIndividualize.bind(this);
		this.selectVariant = this.selectVariant.bind(this);
		this.selectFamily = this.selectFamily.bind(this);
		this.addFamily = this.addFamily.bind(this);
		this.addVariant = this.addVariant.bind(this);
		this.showCollection = this.showCollection.bind(this);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const store = await this.client.fetch('/prototypoStore');

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					families: head.toJS().fonts,
					family: head.toJS().family,
					variant: head.toJS().variant,
					groups: head.toJS().indivGroups,
					indivCreate: head.toJS().indivCreate,
					indivMode: head.toJS().indivMode,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.setState({
			families: store.head.toJS().fonts,
			variant: store.head.toJS().variant,
			family: store.head.toJS().family,
			groups: store.head.toJS().indivGroups,
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
			familySelectedVariantCreation: this.state.family,
		});
	}

	showCollection() {
		this.client.dispatchAction('/store-value', {uiShowCollection: true});
	}

	toggleIndividualize() {
		this.client.dispatchAction('/toggle-individualize');
	}

	render() {
		const variantFamily = _.find(this.state.families, (family) => {
			return family.name === this.state.family.name;
		});

		const variants = variantFamily
			? variantFamily.variants
			: [];

		const addFamily = <ArianneDropMenuItem item={{name: 'Add new family...'}} click={this.addFamily}/>
		const addVariant = <ArianneDropMenuItem item={{name: 'Add new variant...'}} click={this.addVariant}/>

		const groupImg = this.state.groups && this.state.groups.length > 0
			? "assets/images/drop.svg"
			: "assets/images/arianne-plus.svg";

		const groupClasses = ClassNames({
			'arianne-item': true,
			'is-active': this.state.indivMode,
			'is-creating': this.state.indivCreate,
		});

		const groupLabel = this.state.indivCreate
			? 'Creating new group...'
			: 'Group';

		return (
			<div className="arianne-thread">
				<RootArianneItem click={this.showCollection}/>
				<DropArianneItem
					label={this.state.family.name}
					list={this.state.families}
					add={addFamily}
					click={this.selectFamily}/>
				<DropArianneItem
					label={this.state.variant.name}
					family={this.state.family}
					variant={this.state.variant}
					list={variants}
					add={addVariant}
					click={this.selectVariant}/>
				<ActionArianneItem className={groupClasses} label={groupLabel} img={groupImg} click={this.toggleIndividualize}/>
			</div>
		);
	}
}

class RootArianneItem extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<div className="arianne-item is-small" onClick={this.props.click}>
				<div className="arianne-item-action is-small">
					<img className="arianne-item-action-collection" src="assets/images/collection.svg"/>
				</div>
				<div className="arianne-item-arrow"></div>
			</div>
		);
	}
}

class DropArianneItem extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<div className="arianne-item">
				<div className="arianne-item-action">
					{this.props.label}
					<img className="arianne-item-action-drop arianne-item-action-img" src="assets/images/drop.svg"/>
				</div>
				<div className="arianne-item-arrow"></div>
				<ArianneDropMenu
					list={this.props.list}
					click={this.props.click}
					family={this.props.family}
					add={this.props.add}
				/>
			</div>
		);
	}
}

class ArianneDropMenu extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const items = this.props.list.map((item) => {
			return <ArianneDropMenuItem item={item} key={item.name} click={this.props.click} family={this.props.family}/>;
		});

		return (
			<ul className="arianne-drop-menu">
				{items}
				{this.props.add}
			</ul>
		);
	}
}

class ArianneDropMenuItem extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<li className="arianne-drop-menu-item" onClick={() => {
				this.props.click(this.props.item, this.props.family);
			}}>
				{this.props.item.name}
			</li>
		);
	}
}

class ActionArianneItem extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

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
