import React from 'react';
import classNames from 'classnames';

export class ControlsTabs extends React.Component {

	render() {
		const headers = _.map(this.props.children,({props: {iconId, name}}) => {
			const classes = classNames({
				'controls-tabs-icon': true,
				'is-active': this.props.tab == name,
			});

			return (
				<li className={classes} id={iconId}>
				</li>
			);
		});

		return (
			<div className="controls-tabs">
				<ul className="controls-tabs-headers">
					{headers}
				</ul>
				<div className="controls-tabs-container">
					{this.props.children}
				</div>
			</div>
		)
	}
}

export class ControlsTab extends React.Component {

	render() {
		return (
			<div className="controls-tab">
				{this.props.children}
			</div>
		)
	}

}
