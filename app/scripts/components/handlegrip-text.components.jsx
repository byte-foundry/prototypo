import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

export default class HandlegripText extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uiWordSelection: 0,
			letterSpacing: 0,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					uiWordSelection: head.toJS().uiWordSelection,
					//letterSpacing: head.toJS().letterSpacing,
					letterSpacing: 0,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	/**
	*	returns the letter to select (text at the right index)
	*	@return {string} the letter
	*/
	getSelectedLetter() {
		const selectedIndex = this.state.uiWordSelection;

		if (selectedIndex >= 0 && this.props.text && selectedIndex < this.props.text.length) {
			return this.props.text[selectedIndex];
		}
		else {
			return null;
		}
	}

	render() {
		const selectedLetter = this.getSelectedLetter();
		const letterComponents = _.map(this.props.text, (letter, index) => {
			return (
				selectedLetter === letter
				? (
					<HandlegripLetter letter={letter} key={index}/>
				)
				: (
					<RegularLetter letter={letter} key={index} index={index}/>
				)
			);
		});

		return (
			<div
				className="prototypo-word-string"
				spellCheck="false"
				style={this.props.style}
			>
				{letterComponents}
			</div>
		);
	}
}

class HandlegripLetter extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<span className="letter-wrap">
				<span className="handlegrip handlegrip-left">
					<span className="handlegrip-border"></span>
					<span className="handlegrip-spacing-number">
						50
					</span>
				</span>
				<span className="letter-wrap-wrap">
					<span className="letter-wrap-letter">
						{this.props.letter}
					</span>
					<span className="handlegrip-spacing-number">
						450
					</span>
					<span className="handlegrip-scale-left"></span>
					<span className="handlegrip-scale-right"></span>
				</span>
				<span className="handlegrip-right">
					<span className="handlegrip-border"></span>
					<span className="handlegrip-spacing-number">
						50
					</span>
				</span>
			</span>
		);
	}
}

class RegularLetter extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.selectLetter = this.selectLetter.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectLetter() {
		this.client.dispatchAction('/store-value', {uiWordSelection: this.props.index});
	}

	render() {
		return (
			<span className="letter-wrap" onDoubleClick={this.selectLetter}>
				{this.props.letter}
			</span>
		);
	}
}
