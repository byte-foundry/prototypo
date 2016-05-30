import React from 'react';

export default class Button extends React.Component {
	render() {
		return (
			<div className="button" onClick={this.props.click}>
				{this.props.label}
			</div>
		);
	}
}
