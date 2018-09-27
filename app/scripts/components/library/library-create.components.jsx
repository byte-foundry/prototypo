import React from 'react';
import pleaseWait from 'please-wait';
import {Link} from 'react-router';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';
import LocalClient from '../../stores/local-client.stores';
import ScrollArea from 'react-scrollbar/dist/no-css';
import FontUpdater from '../font-updater.components';
import {graphql, gql, compose} from 'react-apollo';
import {
	LibrarySidebarRight,
	SidebarFilters,
} from './library-sidebars.components';

class LibraryCreate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.generateFonts = this.generateFonts.bind(this);
		this.filterFonts = this.filterFonts.bind(this);
		this.createProject = this.createProject.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
		});

		this.client.getStore('/prototypoStore', this.lifespan).onUpdate((head) => {
			this.setState({
				openVariantModal: head.toJS().d.openVariantModal,
				openChangeVariantNameModal: head.toJS().d.openChangeVariantNameModal,
				openDuplicateVariantModal: head.toJS().d.openDuplicateVariantModal,
				familySelectedVariantCreation: head.toJS().d
					.familySelectedVariantCreation,
				collectionSelectedVariant: head.toJS().d.collectionSelectedVariant,
				templatesData: head.toJS().d.templatesData,
			});
			this.generateFonts();
		});
	}

	createProject(template, values, abstractedFontMeta) {
		this.props.router.push({
			pathname: '/onboarding',
			state: {template, values, abstractedFontMeta},
		});
	}

	getTemplateProps(template, templateData) {
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
			values: templateData.initValues,
			templateName: template.templateName,
		});
	}

	getPresetProps(preset, templateInfo, templateData, lmColor, hmColor) {
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
		});
	}

	getFamilyProps(family, templateInfo, templateData, variantToLoad, userColor) {
		return () => ({
			key: family.id,
			family,
			template: templateInfo,
			user: this.props.user,
			background: userColor,
			router: this.props.router,
			variantToLoad,
			createProject: this.createProject,
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
		});
	}

	filterFonts(activeFilters) {
		const {baseFontData} = this.state;
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
		this.setState({fontsToDisplay});
	}

	generateFonts(f, p) {
		const families = f || this.props.families;
		const presets = p || this.props.presets;
		const customBadgesColor = [
			'#29ABE2',
			'#0000FF',
			'#00FF00',
			'#FF0000',
			'#F7931E',
		];
		const userColor = customBadgesColor[0];
		const lmColor = customBadgesColor[1];
		const hmColor = customBadgesColor[4];

		const fontsToGenerate = [];
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
					tags: [template.provider, 'template'],
					designer: template.provider,
					id: template.id,
					type: 'Template',
					props: this.getTemplateProps(template, templateData),
					elem: TemplateItem,
				});
			});
		presets
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

					fontsToGenerate.push({
						name: `preset${preset.id}`,
						template: templateInfo.templateName,
						subset: 'Hamburgefonstiv 123',
						values: preset.baseValues,
					});
					fontData.push({
						template: templateInfo.templateName,
						templateName: templateInfo.name,
						type: 'Preset',
						name: preset.variant.family.name,
						designer:
							preset.ownerInitials === 'LM' || preset.ownerInitials === 'HM'
								? 'Prototypo'
								: '',
						tags: [templateInfo.provider, 'preset'],
						id: preset.id,
						props: this.getPresetProps(
							preset,
							templateInfo,
							templateData,
							lmColor,
							hmColor,
						),
						elem: PresetItem,
					});
				});
		families.forEach((family) => {
			const templateInfo = this.state.templateInfos.find(
				template => template.templateName === family.template,
			) || {name: 'Undefined'};
			const templateData = this.state.templatesData.find(
				e => e.name === family.template,
			);

			const variantToLoad
				= family.variants.find(e => e.name.toLowerCase() === 'regular')
				|| family.variants[0];

			fontsToGenerate.push({
				name: `user${family.id}`,
				template: templateInfo.templateName,
				subset: 'Hamburgefonstiv 123',
				values: {
					...templateData.initValues,
					...variantToLoad.values,
				},
			});
			fontData.push({
				template: templateInfo.templateName,
				templateName: templateInfo.name,
				name: family.name,
				designer: '',
				tags: [templateInfo.provider, 'project', family.name],
				type: 'Font',
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
				),
				elem: FamilyItem,
			});
		});
		this.setState({
			baseFontData: fontData,
			fontsToDisplay: fontData,
			isBaseValueLoaded: true,
		});
	}

	componentWillReceiveProps(newProps) {
		if (newProps.activeFilters !== this.props.activeFilters) {
			this.filterFonts(newProps.activeFilters);
		}
	}

	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-list library-list--create">
					<h1 className="library-list-title">
						START OUT BY CHOOSING A TEMPLATE
					</h1>
					<FamilyList fontsToDisplay={this.state.fontsToDisplay} />
				</div>
				<LibrarySidebarRight router={this.props.router}>
					<SidebarFilters setActiveFilters={this.props.setActiveFilters} />
				</LibrarySidebarRight>
			</div>
		);
	}
}

LibraryCreate.propTypes = {
	families: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string,
			name: PropTypes.string,
			template: PropTypes.string,
		}),
	).isRequired,
};

LibraryCreate.defaultProps = {
	families: [],
};

export default LibraryCreate;

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
	}

	render() {
		return (
			<div className="library-item library-template">
				<span className="type">Template</span>
				<p className="library-item-name">{this.props.template.name}</p>
				<p
					className="library-item-preview"
					style={{
						fontFamily: `template${this.props.template.templateName
							.split('.')
							.join('')}`,
					}}
					onClick={() => {
						this.props.createProject(this.props.template.templateName);
					}}
				>
					Hamburgefonstiv 123
				</p>
				<div className={`provider provider-${this.props.template.provider}`} />
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset="Hamburgefonstiv 123"
					glyph="0"
				/>
			</div>
		);
	}
}

export class FamilyItem extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="library-item library-family">
				<span className="type">Project</span>
				<p className="library-item-name">
					{this.props.family.name}{' '}
					<span className="small">from {this.props.template.name}</span>
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `user${this.props.family.id}`}}
					onClick={() => {
						this.props.createProject(
							this.props.template.templateName,
							this.props.values,
							{
								type: 'VARIANT',
								variantId: this.props.variantToLoad.id,
								name: this.props.family.name,
							},
						);
					}}
				>
					Hamburgefonstiv 123
				</p>
				<div
					className={'provider provider-custom'}
					style={{backgroundColor: this.props.background}}
				>
					{this.props.user.firstName && this.props.user.firstName.charAt(0)}
					{this.props.user.lastName && this.props.user.lastName.charAt(0)}
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset="Hamburgefonstiv 123"
					glyph="0"
				/>
			</div>
		);
	}
}

export class PresetItem extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="library-item library-preset">
				<span className="type">Preset</span>
				<p className="library-item-name">
					{this.props.name}{' '}
					<span className="small">from {this.props.template.name}</span>
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `preset${this.props.preset.id}`}}
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
				>
					Hamburgefonstiv 123
				</p>
				<div
					className={'provider provider-custom'}
					style={{backgroundColor: this.props.background}}
				>
					{this.props.user}
				</div>
				<FontUpdater
					name={this.props.fontName}
					values={this.props.values}
					template={this.props.templateName}
					subset="Hamburgefonstiv 123"
					glyph="0"
				/>
			</div>
		);
	}
}
