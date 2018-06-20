import React from 'react';
import pleaseWait from 'please-wait';
import { graphql, gql, compose } from 'react-apollo';
import Lifespan from 'lifespan';
import LocalClient from '../../stores/local-client.stores';


import CreateVariantModal from '../familyVariant/create-variant-modal.components.jsx';
import ChangeNameVariant from '../familyVariant/change-name-variant.components.jsx';
import DuplicateVariant from '../familyVariant/duplicate-variant.components.jsx';
import { LibrarySidebarLeft } from './library-sidebars.components';
import { TemplateItem, PresetItem, FamilyItem } from './library-list.components';

class LibraryMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeFilters: {},
			isBaseValueLoaded: false,
		}
		this.setActiveFilters = this.setActiveFilters.bind(this);
		this.generateFonts = this.generateFonts.bind(this);
		this.filterFonts = this.filterFonts.bind(this);
		this.export = this.export.bind(this);
		this.goToDashboard = this.goToDashboard.bind(this);
		this.open = this.open.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
		});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					openFamilyModal: head.toJS().d.openFamilyModal,
					openVariantModal: head.toJS().d.openVariantModal,
					openChangeVariantNameModal: head.toJS().d.openChangeVariantNameModal,
					openDuplicateVariantModal: head.toJS().d.openDuplicateVariantModal,
					familySelectedVariantCreation: head.toJS().d.familySelectedVariantCreation,
					collectionSelectedVariant: head.toJS().d.collectionSelectedVariant,
					templatesData: head.toJS().d.templatesData,
				});
			})
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	goToDashboard() {
		this.props.router.push('/dashboard');
	}

	open(variant, family) {
		this.client.dispatchAction('/select-variant', {
			selectedVariant: variant,
			family,
		});
		this.goToDashboard();
	}

	export(familyName, variantName = 'Regular', values, template, glyphs) {
		this.client.dispatchAction('/export-otf-from-library', {
			merged: true,
			familyName,
			variantName,
			exportAs: false,
			values,
			template,
			glyphs,
		});
	}


	setActiveFilters(filters) {
		this.setState({ activeFilters: filters });
		this.filterFonts(filters);
	}

	generateFonts(families, presets) {
		const customBadgesColor = [
			'#29ABE2',
			'#0000FF',
			'#00FF00',
			'#FF0000',
			'#F7931E'
		]
		const userColor = customBadgesColor[0];
		const lmColor = customBadgesColor[1];
		const hmColor = customBadgesColor[4];

		let fontsToGenerate = [];
		let fontData = [];

		this.state.templateInfos && this.state.templateInfos.map((template) => {
			const templateData = this.state.templatesData.find(e => e.name === template.templateName);
			if (this.state.isBaseValueLoaded) {
				fontsToGenerate.push(
					{
						name: `template${(template.templateName).split('.').join("")}`,
						template: template.templateName,
						subset: 'Hamburgefonstiv 123',
						values: templateData.initValues,
					}
				);
				fontData.push({
					template: template.templateName,
					templateName: template.name,
					name: template.name,
					tags: [template.provider, 'template'],
					glyphs: this.state.templateGlyphs[template.templateName],
					designer: template.provider,
					id: template.id,
					type: 'Template',
					elem: (<TemplateItem
						key={template.templateName}
						template={template}						
						glyphs={templateData.glyphs}
						values={templateData.initValues}
						export={this.export}					
					/>)
				})
			};
		});
		presets && presets.filter((preset) => {
			return (
				preset.variant.family.name !== 'Spectral'
				&& preset.variant.family.name !== 'Elzevir'
				&& preset.variant.family.name !== 'Grotesk'
				&& preset.variant.family.name !== 'Fell'
				&& preset.variant.family.name !== 'Antique'
			);
		}).map(((preset) => {
			const templateInfo = this.state.templateInfos.find(template => preset.template === template.templateName) || { name: 'Undefined' };
			const templateData = this.state.templatesData.find(e => e.name === preset.template);
			fontsToGenerate.push(
				{
					name: `preset${preset.id}`,
					template: templateInfo.templateName,
					subset: 'Hamburgefonstiv 123',
					values: preset.baseValues,
				}
			);
			fontData.push({
				template: templateInfo.templateName,
				templateName: templateInfo.name,
				type: 'Presets',
				name: preset.variant.family.name,
				designer: preset.ownerInitials === 'LM' || preset.ownerInitials === 'HM' ? 'Prototypo' : '',
				tags: [templateInfo.provider, 'preset'],
				glyphs: templateData.glyphs,
				id: preset.id,
				elem: (<PresetItem
					key={preset.id}
					preset={preset}
					template={templateInfo}
					user={preset.ownerInitials}
					name={preset.variant.family.name}
					background={preset.ownerInitials === 'LM' ? lmColor : hmColor}
					glyphs={templateData.glyphs}
					values={preset.baseValues}	
					export={this.export}
				/>)
			})
		}));
		families.map((family) => {
			const templateInfo = this.state.templateInfos.find(template => template.templateName === family.template) || { name: 'Undefined' };
			const templateData = this.state.templatesData.find(e => e.name === family.template);
			if (!this.state.isBaseValueLoaded) {
				const variantToLoad = family.variants.find(e => e.name.toLowerCase() === 'regular') || family.variants[0]
				fontsToGenerate.push(
					{
						name: `user${family.id}`,
						template: templateInfo.templateName,
						subset: 'Hamburgefonstiv 123',
						values: {
							...templateData.initValues,
							...variantToLoad.values
						},
					}
				);
				fontData.push({
					template: templateInfo.templateName,
					templateName: templateInfo.name,
					name: family.name,
					designer: '',
					glyphs: templateData.glyphs,
					tags: [templateInfo.provider, 'project', family.name],
					type: 'Fonts',
					variants: family.variants,
					id: family.id,
					user: { firstName: this.props.firstName, lastName: this.props.lastName },
					background: userColor,
					elem: (<FamilyItem
						key={family.id}
						family={family}
						template={templateInfo}
						user={{ firstName: this.props.firstName, lastName: this.props.lastName }}
						background={userColor}
						router={this.props.router}
						variantToLoad={variantToLoad}						
						open={this.open}
					/>)
				})
			}
		});
		this.setState({
			fontsToGenerate,
			baseFontData: fontData,
			fontsToDisplay: fontData,
			isBaseValueLoaded: true,
		});
	}

	filterFonts(libraryFilters) {
		const { baseFontData } = this.state;
		let fontsToDisplay = baseFontData;
		Object.keys(libraryFilters).forEach(filterBy => {
			fontsToDisplay = fontsToDisplay.filter(e => {
				return libraryFilters[filterBy] === 'All' || libraryFilters[filterBy].toLowerCase().includes(e[filterBy].toLowerCase())
			});
		});
		this.setState({ fontsToDisplay });
	}

	componentWillReceiveProps(newProps) {
		if (newProps.presets && newProps.presets.length > 1 && newProps.families && newProps.families.length >= 0 && !this.state.isBaseValueLoaded && this.state.templateInfos) {
			this.generateFonts(newProps.families, newProps.presets);
		}
	}

	render() {
		return (
			<div className="library-main">
				<LibrarySidebarLeft location={this.props.location} />
				{React.cloneElement(this.props.children, {
					baseFontData: this.state.baseFontData,
					templateValues: this.state.templateValues,
					templateInfos: this.state.templateInfos,
					fontsToGenerate: this.state.fontsToGenerate,
					fontsToDisplay: this.state.fontsToDisplay,
					setActiveFilters: this.setActiveFilters
				})}
				{this.state.openVariantModal
			&& <CreateVariantModal family={this.state.familySelectedVariantCreation} propName="openVariantModal" />}
			{
				this.state.openChangeVariantNameModal && (
					<ChangeNameVariant
					family={this.state.familySelectedVariantCreation}
					variant={this.state.collectionSelectedVariant}
					propName="openChangeVariantNameModal"
				/>
				)
			}
			{this.state.openDuplicateVariantModal && (
				<DuplicateVariant
					family={this.state.familySelectedVariantCreation}
					variant={this.state.collectionSelectedVariant}
					propName="openDuplicateVariantModal"
				/>
			)}
			</div>
		);
	}
}

export const libraryQuery = gql`
	query {
		user {
			id
			library {
				id
				name
				template
				variants {
					id
					name
					values
				}
			}
		}
	}
`;

const getNameQuery = gql`
	query getFirstName {
		user {
			id
			firstName
			lastName
		}
	}
`;

export const presetQuery = gql`
	query {
		getAllUniquePresets {
			presets
		}
	}
`

export default compose(
	graphql(libraryQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({ data }) => {
			if (data.loading) {
				return { loading: true };
			}

			if (data.user) {
				return {
					families: data.user.library,
					refetch: data.refetch,
				};
			}

			return { refetch: data.refetch };
		},
	}),
	graphql(getNameQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({ data }) => {
			if (data.loading) {
				return { loading: true, firstName: '', lastName: '', };
			}

			return data.user;
		},
	}),
	graphql(presetQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({ data }) => {
			if (data.loading) {
				return { loading: true };
			}

			if (data.getAllUniquePresets) {
				return {
					presets: data.getAllUniquePresets.presets,
				};
			}
		},
	}),
)(LibraryMain);
