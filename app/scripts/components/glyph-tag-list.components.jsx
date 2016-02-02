import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import Classnames from 'classnames';

export default class GlyphTagList extends React.Component {
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

		const classes = Classnames({
			'glyph-tag-list': true,
			'is-active': this.state.show,
		});

		const pinned = _.map(this.props.pinned, (pin) => {
			return <GlyphPinnedTag tag={pin} selected={this.props.selected} key={`pin${pin}`}/>;
		});

		const pinnedSearch = _.map(this.props.pinnedSearch, (pin) => {
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
					{_.map(this.props.tags, (tag) => {
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
					{_.map(this.props.savedSearch, (query) => {
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

class GlyphPinnedTag extends React.Component {
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

		const itemClasses = Classnames({
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

class GlyphPinnedSearch extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectSearch(query, e) {
		e.stopPropagation();
		this.client.dispatchAction('/search-glyph', {query});
	}

	removeFromPinned(query, e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned-search', {query});
	}

	render() {

		const itemClasses = Classnames({
			'glyph-tag': true,
			'glyph-search': true,
			'is-active': this.props.selected === this.props.search,
		});

		return (
			<div className={itemClasses} onClick={(e) => { this.selectSearch(this.props.search, e); }}>
				<div className="glyph-tag-name glyph-search-name">
					{this.props.search}
				</div>
				<div className="glyph-tag-button is-pinned" onClick={(e) => { this.removeFromPinned(this.props.search, e); }}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		);
	}
}

class GlyphTag extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectTag(tag) {
		this.client.dispatchAction('/select-tag', tag);
	}

	addToPinned(tag, e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned', tag);
	}

	render() {

		const iconClasses = Classnames({
			'glyph-tag-button': true,
			'is-pinned': this.props.pinned && this.props.pinned.indexOf(this.props.tag) !== -1,
		});

		const itemClasses = Classnames({
			'glyph-tag': true,
			'is-active': this.props.selected === this.props.tag,
		});

		return (
			<div className={itemClasses} onClick={() => { this.selectTag(this.props.tag); }}>
				<div className="glyph-tag-name">
					{this.props.tag}
				</div>
				<div className={iconClasses} onClick={(e) => { this.addToPinned(this.props.tag, e); }}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		);
	}
}

class GlyphSearch extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectSearch(query) {
		this.client.dispatchAction('/search-glyph', {query});
	}

	addToPinned(query, e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned-search', {query});
	}

	deleteSearch(query, e) {
		e.stopPropagation();
		this.client.dispatchAction('/delete-search-glyph', {query});
	}

	render() {

		const iconClasses = Classnames({
			'glyph-tag-button': true,
			'is-pinned': this.props.pinned && this.props.pinned.indexOf(this.props.search) !== -1,
		});

		const itemClasses = Classnames({
			'glyph-tag': true,
			'glyph-search': true,
			'is-active': this.props.selected === this.props.search,
		});

		return (
			<div className={itemClasses} onClick={() => { this.selectSearch(this.props.search); }}>
				<div className="glyph-tag-name glyph-search-name">
					{this.props.search}
				</div>
				<div className={iconClasses} onClick={(e) => { this.deleteSearch(this.props.search, e); }}>
					<div className="glyph-tag-button-icon glyph-tag-button-icon-delete">
						&nbsp;
					</div>
				</div>
				<div className={iconClasses} onClick={(e) => { this.addToPinned(this.props.search, e); }}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		);
	}
}
