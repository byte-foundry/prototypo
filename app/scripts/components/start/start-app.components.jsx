import React from 'react';
import pleaseWait from 'please-wait';
import {hashHistory} from 'react-router';
import {AddFamily} from '../familyVariant/add-family-variant.components.jsx';
import Lifespan from 'lifespan';
import LocalClient from '~/stores/local-client.stores.jsx';

export default class StartApp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			families: [],
		};
		this.returnToDashboard = this.returnToDashboard.bind(this);
		this.open = this.open.bind(this);
	}
	async componentWillMount() {
		pleaseWait.instance.finish();

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				let selectedFamily = false;

				if (head.toJS().d.collectionSelectedFamily !== {}) {
					selectedFamily = true;
				}
				this.setState({
					families: head.toJS().d.fonts,
					selected: (
						head.toJS().d.collectionSelectedFamily || {}
					),
					selectedVariant: (
						head.toJS().d.collectionSelectedVariant || {}
					),
					createdFamily: (
						head.toJS().d.createdFamily
					),
				});
				if (!selectedFamily && head.toJS().d.fonts[0]) {
					this.client.dispatchAction('/select-family-collection', head.toJS().d.fonts[0]);
					this.client.dispatchAction('/select-variant-collection', head.toJS().d.fonts[0].variants[0]);
				}
			})
			.onDelete(() => {
				this.setState({
					families: undefined,
				});
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	returnToDashboard() {
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	open(family) {
		this.client.dispatchAction('/select-variant', {variant: family.variants[0], family});
		const dashboardLocation = {
			pathname: '/dashboard',
		};

		hashHistory.push(dashboardLocation);
	}

	render() {
		// create font
		const families = _.map(this.state.families, (family) => {
			const selected = family.name === this.state.selected.name;

			return {
				name: family.name,
				family,
				selected,
			};
		});

		if (this.state.createdFamily) {
			this.open(this.state.createdFamily);
		}

		// project list if any
		return (
			<div className={`start-app ${(families && families.length) ? '' : 'noproject'}`}>
				<div className="start-app-container">
					<div className="start-base">
						<div className="start-base-create">
							<AddFamily start="true" firstTime={!families.length}/>
						</div>
						<div className="start-base-projects">
							<div className="load-project">
								<label className="load-project-label">
									<span className="load-project-label-order">OR. </span>
									Continue recent project
								</label>
								<ul className="load-project-project">
									{families.map((family) => {
										return (
											<li onDoubleClick={() => {this.open(family.family);}} className={`load-project-project-item clearfix ${family.selected ? 'selected' : ''}`}>
												<span>{family.name}</span>
												<span className="load-project-project-item-button" onClick={() => {this.open(family.family);}}>Open</span>
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
