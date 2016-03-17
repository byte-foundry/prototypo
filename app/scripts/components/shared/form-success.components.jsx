import React from 'react';

export default class FormSuccess extends React.Component {
	render() {
		return (
			<div className="form-success">
				{this.props.successText}
			</div>
		);
	}
}
