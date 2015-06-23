import React from 'react';
import PrototypoText from './prototypo-text.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';


export default class PrototypoPanel extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos:{x:0,y:0},
			showContextMenu:false,
			glyph:{},
			panel: {},
		};
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const panel = await this.client.fetch('/panel');
		this.setState({panel:panel.head.toJS()});
		const glyph = await this.client.fetch('/glyphs');
		this.setState({glyph:glyph.head.toJS()});

		this.client.getStore('/panel',this.lifespan)
			.onUpdate(({head}) => {
				this.setState({panel:head.toJS()});
			})
			.onDelete(() => {
				this.setState({panel:undefined});
			});

		this.client.getStore('/glyphs',this.lifespan)
			.onUpdate(({head}) => {
				this.setState({glyph:head.toJS()});
			})
			.onDelete(() => {
				this.setState({glyph:undefined});
			});
	}

	setupCanvas() {
		const canvasContainer = React.findDOMNode(this.refs.canvas);
		canvasContainer.appendChild(window.canvasElement);
		fontInstance.zoom = this.state.panel.zoom ? this.state.panel.zoom : 0.5;
		fontInstance.view.center = this.state.panel.pos ? this.state.panel.pos : fontInstance.view.center;
	}

	componentDidUpdate() {
		this.setupCanvas();
	}

	componentDidMount() {
		const canvasContainer = React.findDOMNode(this.refs.canvas);
		canvasContainer.addEventListener('mousemove', fontInstance.moveHandler.bind(fontInstance));
		canvasContainer.addEventListener('wheel',fontInstance.wheelHandler.bind(fontInstance));
		canvasContainer.addEventListener('mousedown',fontInstance.downHandler.bind(fontInstance));
		canvasContainer.addEventListener('mouseup',fontInstance.upHandler.bind(fontInstance));

		this.setupCanvas();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeMode(e, mode) {
		this.client.dispatchAction('/store-panel-param', {value:mode, name:'mode'});
		if (mode !== 'glyph') {
			this.client.dispatchAction('/store-panel-param', {value:fontInstance.view.center, name:'pos'});
			this.client.dispatchAction('/store-panel-param', {value:fontInstance.zoom, name:'zoom'});
		}
		e.stopPropagation();
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
		if (this.state.panel.mode === 'glyph') {
			this.client.dispatchAction('/store-panel-param', {value:fontInstance.view.center, name:'pos'});
			this.client.dispatchAction('/store-panel-param', {value:fontInstance.zoom, name:'zoom'});
		}
		this.setState({
			showContextMenu:false,
		});
	}

	resetView() {
		fontInstance.view.center = [0,0];
		fontInstance.zoom = 0.5;
	}

	render() {
		let view;
		let menu;
		const canvasClass = ClassNames({
			'is-hidden':this.state.panel.mode === 'glyph',
			'prototypo-canvas-container':true,
		});
		view = [<div ref="canvas" className="prototypo-canvas-container"></div>];

		if (this.state.panel.mode === 'text') {
			view.push(<PrototypoText fontName={this.props.fontName}/>);
			menu = [
				<ContextualMenuItem text="Toggle colors" click={() => {this.setState({invertedColors:!this.state.invertedColors})}}/>,
				<ContextualMenuItem text="Inverted view" click={() => {this.setState({invertedView:!this.state.invertedView})}}/>,
			]
		}
		else {
			if (this.state.shadow) {
				view.push(<div className="shadow-of-the-colossus">{String.fromCharCode(this.state.glyph.selected)}</div>)
			}
			menu = [
				<ContextualMenuItem text={`${!fontInstance.showNodes ? 'Show' : 'Hide'} nodes`} click={() => { fontInstance.showNodes = !fontInstance.showNodes; }}/>,
				<ContextualMenuItem text={`${fontInstance.fill ? 'Show' : 'Hide'} outline`} click={() => { fontInstance.fill = !fontInstance.fill; }}/>,
				<ContextualMenuItem text={`${!fontInstance.showCoords ? 'Show' : 'Hide'} coords`} click={() => { fontInstance.showCoords = !fontInstance.showCoords; }}/>,
				<ContextualMenuItem text="Reset view" click={() => { this.resetView() }}/>,
				<ContextualMenuItem text={`${this.state.shadow ? 'Hide' : 'Show'} shadow`} click={() => { this.setState({shadow:!this.state.shadow})}}/>,
			]
		}

		return (
			<div id="prototypopanel"
				onContextMenu={(e) => {this.showContextMenu(e)}}
				onClick={() => { this.hideContextMenu() }}
				onMouseLeave={() => {this.hideContextMenu()}}
				onDoubleClick={() => { this.resetView() }}>
				{view}
				<div className="prototypo-panel-buttons-list">
					<div className="prototypo-panel-buttons-list-button" onClick={(e) => {
						this.changeMode(e, 'text');
					}}>
						Text view
					</div>
					<div className="prototypo-panel-buttons-list-button" onClick={(e) => {
					 	this.changeMode(e, 'glyph')
					 }}>
						Glyph view
					</div>
					<div className="prototypo-panel-buttons-list-button" onClick={() => { this.changeMode('half')}}>
						Half and Half
					</div>
				</div>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		)
	}
}

class ContextualMenu extends React.Component {
	render() {
		const menuStyle = {
			top:this.props.pos.y-15,
			left:this.props.pos.x-340,
		};

		return this.props.show ? (
			<div className="contextual-menu" style={menuStyle}>
				<ul className="contextual-menu-list">
					{this.props.children}
				</ul>
			</div>
		) : false;
	}
}

class ContextualMenuItem extends React.Component {
	render() {
		return (
			<li className="contextual-menu-list-item" onClick={this.props.click}>
				{this.props.text}
			</li>
		)
	}
}
