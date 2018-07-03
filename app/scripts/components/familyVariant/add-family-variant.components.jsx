import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import React from 'react';
import {compose, graphql} from 'react-apollo';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar/dist/no-css';
import LocalClient from '../../stores/local-client.stores.jsx';
import Log from '../../services/log.services.js';

import {libraryQuery} from '../library/library-main.components';

import Button from '../shared/new-button.components.jsx';
import SelectWithLabel from '../shared/select-with-label.components.jsx';

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
			designer: ""
			designerUrl: ""
			foundry: "Prototypo"
			foundryUrl: "https://prototypo.io/"
			variants: [{name: "Regular", width: "normal", weight: 400, italic: false}]
		) {
			id
			name
			template
			designer
			designerUrl
			foundry
			foundryUrl
			tags
			variants {
				id
				name
				values
				weight
				width
				italic
			}
		}
	}
`;

export class AddVariantRaw extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			name: '',
		};

		this.variants = [
			{
				label: 'Thin',
				value: 'Thin',
				thickness: 100,
				width: 'medium',
				italic: false,
			}, // 20
			{
				label: 'Thin Italic',
				value: 'Thin Italic',
				thickness: 100,
				width: 'medium',
				italic: true,
			},
			{
				label: 'Light',
				value: 'Light',
				thickness: 200,
				width: 'medium',
				italic: false,
			}, // 50
			{
				label: 'Light Italic',
				value: 'Light Italic',
				thickness: 200,
				width: 'medium',
				italic: true,
			},
			{
				label: 'Book',
				value: 'Book',
				thickness: 300,
				width: 'medium',
				italic: false,
			}, // 70
			{
				label: 'Book Italic',
				value: 'Book Italic',
				thickness: 300,
				width: 'medium',
				italic: true,
			},
			{
				label: 'Regular',
				value: 'Regular',
				thickness: 400,
				width: 'medium',
				italic: false,
			},
			{
				label: 'Regular Italic',
				value: 'Regular Italic',
				thickness: 400,
				width: 'medium',
				italic: true,
			},
			{
				label: 'Semi-Bold',
				value: 'Semi-Bold',
				thickness: 600,
				width: 'medium',
				italic: false,
			}, // 100
			{
				label: 'Semi-Bold Italic',
				value: 'Semi-Bold Italic',
				thickness: 600,
				width: 'medium',
				italic: true,
			},
			{
				label: 'Bold',
				value: 'Bold',
				thickness: 700,
				width: 'medium',
				italic: false,
			}, // 115
			{
				label: 'Bold Italic',
				value: 'Bold Italic',
				thickness: 700,
				width: 'medium',
				italic: true,
			},
			{
				label: 'Extra-Bold',
				value: 'Extra-Bold',
				thickness: 800,
				width: 'medium',
				italic: false,
			}, // 135
			{
				label: 'Extra-Bold Italic',
				value: 'Extra-Bold Italic',
				thickness: 800,
				width: 'medium',
				italic: true,
			},
			{
				label: 'Black',
				value: 'Black',
				thickness: 900,
				width: 'medium',
				italic: false,
			}, // 150
			{
				label: 'Black Italic',
				value: 'Black Italic',
				thickness: 900,
				width: 'medium',
				italic: true,
			},
		];

		this.createVariant = this.createVariant.bind(this);
		this.exit = this.exit.bind(this);
		this.saveName = this.saveName.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	async createVariant() {
		this.setState({error: null});
		const name = this.name.inputValue.value;
		const meta = this.variants.find(
			e => e.value === this.name.inputValue.value,
		);

		try {
			// TODO: check duplicates, on Graphcool ?

			if (!name.trim()) {
				throw new Error('You need to enter a name');
			}

			const {data: {createVariant}} = await this.props.createVariant(
				meta ? meta.value : name,
				meta ? meta.thickness : 400,
				meta ? meta.width : 'medium',
				meta ? meta.italic : false,
			);

			Log.ui('Collection.createVariant');

			this.exit();

			this.client.dispatchAction('/select-variant', {
				selectedVariant: {
					id: createVariant.id,
					name: createVariant.name,
				},
				family: this.props.family,
			});
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
					ref={node => (this.name = node)}
					noResultsText={false}
					placeholder="Enter a variant name or choose a suggestion with predefined settings"
					options={this.variants}
				/>
				{error && <div className="add-family-form-error">{error}</div>}
				<div className="action-form-buttons">
					<Button onClick={this.exit} outline neutral>
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

function adaptValuesFromName(name, values) {
	const lowName = name.toLowerCase();
	const newValues = Object.assign({}, values);

	const thicknessTransform = [
		{string: 'thin', thickness: 20},
		{string: 'light', thickness: 50},
		{string: 'book', thickness: 70},
		{string: 'bold', thickness: 115},
		{string: 'semi-bold', thickness: 100},
		{string: 'extra-bold', thickness: 135},
		{string: 'black', thickness: 150},
	];

	thicknessTransform.forEach((item) => {
		if (lowName.includes(item.string)) {
			newValues.thickness = item.thickness;
		}
	});

	if (lowName.includes('italic')) {
		newValues.slant = 10;
	}

	return newValues;
}

const getBaseValuesQuery = gql`
	query getBaseValues($familyId: ID!) {
		family: Family(id: $familyId) {
			id
			variants(first: 1) {
				id
				values
			}
		}
	}
`;

const createVariantMutation = gql`
	mutation createVariant(
		$familyId: ID!
		$name: String!
		$baseValues: Json!
		$weight: Int!
		$width: String!
		$italic: Boolean!
	) {
		createVariant(
			name: $name
			values: $baseValues
			familyId: $familyId
			weight: $weight
			width: $width
			italic: $italic
		) {
			id
			name
			weight
			values
			width
			italic
			updatedAt
			abstractedFont {
				id
			}
		}
	}
`;

export const AddVariant = graphql(getBaseValuesQuery, {
	options: ({family}) => ({variables: {familyId: family.id}}),
	props({data}) {
		if (data.loading) {
			return {loading: true};
		}

		return {variantBase: data.family.variants[0]};
	},
})(
	graphql(createVariantMutation, {
		props: ({mutate, ownProps}) => ({
			createVariant: (name, weight, width, italic) =>
				mutate({
					variables: {
						familyId: ownProps.family.id,
						name,
						baseValues: adaptValuesFromName(name, ownProps.variantBase.values),
						weight,
						width,
						italic,
					},
					update: (store, {data: {createVariant}}) => {
						const data = store.readQuery({query: libraryQuery});

						const family = data.user.library.find(
							family => family.id === ownProps.family.id,
						);

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
