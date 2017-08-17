import PropTypes from 'prop-types';
import React from 'react';
import {compose, graphql, gql} from 'react-apollo';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar/dist/no-css';
import LocalClient from '~/stores/local-client.stores.jsx';
import Log from '~/services/log.services.js';

import {libraryQuery} from '../collection/collection.components';

import Button from '../shared/new-button.components.jsx';
import SelectWithLabel from '../shared/select-with-label.components.jsx';

export class AddFamily extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			fonts: [],
			error: null,
		};

		this.exit = this.exit.bind(this);
		this.selectFont = this.selectFont.bind(this);
		this.createFont = this.createFont.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const templateList = await this.client.fetch('/prototypoStore');

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					selectedFont: head.toJS().d.uiCreatefamilySelectedTemplate,
					error: head.toJS().d.errorAddFamily,
				});
			})
			.onDelete(() => {
				this.setState({
					error: undefined,
				});
			});

		this.setState({
			fonts: templateList.get('templateList'),
		});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			errorAddFamily: undefined,
			uiCreatefamilySelectedTemplate: undefined,
		});

		this.lifespan.release();
	}

	selectFont(uiCreatefamilySelectedTemplate) {
		this.client.dispatchAction('/store-value', {
			errorAddFamily: undefined,
		});
		this.client.dispatchAction('/store-value', {uiCreatefamilySelectedTemplate});
		this.client.dispatchAction('/store-value', {uiOnboardstep: 'creatingFamily-2'});

		this.name.focus();
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openFamilyModal: false,
		});
	}

	async createFont(e) {
		e.preventDefault();

		const name = e.target.name.value;

		if (!this.state.selectedFont) {
			this.setState({error: 'Please select a font template.'});
			return;
		}

		if (!String(name).trim()) {
			this.setState({error: 'You must choose a name for your family'});
			return;
		}

		// TODO: check if already existing name, or on graphcool?

		// TODO: grab the default values
		try {
			const {data: {createFamily: newFont}} = await this.props.createFamily(
				name,
				this.state.selectedFont.templateName,
			);

			this.client.dispatchAction('/family-created', newFont);

			this.client.dispatchAction('/change-font', {
				templateToLoad: newFont.template,
				variantId: newFont.variants[0].id,
			});

			Log.ui('Collection.CreateFamily'); // TODO: put this in the onCreateFamily in collection
			Log.ui(`createFamily.${this.state.selectedFont.templateName}`);
			this.client.dispatchAction('/store-value', {uiOnboardstep: 'customize'});

			this.props.onCreateFamily(newFont);
		}
		catch (err) {
			this.setState({error: err.message});
		}
	}

	render() {
		const {start} = this.props;

		const familyClass = Classnames({
			'add-family': true,
			'with-error': !!this.state.error,
		});

		const templateList = this.state.fonts.map(font =>
			(<FamilyTemplateChoice
				key={font.name}
				selectedFont={this.state.selectedFont}
				font={font}
				chooseFont={this.selectFont}
			/>),
		);

		const error = this.state.error
			? (<div className="add-family-form-error">
				{this.state.error}
			</div>)
			: false;

		return (
			<div id="font-create" className={familyClass}>
				<div className="add-family-form">
					<label className="add-family-form-label">
						<span className="add-family-form-label-order">1. </span>Choose a font template
					</label>
					<div className="add-family-form-template-list">
						<ScrollArea contentClassName="add-family-form-template-list-content" horizontal={false}>
							{templateList}
						</ScrollArea>
					</div>
					<form onSubmit={this.createFont}>
						<label htmlFor="add-family-form-name" className="add-family-form-label">
							<span className="add-family-form-label-order">2. </span>Choose a family name
						</label>
						<input
							ref={node => (this.name = node)}
							id="add-family-form-name"
							name="name"
							className="add-family-form-input"
							type="text"
							placeholder="My new typeface"
						/>
						{error}
						<div className="action-form-buttons">
							{!start
								&& <Button onClick={this.exit} outline>
									Cancel
								</Button>}
							<Button type="submit" size="small">
								{start ? 'Create project' : 'Create family'}
							</Button>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

AddFamily.defaultProps = {
	createFamily: () => {},
};

AddFamily.propTypes = {
	createFamily: PropTypes.func,
};

const getUserIdQuery = gql`
	query getUserId {
		user {
			id
		}
	}
`;

const createFamilyMutation = gql`
	mutation createFamily($name: String!, $template: String!, $ownerId: ID!) {
		createFamily(
			name: $name
			template: $template
			ownerId: $ownerId
			variants: [{name: "Regular"}]
		) {
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
`;

AddFamily = compose(
	graphql(getUserIdQuery, {
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			return {userId: data.user.id};
		},
	}),
	graphql(createFamilyMutation, {
		props: ({mutate, ownProps}) => ({
			createFamily: (name, template) => {
				debugger;
				return mutate({
					variables: {
						ownerId: ownProps.userId,
						name,
						template,
					},
				});
			},
		}),
		options: {
			update: (store, {data: {createFamily}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library.push(createFamily);

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
)(AddFamily);

export class FamilyTemplateChoice extends React.Component {
	render() {
		const classes = Classnames({
			'family-template-choice': true,
			clearfix: true,
			'is-active': this.props.selectedFont && this.props.selectedFont.name === this.props.font.name,
		});

		return (
			<div
				className={classes}
				onClick={() => {
					this.props.chooseFont(this.props.font);
				}}
			>
				<div className="family-template-choice-provider">
					<div
						className={`provider-${this.props.font.name === 'Spectral' ? 'google' : 'prototypo'}`}
					/>
				</div>
				<div className="family-template-choice-sample">
					<img src={`/assets/images/${this.props.font.sampleLarge}`} alt="" />
				</div>
			</div>
		);
	}
}

export class AddVariantRaw extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			name: '',
		};

		this.variants = [
			{label: 'Thin', value: 'Thin'}, // 20
			{label: 'Thin Italic', value: 'Thin Italic'},
			{label: 'Light', value: 'Light'}, // 50
			{label: 'Light Italic', value: 'Light Italic'},
			{label: 'Book', value: 'Book'}, // 70
			{label: 'Book Italic', value: 'Book Italic'},
			{label: 'Regular', value: 'Regular'},
			{label: 'Regular Italic', value: 'Regular Italic'},
			{label: 'Semi-Bold', value: 'Semi-Bold'}, // 100
			{label: 'Semi-Bold Italic', value: 'Semi-Bold Italic'},
			{label: 'Bold', value: 'Bold'}, // 115
			{label: 'Bold Italic', value: 'Bold Italic'},
			{label: 'Extra-Bold', value: 'Extra-Bold'}, // 135
			{label: 'Extra-Bold Italic', value: 'Extra-Bold Italic'},
			{label: 'Black', value: 'Black'}, // 150
			{label: 'Black Italic', value: 'Black Italic'},
		];

		this.createVariant = this.createVariant.bind(this);
		this.exit = this.exit.bind(this);
		this.saveName = this.saveName.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	async createVariant() {
		// this.client.dispatchAction('/create-variant', {
		// 	name: this.refs.variantName.inputValue.value,
		// 	familyId: this.props.family.id,
		// });
		this.setState({error: null});

		const name = this.name.inputValue.value;

		try {
			// TODO: check duplicates, on Graphcool ?

			if (!name.trim()) {
				throw new Error('You need to enter a name');
			}

			this.props.createVariant(name);

			Log.ui('Collection.createVariant');

			this.exit();
		}
		catch (err) {
			this.setState({error: err.message});
		}
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openVariantModal: false,
		});
	}

	saveName(value) {
		this.setState({error: null, name: value || ''});
	}

	render() {
		const {error} = this.state;

		return (
			<div className="variant">
				<SelectWithLabel
					ref={(node) => this.name = node}
					noResultsText={false}
					placeholder="Enter a variant name or choose a suggestion with predefined settings"
					options={this.variants}
				/>
				{error
					&& <div className="add-family-form-error">
						{error}
					</div>}
				<div className="action-form-buttons">
					<Button onClick={this.exit} outline>
						Cancel
					</Button>
					<Button onClick={this.createVariant} disabled={!!error}>
						Create variant
					</Button>
				</div>
			</div>
		);
	}
}

// very similar to DuplicateVariant
// we could have only one component

const getBaseValuesQuery = gql`
	query getBaseValues($variantBaseId: ID!) {
		variant: Variant(id: $variantBaseId) {
			id
			values
		}
	}
`;

const createVariantMutation = gql`
	mutation createVariant($familyId: ID!, $name: String!, $baseValues: Json!) {
		createVariant(name: $name, values: $baseValues, familyId: $familyId) {
			id
			name
			values
		}
	}
`;

export const AddVariant = graphql(getBaseValuesQuery, {
	options: ({family}) => ({variables: {variantBaseId: family.variants[0].id}}),
	props({data}) {
		if (data.loading) {
			return {loading: true};
		}

		return {variantBase: data.variant};
	},
})(
	graphql(createVariantMutation, {
		props: ({mutate, ownProps}) => ({
			createVariant: name =>
				mutate({
					variables: {
						familyId: ownProps.family.id,
						name,
						baseValues: ownProps.variantBase.values,
					},
					update: (store, {data: {createVariant}}) => {
						const data = store.readQuery({query: libraryQuery});

						const family = data.user.library.find(family => family.id === ownProps.family.id);

						family.variants.push(createVariant);

						store.writeQuery({
							query: libraryQuery,
							data,
						});
					},
				}),
		}),
	})(AddVariantRaw),
);

AddVariant.propTypes = {
	family: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		variants: PropTypes.arrayOf(
			PropTypes.shape({
				id: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
			}),
		),
	}),
};
