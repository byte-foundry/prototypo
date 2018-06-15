import React from 'react';

/**
 *	Component : a regular letter
 *	@extends React.Component
 */
export default class RegularLetter extends React.PureComponent {
	constructor(props) {
		super(props);

		this.select = this.select.bind(this);
	}

	select() {
		this.props.onSelect(this.props.letter, this.props.identifier);
	}

	render() {
		return (
			<span className="letter-wrap letter-wrap-regular" onClick={this.select}>
				{this.props.letter.replace(/ /g, '\u00a0')}
			</span>
		);
	}
}
