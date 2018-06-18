import React from 'react';
import Classnames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class CanvasBarButton extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(
			this,
		);
	}

	render() {
		const classes = Classnames({
			[this.props.name]: true,
			'canvas-bar-button': true,
			'is-active': this.props.active,
		});

		return (
			<div
				className={classes}
				onClick={() => {
					this.props.click(this.props.name);
				}}
			/>
		);
	}
}
