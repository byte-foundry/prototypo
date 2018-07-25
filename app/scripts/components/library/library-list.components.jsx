import React from 'react';
import _uniq from 'lodash/uniq';
import pleaseWait from 'please-wait';
import {Link} from 'react-router';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar/dist/no-css';
import {graphql, gql, compose} from 'react-apollo';

import FontUpdater from '../font-updater.components';
import LocalClient from '../../stores/local-client.stores';

import {
	LibrarySidebarRight,
	SidebarFilters,
	SidebarTags,
} from './library-sidebars.components';

import LibrarySearch from './library-search.components';

class LibraryList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search: '',
			activeFilters: [],
			librarySelectedTags: [],
			mode: '',
		};
		this.generateFonts = this.generateFonts.bind(this);
		this.filterFonts = this.filterFonts.bind(this);
		this.createProject = this.createProject.bind(this);
		this.selectFont = this.selectFont.bind(this);
		this.updateFavourites = this.updateFavourites.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
		});

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					openFamilyModal: head.toJS().d.openFamilyModal,
					openVariantModal: head.toJS().d.openVariantModal,
					openChangeVariantNameModal: head.toJS().d
						.openChangeVariantNameModal,
					openDuplicateVariantModal: head.toJS().d
						.openDuplicateVariantModal,
					familySelectedVariantCreation: head.toJS().d
						.familySelectedVariantCreation,
					collectionSelectedVariant: head.toJS().d
						.collectionSelectedVariant,
					templatesData: head.toJS().d.templatesData,
				});
				this.generateFonts();
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	createProject(template, values) {
		this.props.router.push({
			pathname: '/onboarding',
			state: {template, values},
		});
	}

	updateFavourites(favourite, type, id) {
		const favourites = [...this.props.favourites];
		let relatedKey;

		switch (type) {
		case 'Template':
			relatedKey = 'template';
			break;
		case 'Preset':
			relatedKey = 'preset';
			break;
		case 'Family':
			relatedKey = 'family';
			break;
		default:
			break;
		}
		if (favourite) {
			this.props.deleteFavourite(favourite.id);
		}
		else {
			switch (type) {
			case 'Template':
				this.props.addFavourite(type, undefined, id, undefined);
				break;
			case 'Preset':
				this.props.addFavourite(type, undefined, undefined, id);
				break;
			case 'Family':
				this.props.addFavourite(type, id, undefined, undefined);
				break;
			default:
				break;
			}
		}
	}

	getTemplateProps(template, templateData, favourites) {
		return () => ({
			key: template.templateName,
			template,
			glyphs: templateData.glyphs,
			values: templateData.initValues,
			export: this.props.export,
			createProject: this.createProject,
			click: this.selectFont,
			isOpen: this.state.selectedFont === template.templateName,
			familyId: template.templateName,
			fontName: `template${template.templateName.split('.').join('')}`,
			templateName: template.templateName,
			favourite: favourites.find(
				f => f.type === 'Template' && f.template === template.name,
			),
			updateFavourites: this.updateFavourites,
		});
	}

	getPresetProps(
		preset,
		templateInfo,
		templateData,
		lmColor,
		hmColor,
		favourites,
	) {
		return () => ({
			key: preset.id,
			preset,
			template: templateInfo,
			user: preset.ownerInitials,
			name: preset.variant.family.name,
			createProject: this.createProject,
			background: preset.ownerInitials === 'LM' ? lmColor : hmColor,
			glyphs: templateData.glyphs,
			values: preset.baseValues,
			export: this.props.export,
			click: this.selectFont,
			isOpen: this.state.selectedFont === preset.id,
			familyId: preset.id,
			fontName: `preset${preset.id}`,
			templateName: templateInfo.templateName,
			favourite: favourites.find(
				f => f.type === 'Preset' && f.preset.id === preset.id,
			),
			updateFavourites: this.updateFavourites,
		});
	}

	getFamilyProps(
		family,
		templateInfo,
		templateData,
		variantToLoad,
		userColor,
		isFromTeam = false,
		favourites,
	) {
		return () =>
			variantToLoad && {
				key: family.id,
				family,
				template: templateInfo,
				user: this.props.user,
				background: userColor,
				router: this.props.router,
				variantToLoad,
				open: this.props.open,
				export: this.props.export,
				glyphs: templateData.glyphs,
				values: {
					...templateData.initValues,
					...variantToLoad.values,
				},
				variantName: variantToLoad.name.toLowerCase(),
				click: this.selectFont,
				isOpen: this.state.selectedFont === family.id,
				familyId: family.id,
				templateName: templateInfo.templateName,
				fontName: `user${family.id}`,
				isFromTeam,
				favourite: favourites.find(
					f => f.type === 'Family' && f.family.id === family.id,
				),
				updateFavourites: this.updateFavourites,
			};
	}

	generateFonts(f, p, fa) {
		const families = f || this.props.families;
		const presets = p || this.props.presets;
		const favourites = fa || this.props.favourites || [];
		const customBadgesColor = [
			'#29ABE2',
			'#0000FF',
			'#00FF00',
			'#FF0000',
			'#F7931E',
		];

		const subUserColors = [
			'#A9B247',
			'#29FF58',
			'#00B288',
			'#246699',
			'#4C2556',
		];

		const userColor = customBadgesColor[0];
		const lmColor = customBadgesColor[1];
		const hmColor = customBadgesColor[4];

		const fontData = [];

		this.state.templateInfos
			&& this.state.templateInfos.forEach((template) => {
				const templateData = this.state.templatesData.find(
					e => e.name === template.templateName,
				);

				fontData.push({
					template: template.templateName,
					templateName: template.name,
					name: template.name,
					tags: [],
					designer: template.provider,
					id: template.id,
					type: 'Template',
					props: this.getTemplateProps(
						template,
						templateData,
						favourites,
					),
					elem: TemplateItem,
				});
			});
		presets
			&& this.state.templateInfos
			&& presets
				.filter(
					preset =>
						preset.variant.family.name !== 'Spectral'
						&& preset.variant.family.name !== 'Elzevir'
						&& preset.variant.family.name !== 'Grotesk'
						&& preset.variant.family.name !== 'Fell'
						&& preset.variant.family.name !== 'Antique',
				)
				.forEach((preset) => {
					const templateInfo = this.state.templateInfos.find(
						template => preset.template === template.templateName,
					) || {name: 'Undefined'};
					const templateData = this.state.templatesData.find(
						e => e.name === preset.template,
					);

					fontData.push({
						template: templateInfo.templateName,
						templateName: templateInfo.name,
						type: 'Presets',
						name: preset.variant.family.name,
						designer:
							preset.ownerInitials === 'LM'
							|| preset.ownerInitials === 'HM'
								? 'Prototypo'
								: '',
						id: preset.id,
						tags: [],
						props: this.getPresetProps(
							preset,
							templateInfo,
							templateData,
							lmColor,
							hmColor,
							favourites,
						),
						elem: PresetItem,
					});
				});
		const allTags = [];

		families
			&& this.state.templateInfos
			&& families.forEach((family) => {
				const templateInfo = this.state.templateInfos.find(
					template => template.templateName === family.template,
				) || {name: 'Undefined'};
				const templateData = this.state.templatesData.find(
					e => e.name === family.template,
				);

				family.tags && family.tags.map(tag => allTags.push(tag));
				const variantToLoad
					= family.variants.find(
						e => e.name.toLowerCase() === 'regular',
					) || family.variants[0];

				if (variantToLoad) {
					fontData.push({
						template: templateInfo.templateName,
						templateName: templateInfo.name,
						name: family.name,
						designer: '',
						type: 'Fonts',
						tags: family.tags || [],
						variants: family.variants,
						id: family.id,
						user: {
							firstName: this.props.firstName,
							lastName: this.props.lastName,
						},
						background: userColor,
						props: this.getFamilyProps(
							family,
							templateInfo,
							templateData,
							variantToLoad,
							userColor,
							false,
							favourites,
						),
						elem: FamilyItem,
					});
				}
			});

		this.props.subUsers
			&& this.state.templateInfos
			&& this.props.subUsers.forEach((subUser, index) => {
				const subUserColor
					= subUserColors[index % subUserColors.length];

				subUser.id !== this.props.user.id
					&& subUser.library.forEach((family) => {
						const templateInfo = this.state.templateInfos.find(
							template =>
								template.templateName === family.template,
						) || {name: 'Undefined'};
						const templateData = this.state.templatesData.find(
							e => e.name === family.template,
						);

						family.tags
							&& family.tags.map(tag => allTags.push(tag));
						const variantToLoad
							= family.variants.find(
								e => e.name.toLowerCase() === 'regular',
							) || family.variants[0];

						if (variantToLoad) {
							fontData.push({
								template: templateInfo.templateName,
								templateName: templateInfo.name,
								name: family.name,
								designer: '',
								type: 'SubUser',
								tags: family.tags || [],
								variants: family.variants,
								id: family.id,
								user: {
									firstName: subUser.firstName,
									lastName: subUser.lastName,
								},
								background: subUserColor,
								props: this.getFamilyProps(
									family,
									templateInfo,
									templateData,
									variantToLoad,
									subUserColor,
									true,
									favourites,
								),
								elem: FamilyItem,
							});
						}
					});
			});
		const tagCount = allTags.reduce((obj, val) => {
			obj[val] = (obj[val] || 0) + 1;
			return obj;
		}, {});
		const tagsDedup = Object.keys(tagCount).sort(
			(a, b) => tagCount[b] - tagCount[a],
		);

		this.setState({
			baseFontData: fontData,
			fontsToDisplay: fontData,
			isBaseValueLoaded: true,
			tags: tagsDedup.slice(0, 10),
		});
		this.filterFonts(
			this.props.activeFilters,
			this.state.librarySelectedTags,
			this.state.search,
			this.state.mode,
			fontData,
		);
	}

	filterFonts(activeFilters, selectedTags, searchString, mode, newBaseFontData) {
		const baseFontData = newBaseFontData || this.state.baseFontData;

		// Filter
		let fontsToDisplay = baseFontData;

		Object.keys(activeFilters).forEach((filterBy) => {
			fontsToDisplay = fontsToDisplay.filter(
				e =>
					activeFilters[filterBy] === 'All'
					|| activeFilters[filterBy]
						.toLowerCase()
						.includes(e[filterBy].toLowerCase()),
			);
		});

		// Tags
		fontsToDisplay = fontsToDisplay.filter(
			font =>
				font.tags
				&& selectedTags.every(elem => font.tags.indexOf(elem) > -1),
		);

		// Search
		fontsToDisplay = fontsToDisplay.filter(
			font =>
				font.template
					.toLowerCase()
					.includes(searchString.toLowerCase())
				|| font.templateName
					.toLowerCase()
					.includes(searchString.toLowerCase())
				|| font.name.toLowerCase().includes(searchString.toLowerCase())
				|| (font.tags
					&& font.tags.find(e =>
						e.toLowerCase().includes(searchString.toLowerCase()),
					)),
		);

		// Mode

		let type = '';

		switch (mode) {
		case 'personnal':
			type = 'Fonts';
			break;
		case 'team':
			type = 'SubUser';
			break;
		default:
			break;
		}

		fontsToDisplay = fontsToDisplay.filter(font =>
			font.type.includes(type),
		);

		if (mode === 'favorites') {
			fontsToDisplay = fontsToDisplay.filter(font => !!font.props().favourite);
		}

		this.setState({fontsToDisplay});
	}

	componentWillReceiveProps(newProps) {
		if (newProps.activeFilters !== this.props.activeFilters) {
			this.setState({activeFilters: newProps.activeFilters});
			this.filterFonts(
				newProps.activeFilters,
				this.state.librarySelectedTags,
				this.state.search,
				this.state.mode,
			);
		}
		if (
			newProps.families !== this.props.families
			|| newProps.favourites !== this.props.favourites
		) {
			this.generateFonts(
				newProps.families,
				newProps.presets,
				newProps.favourites,
			);
		}
		if (newProps.search !== this.props.search) {
			this.setState({search: newProps.search});
			this.filterFonts(
				this.state.activeFilters,
				this.state.librarySelectedTags,
				newProps.search,
				this.state.mode,
			);
		}
		if (
			JSON.stringify(newProps.librarySelectedTags)
			!== JSON.stringify(this.props.librarySelectedTags)
		) {
			this.setState({librarySelectedTags: newProps.librarySelectedTags});
			this.filterFonts(
				this.state.activeFilters,
				newProps.librarySelectedTags,
				this.state.search,
				this.state.mode,
			);
		}
		if (newProps.location.query !== this.props.location.query) {
			this.setState({
				mode: newProps.location.query && newProps.location.query.mode,
			});
			this.filterFonts(
				this.state.activeFilters,
				this.state.librarySelectedTags,
				this.state.search,
				newProps.location.query && newProps.location.query.mode,
			);
		}
	}

	selectFont(id) {
		this.setState({
			selectedFont: this.state.selectedFont === id ? undefined : id,
		});
	}

	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-list">
					<FamilyList fontsToDisplay={this.state.fontsToDisplay} />
				</div>
				<LibrarySidebarRight>
					<LibrarySearch />
					<SidebarFilters
						setActiveFilters={this.props.setActiveFilters}
					/>
					<SidebarTags tags={this.state.tags} mode="interactive" />
					<Link
						className="sidebar-action"
						to="/library/fontinuse/create"
					>
						Add fontsinuse
					</Link>
				</LibrarySidebarRight>
			</div>
		);
	}
}

LibraryList.propTypes = {
	families: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string,
			name: PropTypes.string,
			template: PropTypes.string,
		}),
	).isRequired,
};

LibraryList.defaultProps = {
	families: [],
};

export default LibraryList;

class FamilyList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<ScrollArea
				className="library-list-families"
				contentClassName="library-list-families-content"
				horizontal={false}
				style={{overflowX: 'visible'}}
			>
				<div className="library-family-list">
					{this.props.fontsToDisplay
						&& this.props.fontsToDisplay.map(font =>
							React.createElement(font.elem, {...font.props()}),
						)}
				</div>
			</ScrollArea>
		);
	}
}

export class TemplateItem extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
		this.state = {
			text: 'Hamburgefonstiv 123',
		};
		this.onTextChange = this.onTextChange.bind(this);
	}

	onTextChange({target: {value}}) {
		this.setState({
			text: value,
		});
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}

	render() {
		return (
			<div className="library-item" tabIndex={0}>
				<p className="library-item-name">
					<span
						className={`star-icon ${
							this.props.favourite ? 'active' : ''
						}`}
						onClick={() => {
							this.props.updateFavourites(
								this.props.favourite,
								'Template',
								this.props.template.name,
							);
						}}
					>
						★
					</span>
					{this.props.template.name}
				</p>
				<p
					className="library-item-preview"
					style={{
						fontFamily: `template${this.props.template.templateName
							.split('.')
							.join('')}`,
					}}
					onClick={this.selectFont}
				>
					{this.state.text}
				</p>
				<div
					className={`provider provider-${
						this.props.template.provider
					}`}
				/>
				<div
					className={`library-item-actions ${
						this.props.isOpen ? 'opened' : ''
					}`}
				>
					<div
						className="library-item-action"
						onClick={() => {
							this.props.createProject(
								this.props.template.templateName,
							);
						}}
					>
						Edit
					</div>
					<div
						className="library-item-action"
						onClick={() => {
							this.props.export(
								this.props.template.name,
								'regular',
								this.props.values,
								this.props.template.templateName,
								this.props.glyphs,
							);
						}}
					>
						Download
					</div>
					<input
						type="text"
						name="displayedWord"
						value={this.state.text}
						onChange={this.onTextChange}
					/>
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset={this.state.text}
					glyph="0"
				/>
			</div>
		);
	}
}

export class FamilyItem extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
		this.state = {
			text: 'Hamburgefonstiv 123',
		};
		this.onTextChange = this.onTextChange.bind(this);
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}

	onTextChange({target: {value}}) {
		this.setState({
			text: value,
		});
	}

	render() {
		return (
			<div className="library-item" tabIndex={0}>
				<p className="library-item-name">
					<span
						className={`star-icon ${
							this.props.favourite ? 'active' : ''
						}`}
						onClick={() => {
							this.props.updateFavourites(
								this.props.favourite,
								'Family',
								this.props.family.id,
							);
						}}
					>
						★
					</span>
					{this.props.family.name} from {this.props.template.name}
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `user${this.props.family.id}`}}
					onClick={this.selectFont}
				>
					{this.state.text}
				</p>
				<div
					className={'provider provider-custom'}
					style={{backgroundColor: this.props.background}}
				>
					{this.props.user.firstName
						&& this.props.user.firstName.charAt(0)}
					{this.props.user.lastName
						&& this.props.user.lastName.charAt(0)}
				</div>

				<div
					className={`library-item-actions ${
						this.props.isOpen ? 'opened' : ''
					}`}
				>
					{!this.props.isFromTeam && (
						<div
							className="library-item-action"
							onClick={() => {
								this.props.open(
									this.props.variantToLoad,
									this.props.family,
								);
							}}
						>
							Edit
						</div>
					)}
					<div
						className="library-item-action"
						onClick={() => {
							this.props.export(
								this.props.family.name,
								this.props.variantName,
								this.props.values,
								this.props.template.templateName,
								this.props.glyphs,
								this.props.family.designer,
								this.props.family.designerUrl,
								this.props.family.foundry,
								this.props.family.foundryUrl,
								this.props.variantToLoad.weight,
								this.props.variantToLoad.width,
								this.props.variantToLoad.italic,
							);
						}}
					>
						Download
					</div>
					<div
						className="library-item-action"
						onMouseDown={() => {
							this.props.router
								&& this.props.router.push(
									`/library/project/${this.props.family.id}`,
								);
						}}
					>
						Open family
					</div>
					<input
						type="text"
						name="displayedWord"
						value={this.state.text}
						onChange={this.onTextChange}
					/>
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset={this.state.text}
					glyph="0"
				/>
			</div>
		);
	}
}

export class PresetItem extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
		this.state = {
			text: 'Hamburgefonstiv 123',
		};
		this.onTextChange = this.onTextChange.bind(this);
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}

	onTextChange({target: {value}}) {
		this.setState({
			text: value,
		});
	}

	render() {
		return (
			<div className="library-item" tabIndex={0}>
				<p className="library-item-name">
					<span
						className={`star-icon ${
							this.props.favourite ? 'active' : ''
						}`}
						onClick={() => {
							this.props.updateFavourites(
								this.props.favourite,
								'Preset',
								this.props.preset.id,
							);
						}}
					>
						★
					</span>
					{this.props.name} from {this.props.template.name}
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `preset${this.props.preset.id}`}}
					onClick={this.selectFont}
				>
					{this.state.text}
				</p>
				<div
					className={'provider provider-custom'}
					style={{backgroundColor: this.props.background}}
				>
					{this.props.user}
				</div>
				<div
					className={`library-item-actions ${
						this.props.isOpen ? 'opened' : ''
					}`}
				>
					<div
						className="library-item-action"
						onClick={() => {
							this.props.createProject(
								this.props.template.templateName,
								this.props.values,
							);
						}}
					>
						Edit
					</div>
					<div
						className="library-item-action"
						onClick={() => {
							this.props.export(
								this.props.name,
								'regular',
								this.props.values,
								this.props.template.templateName,
								this.props.glyphs,
							);
						}}
					>
						Download
					</div>
					<input
						type="text"
						name="displayedWord"
						value={this.state.text}
						onChange={this.onTextChange}
						placeholder="Search"
					/>
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset={this.state.text}
					glyph="0"
				/>
			</div>
		);
	}
}
