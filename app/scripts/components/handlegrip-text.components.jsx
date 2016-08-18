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
			uiWordHandleWidth: 0,
			letterSpacingLeft: 0,
			letterSpacingRight: 0,
			tracking: undefined,
			fontValues: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.handleUp = this.handleUp.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.handleSelectstart = this.handleSelectstart.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const undoableStore = await this.client.fetch('/undoableStore');

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					uiWordSelection: head.toJS().uiWordSelection || 0,
					uiWordHandleWidth: head.toJS().uiWordHandleWidth || 0,
					letterSpacingLeft: head.toJS().letterSpacingLeft || 0,
					letterSpacingRight: head.toJS().letterSpacingRight || 0,
					tracking: head.toJS().uiSpacingTracking,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		const fontValues = undoableStore.get('controlsValues');

		this.setState({fontValues});

		// make sure there is no selection while dragging
		document.addEventListener('selectstart', this.handleSelectstart);
	}

	componentDidMount() {
		const handlegripDOM = ReactDOM.findDOMNode(this);

		handlegripDOM.addEventListener('mouseup', this.handleUp);
		handlegripDOM.addEventListener('mousemove', this.handleMove);
	}

	componentWillUnmount() {
		const handlegripDOM = ReactDOM.findDOMNode(this);

		this.lifespan.release();

		document.removeEventListener('selectstart', this.handleSelectstart);
		handlegripDOM.removeEventListener('mouseup', this.handleUp);
		handlegripDOM.removeEventListener('mousemove', this.handleMove);
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

		// if this expression is true, the user might have left the draggin zone while dragging
		// and might be trying to come back without the mouse being down
		// in that case we cancel operations because it might lead to an unclear state of dragging
		// event.button and event.buttons work differently but both false means no button pressed
		if (!e.button && !e.buttons) {
			return;
		}

		const leftSideTracking = this.state.tracking === 'left';
		const newX = e.pageX || e.screenX;
		const el = ReactDOM.findDOMNode(this);
		const {offsetLeft} = DOM.getAbsOffset(el);
		let newValue;

		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			const variation = (
				newX - (leftSideTracking ? this.leftCurrentX : this.rightCurrentX)
			);

			newValue = (
				(leftSideTracking ? this.state.letterSpacingLeft : this.state.letterSpacingRight)
				+ variation
			);

			newValue = leftSideTracking
				? Math.min(Math.max(newValue, (-this.props.max)), this.props.min)
				: Math.min(Math.max(newValue, this.props.min), this.props.max);
		}
		else {
			newValue = newX < offsetLeft ? this.props.min : this.props.max;
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

		this.client.dispatchAction('/change-letter-spacing', {
			value: Math.abs(newValue),
			side: this.state.tracking,
			letter: this.getSelectedLetter(),
		});
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

	handleSelectstart(e) {
		// warning : this does not seem to work on "input" tags
		if (this.state.tracking) {
			return e.preventDefault();
		}
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
		this.state = {
			offsetWidth: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentDidMount() {
		this.setState({offsetWidth: this.refs.letterWrapWrap.offsetWidth});
	}

	render() {
		const spacingLeft = Math.abs(this.props.spacingLeft);
		const spacingRight = Math.abs(this.props.spacingRight);
		const totalWidth = this.state.offsetWidth + spacingLeft + spacingRight;
		const glyphSet = fontInstance.font.glyphs;
		const currGlyph = glyphSet[this.props.letter];

		console.log(currGlyph);

		return (
			<span className="letter-wrap">
				<Handlegrip
					side="left"
					spacing={spacingLeft}
					min={this.props.min}
					max={this.props.max}
					letter={this.props.letter}
				/>
				<span ref="letterWrapWrap" className="letter-wrap-wrap">
					<span className="letter-wrap-letter">
						{this.props.letter}
					</span>
					<span className="handlegrip-scales">
						<span className="handlegrip-scale-left"></span>
						<span className="handlegrip-scale-right"></span>
					</span>
					<span className="handlegrip-spacing-number">
						{totalWidth}
					</span>
				</span>
				<Handlegrip
					side="right"
					spacing={spacingRight}
					min={this.props.min}
					max={this.props.max}
					letter={this.props.letter}
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

	componentDidMount() {
		// retrieve and publicly store the width of the current element
		this.client.dispatchAction('/store-value', {
			'uiWordHandleWidth': ReactDOM.findDOMNode(this).offsetWidth,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleDown(e) {
		const leftSideTracking = this.props.side === 'left';

		// tells everyone that the tracking begins
		this.client.dispatchAction('/store-value', {uiSpacingTracking: this.props.side});

		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(ReactDOM.findDOMNode(this));
		const variation = newX - offsetLeft;
		let newValue = (
			this.props.min
			+ (
				leftSideTracking
					? -(this.props.spacing - variation)
					: (this.props.spacing + variation)
			)
		);

		newValue = leftSideTracking
			? Math.min(Math.max(newValue, (-this.props.max)), this.props.min)
			: Math.min(Math.max(newValue, this.props.min), this.props.max);

		if (leftSideTracking) {
			this.client.dispatchAction('/store-value', {letterSpacingLeft: newValue});
		}
		else {
			this.client.dispatchAction('/store-value', {letterSpacingRight: newValue});
		}

		this.client.dispatchAction('/change-letter-spacing', {
			value: Math.abs(newValue),
			side: this.props.side,
			letter: this.props.letter,
		});

		e.stopPropagation();
	}

	render() {
		const left = this.props.side === 'left';
		const handleGripClasses = classNames({
			'handlegrip': true,
			'handlegrip-left': left,
			'handlegrip-right': !left,
		});

		return (
			<span
				className={handleGripClasses}
				onMouseDown={this.handleDown}
				style={this.props.style}
			>
				<span className="handlegrip-border"></span>
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
