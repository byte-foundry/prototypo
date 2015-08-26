import React from 'react';
import Lifespan from 'lifespan';
import classNames from 'classnames';
import LocalClient from '../stores/local-client.stores.jsx';
import GeminiScrollbar from 'react-gemini-scrollbar';

export class ControlsTabs extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();

		this.changeTab = (name) => {
			this.client.dispatchAction('/change-tab-font',{name});
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
					}} key={`${name}ControlsHeader`}>
					<div className="controls-tabs-icon-legend is-legend-active">{name}</div>
				</li>
			);
		});

		const tab = _.map(this.props.children, (child) => {
			if (child.props.name === this.props.tab)
				return child;
		})

		return (
			<div className="controls-tabs">
				<ul className="controls-tabs-headers">
					{headers}
				</ul>
				<GeminiScrollbar autoshow={true}>
					<div className="controls-tabs-container">
						{tab}
					</div>
				</GeminiScrollbar>
			</div>
		)
	}
}

export class ControlsTab extends React.Component {

	render() {
		return (
			<div className="controls-tab" key={`${this.props.name}ControlsTab`}>
				{this.props.children}
			</div>
		)
	}

}
