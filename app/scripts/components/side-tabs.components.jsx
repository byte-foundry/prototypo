import React from 'react';
import ClassNames from 'classnames';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';

export class SideTabs extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.changeTab = (name, disabled) => {
			if( !disabled ) {
				this.client.dispatchAction('/change-tab-sidebar',{name});
			}
		};

		const commits = await this.client.fetch('/commits');
		if (commits.head.toJS().list) {
			this.setState({
				latestCommit:commits.head.toJS().list[0].sha,
				latestViewedCommit:commits.head.toJS().latest,
			});
		}

		this.client.getStore('/commits', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					latestCommit:head.toJS().list[0].sha,
					latestViewedCommit:head.toJS().latest,
				});
			})
			.onDelete(() => {
				this.setState({
					latestCommit:undefined,
					latestViewedCommit:undefined,
				});
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] side tabs');
		}

		let children;

		if (!Array.isArray(this.props.children)) {
			children = [this.props.children];
		}
		else {
			children = this.props.children;
		}

		const tabIcons = _.map(children,({props: {bottom, iconUrl, name, disabled, legend}}) => {
			const classes = ClassNames({
				'side-tabs-icon':true,
				'is-active': name === this.props.tab,
				'is-bottom': !!bottom,
				'has-news': name === 'news-feed' && this.state.latestCommit !== this.state.latestViewedCommit,
				'is-disabled': !!disabled,
			});

			return {
				bottom,
				element: <div className={classes} name={name} onClick={() => {
					this.changeTab(name, disabled);
				}} key={`${name}SideHeader`}>
					<img src={`assets/images/${iconUrl}`}/>
					<div className="side-tabs-legend is-legend-active">{legend}</div>
				</div>,
			};
		});

		const header = _.filter(tabIcons,{bottom:undefined});
		const footer = _.filter(tabIcons,{bottom:true});

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
					<div className="side-tabs-icon-headers-top">
						{((items) => {return _.map(items, (item) => {return item.element}) })(header)}
					</div>
					<div className="side-tabs-icon-headers-bottom">
						{((items) => {return _.map(items, (item) => {return item.element}) })(footer)}
					</div>
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
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] side tab');
		}
		const classes = ClassNames({
			"side-tab": true,
			"is-active": true,
			"side-tab-big": !!this.props.big,
			"is-disabled": !!this.props.disabled,
			"no-padding": !!this.props.padding,
		});

		return (
			<div className={classes} key={`${this.props.name}SideTab`}>
				{this.props.children}
			</div>
		)
	}

}
