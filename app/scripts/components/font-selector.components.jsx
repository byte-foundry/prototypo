import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import ClassNames from 'classnames';

export default class FontSelector extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeFont() {
		this.client.dispatchAction('/change-font', this.props.font.repo);
	}

	render() {
		const family = {
			'font-family': `"${this.props.font.familyName}"`,
		};

		const classes = ClassNames({
			'font-selector': true,
			'is-selected': this.props.selectedRepo === this.props.font.repo,
		});

		return (
			<li className={classes}>
				<div style={family} className="font-selector-name" onClick={ () => { this.changeFont() }}>{`${this.props.font.name} - ${this.props.text}`}</div>
			</li>
		)
	}
}
