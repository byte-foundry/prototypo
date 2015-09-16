import React from 'react';

export class VariantList extends React.Component {
	render() {
		const variants = _.map(this.props.variants, (variant) => {
			return <Variant data={variant}/>
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
	render() {
		return (
			<div className="variant">
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
