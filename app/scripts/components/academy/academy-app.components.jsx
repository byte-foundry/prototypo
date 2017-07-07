import React from 'react';
import pleaseWait from 'please-wait';

export default class AcademyApp extends React.PureComponent {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="academy-app">
				{this.props.children}
			</div>
		);
	}
}
