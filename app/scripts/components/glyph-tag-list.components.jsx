import _mapValues from 'lodash/mapValues';
import React from 'react';
import Lifespan from 'lifespan';
import classNames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

export default class GlyphTagList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
		};
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] GlyphTagList');
		}

		const classes = classNames({
			'glyph-tag-list': true,
			'is-active': this.state.show,
		});

		const pinned = this.props.pinned.map((pin) => {
			return <GlyphPinnedTag tag={pin} selected={this.props.selected} key={`pin${pin}`}/>;
		});

		const pinnedSearch = this.props.pinnedSearch.map((pin) => {
			return <GlyphPinnedSearch search={pin} selected={this.props.selectedSearch} key={`search${pin}`}/>;
		});

		return (
			<div className={classes} onClick={() => {
				this.setState({
					show: !this.state.show,
				});
			}}>
				<div className="glyph-tag-list-selected">
					Filter by {this.props.selected}
					<span className="glyph-tag-list-selected-icon"></span>
				</div>
				<ul className="glyph-tag-list-dropdown">
					{this.props.tags.map((tag) => {
						return (
							<li
								key={tag}
								className="glyph-tag-list-dropdown-item">
								<GlyphTag
									tag={tag}
									selected={this.props.selected}
									pinned={this.props.pinned}/>
							</li>
						);
					})}
					{this.props.savedSearch.map((query) => {
						return (
							<li
								key={query}
								className="glyph-tag-list-dropdown-item">
								<GlyphSearch
									selected={this.props.selectedSearch}
									pinned={this.props.pinnedSearch}
									search={query} />
							</li>
						);
					})}
				</ul>
				{pinned}
				{pinnedSearch}
			</div>
		);
	}
}

class GlyphPinnedTag extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectTag(tag, e) {
		e.stopPropagation();
		this.client.dispatchAction('/select-tag', tag);
	}

	removeFromPinned(tag, e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned', tag);
	}

	render() {

		const itemClasses = classNames({
			'glyph-tag': true,
			'is-active': this.props.selected === this.props.tag,
		});

		return (
			<div className={itemClasses} onClick={(e) => { this.selectTag(this.props.tag, e); }}>
				<div className="glyph-tag-name">
					{this.props.tag}
				</div>
				<div className="glyph-tag-button is-pinned" onClick={(e) => { this.removeFromPinned(this.props.tag, e); }}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		);
	}
}

class GlyphPinnedSearch extends React.PureComponent {
	constructor(props) {
		super(props);
		this.selectSearch = this.selectSearch.bind(this);
		this.removeFromPinned = this.removeFromPinned.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectSearch(e) {
		e.stopPropagation();
		this.client.dispatchAction('/search-glyph', {query: this.props.query});
	}

	removeFromPinned(e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned-search', {query: this.props.query});
	}

	render() {

		const itemClasses = classNames({
			'glyph-tag': true,
			'glyph-search': true,
			'is-active': this.props.selected === this.props.search,
		});

		return (
			<div className={itemClasses} onClick={this.selectSearch}>
				<div className="glyph-tag-name glyph-search-name">
					{this.props.search}
				</div>
				<div className="glyph-tag-button is-pinned" onClick={this.removeFromPinned}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		);
	}
}

class GlyphTag extends React.PureComponent {
	constructor(props) {
		super(props);
		this.selectTag = this.selectTag.bind(this);
		this.addToPinned = this.addToPinned.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectTag(e) {
		e.stopPropagation();
		this.client.dispatchAction('/select-tag', this.props.tag);
	}

	addToPinned(e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned', this.props.tag);
	}

	render() {

		const iconClasses = classNames({
			'glyph-tag-button': true,
			'is-pinned': this.props.pinned && this.props.pinned.indexOf(this.props.tag) !== -1,
		});

		const itemClasses = classNames({
			'glyph-tag': true,
			'is-active': this.props.selected === this.props.tag,
		});

		return (
			<div className={itemClasses} onClick={this.selectTag}>
				<div className="glyph-tag-name">
					{this.props.tag}
				</div>
				<div className={iconClasses} onClick={this.addToPinned}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		);
	}
}

class GlyphSearch extends React.PureComponent {
	constructor(props) {
		super(props);
		this.selectSearch = this.selectSearch.bind(this);
		this.addToPinned = this.addToPinned.bind(this);
		this.deleteSearch = this.deleteSearch.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectSearch(e) {
		e.stopPropagation();
		this.client.dispatchAction('/search-glyph', {query: this.props.search});
	}

	addToPinned(e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned-search', {query: this.props.search});
	}

	deleteSearch(e) {
		e.stopPropagation();
		this.client.dispatchAction('/delete-search-glyph', {query: this.props.search});
	}

	render() {

		const iconClasses = classNames({
			'glyph-tag-button': true,
			'is-pinned': this.props.pinned && this.props.pinned.indexOf(this.props.search) !== -1,
		});

		const itemClasses = classNames({
			'glyph-tag': true,
			'glyph-search': true,
			'is-active': this.props.selected === this.props.search,
		});

		return (
			<div className={itemClasses} onClick={this.selectSearch}>
				<div className="glyph-tag-name glyph-search-name">
					{this.props.search}
				</div>
				<div className={iconClasses} onClick={this.deleteSearch}>
					<div className="glyph-tag-button-icon glyph-tag-button-icon-delete">
						&nbsp;
					</div>
				</div>
				<div className={iconClasses} onClick={this.addToPinned}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		);
	}
}
