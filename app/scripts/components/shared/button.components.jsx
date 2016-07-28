import React from 'react';
import ClassNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import WaitForLoad from '../wait-for-load.components.jsx';

export default class Button extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const isSplitted = this.props.splitted;
		const classes = ClassNames({
			button: true,
			danger: this.props.danger,
			neutral: this.props.neutral,
			dark: this.props.dark,
			'split-left': isSplitted,
		});
		const splitRight = ClassNames({
			'split-right': true,
			button: true,
			neutral: true,
			'is-active': isSplitted,
		});
		const splitButton = this.props.splitButton
			? (
				<div className={splitRight} onClick={this.props.altClick} >
					{this.props.altLabel}
				</div>
			)
			: false;

		return (
			<div className="button-container">
				<div className={classes} onClick={this.props.click} >
					<WaitForLoad loaded={!this.props.loading}>
						{this.props.label}
					</WaitForLoad>
				</div>
				{splitButton}
			</div>
		);
	}
}
