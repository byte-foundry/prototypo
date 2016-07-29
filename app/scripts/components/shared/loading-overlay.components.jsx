import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class LoadingOverlay extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<div className="loading-overlay">
				<img src="assets/images/prototypo-loading.svg" />
			</div>
		);
	}
}
