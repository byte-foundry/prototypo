import React from 'react';

export class ControlsTabs extends React.Component {

	render() {
		const headers = _.map(this.props.children,(child) => {
			return (
				<li className='controls-tabs-icon' id={child.props.iconId}>
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
