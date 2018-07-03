import React from 'react';

export default class LoadingOverlay extends React.PureComponent {
	render() {
		return (
			<div className="loading-overlay">
				<span className="prototypo-loading" />
			</div>
		);
	}
}
