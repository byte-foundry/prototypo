import React from 'react';
import ClassNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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
		});
		const splitButton = isSplitted
			? (
				<div className={splitRight} onClick={this.props.altClick}>
					{this.props.altLabel}
				</div>
			)
			: false;


		return (
			<ReactCSSTransitionGroup
				component="div"
				transitionName="button"
				transitionEnterTimeout={200}
				transitionLeaveTimeout={150}
				className="button-container">
					<div className={classes} onClick={this.props.click}>
						{this.props.label}
					</div>
					{splitButton}
			</ReactCSSTransitionGroup>
		);
	}
}
