import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import InlineSVG from 'svg-inline-react';
import Lifespan from 'lifespan';
import LocalClient from '../../stores/local-client.stores';

import CreateVariantModal from '../familyVariant/create-variant-modal.components.jsx';
import ChangeNameVariant from '../familyVariant/change-name-variant.components.jsx';
import DuplicateVariant from '../familyVariant/duplicate-variant.components.jsx';
import GoProModal from '../go-pro-modal.components.jsx';
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
		this.closeRestrictedFeatureOverlay = this.closeRestrictedFeatureOverlay.bind(
			this,
		);
		this.openGoProModal = this.openGoProModal.bind(this);
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
				openFamilyModal: head.toJS().d.openFamilyModal,
				openVariantModal: head.toJS().d.openVariantModal,
				openChangeVariantNameModal: head.toJS().d.openChangeVariantNameModal,
				openDuplicateVariantModal: head.toJS().d.openDuplicateVariantModal,
				familySelectedVariantCreation: head.toJS().d
					.familySelectedVariantCreation,
				collectionSelectedVariant: head.toJS().d.collectionSelectedVariant,
				templatesData: head.toJS().d.templatesData,
				search: head.toJS().d.librarySearchString,
				librarySelectedTags: head.toJS().d.librarySelectedTags,
				openRestrictedFeature: head.toJS().d.openRestrictedFeature,
				restrictedFeatureHovered: head.toJS().d.restrictedFeatureHovered,
				openGoProModal: head.toJS().d.openGoProModal,
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

	export(
		familyName,
		variantName = 'Regular',
		values,
		template,
		glyphs,
		designer,
		designerUrl,
		foundry,
		foundryUrl,
		weight,
		width,
		italic,
	) {
		this.client.dispatchAction('/export-otf-from-library', {
			merged: true,
			familyName,
			variantName,
			exportAs: false,
			values,
			template,
			glyphs,
			designer,
			designerUrl,
			foundry,
			foundryUrl,
			weight,
			width,
			italic,
		});
	}

	setActiveFilters(filters) {
		this.setState({activeFilters: filters});
	}

	openGoProModal() {
		// TODO: Intercom tracking
		this.client.dispatchAction('/store-value', {
			openGoProModal: true,
		});
	}

	closeRestrictedFeatureOverlay() {
		this.client.dispatchAction('/store-value', {
			openRestrictedFeature: false,
			restrictedFeatureHovered: '',
		});
	}

	render() {
		let featureHovered;

		switch (this.state.restrictedFeatureHovered) {
		case 'export':
			featureHovered
					= 'To export as many projects as you want with unlimited rights';
			break;
		default:
			featureHovered = 'This feature is not available to you yet.';
		}

		const restrictedFeatureText = this.state.openRestrictedFeature ? (
			<div
				className="panel-demo-overlay"
				onClick={this.closeRestrictedFeatureOverlay}
			>
				<div className="panel-demo-overlay-text">
					<InlineSVG
						element="div"
						src={require('!svg-inline-loader!../../../images/academy/lock.svg')}
						onClick={this.openGoProModal}
					/>
					<p>{featureHovered}</p>

					<div
						className="panel-demo-overlay-text-gopro-cta"
						onClick={this.openGoProModal}
					>
						Upgrade to the full version
					</div>
				</div>
			</div>
		) : (
			false
		);

		return (
			<div className="library-main">
				<LibrarySidebarLeft
					location={this.props.location}
					subUsers={this.props.subUsers}
					userId={this.props.userId}
					families={this.props.families}
					routeParams={this.props.params}
					favourites={this.props.favourites}
				/>
				{React.cloneElement(this.props.children, {
					activeFilters: this.state.activeFilters,
					families: this.props.families,
					subUsers: this.props.subUsers,
					presets: this.props.presets,
					setActiveFilters: this.setActiveFilters,
					fontInUses: this.props.fontInUses,
					open: this.open,
					export: this.export,
					rename: this.rename,
					duplicate: this.duplicate,
					deleteVariant: this.deleteVariant,
					updateTags: this.props.updateTags,
					favourites: this.props.favourites,
					addFavourite: this.props.addFavourite,
					deleteFavourite: this.props.deleteFavourite,
					user: {
						firstName: this.props.firstName,
						lastName: this.props.lastName,
						id: this.props.userId,
					},
					search: this.state.search,
					librarySelectedTags: this.state.librarySelectedTags,
				})}
				{restrictedFeatureText}
				{this.state.openGoProModal && <GoProModal propName="openGoProModal" />}
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

export const teamQuery = gql`
	query {
		user {
			id
			manager {
				id
				subUsers {
					id
					firstName
					lastName
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
		}
	}
`;

const libraryUserQuery = gql`
	query getLibraryUserInfos {
		user {
			id
			firstName
			lastName
			fontInUses {
				id
				client
				clientUrl
				designer
				designerUrl
				images
				fontUsed {
					id
					name
					family {
						id
					}
					type
					template
					preset {
						id
					}
				}
			}
			favourites {
				id
				type
				name
				preset {
					id
				}
				family {
					id
					variants {
						id
					}
				}
				template
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

const deleteFavouriteMutation = gql`
	mutation deleteAbstractedFont($id: ID!) {
		deleteAbstractedFont(id: $id) {
			id
		}
	}
`;

const addFavouriteMutation = gql`
	mutation createAbstractedFont(
		$userId: ID!
		$type: FontType!
		$familyId: ID
		$template: String
		$presetId: ID
		$name: String!
	) {
		createAbstractedFont(
			userId: $userId
			type: $type
			familyId: $familyId
			template: $template
			presetId: $presetId
			name: $name
		) {
			id
			type
			name
			preset {
				id
			}
			family {
				id
			}
			template
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
	graphql(teamQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}
			if (data.user) {
				return {
					subUsers: data.user.manager ? data.user.manager.subUsers : [],
					refetch: data.refetch,
				};
			}

			return {refetch: data.refetch};
		},
	}),
	graphql(libraryUserQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({data}) => {
			if (data.loading) {
				return {
					loading: true,
					firstName: '',
					lastName: '',
					favourites: [],
				};
			}
			return {
				firstName: data.user.firstName,
				lastName: data.user.lastName,
				userId: data.user.id,
				favourites: data.user.favourites,
				fontInUses: data.user.fontInUses,
			};
		},
	}),
	graphql(deleteFavouriteMutation, {
		props: ({mutate}) => ({
			deleteFavourite: id =>
				mutate({
					variables: {
						id,
					},
				}),
		}),
		options: {
			update: (store, {data: {deleteAbstractedFont}}) => {
				const data = store.readQuery({query: libraryUserQuery});

				data.user.favourites.splice(
					data.user.favourites.findIndex(
						f => f.id === deleteAbstractedFont.id,
					),
					1,
				);
				store.writeQuery({
					query: libraryUserQuery,
					data,
				});
			},
		},
	}),
	graphql(addFavouriteMutation, {
		props: ({mutate, ownProps}) => ({
			addFavourite: (type, familyId, template, presetId, name) =>
				mutate({
					variables: {
						userId: ownProps.userId,
						type,
						familyId,
						template,
						presetId,
						name,
					},
				}),
		}),
		options: {
			update: (store, {data: {createAbstractedFont}}) => {
				const data = store.readQuery({query: libraryUserQuery});

				data.user.favourites.push(createAbstractedFont);
				store.writeQuery({
					query: libraryUserQuery,
					data,
				});
			},
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
		}),
		options: {
			update: (store, {data: {updateFamily}}) => {
				const data = store.readQuery({query: libraryQuery});
				const family = data.user.library.find(f => f.id === updateFamily.id);

				family.tags = [...updateFamily.tags];
				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
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
