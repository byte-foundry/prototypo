import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import {FamilyList, AddFamily} from './family.components.jsx';

export default class FontsCollection extends React.Component {

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
		this.defaultText = 'Abc 123';
		this.setState({});

		const fontVariant = await this.client.fetch('/fontVariant');

		this.setState(fontVariant.head.toJS());

		this.client.getStore('/fontVariant', this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS());
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] fonts collection');
		}

		return (
			<div className="fonts-collection">
				<h1 className="fonts-collection-title side-tab-h1">Your font collections</h1>
				<AddFamily />
				<FamilyList selected={this.state.family} variantSelected={this.state.variant}/>
			</div>
		);
	}
}
