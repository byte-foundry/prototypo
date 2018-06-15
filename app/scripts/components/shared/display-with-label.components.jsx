import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class DisplayWithLabel extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(
			this,
		);
	}

	render() {
		const label = this.props.nolabel ? (
			false
		) : (
			<label className="display-with-label-label">{this.props.label}</label>
		);
		const classes = `display-with-label ${this.props.className}`;

		return (
			<div className={classes}>
				{label}
				<div className="display-with-label-display">{this.props.children}</div>
			</div>
		);
	}
}
