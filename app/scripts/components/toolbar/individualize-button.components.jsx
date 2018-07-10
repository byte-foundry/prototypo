import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class IndividualizeButton extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					individualize: head.toJS().d.indivMode,
					credits: head.toJS().d.credits,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	individualize() {
		this.client.dispatchAction('/toggle-individualize');
	}

	render() {
		const buttonClass = Classnames({
			'individualize-button-switch': true,
			'is-active': this.state.individualize,
		});
		const activeAllClassName = Classnames({
			'individualize-button-label': true,
			'active-label': !this.state.individualize,
		});
		const activeGroupsClassName = Classnames({
			'individualize-button-label': true,
			'active-label': this.state.individualize,
		});

		return (
			<div
				className="individualize-button"
				onClick={() => {
					this.individualize();
				}}
			>
				<div className={activeAllClassName}>All glyphs</div>
				<div
					className={buttonClass}
					onClick={() => {
						this.individualize();
					}}
				>
					<div
						className="individualize-button-switch-toggle"
						title="Individualize parameters"
					/>
				</div>
				<div className={activeGroupsClassName}>Groups of glyphs</div>
			</div>
		);
	}
}
