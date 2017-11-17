import React from 'react';

export default class FormError extends React.PureComponent {
	render() {
		const {children, errorText} = this.props;

		return <div className="form-error">{children || errorText}</div>;
	}
}
