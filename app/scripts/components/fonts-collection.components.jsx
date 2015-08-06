import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import FontSelector from './font-selector.components.jsx';

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
		const fonts = _.map(this.props.fonts, (font) => {
			return <FontSelector font={font} text={this.defaultText} selectedRepo={this.state.selected}/>
		});
		return (
			<div className="fonts-collection">
				<h1 className="fonts-collection-title side-tab-h1">Change the font template</h1>
				<ul className="fonts-collection-selectors">
					{fonts}
				</ul>
			</div>
		)
	}
}
