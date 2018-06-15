import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import classNames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

export default class GlyphButton extends React.PureComponent {
	constructor(props) {
		super(props);
		this.toggleLockList = this.toggleLockList.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleLockList() {
		this.client.dispatchAction('/toggle-lock-list', {});
		Log.ui('GlyphButton.toggleLockList');
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] glyph button');
		}

		const pinned = [];

		this.props.pinned.forEach((tag) => {
			pinned.push(
				<Pinned
					tag={tag}
					selected={this.props.selected}
					key={`button${tag}`}
				/>,
			);
		});

		const lockClasses = classNames({
			'glyph-btn-list-btn-lock': true,
			'is-locked': this.props.locked,
		});

		return (
			<div className="glyph-btn-list">
				<div className="glyph-btn-list-btn clearfix">
					<label className="glyph-btn-list-btn-label">Glyph list</label>
					<div
						className="glyph-btn-list-btn-wrapper"
						onClick={this.toggleLockList}
					>
						<div className={lockClasses} />
					</div>
				</div>
				{pinned}
			</div>
		);
	}
}

class Pinned extends React.PureComponent {
	constructor(props) {
		super(props);
		this.selectTag = this.selectTag.bind(this);
		this.addToPinned = this.addToPinned.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectTag() {
		this.client.dispatchAction('/select-tag', this.props.tag);
	}

	addToPinned(e) {
		e.stopPropagation();
		this.client.dispatchAction('/add-pinned', this.props.tag);
	}

	render() {
		const tagClasses = classNames({
			'glyph-btn-list-btn-label': true,
			'glyph-btn-list-btn-tags': true,
			'is-active': this.props.selected === this.props.tag,
		});

		return (
			<div className="glyph-btn-list-btn clearfix" onClick={this.selectTag}>
				<label className={tagClasses}>{this.props.tag}</label>
				<div className="glyph-btn-list-btn-tag-wrapper">
					<div
						className="glyph-btn-list-btn-tag-wrapper-close"
						onClick={this.addToPinned}
					>
						×
					</div>
				</div>
			</div>
		);
	}
}
