import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Log from '../services/log.services.js';

import LocalClient from '../stores/local-client.stores.jsx';

export default class CanvasGlyphInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mode: [],
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					selected: head.toJS().glyphSelected,
					mode: head.toJS().uiMode,
					focused: head.toJS().glyphFocused,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		window.addEventListener('keypress', (e) => {
			if (this.state.focused) {
				e.preventDefault();
				e.stopPropagation();

				this.client.dispatchAction('/select-glyph', {
					unicode: `${e.charCode}`,
				});
			}
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleView(name) {
		const newViewMode = _.xor(this.state.mode, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-value', {uiMode: newViewMode});
			Log.ui('Canvas.toggleView', name);
		}
	}

	setupGlyphAccess(e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-focus-direct-access');

		const cleanGlyphAccess = (evt) => {
			evt.preventDefault();
			evt.stopPropagation();
			this.client.dispatchAction('/toggle-focus-direct-access');
			window.removeEventListener('click', cleanGlyphAccess);
		};

		window.addEventListener('click', cleanGlyphAccess);
	}

	render() {
		const classes = Classnames({
			'canvas-glyph-input-input': true,
			'is-active': this.state.focused,
		});
		return (
			<div className="canvas-menu-item canvas-glyph-input">
				<div className="canvas-glyph-input-label is-active" onClick={() => { this.toggleView('list'); }} >Glyphs List</div>
				<div className={classes} onClick={(e) => { this.setupGlyphAccess(e);}}>{String.fromCharCode(this.state.selected)}</div>
			</div>
		);
	}
}
