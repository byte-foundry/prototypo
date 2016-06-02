import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '~/stores/local-client.stores.jsx';

export default class ArianneThread extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			families: [],
			selection: {
				family: {},
				variant: {},
			},
		};
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const families = await this.client.fetch('/fontLibrary');
		const fontVariant = await this.client.fetch('/fontVariant');

		this.client.getStore('/fontLibrary', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					families: head.toJS().fonts,
				});
			})
			.onDelete(() => {
				this.setState({
					families: undefined,
				});
			});

		this.client.getStore('/fontVariant', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					selection: head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState({
					selection: undefined,
				});
			});

		this.setState({
			families: families.head.toJS().fonts,
			selection: fontVariant.head.toJS(),
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
		this.client.dispatchAction('/open-create-family-modal', {});
	}

	addVariant() {
	}

	showCollection() {
		this.client.dispatchAction('/store-panel-param', {showCollection: true});
	}

	render() {
		const variantFamily = _.find(this.state.families, (family) => {
			return family.name === this.state.selection.family.name;
		});

		const variants = variantFamily
			? variantFamily.variants
			: [];

		const addFamily = <ArianneDropMenuItem item={{name: 'Add new family...'}} click={this.addFamily.bind(this)}/>
		const addVariant = <ArianneDropMenuItem item={{name: 'Add new variant...'}} click={this.addVariant.bind(this)}/>

		return (
			<div className="arianne-thread">
				<RootArianneItem click={this.showCollection.bind(this)}/>
				<DropArianneItem
					label={this.state.selection.family.name}
					list={this.state.families}
					add={addFamily}
					click={this.selectFamily.bind(this)}/>
				<DropArianneItem
					label={this.state.selection.variant.name}
					family={this.state.selection.family}
					variant={this.state.selection.variant}
					list={variants}
					add={addVariant}
					click={this.selectVariant.bind(this)}/>
				<ActionArianneItem label="group" img="assets/images/arianne-plus.svg"/>
			</div>
		);
	}
}

class RootArianneItem extends React.Component {
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
	render() {
		return (
			<div className="arianne-item">
				<div className="arianne-item-action">
					{this.props.label}
					<img className="arianne-item-action-plus arianne-item-action-img" src={this.props.img}/>
				</div>
				<div className="arianne-item-arrow"></div>
			</div>
		);
	}
}
