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
			letterAdvanceWidth: 0,
			trackingX: 0,
			tracking: undefined,
			fontValues: undefined,
		};
		this.leftCurrentX = 0;
		this.rightCurrentX = 0;
		// initialise glyph advanceWidth
		fontInstance.getGlyphProperty(
			this.getSelectedLetter(),
			['advanceWidth', 'spacingLeft', 'spacingRight', 'baseSpacingLeft', 'baseSpacingRight'],
			({advanceWidth, spacingLeft, spacingRight, baseSpacingLeft, baseSpacingRight}) => {
				if (advanceWidth) {
					this.state.letterAdvanceWidth = Math.round(advanceWidth);
				}
				if (spacingLeft) {
					this.state.letterSpacingLeft = Math.round(spacingLeft);
				}
				if (spacingRight) {
					this.state.letterSpacingRight = Math.round(spacingRight);
				}
				if (baseSpacingLeft) {
					this.state.baseSpacingLeft = Math.round(baseSpacingLeft);
				}
				if (baseSpacingRight) {
					this.state.baseSpacingRight = Math.round(baseSpacingRight);
				}
			}
		);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

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
					letterSpacingLeft: head.toJS().letterSpacingLeft || this.state.letterSpacingLeft,
					letterSpacingRight: head.toJS().letterSpacingRight || this.state.letterSpacingRight,
					letterAdvanceWidth: head.toJS().letterAdvanceWidth || this.state.letterAdvanceWidth,
					tracking: head.toJS().uiSpacingTracking,
					trackingX: head.toJS().uiTrackingX,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					fontValues: head.toJS().controlsValues,
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

	componentDidUpdate() {
		// initialise glyph advanceWidth
		fontInstance.getGlyphProperty(
			this.getSelectedLetter(),
			['advanceWidth', 'spacingLeft', 'spacingRight', 'baseSpacingLeft', 'baseSpacingRight'],
			({advanceWidth, spacingLeft, spacingRight, baseSpacingLeft, baseSpacingRight}) => {
				if (advanceWidth) {
					this.setState({letterAdvanceWidth: Math.round(advanceWidth)});
				}
				if (spacingLeft) {
					this.setState({letterSpacingLeft: Math.round(spacingLeft)});
				}
				if (spacingRight) {
					this.setState({letterSpacingRight: Math.round(spacingRight)});
				}
				if (baseSpacingLeft) {
					this.setState({baseSpacingLeft: Math.round(baseSpacingLeft)});
				}
				if (baseSpacingRight) {
					this.setState({baseSpacingRight: Math.round(baseSpacingRight)});
				}
			}
		);
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

		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			const variation = newX - this.state.trackingX;
			const unicode = this.getSelectedLetter().charCodeAt(0);
			const property = leftSideTracking ? 'spacingLeft' : 'spacingRight';

			newValue = (
				this.state.fontValues.glyphSpecialProps[unicode][property]
				+ variation * (leftSideTracking ? -1 : 1)
			);

			newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);

		}
		else {
			newValue = newX < offsetLeft ? this.props.min : this.props.max;
		}

		// if we are currently tracking left side spacing
		if (leftSideTracking) {
			// set the new spacing value
			this.client.dispatchAction('/store-value', {letterSpacingLeft: newValue + this.state.baseSpacingLeft});
		}
		else {
			this.client.dispatchAction('/store-value', {letterSpacingRight: newValue + this.state.baseSpacingRight});
		}

		this.client.dispatchAction('/store-value', {uiTrackingX: newX});

		if (newValue) {
			this.client.dispatchAction('/change-letter-spacing', {
				value: Math.abs(newValue),
				side: this.state.tracking,
				letter: this.getSelectedLetter(),
			});

			//this.dispatchAllFromFontinstance();
			this.client.dispatchAction('/store-value', {letterAdvanceWidth: newValue + this.state.letterAdvanceWidth});
		}

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
		fontInstance.getGlyphProperty(
			this.getSelectedLetter(),
			['advanceWidth', 'spacingLeft', 'spacingRight'],
			({advanceWidth, spacingLeft, spacingRight}) => {
				if (advanceWidth) {
					this.client.dispatchAction('/store-value', {
						letterAdvanceWidth: Math.round(advanceWidth),
					});
				}
				if (spacingLeft) {
					this.client.dispatchAction('/store-value', {
						letterSpacingLeft: Math.round(spacingLeft),
					});
				}
				if (spacingRight) {
					this.client.dispatchAction('/store-value', {
						letterSpacingRight: Math.round(spacingRight),
					});
				}
			}
		);
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
						advanceWidth={this.state.letterAdvanceWidth}
						dispatchAll={this.dispatchAllFromFontinstance}
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
		this.state = {
			advanceWidth: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const spacingLeft = Math.abs(this.props.spacingLeft);
		const spacingRight = Math.abs(this.props.spacingRight);

		return (
			<span className="letter-wrap">
				<Handlegrip
					side="left"
					spacing={spacingLeft}
					min={this.props.min}
					max={this.props.max}
					letter={this.props.letter}
					dispatchAll={this.props.dispatchAll}
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
						{this.props.advanceWidth}
					</span>
				</span>
				<Handlegrip
					side="right"
					spacing={spacingRight}
					min={this.props.min}
					max={this.props.max}
					letter={this.props.letter}
					dispatchAll={this.props.dispatchAll}
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

		this.client.dispatchAction('/store-value', {uiTrackingX: newX});

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
