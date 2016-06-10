import React from 'react';
import ClassNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class Button extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const classes = ClassNames({
			button: true,
			danger: this.props.danger,
			neutral: this.props.neutral,
		});

		return (
			<div className={classes} onClick={this.props.click}>
				{this.props.label}
			</div>
		);
	}
}
