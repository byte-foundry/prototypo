import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import Lifespan from 'lifespan';
import LocalClient from '../../stores/local-client.stores';

import CreateVariantModal from '../familyVariant/create-variant-modal.components.jsx';
import ChangeNameVariant from '../familyVariant/change-name-variant.components.jsx';
import DuplicateVariant from '../familyVariant/duplicate-variant.components.jsx';
import {LibrarySidebarLeft} from './library-sidebars.components';

class LibraryMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeFilters: {},
			isBaseValueLoaded: false,
		};
		this.setActiveFilters = this.setActiveFilters.bind(this);
		this.export = this.export.bind(this);
		this.goToDashboard = this.goToDashboard.bind(this);
		this.open = this.open.bind(this);
		this.rename = this.rename.bind(this);
		this.duplicate = this.duplicate.bind(this);
		this.deleteVariant = this.deleteVariant.bind(this);
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
					search: head.toJS().d.librarySearchString,
					librarySelectedTags: head.toJS().d.librarySelectedTags,
				});
			});
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

	rename(variant, family) {
		this.client.dispatchAction('/store-value', {
			openChangeVariantNameModal: true,
			collectionSelectedVariant: variant,
			familySelectedVariantCreation: family,
		});
	}

	async deleteVariant(variant, family) {
		try {
			await this.props.deleteVariant(variant.id);

			// legacy call use to change the selected variant
			this.client.dispatchAction('/delete-variant', {
				variant,
				familyName: family.name,
			});
		}
		catch (err) {
			// TODO: Error handling
		}
	}

	duplicate(variant, family) {
		this.client.dispatchAction('/store-value', {
			openDuplicateVariantModal: true,
			collectionSelectedVariant: variant,
			familySelectedVariantCreation: family,
		});
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
		this.setState({activeFilters: filters});
	}

	render() {
		return (
			<div className="library-main">
				<LibrarySidebarLeft location={this.props.location} />
				{React.cloneElement(this.props.children, {
					activeFilters: this.state.activeFilters,
					families: this.props.families,
					presets: this.props.presets,
					setActiveFilters: this.setActiveFilters,
					open: this.open,
					export: this.export,
					rename: this.rename,
					duplicate: this.duplicate,
					deleteVariant: this.deleteVariant,
					updateTags: this.props.updateTags,
					user: {
						firstName: this.props.firstName,
						lastName: this.props.lastName,
					},
					search: this.state.search,
					librarySelectedTags: this.state.librarySelectedTags,
				})}
				{this.state.openVariantModal && (
					<CreateVariantModal
						family={this.state.familySelectedVariantCreation}
						propName="openVariantModal"
					/>
				)}
				{this.state.openChangeVariantNameModal && (
					<ChangeNameVariant
						family={this.state.familySelectedVariantCreation}
						variant={this.state.collectionSelectedVariant}
						propName="openChangeVariantNameModal"
					/>
				)}
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
				tags
				designer
				designerUrl
				foundry
				foundryUrl
				variants {
					id
					name
					values
					width
					weight
					italic
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
`;

const updateTagsMutation = gql`
	mutation updateTags($id: ID!, $newTags: [String!]) {
		updateFamily(id: $id, tags: $newTags) {
			id
			tags
		}
	}
`;

const deleteVariantMutation = gql`
	mutation deleteVariant($id: ID!) {
		deleteVariant(id: $id) {
			id
		}
	}
`;

export default compose(
	graphql(libraryQuery, {
		options: {
			fetchPolicy: 'cache-first',
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
	graphql(getNameQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({data}) => {
			if (data.loading) {
				return {loading: true, firstName: '', lastName: ''};
			}
			return {
				firstName: data.user.firstName,
				lastName: data.user.lastName,
			};
		},
	}),
	graphql(updateTagsMutation, {
		props: ({mutate}) => ({
			updateTags: (id, newTags) =>
				mutate({
					variables: {
						id,
						newTags,
					},
				}),
			update: (store, {data: {updateFamily}}) => {
				const data = store.readQuery({query: libraryQuery});
				const family = data.user.library.find(
					f => f.id === updateFamily.id,
				);
	
				family.tags = updateFamily.tags;
				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		}),
	}),
	graphql(deleteVariantMutation, {
		props: ({mutate}) => ({
			deleteVariant: id =>
				mutate({
					variables: {id},
				}),
		}),
		options: {
			update: (store, {data: {deleteVariant}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library.forEach((family) => {
					// eslint-disable-next-line
					family.variants = family.variants.filter(
						variant => variant.id !== deleteVariant.id,
					);
				});

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
	graphql(presetQuery, {
		options: {
			fetchPolicy: 'cache-first',
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
)(LibraryMain);
