import React from 'react';
import {Route, Link, matchPath, withRouter} from 'react-router-dom';

import LocalClient from '../../stores/local-client.stores';
import LibraryButton from './library-button.components';

class LibrarySidebarLeftRaw extends React.Component {
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
		const query = new URLSearchParams(this.props.location.search);

		this.props.subUsers
			&& this.props.subUsers.forEach((subUser) => {
				subUser.id !== this.props.userId
					&& subUser.library.forEach((family) => {
						subUserLibrary.push(family);
					});
			});

		let subUsersProjects = subUserLibrary.map(f => (
			<Route path={`/library/project/${f.id}`}>
				{({match}) => (
					<p className={`sidebar-left-project ${match ? 'active' : ''}`}>
						<Link to={`/library/project/${f.id}`}>
							<span className="big">{f.name}</span>
							<span className="small">({f.variants.length})</span>
						</Link>
					</p>
				)}
			</Route>
		));

		if (subUsersProjects.length > 9) {
			const initialsubUsersProjectsLength = subUsersProjects.length;

			subUsersProjects = subUsersProjects.slice(0, 9);
			subUsersProjects.push(
				<p className="sidebar-left-project">
					<Link to="/library?mode=team">
						And {initialsubUsersProjectsLength - 9} more...
					</Link>
				</p>,
			);
		}

		const isSubUserActive
			= (this.props.location.pathname === '/library'
				&& query.get('mode') === 'team')
			|| subUserLibrary.some(e => e.id === this.props.match.params.projectID);

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
						a.variants[0]
						&& b.variants[0]
						&& Date.parse(a.variants[0].updatedAt)
							< Date.parse(b.variants[0].updatedAt),
				)
				.forEach((family) => {
					userProjects.push(
						<Route path={`/library/project/${family.id}`}>
							{({match}) => (
								<p className={`sidebar-left-project ${match ? 'active' : ''}`}>
									<Link to={`/library/project/${family.id}`}>
										<span className="big">{family.name}</span>
										<span className="small">({family.variants.length})</span>
									</Link>
								</p>
							)}
						</Route>,
					);
				});

		if (userProjects.length > 9) {
			const initialuserProjectsLength = userProjects.length;

			userProjects = userProjects.slice(0, 9);
			userProjects.push(
				<p className="sidebar-left-project">
					<Link to="/library?mode=personal">
						And {initialuserProjectsLength - 9} more...
					</Link>
				</p>,
			);
		}

		const isUserProjectActive
			= (this.props.location.pathname === '/library'
				&& query.get('mode') === 'personal')
			|| (this.props.families
				&& this.props.families.some(e => matchPath(`/library/project/${e.id}`)));

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
							<Route
								path={`/library/project/${abstractedFont.family
									&& abstractedFont.family.id}`}
							>
								{({match}) => (
									<p
										className={`sidebar-left-project ${
											abstractedFont.type === 'Family' && match ? 'active' : ''
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
											<Link to="/library?mode=favorites">
												<span>{abstractedFont.name}</span>{' '}
											</Link>
										)}
									</p>
								)}
							</Route>,
						);
					}
				});

		if (userFavourites.length > 9) {
			const initialuserFavouritesLength = userFavourites.length;

			userFavourites = userFavourites.slice(0, 9);
			userFavourites.push(
				<p className="sidebar-left-project">
					<Link to="/library?mode=favorites">
						And {initialuserFavouritesLength - 9} more...
					</Link>
				</p>,
			);
		}

		const isUserFavouritesActive
			= (this.props.location.pathname === '/library'
				&& query.get('mode') === 'favorites')
			|| (this.props.favourites
				&& this.props.favourites.some(
					e =>
						e.type === 'Family'
						&& e.family
						&& matchPath(`/library/project/${e.family.id}`),
				));

		return (
			<div className="library-sidebar-left">
				{this.props.location.pathname !== '/library/create' && (
					<LibraryButton
						name="New Project"
						dark
						big
						onClick={() => {
							this.props.history.push('/library/create');
						}}
					/>
				)}
				{this.props.location.pathname === '/library/create' && (
					<LibraryButton
						name="Back to Library"
						dark
						big
						onClick={() => {
							this.props.history.push('/library/home');
						}}
					/>
				)}
				{this.props.location.pathname !== '/library/create' && (
					<div>
						<div className="library-links">
							<div>
								<Link
									to="/library"
									className={`library-link ${
										this.props.location.pathname === '/library'
										&& !query.has('mode')
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
									<Link to="/library?mode=personal">Personal library</Link>
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
										<Link to="/library?mode=team">Team library</Link>
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
									<Link to="/library?mode=favorites">Favorites</Link>
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

export const LibrarySidebarLeft = withRouter(LibrarySidebarLeftRaw);

class LibrarySidebarRightRaw extends React.Component {
	render() {
		return (
			<div className="library-sidebar-right">
				<LibraryButton
					name="My account"
					dark
					bold
					highlight
					full
					onClick={() => {
						this.props.history.push('/account/home');
					}}
				/>
				{this.props.children}
			</div>
		);
	}
}

export const LibrarySidebarRight = withRouter(LibrarySidebarRightRaw);

class FamilySidebarActionsRaw extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			confirmDelete: false,
		};
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
				<LibraryButton
					name="Export family"
					bold
					full
					loading={this.props.exporting}
					error={this.props.errorExport}
					onClick={() => {
						this.props.exportFamily();
					}}
				/>
				{this.props.isPersonal
					&& this.props.mode === 'see' && (
					<LibraryButton
						name="Family settings"
						bold
						full
						onClick={() => {
							this.props.history.push(
								`/library/project/${this.props.familyId}/details`,
							);
						}}
					/>
				)}
				{this.props.isPersonal
					&& this.props.mode === 'details' && (
					<LibraryButton
						name="Family dashboard"
						bold
						full
						onClick={() => {
							this.props.history.push(
								`/library/project/${this.props.familyId}`,
							);
						}}
					/>
				)}
				{this.props.isPersonal && (
					<LibraryButton
						name="Add new Variant"
						bold
						full
						onClick={() => {
							this.addVariant();
						}}
					/>
				)}

				{this.props.isPersonal
					&& this.props.mode === 'details' && (
					<LibraryButton
						name={`${this.state.confirmDelete ? 'Confirm' : 'Delete family'}`}
						bold
						full
						error={this.state.confirmDelete}
						onClick={() => {
							if (this.state.confirmDelete) {
								this.props.deleteFamily();
							}
							else {
								this.setState({confirmDelete: true});
							}
						}}
						onBlur={() => {
							this.setState({confirmDelete: false});
						}}
					/>
				)}
			</div>
		);
	}
}

export const FamilySidebarActions = withRouter(FamilySidebarActionsRaw);

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
							name: 'Preset',
						},
						{
							active: false,
							name: 'Font',
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
						{
							active: false,
							name: 'Havas',
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
				{this.props.isPersonal && (
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
