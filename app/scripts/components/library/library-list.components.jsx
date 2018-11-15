import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar/dist/no-css';

import FontUpdater from '../font-updater.components';
import LocalClient from '../../stores/local-client.stores';

import {
	LibrarySidebarRight,
	SidebarFilters,
	SidebarTags,
} from './library-sidebars.components';

import LibrarySearch from './library-search.components';
import LibraryButton from './library-button.components';

class LibraryList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			displayedText: 'Hamburgefonstiv 123',
		};

		this.filterFonts = this.filterFonts.bind(this);
		this.createProject = this.createProject.bind(this);
		this.selectFont = this.selectFont.bind(this);
		this.updateFavourites = this.updateFavourites.bind(this);
		this.onTextChange = this.onTextChange.bind(this);
		this.getEmptyMessage = this.getEmptyMessage.bind(this);
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
					openVariantModal: head.toJS().d.openVariantModal,
					openChangeVariantNameModal: head.toJS().d.openChangeVariantNameModal,
					openDuplicateVariantModal: head.toJS().d.openDuplicateVariantModal,
					familySelectedVariantCreation: head.toJS().d
						.familySelectedVariantCreation,
					collectionSelectedVariant: head.toJS().d.collectionSelectedVariant,
					templatesData: head.toJS().d.templatesData,
					exporting: head.toJS().d.export,
					errorExport: head.toJS().d.errorExport,
				});
				this.generateFonts(
					this.props.families,
					this.props.presets,
					this.props.favourites,
				);
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	createProject(template, values, abstractedFontMeta) {
		this.props.history.push({
			pathname: '/onboarding',
			state: {template, values, abstractedFontMeta},
		});
	}

	onTextChange(text) {
		this.setState({
			displayedText: text,
		});
	}
	updateFavourites(favourite, type, id, name, abstractedFontId) {
		if (favourite) {
			this.props.deleteFavourite(favourite.id);
		}
		else if (abstractedFontId) {
			this.props.addFavourite(abstractedFontId);
		}
		else {
			switch (type) {
			case 'TEMPLATE':
				this.props.addFavourite(
					this.props.abstractedTemplates.find(e => e.template === name).id,
				);
				break;
			case 'PRESET':
				this.props.createFavourite(type, undefined, undefined, id, name);
				break;
			case 'VARIANT':
				this.props.createFavourite(type, id, undefined, undefined, name);
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
			exporting: this.state.exporting,
			errorExport: this.state.errorExport,
			createProject: this.createProject,
			click: this.selectFont,
			isOpen: this.state.selectedFont === template.templateName,
			familyId: template.templateName,
			fontName: `template${template.templateName.split('.').join('')}`,
			templateName: template.templateName,
			displayedText: this.state.displayedText,
			onTextChange: this.onTextChange,
			favourite: favourites.find(
				f => f.type === 'TEMPLATE' && f.template === template.name,
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
			values: {
				...templateData.initValues,
				...preset.baseValues,
			},
			export: this.props.export,
			exporting: this.state.exporting,
			errorExport: this.state.errorExport,
			click: this.selectFont,
			isOpen: this.state.selectedFont === preset.id,
			familyId: preset.id,
			displayedText: this.state.displayedText,
			onTextChange: this.onTextChange,
			fontName: `preset${preset.id}`,
			templateName: templateInfo.templateName,
			abstractedFontId: preset.abstractedFont && preset.abstractedFont.id,
			favourite: favourites.find(
				f => f.type === 'PRESET' && f.preset && f.preset.id === preset.id,
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
				variantToLoad,
				open: this.props.open,
				export: this.props.export,
				exporting: this.state.exporting,
				errorExport: this.state.errorExport,
				displayedText: this.state.displayedText,
				onTextChange: this.onTextChange,
				glyphs: templateData.glyphs,
				values: {
					...templateData.initValues,
					...(typeof variantToLoad.values === 'object'
						? variantToLoad.values
						: JSON.parse(variantToLoad.values)),
				},
				variantName: variantToLoad.name.toLowerCase(),
				click: this.selectFont,
				isOpen: this.state.selectedFont === family.id,
				familyId: family.id,
				templateName: templateInfo.templateName,
				fontName: `user${family.id}`,
				isFromTeam,
				favourite: favourites.find(
					f =>
						f.type === 'VARIANT'
						&& f.variant
						&& variantToLoad
						&& variantToLoad.id === f.variant.id,
				),
				abstractedFontId:
					variantToLoad.abstractedFont && variantToLoad.abstractedFont.id,
				updateFavourites: this.updateFavourites,
			};
	}

	generateFonts(families, presets, favourites = []) {
		const customBadgesColor = [
			'#003049',
			'#D62828',
			'#F77F00',
			'#FCBF49',
			'#71AF2F',
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
					props: this.getTemplateProps(template, templateData, favourites),
					elem: TemplateItem,
				});
			});

		const havasPreset
			= presets
			&& this.state.templateInfos
			&& presets.find(e => e.ownerInitials === 'HAVAS');

		if (havasPreset) {
			const templateInfo = this.state.templateInfos.find(
				template => havasPreset.template === template.templateName,
			) || {name: 'Undefined'};
			const templateData = this.state.templatesData.find(
				e => e.name === havasPreset.template,
			);

			fontData.push({
				template: templateInfo.templateName,
				templateName: templateInfo.name,
				type: 'Preset',
				name: havasPreset.variant.family.name,
				designer: 'Havas',
				id: havasPreset.id,
				tags: [],
				props: this.getPresetProps(
					havasPreset,
					templateInfo,
					templateData,
					lmColor,
					hmColor,
					favourites,
				),
				elem: PresetItem,
			});
		}
		const filteredPresets
			= presets
			&& this.state.templateInfos
			&& presets.filter(
				preset =>
					preset.variant.family.name !== 'Spectral'
					&& preset.variant.family.name !== 'Elzevir'
					&& preset.variant.family.name !== 'Grotesk'
					&& preset.variant.family.name !== 'Fell'
					&& preset.variant.family.name !== 'Antique'
					&& preset.variant.family.name !== 'Prototypo Grotesk'
					&& preset.ownerInitials !== 'HAVAS',
			);

		if (filteredPresets) {
			filteredPresets.forEach((preset) => {
				const templateInfo = this.state.templateInfos.find(
					template => preset.template === template.templateName,
				) || {name: 'Undefined'};
				const templateData = this.state.templatesData.find(
					e => e.name === preset.template,
				);

				fontData.push({
					template: templateInfo.templateName,
					templateName: templateInfo.name,
					type: 'Preset',
					name: preset.variant.family.name,
					designer:
						preset.ownerInitials === 'LM' || preset.ownerInitials === 'HM'
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
		}
		const allTags = [];

		families
			&& this.state.templateInfos
			&& families.forEach((family) => {
				const templateInfo = this.state.templateInfos.find(
					template => template.templateName === family.template,
				);

				if (!templateInfo) return;
				const templateData = this.state.templatesData.find(
					e => e.name === family.template,
				);

				family.tags && family.tags.map(tag => allTags.push(tag));
				const variantToLoad
					= family.variants.find(e => e.name.toLowerCase() === 'regular')
					|| family.variants[0];

				if (variantToLoad) {
					fontData.push({
						template: templateInfo.templateName,
						templateName: templateInfo.name,
						name: family.name,
						designer:
							family.from
							&& family.from.preset
							&& family.from.preset.ownerInitials === 'HAVAS'
								? 'havas'
								: templateInfo.provider,
						type: 'Font',
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
				const subUserColor = subUserColors[index % subUserColors.length];

				subUser.id !== this.props.user.id
					&& subUser.library.forEach((family) => {
						const templateInfo = this.state.templateInfos.find(
							template => template.templateName === family.template,
						) || {name: 'Undefined'};
						const templateData = this.state.templatesData.find(
							e => e.name === family.template,
						);

						family.tags && family.tags.map(tag => allTags.push(tag));
						const variantToLoad
							= family.variants.find(e => e.name.toLowerCase() === 'regular')
							|| family.variants[0];

						if (variantToLoad) {
							fontData.push({
								template: templateInfo.templateName,
								templateName: templateInfo.name,
								name: family.name,
								designer:
									family.from
									&& family.from.preset
									&& family.from.preset.ownerInitials === 'HAVAS'
										? 'havas'
										: templateInfo.provider,
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
			isBaseValueLoaded: true,
			tags: tagsDedup.slice(0, 10),
		});
	}

	filterFonts(
		activeFilters = [],
		selectedTags = [],
		searchString = '',
		mode = '',
		newBaseFontData = [],
	) {
		// Filter
		let fontsToDisplay = newBaseFontData;

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
		fontsToDisplay
			= fontsToDisplay
			&& fontsToDisplay.filter(
				font =>
					font.tags
					&& selectedTags.every(elem => font.tags.indexOf(elem) > -1),
			);

		// Search
		fontsToDisplay
			= fontsToDisplay
			&& fontsToDisplay.filter(
				font =>
					font.template
						.toLowerCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '')
						.includes(
							searchString
								.toLowerCase()
								.normalize('NFD')
								.replace(/[\u0300-\u036f]/g, ''),
						)
					|| font.templateName
						.toLowerCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '')
						.includes(
							searchString
								.toLowerCase()
								.normalize('NFD')
								.replace(/[\u0300-\u036f]/g, ''),
						)
					|| font.name
						.toLowerCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '')
						.includes(
							searchString
								.toLowerCase()
								.normalize('NFD')
								.replace(/[\u0300-\u036f]/g, ''),
						)
					|| (font.tags
						&& font.tags.find(e =>
							e
								.toLowerCase()
								.normalize('NFD')
								.replace(/[\u0300-\u036f]/g, '')
								.includes(
									searchString
										.toLowerCase()
										.normalize('NFD')
										.replace(/[\u0300-\u036f]/g, ''),
								),
						)),
			);

		// Mode

		let type = '';

		switch (mode) {
		case 'personal':
			type = 'Font';
			break;
		case 'team':
			type = 'SubUser';
			break;
		default:
			break;
		}

		fontsToDisplay
			= fontsToDisplay
			&& fontsToDisplay.filter(font => font.type.includes(type));

		if (mode === 'favorites') {
			fontsToDisplay
				= fontsToDisplay
				&& fontsToDisplay.filter(font => !!font.props().favourite);
		}

		return fontsToDisplay;
	}

	componentWillReceiveProps({families, favourites, presets}) {
		if (
			families !== this.props.families
			|| favourites !== this.props.favourites
			|| presets !== this.props.presets
		) {
			this.generateFonts(families, presets, favourites);
		}
	}

	selectFont(id) {
		this.setState({
			selectedFont: this.state.selectedFont === id ? undefined : id,
		});
	}

	getEmptyMessage() {
		const query = new URLSearchParams(this.props.location.search);

		if (query.get('mode') === 'personal') {
			return (
				<div className="library-see-description">
					<p>
						<span>
							Dive into Prototypo by creating your first project with our
							templates or Unique presets
						</span>
					</p>
					<p>
						<Link to="/library/create">Create your font now</Link>
					</p>
				</div>
			);
		}
		if (query.get('mode') === 'favorites') {
			return (
				<div className="library-see-description">
					<p>
						<span>
							You have not starred any fonts yet. Simply click on the star icon
							to tag fonts as your favorites in your library.
						</span>
					</p>
					<p>
						<Link to="/library">Back to the list</Link>
					</p>
				</div>
			);
		}
		return (
			<div className="library-see-description">
				<p>
					<span>Your search didn't return any results.</span>
				</p>
				<p>
					<Link
						to="/library"
						onClick={() => {
							this.client.dispatchAction('/store-value', {
								librarySearchString: '',
								librarySelectedTags: [],
							});
						}}
					>
						Clear search data
					</Link>
				</p>
			</div>
		);
	}

	render() {
		const {baseFontData} = this.state;
		const {activeFilters, librarySelectedTags, search, location} = this.props;

		const query = new URLSearchParams(location.search);
		const fontsToDisplay = this.filterFonts(
			activeFilters,
			librarySelectedTags,
			search,
			query.get('mode'),
			baseFontData,
		);

		return (
			<div className="library-content-wrapper">
				<div className="library-list library-see">
					{fontsToDisplay.length === 0 ? (
						<div>
							<div className="library-see-title">There is nothing here!</div>
							{this.getEmptyMessage()}
						</div>
					) : (
						<FamilyList fontsToDisplay={fontsToDisplay} />
					)}
				</div>
				<LibrarySidebarRight>
					<LibrarySearch />
					<SidebarFilters setActiveFilters={this.props.setActiveFilters} />
					<SidebarTags tags={this.state.tags} mode="interactive" />
					<LibraryButton
						name="Add fontsinuse"
						bold
						full
						onClick={() => {
							this.props.history.push('/library/fontinuse/create');
						}}
					/>
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

export default withRouter(LibraryList);

class FamilyList extends React.Component {
	render() {
		return (
			<ScrollArea
				className="library-list-families"
				contentClassName="library-list-families-content"
				horizontal={false}
				style={{overflowX: 'visible'}}
			>
				<div className="library-family-list">
					{this.props.fontsToDisplay.map(font =>
						React.createElement(font.elem, font.props()),
					)}
				</div>
			</ScrollArea>
		);
	}
}

FamilyList.defaultProps = {
	fontsToDisplay: [],
};

FamilyList.propTypes = {
	fontsToDisplay: PropTypes.arrayOf(
		PropTypes.shape({
			type: PropTypes.oneOf(['Template', 'Preset', 'Font']),
		}),
	),
};

export class TemplateItem extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
		this.state = {
			text: 'Hamburgefonstiv 123',
			keyDowns: 0,
		};
		this.onTextChange = this.onTextChange.bind(this);
	}

	onTextChange({target: {value}}) {
		this.props.onTextChange(value);
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}

	render() {
		return (
			<div
				className={`library-item library-template ${
					this.props.isOpen ? 'opened' : ''
				}`}
				tabIndex={0}
				onKeyDown={(e) => {
					this.setState({keyDowns: this.state.keyDowns + e.keyCode});
				}}
				onKeyUp={() => {
					this.setState({keyDowns: 0});
				}}
			>
				<span className="type">Template</span>
				<p className="library-item-name">
					<span
						className={`star-icon ${this.props.favourite ? 'active' : ''}`}
						onClick={() => {
							this.props.updateFavourites(
								this.props.favourite,
								'TEMPLATE',
								this.props.template.name,
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
					{this.props.displayedText}
				</p>
				<div className={`provider provider-${this.props.template.provider}`} />
				<div
					className={`library-item-actions ${
						this.props.isOpen ? 'opened' : ''
					}`}
				>
					<LibraryButton
						name="Create from this template"
						floated
						dark
						onClick={() => {
							this.props.createProject(this.props.template.templateName);
						}}
					/>
					<LibraryButton
						name={this.state.keyDowns === 33 ? 'Download source' : 'Download'}
						floated
						dark
						loading={this.props.exporting}
						error={this.props.errorExport}
						onClick={() => {
							this.props.export(
								!this.state.keyDowns === 33,
								this.props.template.name,
								'regular',
								this.props.values,
								this.props.template.templateName,
								this.props.glyphs,
							);
						}}
					/>
					<input
						type="text"
						name="displayedWord"
						value={this.props.displayedText}
						onChange={this.onTextChange}
					/>
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset={this.props.displayedText}
					glyph="0"
				/>
			</div>
		);
	}
}

class FamilyItemRaw extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
		this.onTextChange = this.onTextChange.bind(this);
		this.state = {
			keyDowns: 0,
		};
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}

	onTextChange({target: {value}}) {
		this.props.onTextChange(value);
	}

	render() {
		return (
			<div
				className={`library-item library-family ${
					this.props.isOpen ? 'opened' : ''
				}`}
				tabIndex={0}
				onKeyDown={(e) => {
					this.setState({keyDowns: this.state.keyDowns + e.keyCode});
				}}
				onKeyUp={() => {
					this.setState({keyDowns: 0});
				}}
			>
				<span className="type">Project</span>
				<p className="library-item-name">
					<span
						className={`star-icon ${this.props.favourite ? 'active' : ''}`}
						onClick={() => {
							this.props.updateFavourites(
								this.props.favourite,
								'VARIANT',
								this.props.variantToLoad.id,
								this.props.family.name,
								this.props.abstractedFontId,
							);
						}}
					>
						★
					</span>
					{this.props.family.name}{' '}
					<span className="small">from {this.props.template.name}</span>
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `user${this.props.family.id}`}}
					onClick={this.selectFont}
				>
					{this.props.displayedText}
				</p>
				<div
					className={'provider provider-custom'}
					style={{backgroundColor: this.props.background}}
				>
					{this.props.user.firstName && this.props.user.firstName.charAt(0)}
					{this.props.user.lastName && this.props.user.lastName.charAt(0)}
				</div>

				<div
					className={`library-item-actions ${
						this.props.isOpen ? 'opened' : ''
					}`}
				>
					{!this.props.isFromTeam && (
						<LibraryButton
							floated
							name="Open in the editor"
							dark
							onClick={() => {
								this.props.open(this.props.variantToLoad, this.props.family);
							}}
						/>
					)}
					<LibraryButton
						name={this.state.keyDowns === 33 ? 'Download source' : 'Download'}
						floated
						dark
						loading={this.props.exporting}
						error={this.props.errorExport}
						onClick={() => {
							this.props.export(
								!this.state.keyDowns === 33,
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
					/>
					<LibraryButton
						name="Open family"
						floated
						dark
						onClick={() => {
							this.props.history.push(
								`/library/project/${this.props.family.id}`,
							);
						}}
					/>
					<input
						type="text"
						name="displayedWord"
						value={this.props.displayedText}
						onChange={this.onTextChange}
					/>
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset={this.props.displayedText}
					glyph="0"
				/>
			</div>
		);
	}
}

export const FamilyItem = withRouter(FamilyItemRaw);

export class PresetItem extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
		this.state = {
			text: 'Hamburgefonstiv 123',
			keyDowns: 0,
		};
		this.onTextChange = this.onTextChange.bind(this);
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}

	onTextChange({target: {value}}) {
		this.props.onTextChange(value);
	}

	render() {
		return (
			<div
				className={`library-item library-preset ${
					this.props.isOpen ? 'opened' : ''
				}`}
				tabIndex={0}
				onKeyDown={(e) => {
					this.setState({keyDowns: this.state.keyDowns + e.keyCode});
				}}
				onKeyUp={() => {
					this.setState({keyDowns: 0});
				}}
			>
				<span className="type">Preset</span>
				<p className="library-item-name">
					<span
						className={`star-icon ${this.props.favourite ? 'active' : ''}`}
						onClick={() => {
							this.props.updateFavourites(
								this.props.favourite,
								'PRESET',
								this.props.preset.id,
								this.props.name,
								this.props.abstractedFontId,
							);
						}}
					>
						★
					</span>
					{this.props.name}{' '}
					<span className="small">from {this.props.template.name}</span>
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `preset${this.props.preset.id}`}}
					onClick={this.selectFont}
				>
					{this.props.displayedText}
				</p>
				<div
					className={`provider provider-${
						this.props.user === 'HAVAS' ? 'havas' : 'custom'
					}`}
					style={{
						backgroundColor:
							this.props.user !== 'HAVAS' ? this.props.background : 'white',
					}}
				>
					{this.props.user !== 'HAVAS' && this.props.user}
				</div>
				<div
					className={`library-item-actions ${
						this.props.isOpen ? 'opened' : ''
					}`}
				>
					<LibraryButton
						name="Create from this preset"
						floated
						dark
						onClick={() => {
							this.props.createProject(
								this.props.template.templateName,
								this.props.values,
								{
									type: 'PRESET',
									presetId: this.props.preset.id,
									name: this.props.name,
								},
							);
						}}
					/>
					<LibraryButton
						name={this.state.keyDowns === 33 ? 'Download source' : 'Download'}
						floated
						dark
						loading={this.props.exporting}
						error={this.props.errorExport}
						onClick={() => {
							this.props.export(
								!this.state.keyDowns === 33,
								this.props.name,
								'regular',
								this.props.values,
								this.props.template.templateName,
								this.props.glyphs,
							);
						}}
					/>
					<input
						type="text"
						name="displayedWord"
						value={this.props.displayedText}
						onChange={this.onTextChange}
						placeholder="Search"
					/>
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset={this.props.displayedText}
					glyph="0"
				/>
			</div>
		);
	}
}
