import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import FontSelector from './font-selector.components.jsx';
import {FamilyList, AddFamily} from './family.components.jsx';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';

export default class FontsCollection extends React.Component {

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
		this.defaultText = 'Abc 123';
		this.setState({});

		const fontTemplate = await this.client.fetch('/fontTemplate');

		this.setState(fontTemplate.head.toJS());

		this.client.getStore('/fontTemplate', this.lifespan)
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
				<ReactGeminiScrollbar>
					<FamilyList />
				</ReactGeminiScrollbar>
			</div>
		)
	}
}
