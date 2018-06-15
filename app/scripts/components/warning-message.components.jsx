import React from 'react';

export default class WarningMessage extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] WarningMessage');
		}
		return <div className="warning-message">{this.props.text}</div>;
	}
}
