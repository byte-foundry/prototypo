import React from 'react';

export default class ArianneThread extends React.Component {
	render() {
		return (
			<div className="arianne-thread">
				<RootArianneItem />
				<DropArianneItem label="font"/>
				<DropArianneItem label="variant"/>
				<ActionArianneItem label="group" img="assets/images/arianne-plus.svg"/>
			</div>
		);
	}
}

class RootArianneItem extends React.Component {
	render() {
		return (
			<div className="arianne-item is-small">
				<div className="arianne-item-action is-small">
					<img className="arianne-item-action-collection" src="assets/images/collection.svg"/>
				</div>
				<div className="arianne-item-arrow"></div>
			</div>
		);
	}
}

class DropArianneItem extends React.Component {
	render() {
		return (
			<div className="arianne-item">
				<div className="arianne-item-action">
					{this.props.label}
					<img className="arianne-item-action-drop arianne-item-action-img" src="assets/images/drop.svg"/>
				</div>
				<div className="arianne-item-arrow"></div>
			</div>
		);
	}
}

class ActionArianneItem extends React.Component {
	render() {
		return (
			<div className="arianne-item">
				<div className="arianne-item-action">
					{this.props.label}
					<img className="arianne-item-action-plus arianne-item-action-img" src={this.props.img}/>
				</div>
				<div className="arianne-item-arrow"></div>
			</div>
		);
	}
}
