import React from 'react';

export default class FormError extends React.Component {
	render() {
		return (
			<div className="form-error">
				{this.props.errorText}
			</div>
		);
	}
}
