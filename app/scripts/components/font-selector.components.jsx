import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import Classnames from 'classnames';
import Log from '../services/log.services.js';

/* Apparently this component is never used */
export default class FontSelector extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeFont() {
		this.client.dispatchAction('/change-font', this.props.font.repo);
		Log.ui('FontSelector.changeFont', this.props.font.repo);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] font selector');
		}

		const family = {
			'fontFamily': `"${this.props.font.familyName}"`,
		};

		const classes = Classnames({
			'font-selector': true,
			'is-selected': this.props.selectedRepo === this.props.font.repo,
		});

		return (
			<li className={classes} onClick={ () => { this.changeFont(); }}>
				<div style={family} className="font-selector-name">{`${this.props.font.name} - ${this.props.text}`}</div>
			</li>
		);
	}
}
