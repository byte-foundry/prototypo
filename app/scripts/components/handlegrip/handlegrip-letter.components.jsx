import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import HandlegripBar from './handlegrip-bar.components.jsx';

/**
*	Component : a letter where you can set spacing
*	With a drag'n'dropable handlegrip
*	@extends React.Component
*/
export default class HandlegripLetter extends React.Component {
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
				<HandlegripBar
					side="left"
					spacing={spacingLeft}
					min={this.props.min}
					max={this.props.max}
					letter={this.props.letter}
				/>
				<span className="letter-wrap-wrap">
					<span ref="letterWrapLetter" className="letter-wrap-letter">
						{this.props.letter}
					</span>
					<span className="handlegrip-spacing-number">
						{advanceWidth}
					</span>
				</span>
				<HandlegripBar
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
