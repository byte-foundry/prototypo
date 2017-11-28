import React from 'react';

export default class FormSuccess extends React.PureComponent {
	render() {
		const {children, successText} = this.props;

		return <div className="form-success">{children || successText}</div>;
	}
}
