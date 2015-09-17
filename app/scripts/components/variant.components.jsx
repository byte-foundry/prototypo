import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Classnames from 'classnames';

export class VariantList extends React.Component {
	render() {
		const variants = _.map(this.props.variants, (variant) => {
			if (this.props.selected && variant.name === this.props.selected.name) {
				return <Variant data={variant} family={this.props.family} selected={true}/>
			}
			else {
				return <Variant data={variant} family={this.props.family}/>
			}
		})
		return (
			<div className="variant-list">
				{variants}
				<AddVariant />
			</div>
		);
	}
}

export class Variant extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectVariant() {
		this.client.dispatchAction('/select-variant',{variant:this.props.data, family:this.props.family});
	}

	render() {
		const classes = Classnames({
			variant: true,
			'is-active': this.props.selected,
		});

		return (
			<div className={classes} onClick={() => {this.selectVariant()} }>
				<img className="variant-caret variant-caret-closed" src="/assets/images/list-icon-closed.svg"></img>
				<img className="variant-caret variant-caret-open" src="/assets/images/list-icon-open.svg"></img>
				<div className="variant-name">
					{this.props.data.name}
				</div>
			</div>
		);
	}
}

export class AddVariant extends React.Component {
	render() {
		return (
			<div className="variant">
				<img className="variant-caret" src="/assets/images/add-icon.svg"></img>
				<div className="variant-name">
					Add a variant
				</div>
			</div>
		);
	}
}
