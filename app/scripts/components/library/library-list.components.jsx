import React from 'react';
import pleaseWait from 'please-wait';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';
import LocalClient from '../../stores/local-client.stores';
import ScrollArea from 'react-scrollbar/dist/no-css';
import FontUpdater from "../font-updater.components";
import {graphql, gql, compose} from 'react-apollo';

class LibraryList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};
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

	render() {
		return (
			<div className="library-list">
				<FamilyList userProjects={this.props.families} presets={this.props.presets} templateInfos={this.state.templateInfos} />
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

export const presetQuery = gql`
	query {
		getAllUniquePresets {
			presets
		}
	}
`

LibraryList.propTypes = {
	families: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string,
		template: PropTypes.string,
	})).isRequired,
};

LibraryList.defaultProps = {
	families: [],
};

export default compose(
	graphql(libraryQuery, {
		options: {
			fetchPolicy: 'network-only',
		},
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			if (data.user) {
				return {
					families: data.user.library,
					refetch: data.refetch,
				};
			}

			return {refetch: data.refetch};
		},
	}),
	graphql(presetQuery, {
		options: {
			fetchPolicy: 'network-only',
		},
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			if (data.getAllUniquePresets) {
				return {
					presets: data.getAllUniquePresets.presets,
				};
			}
		},
	}),
)(LibraryList);

class FamilyList extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		let fontsToGenerate = [];

		const prototypoTemplates = this.props.templateInfos && this.props.templateInfos.map((template) => {
			// fontsToGenerate.push(
			// 	{
			// 		name: `template${(template.templateName).split('.').join("")}`,
			// 		template: template.templateName,
			// 		subset: 'Hamburgefonstiv 123',
			// 		values: {},
			// 	}
			// );
			return (
				<TemplateItem
					key={template.templateName}
					template={template}
				/>
			)
		})
		const userProjects = this.props.userProjects.map((family) => {
			const templateInfo = this.props.templateInfos.find(template => template.templateName === family.template) || {name: 'Undefined'};
			// fontsToGenerate.push(
			// 	{
			// 		name: `user${family.id}`,
			// 		template: templateInfo.templateName,
			// 		subset: 'Hamburgefonstiv 123',
			// 		values: family.variants[0].values,
			// 	}
			// );
			return (
				<FamilyItem
					key={family.id}
					family={family}
					template={templateInfo}
				/>
			);
		});

		const uniquePresets = this.props.presets && this.props.presets.filter(preset => {			
			return (
				preset.variant.family.name !== 'Spectral'
				&& preset.variant.family.name !== 'Elzevir'
				&& preset.variant.family.name !== 'Grotesk'
				&& preset.variant.family.name !== 'Fell'
				&& preset.variant.family.name !== 'Antique'
			);
		}).map((preset => {
			const templateInfo = this.props.templateInfos.find(template => preset.template === template.templateName) || {name: 'Undefined'};
			fontsToGenerate.push(
				{
					name: `preset${preset.id}`,
					template: templateInfo.templateName,
					subset: 'Hamburgefonstiv 123',
					values: preset.baseValues,
				}
			);
			return (
				<PresetItem
					key={preset.id}
					preset={preset}
					template={templateInfo}
				/>
			)
		}));

		console.log(fontsToGenerate)

		return (
			<ScrollArea
				className="family-list-families"
				contentClassName="family-list-families-content"
				horizontal={false}
				style={{overflowX: 'visible'}}
			>
				<div className="library-family-list">
					{prototypoTemplates}
					{uniquePresets}
					{userProjects}
					Bite
					<FontUpdater extraFonts={fontsToGenerate} />
				</div>
			</ScrollArea>			
		)
	}
}

class TemplateItem extends React.PureComponent {
	constructor(props) {
		super(props)		
	}

	render() {
		return (
			<div className="library-template-item">
				<p>
					{this.props.template.name} {this.props.template.templateName}
				</p>
				<p className="library-item-preview" style={{fontFamily: `template${(this.props.template.templateName).split('.').join("")}`}}>Hamburgefonstiv 123</p>
			</div>
		)
	}
}

class FamilyItem extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="library-family-item">
				<p>
					{this.props.family.name} from {this.props.template.name}
				</p>
				<p className="library-item-preview" style={{fontFamily: `user${this.props.family.id}`}}>Hamburgefonstiv 123</p>
			</div>
		)
	}
}

class PresetItem extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (			
			<div className="library-preset-item">
				<p>
					{this.props.preset.variant.family.name} from {this.props.template.name}
				</p>
				<p className="library-item-preview" style={{fontFamily: `preset${this.props.preset.id}`}}>Hamburgefonstiv 123</p>
			</div>
		)
	}
}





