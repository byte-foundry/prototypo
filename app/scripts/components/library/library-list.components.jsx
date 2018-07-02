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

class LibraryList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.generateFonts = this.generateFonts.bind(this);
		this.filterFonts = this.filterFonts.bind(this);
		this.createProject = this.createProject.bind(this);
		this.selectFont = this.selectFont.bind(this);
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

	createProject(template, values) {
		this.props.router.push({
			pathname: '/onboarding',
			state: {template, values},
		})
	}

	getTemplateProps(template, templateData) {
		return () => {
			return {
				key: template.templateName,
				template: template,
				glyphs: templateData.glyphs,
				values: templateData.initValues,
				export: this.props.export,
				createProject: this.createProject,
				click: this.selectFont,
				isOpen: this.state.selectedFont === template.templateName,
				familyId: template.templateName,
			};
		};
	}

	getPresetProps(preset, templateInfo, templateData, lmColor, hmColor) {
		return () => {
			return {
				key: preset.id,
				preset: preset,
				template: templateInfo,
				user: preset.ownerInitials,
				name: preset.variant.family.name,
				createProject: this.createProject,
				background:
					preset.ownerInitials === 'LM'
						? lmColor
						: hmColor
				,
				glyphs: templateData.glyphs,
				values: preset.baseValues,
				export: this.props.export,
				click: this.selectFont,
				isOpen: this.state.selectedFont === preset.id,
				familyId: preset.id,
			}
		};
	}

	getFamilyProps(family, templateInfo, templateData, variantToLoad, userColor) {
		return () => {
			return {
				key: family.id,
				family: family,
				template: templateInfo,
				user: this.props.user,
				background: userColor,
				router: this.props.router,
				variantToLoad: variantToLoad,
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
			};
		};
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

				fontsToGenerate.push({
					name: `template${template.templateName
						.split('.')
						.join('')}`,
					template: template.templateName,
					subset: 'Hamburgefonstiv 123',
					values: templateData.initValues,
				});
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

					fontsToGenerate.push({
						name: `preset${preset.id}`,
						template: templateInfo.templateName,
						subset: 'Hamburgefonstiv 123',
						values: preset.baseValues,
					});
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
						tags: [templateInfo.provider, 'preset'],
						id: preset.id,
						props: this.getPresetProps(preset, templateInfo, templateData, lmColor, hmColor),
						elem: PresetItem,
					});
				});
		families && this.state.templateInfos && families.forEach((family) => {
			const templateInfo = this.state.templateInfos.find(
				template => template.templateName === family.template,
			) || {name: 'Undefined'};
			const templateData = this.state.templatesData.find(
				e => e.name === family.template,
			);

			const variantToLoad
				= family.variants.find(
					e => e.name.toLowerCase() === 'regular',
				) || family.variants[0];

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
				type: 'Fonts',
				variants: family.variants,
				id: family.id,
				user: {
					firstName: this.props.firstName,
					lastName: this.props.lastName,
				},
				background: userColor,
				props: this.getFamilyProps(family, templateInfo, templateData, variantToLoad, userColor),
				elem: FamilyItem,
			});
		});
		this.setState({
			fontsToGenerate,
			baseFontData: fontData,
			fontsToDisplay: fontData,
			isBaseValueLoaded: true,
		});
	}

	componentWillReceiveProps(newProps) {
		if (newProps.activeFilters !== this.props.activeFilters) {
			this.filterFonts(newProps.activeFilters);
		}
		if (newProps.families !== this.props.families) {
			this.generateFonts(newProps.families, newProps.presets);
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
					<FamilyList
						fontsToGenerate={this.state.fontsToGenerate}
						fontsToDisplay={this.state.fontsToDisplay}
					/>
				</div>
				<LibrarySidebarRight>
					<SidebarFilters
						setActiveFilters={this.props.setActiveFilters}
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
							&& this.props.fontsToDisplay.map(font => React.createElement(font.elem, {...font.props()}))}
					<FontUpdater extraFonts={this.props.fontsToGenerate} />
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
		}
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
			<div
				className="library-item"
				tabIndex={0}
			>
				<p className="library-item-name">{this.props.template.name}</p>
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
					<div className="library-item-action"
						onClick={() => {
							this.props.createProject(
								this.props.template.templateName
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
					<input type="text" name="displayedWord" value={this.state.text} onChange={this.onTextChange}/>
				</div>
			</div>
		);
	}
}

export class FamilyItem extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}

	render() {
		return (
			<div
				className="library-item"
				tabIndex={0}
			>
				<p className="library-item-name">
					{this.props.family.name} from {this.props.template.name}
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `user${this.props.family.id}`}}
					onClick={this.selectFont}
				>
					Hamburgefonstiv 123
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
					<div
						className="library-item-action"
						onClick={() => {
							this.props.export(
								this.props.family.name,
								this.props.variantName,
								this.props.values,
								this.props.template.templateName,
								this.props.glyphs,
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
					<input type="text" name="displayedWord" value="Hamburgefonstiv 123"/>
				</div>
			</div>
		);
	}
}

export class PresetItem extends React.Component {
	constructor(props) {
		super(props);
		this.selectFont = this.selectFont.bind(this);
	}

	selectFont() {
		this.props.click(this.props.familyId);
	}


	render() {
		return (
			<div
				className="library-item"
				tabIndex={0}
			>
				<p className="library-item-name">
					{this.props.name} from {this.props.template.name}
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `preset${this.props.preset.id}`}}
					onClick={this.selectFont}
				>
					Hamburgefonstiv 123
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
					<div className="library-item-action"
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
					<input type="text" name="displayedWord" value="Hamburgefonstiv 123"/>
				</div>
			</div>
		);
	}
}
