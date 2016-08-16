import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import DOM from '../helpers/dom.helpers.js';
import classNames from 'classnames';

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
			tracking: undefined,
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
					letterSpacingRight: head.toJS().letterSpacingRight || 0,
					tracking: head.toJS().uiSpacingTracking,
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
		if (!this.state.tracking) {
			return;
		}

		// tells everyone to stop tracking
		this.client.dispatchAction('/store-value', {uiSpacingTracking: false});

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
		if (!this.state.tracking) {
			return;
		}

		const leftSideTracking = this.state.tracking === 'left';
		const newX = e.pageX || e.screenX;
		const el = ReactDOM.findDOMNode(this);
		const {offsetLeft} = DOM.getAbsOffset(el);
		let newValue;

		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			const variation = (
				(newX - (leftSideTracking ? this.leftCurrentX : this.rightCurrentX))
				 /* / this.sliderWidth  * (this.props.max - this.props.min)*/
			);

			newValue = /*this.props.value*/ (leftSideTracking ? this.state.letterSpacingLeft : this.state.letterSpacingRight) + variation;

			// newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);
		}
		else {
			newValue = newX < offsetLeft ? /*this.props.min*/ 0 : /*this.props.max*/ 100;
		}

		// if we are currently tracking left side spacing
		if (leftSideTracking) {
			// set the new spacing value
			this.client.dispatchAction('/store-value', {letterSpacingLeft: newValue});
			this.leftCurrentX = newX;
		}
		else {
			this.client.dispatchAction('/store-value', {letterSpacingRight: newValue});
			this.rightCurrentX = newX;
		}

		/*
		this.client.dispatchAction('/change-param', {
			value: newValue,
			name: this.props.name,
		});
		*/
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
*	Component : a letter where you can set spacing
*	With a drag'n'dropable handlegrip
*	@extends React.Component
*/
class HandlegripLetter extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const styleHandlegripLeft = {
			left: this.props.spacingLeft,
		};
		const styleHandlegripRight = {
			right: -(this.props.spacingRight),
		};

		return (
			<span className="letter-wrap">
				<Handlegrip
					side="left"
					style={styleHandlegripLeft}
					spacing={this.props.spacingLeft}
					min={this.props.min}
					max={this.props.max}
				/>
				<span className="letter-wrap-wrap">
					<span className="letter-wrap-letter">
						{this.props.letter}
					</span>
					<span className="handlegrip-spacing-number">
						450
					</span>
				</span>
				<Handlegrip
					side="right"
					style={styleHandlegripRight}
					spacing={this.props.spacingRight}
					min={this.props.min}
					max={this.props.max}
				/>
			</span>
		);
	}
}


/**
*	Component : the handlegrip (green bar) surrounding the letter
*	@extends React.Component
*/
class Handlegrip extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.handleDown = this.handleDown.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleDown(e) {
		// tells everyone that the tacking begins
		this.client.dispatchAction('/store-value', {uiSpacingTracking: this.props.side});

		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(ReactDOM.findDOMNode(this));
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

		e.stopPropagation();
	}

	render() {
		const left = this.props.side === 'left';
		const handleGripClasses = classNames({
			'handlegrip': true,
			'handlegrip-left': left,
			'handlegrip-right': !left,
		});
		const scaleClasses = classNames({
			'handlegrip-scale-left': left,
			'handlegrip-scale-right': !left,
		});

		return (
			<span
				className={handleGripClasses}
				onMouseDown={this.handleDown}
				style={this.props.style}
			>
				<span className="handlegrip-border"></span>
				<span className={scaleClasses}></span>
				<span className="handlegrip-spacing-number">
					{this.props.spacing}
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
