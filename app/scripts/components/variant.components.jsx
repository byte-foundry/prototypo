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
				<AddVariant familyName={this.props.family.name}/>
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
	componentWillMount() {
		this.client = LocalClient.instance();

		this.setState({
			flipped:false,
		});

		this.variants = [
			'THIN', //20
			'THIN ITALIC',
			'LIGHT', //50
			'LIGHT ITALIC',
			'BOOK', //70
			'BOOK ITALIC',
			'REGULAR',
			'REGULAR ITALIC',
			'SEMI-BOLD', //100
			'SEMI-BOLD ITALIC',
			'BOLD', //115
			'BOLD ITALIC',
			'EXTRA-BOLD', //135
			'EXTRA-BOLD ITALIC',
			'BLACK', //150
			'BLACK ITALIC',
		]
	}

	flip(e) {
		if (e.target == React.findDOMNode(this.refs.container)) {
			this.setState({
				flipped:!this.state.flipped,
			});
		}
	}

	createVariant(name) {
		this.client.dispatchAction('/create-variant',{
			name,
			familyName: this.props.familyName,
		});
		this.setState({
			flipped:false,
		});
	}

	render() {
		const classes = Classnames({
			variant:true,
			'flipping-variant': true,
			'is-flipped': this.state.flipped,
		});
		return (
			<div className={classes} onClick={(e) => { this.flip(e) }} ref="container">
				<div className="flipping-variant-recto">
					<img className="variant-caret" src="/assets/images/add-icon.svg"></img>
					<div className="variant-name">
						Add a variant
					</div>
				</div>
				<div className="flipping-variant-verso">
					<img className="variant-caret" src="/assets/images/font-infos.svg"></img>
					<TextWithSuggestion suggestions={this.variants} validate={(name) => {this.createVariant(name)}}></TextWithSuggestion>
				</div>
			</div>
		);
	}
}

class TextWithSuggestion extends React.Component {
	render() {
		const suggestions = _.map(this.props.suggestions, (suggestion) => {
			return <option className="text-suggestion-list-item" value={suggestion}/>;
		});
		return (
			<div className="text-suggestion">
				<input className="text-suggestion-input" list="suggestions" type="text" placeholder="Enter a variant or choose a suggestion" ref="text"></input>
				<datalist id="suggestions">
					{suggestions}
				</datalist>
				<button className="text-suggestion-button" onClick={() => { this.props.validate(React.findDOMNode(this.refs.text).value) }}>Save</button>
			</div>
		)
	}
}
