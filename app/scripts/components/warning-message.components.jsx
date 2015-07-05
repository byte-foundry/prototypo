import React from 'react';

export default class WarningMessage extends React.Component {
	render() {
		return (
			<div className="warning-message">{this.props.text}</div>
		)
	}
}
