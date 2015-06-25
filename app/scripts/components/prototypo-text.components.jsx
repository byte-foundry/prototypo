import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import {ContextualMenu, ContextualMenuItem} from './contextual-menu.components.jsx';

export default class PrototypoText extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos:{x:0,y:0},
			showContextMenu:false,
		}
	}

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
		React.findDOMNode(this.refs.text).textContent = this.state.text && this.state.text.length > 0 ? this.state.text : 'abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n,;.:-!?\‘\’\“\”\'\"\«\»()[]\n0123456789\n+&\/\náàâäéèêëíìîïóòôöúùûü\nÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜ\n\nᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀsᴛᴜᴠᴡʏᴢ';
	}

	componentDidUpdate() {
		this.setupText();
	}

	componentDidMount() {
		this.setupText();
	}

	componentWillUnmount() {
		if (React.findDOMNode(this.refs.text).value) {
			this.client.dispatchAction('/store-text',{text:React.findDOMNode(this.refs.text).value});
		}
		this.lifespan.release();
	}

	updateSubset() {
		fontInstance.subset = React.findDOMNode(this.refs.text).value;
	}

	showContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu:true,
			contextMenuPos:{x:e.clientX,y:e.clientY},
		});
	}

	hideContextMenu() {
		if (this.state.showContextMenu) {
			this.setState({
				showContextMenu:false,
			});
		}
	}

	render() {
		const style = {
			'fontFamily':`${this.props.fontName || 'theyaintus'}, 'sans-serif'`,
		};

		const menu = [
			<ContextualMenuItem
				text="Toggle colors"
				key="colors"
				click={() => { this.client.dispatchAction('/store-panel-param',{invertedView:!this.state.panel.invertedView}) }}/>,
			<ContextualMenuItem
				key="view"
				text="Inverted view"
				click={() => { this.client.dispatchAction('/store-panel-param',{invertedColors:!this.state.panel.invertedColors}) }}/>,
		]

		return (
			<div
				className="prototypo-text"
				onContextMenu={(e) => { this.showContextMenu(e) }}
				onClick={() => { this.hideContextMenu() }}
				onMouseLeave={() => { this.hideContextMenu() }}>
				<textarea
					ref="text"
					className="prototypo-text-string"
					spellCheck="false"
					style={style}
					onChange={() => {this.updateSubset()}}
				></textarea>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		)
	}
}
