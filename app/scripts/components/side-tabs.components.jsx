import React from 'react';

export class SideTabs extends React.Component {

	render() {

		let children;

		if (typeof this.props.children == 'object') {
			children = [this.props.children];
		}
		else {
			children = this.props.children;
		}

		const headers = _.map(children,(child) => {
			return (
				<div className="side-tabs-icon">
					<img src={`assets/images/${child.props.iconUrl}`}/>
				</div>
			);
		});

		return (
			<div className="side-tabs">
				<div className="side-tabs-headers">
					<div className="side-tabs-icon-headers">
						<img src='assets/images/prototypo-icon.png'/>
					</div>
					{headers}
				</div>
				<div className="side-tabs-container">
					{this.props.children}
				</div>
			</div>
		)
	}
}

export class SideTab extends React.Component {

	render() {
		return (
			<div className="side-tab is-active">
				{this.props.children}
			</div>
		)
	}

}
