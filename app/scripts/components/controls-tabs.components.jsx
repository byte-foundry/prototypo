import React from 'react';
import Lifespan from 'lifespan';
import classNames from 'classnames';
import LocalClient from '../stores/local-client.stores.jsx';

export class ControlsTabs extends React.Component {
	componentWillMount() {
		this.client = new LocalClient().instance;

		this.changeTab = (name) => {
			this.client.dispatchAction('/change-tab',{name});
		};
	}
	render() {
		const headers = _.map(this.props.children,({props: {iconId, name}}) => {
			const classes = classNames({
				'controls-tabs-icon': true,
				'is-active': this.props.tab == name,
			});

			return (
				<li className={classes} id={iconId}
					onClick={() => {
						this.changeTab(name)
					}}>
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
