import React from 'react';
import ClassNames from 'classnames';
import LocalClient from '../stores/local-client.stores.jsx';

export class SideTabs extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance();

		this.changeTab = (name, disabled) => {
			if( !disabled ) {
				this.client.dispatchAction('/change-tab-sidebar',{name});
			}
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

		const headers = _.map(children,({props: {bottom, iconUrl, name, disabled}}) => {
			const classes = ClassNames({
				'side-tabs-icon':true,
				'is-active': name === this.props.tab,
				'is-bottom': !!bottom,
				'has-news': !!bottom,
				'is-disabled': !!disabled,
			});

			return (
				<div className={classes} onClick={() => {
					this.changeTab(name, disabled);
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
						<img src='assets/images/prototypo-icon.svg'/>
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
			"is-disabled": !!this.props.disabled,
		});

		return (
			<div className={classes} key={`${this.props.name}SideTab`}>
				{this.props.children}
			</div>
		)
	}

}
