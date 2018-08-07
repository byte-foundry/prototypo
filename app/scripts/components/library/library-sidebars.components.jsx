import React from 'react';
import {Link} from 'react-router';

import LocalClient from '../../stores/local-client.stores';

export class LibrarySidebarLeft extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPersonalOpened: false,
			isTeamOpened: false,
			isFavoritesOpened: false,
		};
	}
	render() {
		const subUserLibrary = [];

		this.props.subUsers
			&& this.props.subUsers.forEach((subUser) => {
				subUser.id !== this.props.userId
					&& subUser.library.forEach((family) => {
						subUserLibrary.push(family);
					});
			});

		let subUsersProjects = subUserLibrary.map(f => (
			<p
				className={`sidebar-left-project ${
					this.props.routeParams && f.id === this.props.routeParams.projectID
						? 'active'
						: ''
				}`}
			>
				<Link to={`/library/project/${f.id}`}>
					<span className="big">{f.name}</span>
					<span className="small">({f.variants.length})</span>
				</Link>
			</p>
		));

		if (subUsersProjects.length > 9) {
			const initialsubUsersProjectsLength = subUsersProjects.length;

			subUsersProjects = subUsersProjects.slice(0, 9);
			subUsersProjects.push(
				<p className="sidebar-left-project">
					<Link to="/library/home?mode=team">
						And {initialsubUsersProjectsLength - 9} more...
					</Link>
				</p>,
			);
		}

		const isSubUserActive
			= (this.props.location.pathname === '/library/home'
				&& this.props.location.query.mode
				&& this.props.location.query.mode === 'team')
			|| (this.props.routeParams
				&& subUserLibrary.find(e => e.id === this.props.routeParams.projectID));

		let userProjects = [];

		let families;

		if (this.props.families) {
			families = JSON.parse(JSON.stringify(this.props.families));
		}

		families
			&& families.forEach(
				f =>
					f.variants
					&& f.variants.sort(
						(a, b) => Date.parse(a.updatedAt) < Date.parse(b.updatedAt),
					),
			);
		families
			&& families
				.sort(
					(a, b) =>
						Date.parse(a.variants[0].updatedAt)
						< Date.parse(b.variants[0].updatedAt),
				)
				.forEach((family) => {
					userProjects.push(
						<p
							className={`sidebar-left-project ${
								this.props.routeParams
								&& family.id === this.props.routeParams.projectID
									? 'active'
									: ''
							}`}
						>
							<Link to={`/library/project/${family.id}`}>
								<span className="big">{family.name}</span>
								<span className="small">({family.variants.length})</span>
							</Link>
						</p>,
					);
				});

		if (userProjects.length > 9) {
			const initialuserProjectsLength = userProjects.length;

			userProjects = userProjects.slice(0, 9);
			userProjects.push(
				<p className="sidebar-left-project">
					<Link to="/library/home?mode=personnal">
						And {initialuserProjectsLength - 9} more...
					</Link>
				</p>,
			);
		}

		const isUserProjectActive
			= (this.props.location.pathname === '/library/home'
				&& this.props.location.query.mode
				&& this.props.location.query.mode === 'personnal')
			|| (this.props.routeParams
				&& this.props.families
				&& this.props.families.find(
					e => e.id === this.props.routeParams.projectID,
				));

		let userFavourites = [];
		let favourites;

		if (this.props.favourites) {
			favourites = JSON.parse(JSON.stringify(this.props.favourites));
		}
		favourites
			&& favourites
				.sort((a, b) => Date.parse(a.updatedAt) < Date.parse(b.updatedAt))
				.forEach((abstractedFont) => {
					if (abstractedFont.type !== 'Family' || abstractedFont.family) {
						userFavourites.push(
							<p
								className={`sidebar-left-project ${
									this.props.routeParams
									&& abstractedFont.type === 'Family'
									&& abstractedFont.family.id === this.props.routeParams.projectID
										? 'active'
										: ''
								}`}
							>
								{abstractedFont.type === 'Family' ? (
									<Link to={`/library/project/${abstractedFont.family.id}`}>
										<span className="big">{abstractedFont.name}</span>{' '}
										<span className="small">
											({abstractedFont.family.variants.length})
										</span>
									</Link>
								) : (
									<Link to="/library/home?mode=favorites">
										<span>{abstractedFont.name}</span>{' '}
									</Link>
								)}
							</p>,
						);
					}
				});

		if (userFavourites.length > 9) {
			const initialuserFavouritesLength = userFavourites.length;

			userFavourites = userFavourites.slice(0, 9);
			userFavourites.push(
				<p className="sidebar-left-project">
					<Link to="/library/home?mode=favorites">
						And {initialuserFavouritesLength - 9} more...
					</Link>
				</p>,
			);
		}

		const isUserFavouritesActive
			= (this.props.location.pathname === '/library/home'
				&& this.props.location.query.mode
				&& this.props.location.query.mode === 'favorites')
			|| (this.props.routeParams
				&& this.props.favourites
				&& this.props.favourites.find(
					e =>
						e.type === 'Family'
						&& e.family
						&& e.family.id === this.props.routeParams.projectID,
				));

		return (
			<div className="library-sidebar-left">
				{this.props.location.pathname !== '/library/create' && (
					<Link to="/library/create" className="library-sidebar-action-dark">
						New Project
					</Link>
				)}
				{this.props.location.pathname === '/library/create' && (
					<Link to="/library/home" className="library-sidebar-action-dark">
						Back to library
					</Link>
				)}
				{this.props.location.pathname !== '/library/create' && (
					<div>
						<div className="library-links">
							<div>
								<Link
									to="/library/home"
									className={`library-link ${
										this.props.location.pathname === '/library/home'
										&& !this.props.location.query.mode
											? 'active'
											: ''
									}`}
								>
									<span className="library-link-arrow hidden">▶</span>All
								</Link>
							</div>
							<div>
								<p
									className={`library-link ${
										isUserProjectActive ? 'active' : ''
									}`}
								>
									<span
										className={`library-link-arrow ${
											this.state.isPersonalOpened ? 'active' : ''
										}`}
										onClick={() => {
											this.setState({
												isPersonalOpened: !this.state.isPersonalOpened,
											});
										}}
									>
										▶
									</span>{' '}
									<Link to="/library/home?mode=personnal">
										Personal library
									</Link>
								</p>
								{this.state.isPersonalOpened && userProjects}
							</div>
							{this.props.subUsers
								&& this.props.subUsers.length > 0 && (
								<div>
									<p
										className={`library-link ${
											isSubUserActive ? 'active' : ''
										}`}
									>
										<span
											className={`library-link-arrow ${
												this.state.isTeamOpened ? 'active' : ''
											}`}
											onClick={() => {
												this.setState({
													isTeamOpened: !this.state.isTeamOpened,
												});
											}}
										>
												▶
										</span>{' '}
										<Link to="/library/home?mode=team">Team library</Link>
									</p>
									{this.state.isTeamOpened && subUsersProjects}
								</div>
							)}
						</div>
						<hr />
						<div className="library-links">
							<div>
								<p
									className={`library-link ${
										isUserFavouritesActive ? 'active' : ''
									}`}
								>
									<span
										className={`library-link-arrow ${
											this.state.isFavoritesOpened ? 'active' : ''
										}`}
										onClick={() => {
											this.setState({
												isFavoritesOpened: !this.state.isFavoritesOpened,
											});
										}}
									>
										▶
									</span>{' '}
									<Link to="/library/home?mode=favorites">Favorites</Link>
								</p>
								{this.state.isFavoritesOpened && userFavourites}
							</div>
							<div>
								<Link
									to="/library/hosting"
									className={`library-link ${
										this.props.location.pathname === '/library/hosting'
											? 'active'
											: ''
									}`}
								>
									<span className="library-link-arrow hidden">▶</span>Hosted
									fonts
								</Link>
							</div>
							<div>
								<Link
									to="/library/fontinuse"
									className={`library-link ${
										this.props.location.pathname === '/library/fontinuse'
											? 'active'
											: ''
									}`}
								>
									<span className="library-link-arrow hidden">▶</span>Fonts in
									use
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export class LibrarySidebarRight extends React.Component {
	render() {
		return (
			<div className="library-sidebar-right">
				<Link
					to="/account/home"
					className="sidebar-action sidebar-action-account"
				>
					My account
				</Link>
				{this.props.children}
			</div>
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
				{this.props.isPersonnal
					&& this.props.mode === 'see' && (
					<Link
						className="sidebar-action"
						to={`/library/project/${this.props.familyId}/details`}
					>
							Family settings
					</Link>
				)}
				{this.props.isPersonnal
					&& this.props.mode === 'details' && (
					<Link
						className="sidebar-action"
						to={`/library/project/${this.props.familyId}`}
					>
							Family dashboard
					</Link>
				)}
				{this.props.isPersonnal && (
					<div
						className="sidebar-action"
						onClick={() => {
							this.addVariant();
						}}
					>
						Add new Variant
					</div>
				)}

				{this.props.isPersonnal
					&& this.props.mode === 'details' && (
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
									key => this.props.glyphs[key][0].unicode !== undefined,
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
							className={`sidebar-filter-elem ${elem.active ? 'active' : ''}`}
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
// eslint-disable-next-line
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
		this.removeTag = this.removeTag.bind(this);
	}
	setActiveTag(elem) {
		const newTags = [...this.state.tags];
		const newTagsIndex = newTags.findIndex(e => e.name === elem);

		newTags[newTagsIndex].active = !newTags[newTagsIndex].active;
		this.setState({tags: newTags});
		const filteredTags = newTags.filter(e => e.active).map(e => e.name);

		this.client.dispatchAction('/store-value', {
			librarySelectedTags: filteredTags,
		});
	}
	addTag(e, doNotClose = false) {
		const newTags = [...(this.props.tags || [])];

		if (
			this.state.newTag.trim(' ') !== ''
			&& newTags.findIndex(e => e === this.state.newTag) === -1
		) {
			newTags.push(this.state.newTag);
			this.props.updateTags(this.props.familyId, newTags);
		}

		this.setState({
			newTag: '',
			addButtonActive: doNotClose,
		});

		if (doNotClose) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
	removeTag(elem) {
		const newTags = [...this.props.tags];

		newTags.splice(newTags.findIndex(e => e === elem), 1);
		this.props.updateTags(this.props.familyId, newTags);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();

		const tagsDedup = [];

		this.props.tags
			&& this.props.tags.forEach((item) => {
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
		if (JSON.stringify(newProps.tags) !== JSON.stringify(this.props.tags)) {
			const tagsDedup = [];

			newProps.tags
				&& newProps.tags.forEach((item) => {
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
							className={`sidebar-tags-elem ${elem.active ? 'active' : ''} ${
								this.props.mode
							}`}
							onClick={() => {
								if (this.props.mode !== 'readonly') {
									this.setActiveTag(elem.name);
								}
								else {
									this.removeTag(elem.name);
								}
							}}
							key={`tag${elem.name}`}
						>
							{elem.name}
						</div>
					))}
				</div>
				{this.props.mode !== 'readonly'
					&& this.state.tags.length === 0 && (
					<span>No tags yet. Open one of your project to add one!</span>
				)}
				{this.props.isPersonnal && (
					<div
						className={`sidebar-tags-add ${this.props.mode} ${
							this.state.addButtonActive ? 'active' : ''
						}`}
						onClick={() => {
							this.setState({addButtonActive: true});
						}}
					>
						{this.state.addButtonActive ? (
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
										this.addTag(e);
									}
									if (e.keyCode === 188) {
										this.addTag(e, true);
									}
								}}
							/>
						) : (
							<span>+</span>
						)}
					</div>
				)}
			</div>
		);
	}
}
