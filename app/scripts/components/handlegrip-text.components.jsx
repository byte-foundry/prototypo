import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import DOM from '../helpers/dom.helpers.js';

/**
*	Component : Text in prototypo-word
*	Where you can set spacing on a specific letter
*	@extends React.Component
*/
export default class HandlegripText extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uiWordSelection: 0,
			letterSpacingLeft: 0,
			letterSpacingRight: 0,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.handleUp = this.handleUp.bind(this);
		this.handleMove = this.handleMove.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					uiWordSelection: head.toJS().uiWordSelection || 0,
					letterSpacingLeft: head.toJS().letterSpacingLeft || 0,
					letterSpacingRight: 0,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentDidMount() {
		const handlegripDOM = ReactDOM.findDOMNode(this);

		handlegripDOM.addEventListener('mouseup', this.handleUp);
		handlegripDOM.addEventListener('mousemove', this.handleMove);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleUp(e) {
		if (!this.refs.selectedLetter.tracking) {
			return;
		}

		this.refs.selectedLetter.tracking = false;

		/*
		this.client.dispatchAction('/change-param', {
			value: this.props.value,
			name: this.props.name,
			label: this.props.label,
			force: true,
		});
		*/

		e.stopPropagation();
	}

	handleMove(e) {
		if (!this.refs.selectedLetter.tracking) {
			return;
		}

		const newX = e.pageX || e.screenX;
		const el = ReactDOM.findDOMNode(this);
		const {offsetLeft} = DOM.getAbsOffset(el);
		let newValue;

		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			const variation = (
				(newX - this.currentX) /* / this.sliderWidth  * (this.props.max - this.props.min)*/
			);

			newValue = /*this.props.value*/ this.state.letterSpacingLeft + variation;

			// newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);
		}
		else {
			newValue = newX < offsetLeft ? /*this.props.min*/ 0 : /*this.props.max*/ 100;
		}

		/*
		this.client.dispatchAction('/change-param', {
			value: newValue,
			name: this.props.name,
		});
		*/
		this.client.dispatchAction('/store-value', {letterSpacingLeft: newValue});

		this.currentX = newX;
	}

	render() {
		const selectedLetter = this.state.uiWordSelection;
		const letterComponents = _.map(this.props.text.split(''), (letter, index) => {
			return (
				selectedLetter === index
				? (
					<HandlegripLetter
						letter={letter}
						ref="selectedLetter"
						spacingLeft={this.state.letterSpacingLeft}
						spacingRight={this.state.letterSpacingRight}
						min={0}
						max={100}
						key={index}
					/>
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

/**
*	Component : letter where you can set spacing
*	With a drag'n'dropable handlegrip
*	@extends React.Component
*/
class HandlegripLetter extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.handleDown = this.handleDown.bind(this);
	}

	handleDown(e) {
		if (this.props.disabled) {
			return;
		}

		this.tracking = true;

		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(this.refs.handlegripLeft);
		let newValue = (
			((newX - offsetLeft) /* / this.sliderWidth */ * (this.props.max - this.props.min))
			+ this.props.min
		);

		newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);

		/*
		this.client.dispatchAction('/change-param', {
			value: newValue,
			name: this.props.name,
			label: this.props.label,
		});
		*/

		this.currentX = newX;

		e.stopPropagation();
	}

	render() {
		const styleHandlegripLeft = {
			left: this.props.spacingLeft,
		};
		const styleHandlegripRight = {
			right: this.props.spacingRight,
		};

		return (
			<span className="letter-wrap">
				<span
					className="handlegrip handlegrip-left"
					ref="handlegripLeft"
					onMouseDown={this.handleDown}
					style={styleHandlegripLeft}
				>
					<span className="handlegrip-border"></span>
					<span className="handlegrip-scale-left"></span>
					<span className="handlegrip-spacing-number">
						{this.props.spacingLeft}
					</span>
				</span>
				<span className="letter-wrap-wrap">
					<span className="letter-wrap-letter">
						{this.props.letter}
					</span>
					<span className="handlegrip-spacing-number">
						450
					</span>
				</span>
				<span
					className="handlegrip handlegrip-right"
					ref="handlegripRight"
					onMouseDown={this.handleDown}
					style={styleHandlegripRight}
				>
					<span className="handlegrip-border"></span>
					<span className="handlegrip-scale-right"></span>
					<span className="handlegrip-spacing-number">
						{this.props.spacingRight}
					</span>
				</span>
			</span>
		);
	}
}

/**
*	Component : a regular letter
*	@extends React.Component
*/
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
