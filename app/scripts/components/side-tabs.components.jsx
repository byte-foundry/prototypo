import React from 'react';
import ClassNames from 'classnames';
import LocalClient from '../stores/local-client.stores.jsx';

export class SideTabs extends React.Component {

	componentWillMount() {
		this.client = new LocalClient().instance;

		this.changeTab = (name) => {
			this.client.dispatchAction('/change-tab-sidebar',{name});
		};
	}

	render() {

		let children;

		if (!Array.isArray(this.props.children)) {
			children = [this.props.children];
		}
		else {
			children = this.props.children;
		}

		const headers = _.map(children,({props: {iconUrl, name}}) => {
			const classes = ClassNames({
				'side-tabs-icon':true,
				'is-active': name === this.props.tab,
			});

			return (
				<div className={classes} onClick={() => {
					this.changeTab(name);
				}} key={`${name}SideHeader`}>
					<img src={`assets/images/${iconUrl}`}/>
				</div>
			);
		});

		const tab = _.map(children,(child) => {
			if (this.props.tab === child.props.name)
				return child;
		})

		return (
			<div className="side-tabs">
				<div className="side-tabs-headers">
					<div className="side-tabs-icon-headers">
						<img src='assets/images/prototypo-icon.png'/>
					</div>
					{headers}
				</div>
				<div className="side-tabs-container">
					{tab}
				</div>
			</div>
		)
	}
}

export class SideTab extends React.Component {

	render() {
		const classes = ClassNames({
			"side-tab": true,
			"is-active": true,
			"side-tab-big": !!this.props.big,
		});

		return (
			<div className={classes} key={`${this.props.name}SideTab`}>
				{this.props.children}
			</div>
		)
	}

}
