import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import classNames from 'classnames';
import Lifespan from 'lifespan';
import Log from '../services/log.services.js';

export class VariantList extends React.Component {
	render() {
		const variants = _.map(this.props.variants, (variant) => {
			if (this.props.selected && variant.name === this.props.selected.name) {
				return <Variant key={variant.id} data={variant} family={this.props.family} selected={true}/>;
			}
			else {
				return <Variant key={variant.id} data={variant} family={this.props.family}/>;
			}
		});

		return (
			<div className="variant-list">
				{variants}
				<AddVariant familyName={this.props.family.name}/>
			</div>
		);
	}
}

export class Variant extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectVariant() {
		this.client.dispatchAction('/select-variant', {variant: this.props.data, family: this.props.family});
	}

	flip(e, display) {
		e.stopPropagation();
		if (e.target.nodeName !== "INPUT") {
			this.setState({
				flipped: !this.state.flipped,
				display,
			});
		}
	}

	deactivate() {
		this.deactivation = setTimeout(() => {
			this.setState({
				flipped: false,
				display: undefined,
			});
		}, 1500);
	}

	delayDeactivate() {
		clearTimeout(this.deactivation);
	}

	editVariant(name) {
		this.client.dispatchAction('/edit-variant', {variant: this.props.data, family: this.props.family, newName: name});
		Log.ui('Collection.editVariant');
	}

	deleteVariant() {
		this.client.dispatchAction('/delete-variant', {variant: this.props.data, familyName: this.props.family.name});
		Log.ui('Collection.deleteVariant');
	}

	render() {
		const rectoClasses = classNames({
			'flipping-variant-recto': true,
			'is-active': this.props.selected,
			'is-flipped': this.state.flipped,
		});

		const versoClasses = classNames({
			'flipping-variant-verso': true,
			'is-active': this.props.selected,
			'is-flipped': this.state.flipped,
		});

		const editClasses = classNames({
			'variant-edit': true,
			'is-active': this.state.display === 'edit',
		});

		const deleteClasses = classNames({
			'variant-delete': true,
			'is-active': this.state.display === 'delete',
		});
		const deleteBtn = this.props.family.variants.length > 1 ? (
				<div className="variant-button variant-hover" onClick={(e) => { this.flip(e, "delete"); }}>
					DELETE
				</div>
			) : false;

		return (
			<div className="variant flipping-variant" onClick={() => {this.selectVariant();} } onMouseLeave={() => {this.deactivate();}} onMouseEnter={() => {this.delayDeactivate();}}>
				<div className={rectoClasses}>
					<img className="variant-caret variant-caret-closed" src="/assets/images/list-icon-closed.svg"></img>
					<img className="variant-caret variant-caret-open" src="/assets/images/list-icon-open.svg"></img>
					<div className="variant-name">
						{this.props.data.name}
					</div>
					<div className="variant-button variant-hover" onClick={(e) => { this.flip(e, "edit"); }}>
						EDIT
					</div>
					{deleteBtn}
				</div>
				<div className={versoClasses} onClick={(e) => { this.flip(e); }}>
					<div className={editClasses}>
						<img className="variant-caret" src="/assets/images/font-infos.svg"></img>
						<TextWithSuggestion value={this.props.data.name} validate={(name) => {this.editVariant(name);}}></TextWithSuggestion>
					</div>
					<div className={deleteClasses}>
						<img className="variant-caret" src="/assets/images/font-infos.svg"></img>
						Delete this variant
						<div className="variant-button" onClick={() => {this.deleteVariant();}}>YES</div>
						<div className="variant-button" onClick={(e) => { this.flip(e); }}>NO</div>
					</div>
				</div>
			</div>
		);
	}
}
