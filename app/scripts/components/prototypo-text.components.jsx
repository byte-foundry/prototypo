import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

export default class PrototypoText extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.fetch('/panel')
			.then((store) => {
				this.setState(store.head.toJS());
			});

		this.client.getStore('/panel',this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS());
			})
			.onDelete(() => {
				this.setState(undefined);
			})
	}

	setupText() {
		React.findDOMNode(this.refs.text).textContent = this.state ? this.state.text : '';
	}

	componentDidUpdate() {
		this.setupText();
	}

	componentDidMount() {
		this.setupText();
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-text',{text:React.findDOMNode(this.refs.text).value});
		this.lifespan.release();
	}

	updateSubset() {
		fontInstance.subset(React.findDOMNode(this.refs.text).value);
	}

	render() {
		const style = {
			'fontFamily':`${this.props.fontName || 'theyaintus'}, 'sans-serif'`,
		};

		return (
			<div className="prototypo-text">
				<textarea
					ref="text"
					className="prototypo-text-string"
					spellCheck="false"
					style={style}
					onChange={() => {this.updateSubset()}}
				></textarea>
			</div>
		)
	}
}
