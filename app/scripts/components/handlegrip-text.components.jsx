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
			spacingLeft: 0,
			spacingRight: 0,
			baseSpacingLeft: 0,
			baseSpacingRight: 0,
			advanceWidth: 0,
			trackingX: 0,
			letterFontSize: 0,
			tracking: undefined,
			fontValues: undefined,
		};
		this.leftCurrentX = 0;
		this.rightCurrentX = 0;
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// retrieve the initial values, only once
		fontInstance.getGlyphProperty(
			this.getSelectedLetter(),
			['advanceWidth', 'spacingLeft', 'spacingRight'],
			({advanceWidth, spacingLeft, spacingRight}) => {
				this.setState({advanceWidth, spacingLeft, spacingRight});
			}
		);

		// function bindings
		this.handleUp = this.handleUp.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.handleSelectstart = this.handleSelectstart.bind(this);
		this.dispatchAllFromFontinstance = this.dispatchAllFromFontinstance.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					uiWordSelection: head.toJS().uiWordSelection || 0,
					uiWordHandleWidth: head.toJS().uiWordHandleWidth || 0,
					tracking: head.toJS().uiSpacingTracking,
					letterFontSize: head.toJS().uiLetterSpacingLetterFontSize || this.state.letterFontSize,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					fontValues: head.toJS().controlsValues,
					trackingX: head.toJS().uiTrackingX,
					baseSpacingLeft: head.toJS().baseSpacingLeft,
					baseSpacingRight: head.toJS().baseSpacingRight,
					spacingLeft: head.toJS().spacingLeft || this.state.spacingLeft,
					spacingRight: head.toJS().spacingRight || this.state.spacingRight,
					advanceWidth: head.toJS().advanceWidth || this.state.advanceWidth,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

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

		const el = ReactDOM.findDOMNode(this);

		this.client.dispatchAction('/store-value', {
			// tells everyone to stop tracking
			uiSpacingTracking: false,
			// adjust font size
			uiWordFontSize: DOM.getProperFontSize(
				this.props.text,
				el.style,
				el.clientWidth
			),
		});

		this.dispatchAllFromFontinstance();

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

		// advanceWidth is in typographic unit
		const advanceWidth = this.state.advanceWidth;
		// letter offsetWidth in pixels
		const letterOffsetWidth = this.refs.selectedLetter.getOffsetWidth();

		const newSpacingValues = {};

		// here we are going to find out the pixel ratio for dragging
		const dragginRatio = parseFloat(advanceWidth) / letterOffsetWidth;

		const property = leftSideTracking ? 'spacingLeft' : 'spacingRight';
		const unicode = this.getSelectedLetter().charCodeAt(0);
		const variation = Math.round(
			(newX - this.state.trackingX) * dragginRatio
		) * (leftSideTracking ? -1 : 1);
		const updatedValue = (
			this.state.fontValues.glyphSpecialProps[unicode][property]
			+ (variation)
		);

		// if the new X value is in the element boundaries
		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			newValue = updatedValue;
			newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);

		}
		else {
			newValue = newX < offsetLeft ? this.props.min : this.props.max;
		}

		// if we are currently tracking left side spacing
		if (leftSideTracking) {
			// set the new spacing value
			newSpacingValues.spacingLeft = newValue + this.state.baseSpacingLeft;
		}
		else {
			newSpacingValues.spacingRight = newValue + this.state.baseSpacingRight;
		}

		newSpacingValues.uiTrackingX = newX;

		if (newValue) {
			this.client.dispatchAction('/change-letter-spacing', {
				value: Math.abs(newValue),
				side: this.state.tracking,
				letter: this.getSelectedLetter(),
			});

			// if the user went to far, no need to update the advanceWidth value
			if (updatedValue <= this.props.max) {
				newSpacingValues.advanceWidth = variation + advanceWidth;
			}
		}

		this.client.dispatchAction('/store-value-undoable', newSpacingValues);

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

	dispatchAllFromFontinstance() {
		// get the new advanceWidth of the current glyph
		// directly from the globaly available font instance
		this.client.dispatchAction('/update-letter-spacing-value', {
			letter: this.getSelectedLetter(),
			valueList: ['advanceWidth', 'spacingLeft', 'spacingRight'],
		});
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
						spacingLeft={this.state.spacingLeft}
						spacingRight={this.state.spacingRight}
						advanceWidth={this.state.advanceWidth}
						min={this.props.min}
						max={this.props.max}
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

	getOffsetWidth() {
		return this.refs.letterWrapLetter.clientWidth;
	}

	render() {
		const spacingLeft = Math.round(Math.abs(this.props.spacingLeft));
		const spacingRight = Math.round(Math.abs(this.props.spacingRight));
		const advanceWidth = Math.round(Math.abs(this.props.advanceWidth));

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
					<span ref="letterWrapLetter" className="letter-wrap-letter">
						{this.props.letter}
					</span>
					<span className="handlegrip-scales">
						<span className="handlegrip-scale-left"></span>
						<span className="handlegrip-scale-right"></span>
					</span>
					<span className="handlegrip-spacing-number">
						{advanceWidth}
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
		// tells everyone that the tracking begins, and on which side
		this.client.dispatchAction('/store-value', {uiSpacingTracking: this.props.side});

		const newX = e.pageX || e.screenX;

		this.client.dispatchAction('/store-value-undoable', {uiTrackingX: newX});

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
		this.client.dispatchAction('/update-letter-spacing-value', {
			letter: this.props.letter.charCodeAt(0),
			valueList: ['advanceWidth', 'spacingLeft', 'spacingRight', 'baseSpacingLeft', 'baseSpacingRight'],
		});
	}

	render() {
		return (
			<span className="letter-wrap" onDoubleClick={this.selectLetter}>
				{this.props.letter}
			</span>
		);
	}
}
