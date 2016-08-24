import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import DOM from '../../helpers/dom.helpers.js';

import HandlegripLetter from './handlegrip-letter.components.jsx';
import RegularLetter from './regular-letter.components.jsx';

/**
*	Component : Text in prototypo-word
*	Where you can set spacing on a specific letter
*	@extends React.Component
*/
export default class HandlegripText extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			spacingLeft: 0,
			spacingRight: 0,
			baseSpacingLeft: 0,
			baseSpacingRight: 0,
			advanceWidth: 0,
			trackingX: 0,
			letterFontSize: 0,
			tracking: false,
			fontValues: null,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// retrieve the initial values, only once
		fontInstance.getGlyphProperty(
			this.getSelectedLetter(),
			['advanceWidth', 'spacingLeft', 'spacingRight', 'baseSpacingLeft', 'baseSpacingRight'],
			({advanceWidth, spacingLeft, spacingRight, baseSpacingLeft, baseSpacingRight}) => {
				this.setState({
					advanceWidth,
					spacingLeft,
					spacingRight,
					baseSpacingLeft,
					baseSpacingRight,
				});
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
					baseSpacingLeft: head.toJS().baseSpacingLeft || this.state.baseSpacingLeft,
					baseSpacingRight: head.toJS().baseSpacingRight || this.state.baseSpacingRight,
					spacingLeft: head.toJS().spacingLeft || this.state.spacingLeft,
					spacingRight: head.toJS().spacingRight || this.state.spacingRight,
					unClampedOldValue: head.toJS().unClampedOldValue,
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
		const trackingX = this.state.trackingX;
		const el = ReactDOM.findDOMNode(this);
		const {offsetLeft} = DOM.getAbsOffset(el);
		const letterOffsetWidth = this.refs.selectedLetter.getClientWidth();
		let newValue;
		let clampedNewValue;

		// here we are going to try and avoid
		// dragging w/o being near the handle
		const barProps = leftSideTracking
			? this.refs.selectedLetter.getLeftBar()
			: this.refs.selectedLetter.getRightBar();

		// advanceWidth is in typographic unit
		const advanceWidth = this.state.advanceWidth;
		// intiate spacing value that will be set w/ dispatchAction
		const newSpacingValues = {};

		// here we are going to find out the pixel ratio for dragging
		const dragginRatio = parseFloat(advanceWidth) / letterOffsetWidth;

		// property to edit
		const property = leftSideTracking ? 'spacingLeft' : 'spacingRight';
		// current letter's unicode
		const unicode = this.getSelectedLetter().charCodeAt(0);
		// store the special property object for the current unicode value
		const specialPropsObject = this.state.fontValues.glyphSpecialProps
			? this.state.fontValues.glyphSpecialProps[unicode]
			: {};

		// obtain variation value
		const variation = Math.round(
			(newX - trackingX) * dragginRatio
		) * (leftSideTracking ? -1 : 1);

		console.log("newX: "+ newX);
		console.log("variation: "+ variation);
		console.log("trackingX: "+ this.state.trackingX);
		console.log("old value: " + this.state.unClampedOldValue);

		// compute new value
		newValue = (
			(
				this.state.unClampedOldValue || (
					specialPropsObject && specialPropsObject[property]
						? this.state[property]
						: 0
				)
			)
			+ (variation)
		);

		console.log("unclamped spacing: "+ this.state[property]);

		// if the new X value is in the element boundaries
		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			const baseSpacing = leftSideTracking
				? this.state.baseSpacingLeft
				: this.state.baseSpacingRight;

			clampedNewValue = Math.min(Math.max(newValue, (this.props.min - baseSpacing)), this.props.max);
		}
		else {
			clampedNewValue = newX < offsetLeft ? this.props.min : this.props.max;
		}
		console.log("newValue: "+ newValue);
		console.log("clampedNewValue: "+ clampedNewValue);

		// if we are currently tracking left side spacing
		if (leftSideTracking) {
			// set the new spacing value
			newSpacingValues.spacingLeft = clampedNewValue + this.state.baseSpacingLeft;
		}
		else {
			newSpacingValues.spacingRight = clampedNewValue + this.state.baseSpacingRight;
		}

		if (!Number.isNaN(newValue)) {
			this.client.dispatchAction('/change-letter-spacing', {
				value: clampedNewValue,
				side: this.state.tracking,
				letter: this.getSelectedLetter(),
			});

		}

		newSpacingValues.unClampedOldValue = newValue;
		newSpacingValues.uiTrackingX = newX;

		this.client.dispatchAction('/store-value-undoable', newSpacingValues);

	}

	/**
	*	returns the letter to select (text at the right index)
	*	@return {string} the letter
	*/
	getSelectedLetter() {
		const selectedIndex = this.props.selectedLetter;

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
		const selectedLetter = this.props.selectedLetter;
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
