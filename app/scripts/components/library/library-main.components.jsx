import React from 'react';
import pleaseWait from 'please-wait';
import { graphql, gql, compose } from 'react-apollo';
import Lifespan from 'lifespan';
import LocalClient from '../../stores/local-client.stores';
import _forOwn from 'lodash/forOwn';

import { LibrarySidebarLeft } from './library-sidebars.components';
import { TemplateItem, PresetItem, FamilyItem } from './library-list.components';

class LibraryMain extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activeFilters: {},
			isBaseValueLoaded: false,
		}
		this.setActiveFilters = this.setActiveFilters.bind(this);
		this.loadInitialValues = this.loadInitialValues.bind(this);
		this.generateFonts = this.generateFonts.bind(this);
		this.filterFonts = this.filterFonts.bind(this);
		this.export = this.export.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
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

	async loadInitialValues() {
		const typedataAntique = await import(/* webpackChunkName: "ptfs" */`../../../../dist/templates/antique.ptf/font.json`);
		const antiqueInitValues = {};
		const antiqueGlyphs = {};
		_forOwn(typedataAntique.glyphs, (glyph) => {
			if (!antiqueGlyphs[glyph.unicode]) {
				antiqueGlyphs[glyph.unicode] = [];
			}
			antiqueGlyphs[glyph.unicode].push(glyph);
		});
		typedataAntique.controls.forEach(group => group.parameters.forEach((param) => {
			antiqueInitValues[param.name] = param.init;
		}));
		const typedataElzevir = await import(/* webpackChunkName: "ptfs" */`../../../../dist/templates/elzevir.ptf/font.json`);
		const elzevirInitValues = {};
		const elzevirGlyphs = {};
		_forOwn(typedataElzevir.glyphs, (glyph) => {
			if (!elzevirGlyphs[glyph.unicode]) {
				elzevirGlyphs[glyph.unicode] = [];
			}
			elzevirGlyphs[glyph.unicode].push(glyph);
		});
		typedataElzevir.controls.forEach(group => group.parameters.forEach((param) => {
			elzevirInitValues[param.name] = param.init;
		}));
		const typedataSpectral = await import(/* webpackChunkName: "ptfs" */`../../../../dist/templates/gfnt.ptf/font.json`);
		const spectralInitValues = {};
		const spectralGlyphs = {};
		_forOwn(typedataSpectral.glyphs, (glyph) => {
			if (!spectralGlyphs[glyph.unicode]) {
				spectralGlyphs[glyph.unicode] = [];
			}
			spectralGlyphs[glyph.unicode].push(glyph);
		});
		typedataSpectral.controls.forEach(group => group.parameters.forEach((param) => {
			spectralInitValues[param.name] = param.init;
		}));
		const typedataFell = await import(/* webpackChunkName: "ptfs" */`../../../../dist/templates/john-fell.ptf/font.json`);
		const fellInitValues = {};
		const fellGlyphs = {};
		_forOwn(typedataFell.glyphs, (glyph) => {
			if (!fellGlyphs[glyph.unicode]) {
				fellGlyphs[glyph.unicode] = [];
			}
			fellGlyphs[glyph.unicode].push(glyph);
		});
		typedataFell.controls.forEach(group => group.parameters.forEach((param) => {
			fellInitValues[param.name] = param.init;
		}));
		const typedataVenus = await import(/* webpackChunkName: "ptfs" */`../../../../dist/templates/venus.ptf/font.json`);
		const venusInitValues = {};
		const venusGlyphs = {};
		_forOwn(typedataVenus.glyphs, (glyph) => {
			if (!venusGlyphs[glyph.unicode]) {
				venusGlyphs[glyph.unicode] = [];
			}
			venusGlyphs[glyph.unicode].push(glyph);
		});
		typedataVenus.controls.forEach(group => group.parameters.forEach((param) => {
			venusInitValues[param.name] = param.init;
		}));
		this.setState({
			templateValues: {
				'antique.ptf': antiqueInitValues,
				'elzevir.ptf': elzevirInitValues,
				'gfnt.ptf': spectralInitValues,
				'john-fell.ptf': fellInitValues,
				'venus.ptf': venusInitValues
			},
			templateGlyphs: {
				'antique.ptf': antiqueGlyphs,
				'elzevir.ptf': elzevirGlyphs,
				'gfnt.ptf': spectralGlyphs,
				'john-fell.ptf': fellGlyphs,
				'venus.ptf': venusGlyphs
			},
			isBaseValueLoaded: true,
		});
		this.generateFonts();
	}

	generateFonts() {
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
			if (this.state.isBaseValueLoaded) {
				fontsToGenerate.push(
					{
						name: `template${(template.templateName).split('.').join("")}`,
						template: template.templateName,
						subset: 'Hamburgefonstiv 123',
						values: this.state.templateValues[template.templateName],
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
						glyphs={this.state.templateGlyphs[template.templateName]}
						values={this.state.templateValues[template.templateName]}
						export={this.export}					
					/>)
				})
			};
		});
		this.props.presets && this.props.presets.filter(preset => {
			return (
				preset.variant.family.name !== 'Spectral'
				&& preset.variant.family.name !== 'Elzevir'
				&& preset.variant.family.name !== 'Grotesk'
				&& preset.variant.family.name !== 'Fell'
				&& preset.variant.family.name !== 'Antique'
			);
		}).map((preset => {
			const templateInfo = this.state.templateInfos.find(template => preset.template === template.templateName) || { name: 'Undefined' };
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
				glyphs: this.state.templateGlyphs[templateInfo.templateName],
				id: preset.id,
				elem: (<PresetItem
					key={preset.id}
					preset={preset}
					template={templateInfo}
					user={preset.ownerInitials}
					name={preset.variant.family.name}
					background={preset.ownerInitials === 'LM' ? lmColor : hmColor}
					glyphs={this.state.templateGlyphs[templateInfo.templateName]}
					values={preset.baseValues}	
					export={this.export}
				/>)
			})
		}));
		this.props.families.map((family) => {
			const templateInfo = this.state.templateInfos.find(template => template.templateName === family.template) || { name: 'Undefined' };
			if (this.state.isBaseValueLoaded) {
				fontsToGenerate.push(
					{
						name: `user${family.id}`,
						template: templateInfo.templateName,
						subset: 'Hamburgefonstiv 123',
						values: {
							...this.state.templateValues[templateInfo.templateName],
							...family.variants[0].values
						},
					}
				);
				fontData.push({
					template: templateInfo.templateName,
					templateName: templateInfo.name,
					name: family.name,
					designer: '',
					glyphs: this.state.templateGlyphs[templateInfo.templateName],
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
					/>)
				})
			}
		});
		this.setState({
			fontsToGenerate,
			baseFontData: fontData,
			fontsToDisplay: fontData,
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
		if (newProps.presets && newProps.presets.length > 1 && !this.state.isBaseValueLoaded) {
			this.loadInitialValues();
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
			fetchPolicy: 'network-only',
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
			fetchPolicy: 'network-only',
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
