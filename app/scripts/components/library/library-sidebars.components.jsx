import React from 'react';
import {Link} from 'react-router';

import LocalClient from '../../stores/local-client.stores';

export class LibrarySidebarLeft extends React.Component {
	render() {
		return (
			<div className="library-sidebar-left">
				{this.props.location.pathname !== '/library/create' && (
					<Link
						to="/library/create"
						className="library-sidebar-action-dark"
					>
						New Project
					</Link>
				)}
				{this.props.location.pathname === '/library/create' && (
					<Link
						to="/library/home"
						className="library-sidebar-action-dark"
					>
						Back to library
					</Link>
				)}
				{this.props.location.pathname !== '/library/create' && (
					<div className="library-links">
						<Link
							to="/library/home"
							className={`library-link ${
								this.props.location.pathname === '/library/home'
									? 'active'
									: ''
							}`}
						>
							All
						</Link>
					</div>
				)}
			</div>
		);
	}
}

export class LibrarySidebarRight extends React.Component {
	render() {
		return (
			<div className="library-sidebar-right">{this.props.children}</div>
		);
	}
}

export class FamilySidebarActions extends React.Component {
	constructor(props) {
		super(props);
		this.addVariant = this.addVariant.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
	}
	addVariant() {
		this.client.dispatchAction('/store-value', {
			openVariantModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}
	render() {
		return (
			<div className="sidebar-actions-family">
				<div
					className="sidebar-action"
					onClick={() => {
						this.props.exportFamily();
					}}
				>
					Export family
				</div>
				{this.props.mode === 'see' && (
					<Link
						className="sidebar-action"
						to={`/library/project/${this.props.familyId}/details`}
					>
						Family settings
					</Link>
				)}
				{this.props.mode === 'details' && (
					<Link
						className="sidebar-action"
						to={`/library/project/${this.props.familyId}`}
					>
						Family dashboard
					</Link>
				)}
				<div
					className="sidebar-action"
					onClick={() => {
						this.addVariant();
					}}
				>
					Add new Variant
				</div>
				{this.props.mode === 'details' && (
					<div
						className="sidebar-action"
						onClick={() => {
							this.props.deleteFamily();
						}}
					>
						Delete family
					</div>
				)}
			</div>
		);
	}
}

export class FamilySidebarGlyphs extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="sidebar-glyphs">
				<div className="sidebar-glyphs-title">Support</div>
				{this.props.glyphs && (
					<div className="sidebar-glyphs-language">
						Latin<span>
							{
								Object.keys(this.props.glyphs).filter(
									key =>
										this.props.glyphs[key][0].unicode
										!== undefined,
								).length
							}
						</span>
					</div>
				)}
			</div>
		);
	}
}

export class SidebarFilters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeFilters: {
				type: 'All',
				designer: 'All',
			},
		};
		this.editActiveFilter = this.editActiveFilter.bind(this);
	}
	editActiveFilter(name, value) {
		const activeFilters = {...this.state.activeFilters};

		activeFilters[name] = value;
		this.setState({activeFilters});
		this.props.setActiveFilters(activeFilters);
	}
	render() {
		return (
			<div className="sidebar-filters">
				<SidebarFilter
					title="Type"
					elems={[
						{
							active: true,
							name: 'All',
						},
						{
							active: false,
							name: 'Template',
						},
						{
							active: false,
							name: 'Presets',
						},
						{
							active: false,
							name: 'Fonts',
						},
					]}
					editActiveFilter={this.editActiveFilter}
				/>
				<SidebarFilter
					title="Designer"
					elems={[
						{
							active: true,
							name: 'All',
						},
						{
							active: false,
							name: 'Prototypo',
						},
						{
							active: false,
							name: 'Production type',
						},
						{
							active: false,
							name: 'Google',
						},
					]}
					editActiveFilter={this.editActiveFilter}
				/>
			</div>
		);
	}
}

class SidebarFilter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: props.title,
			elems: props.elems,
		};
		this.setElemActive = this.setElemActive.bind(this);
	}
	setElemActive(elem) {
		const elems = [...this.state.elems];
		const activeIndex = elems.findIndex(e => e.active === true);
		const clickedIndex = elems.findIndex(e => e.name === elem.name);

		elems[activeIndex].active = false;
		elems[clickedIndex].active = true;
		this.setState({elems});
		this.props.editActiveFilter(this.state.title.toLowerCase(), elem.name);
	}
	render() {
		return (
			<div className="sidebar-filter">
				<p className="sidebar-filter-title">{this.state.title}</p>
				<div className="sidebar-filter-elems">
					{this.state.elems.map(elem => (
						<div
							className={`sidebar-filter-elem ${
								elem.active ? 'active' : ''
							}`}
							onClick={() => {
								this.setElemActive(elem);
							}}
							key={`filter${this.state.title}${elem.name}`}
						>
							{elem.name}
						</div>
					))}
				</div>
			</div>
		);
	}
}

export class SidebarTags extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tags: [],
			newTag: '',
			addButtonActive: false,
		};
		this.setActiveTag = this.setActiveTag.bind(this);
		this.addTag = this.addTag.bind(this);
	}
	setActiveTag(elem) {}
	addTag() {
		const newTags = [...this.props.tags];

		newTags.push(this.state.newTag);
		this.props.updateTags(this.props.familyId, newTags);
		this.setState({
			newTag: '',
			addButtonActive: false,
		});
	}
	componentWillMount() {
		const tagsDedup = [];

		this.props.tags && this.props.tags.forEach((item) => {
			if (tagsDedup.indexOf(item) < 0) {
				tagsDedup.push(item);
			}
		});
		const newTags = tagsDedup.map(tag => ({
			name: tag,
			active: false,
		}));

		this.setState({tags: newTags});
	}
	componentWillReceiveProps(newProps) {
		if (newProps.tags !== this.props.tags) {
			const tagsDedup = [];

			newProps.tags && newProps.tags.forEach((item) => {
				if (tagsDedup.indexOf(item) < 0) {
					tagsDedup.push(item);
				}
			});
			const newTags = tagsDedup.map(tag => ({
				name: tag,
				active: false,
			}));

			this.setState({tags: newTags});
		}
	}
	render() {
		return (
			<div className="sidebar-tags">
				<p className="sidebar-tags-title">Tags</p>
				<div className="sidebar-tags-elems">
					{this.state.tags.map(elem => (
						<div
							className={`sidebar-tags-elem ${
								elem.active ? 'active' : ''
							} ${this.props.mode}`}
							onClick={() => {
								if (this.props.mode !== 'readonly') {
									this.setActiveTag(elem);
								}
							}}
							key={`tag${elem.name}`}
						>
							{elem.name}
						</div>
					))}
				</div>
				<div
					className={`sidebar-tags-add ${
						this.state.addButtonActive ? 'active' : ''
					}`}
					onClick={() => {
						this.setState({addButtonActive: true});
					}}
				>
					{this.props.mode === 'readonly'
					&& this.state.addButtonActive ? (
							<input
								type="text"
								name=""
								id=""
								tabIndex="0"
								placeholder="type then press enter.."
								onBlur={() => {
									this.setState({addButtonActive: false});
								}}
								value={this.state.newTag}
								onChange={(e) => {
									this.setState({newTag: e.target.value});
								}}
								onKeyDown={(e) => {
									if (e.keyCode === 13) {
										this.addTag();
									}
								}}
							/>
						) : (
							<span>+</span>
						)}
				</div>
			</div>
		);
	}
}
