import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Classnames from 'classnames';
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
		const classes = Classnames({
			variant: true,
			'is-active': this.props.selected,
			'flipping-variant': true,
			'is-flipped': this.state.flipped,
		});

		const editClasses = Classnames({
			'variant-edit': true,
			'is-active': this.state.display === 'edit',
		});

		const deleteClasses = Classnames({
			'variant-delete': true,
			'is-active': this.state.display === 'delete',
		});
		const deleteBtn = this.props.family.variants.length > 1 ? (
				<div className="variant-button variant-hover" onClick={(e) => { this.flip(e, "delete"); }}>
					DELETE
				</div>
			) : false;

		return (
			<div className={classes} onClick={() => {this.selectVariant();} } onMouseLeave={() => {this.deactivate();}} onMouseEnter={() => {this.delayDeactivate();}}>
				<div className="flipping-variant-recto">
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
				<div className="flipping-variant-verso" onClick={(e) => { this.flip(e); }}>
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

export class AddVariant extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/fontLibrary', this.lifespan)
		.onUpdate(({head}) => {
				if (head.toJS().errorAddVariant !== this.state.error) {
					this.setState({
						error: head.toJS().errorAddVariant,
					});
				}
				if (head.toJS().errorAddVariant === undefined) {
					this.setState({
						flipped: false,
					});
				}
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.setState({
			flipped: false,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	flip(e) {
		if (e.target.nodeName !== "INPUT") {
			this.setState({
				flipped: !this.state.flipped,
			});
		}

		this.setState({
			error: undefined,
		});
	}

	createVariant(e, name) {
		e.stopPropagation();
		this.client.dispatchAction('/create-variant', {
			name,
			familyName: this.props.familyName,
		});
		Log.ui('Collection.createVariant');
	}

	render() {
		const classes = Classnames({
			variant: true,
			'flipping-variant': true,
			'is-flipped': this.state.flipped,
		});

		return (
			<div className={classes} onClick={(e) => { this.flip(e); }} ref="container">
				<div className="flipping-variant-recto">
					<img className="variant-caret" src="/assets/images/add-icon.svg"></img>
					<div className="variant-name">
						Add a variant
					</div>
				</div>
				<div className="flipping-variant-verso">
					<img className="variant-caret" src="/assets/images/font-infos.svg"></img>
					<TextWithSuggestion suggestions={this.variants} validate={(name, e) => {this.createVariant(e, name);}}></TextWithSuggestion>
					<div className="variant-error">{this.state.error}</div>
				</div>
			</div>
		);
	}
}

class TextWithSuggestion extends React.Component {
	render() {
		return (
			<div className="text-suggestion">
				<input className="text-suggestion-input" list="suggestions" type="text" defaultValue={this.props.value} placeholder="Enter a variant or choose a suggestion" ref="text"></input>
				<div className="text-suggestion-button" onClick={(e) => { this.props.validate(this.refs.text.value, e); }}>Save</div>
			</div>
		);
	}
}
