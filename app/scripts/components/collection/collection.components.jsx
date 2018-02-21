import Lifespan from 'lifespan';
import PropTypes from 'prop-types';
import React from 'react';
import ScrollArea from 'react-scrollbar/dist/no-css';
import {graphql, gql, compose} from 'react-apollo';

import Family from './family.components';
import Variant from './variant.components';
import LocalClient from '~/stores/local-client.stores';
import Button from '../shared/new-button.components';
import {collectionsTutorialLabel} from '../../helpers/joyride.helpers';

class Collection extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};

		this.returnToDashboard = this.returnToDashboard.bind(this);
		this.open = this.open.bind(this);
		this.handleDeleteFamily = this.handleDeleteFamily.bind(this);
		this.handleDeleteVariant = this.handleDeleteVariant.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
		});

		this.client.getStore('/prototypoStore', this.lifespan).onUpdate((head) => {
			const {
				collectionSelectedFamily,
				collectionSelectedVariant,
				uiAskSubscribeFamily,
				uiAskSubscribeVariant,
				variantToExport,
				exportedVariant,
			} = head.toJS().d;

			this.setState({
				selected: collectionSelectedFamily || this.props.families[0],
				selectedVariant:
					collectionSelectedVariant
					|| (this.props.families[0] && this.props.families[0].variants[0]),
				askSubscribeFamily: uiAskSubscribeFamily,
				askSubscribeVariant: uiAskSubscribeVariant,
				variantToExport,
				exportedVariant,
			});

			if (!collectionSelectedFamily) {
				this.client.dispatchAction('/select-family-collection', this.props.families[0]);
				this.client.dispatchAction(
					'/select-variant-collection',
					this.props.families[0].variants[0],
				);
			}
		});
	}

	componentDidMount() {
		setTimeout(() => {
			this.client.dispatchAction('/store-value', {
				uiJoyrideTutorialValue: collectionsTutorialLabel,
			});
		}, this.props.collectionTransitionTimeout + 100);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	returnToDashboard() {
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	open(variant) {
		this.client.dispatchAction('/select-variant', {
			variant: variant || this.state.selectedVariant,
			family: this.state.selected,
		});
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	async handleDeleteFamily() {
		await this.props.deleteFamily(this.state.selected.id);
		await this.props.refetch(); // ugly TMP
	}

	async handleDeleteVariant() {
		await this.props.deleteVariant(this.state.selectedVariant.id);
		await this.props.refetch(); // ugly TMP
	}

	render() {
		const {families, deleteFamily} = this.props;
		const {
			selected,
			templateInfos,
			askSubscribeFamily,
			variantToExport,
			exportedVariant,
		} = this.state;

		const selectedFamilyVariants = (families.find(family => family.id === selected.id) || {})
			.variants;
		const variant = selectedFamilyVariants
			? (<VariantList
				variants={selectedFamilyVariants}
				selectedVariantId={this.state.selectedVariant.id}
				askSubscribe={askSubscribeFamily}
				variantToExport={variantToExport}
				exportedVariant={exportedVariant}
				family={selected}
				deleteVariant={this.props.deleteVariant}
			/>)
			: false;

		return (
			<div className="collection">
				<div className="collection-container">
					<div className="account-dashboard-icon" onClick={this.returnToDashboard} />
					<div className="account-dashboard-back-icon" onClick={this.returnToDashboard} />
					<div className="account-header">
						<h1 className="account-title">My projects</h1>
					</div>
					<div className="collection-content">
						<FamilyList
							list={families}
							templateInfos={templateInfos}
							selected={selected}
							deleteSplit={this.state.familyDeleteSplit}
							deleteFamily={deleteFamily}
						/>
						{variant}
					</div>
				</div>
			</div>
		);
	}
}

Collection.propTypes = {
	families: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string,
			name: PropTypes.string,
			template: PropTypes.string,
		}),
	).isRequired,
	deleteFamily: PropTypes.func,
	deleteVariant: PropTypes.func,
};

Collection.defaultProps = {
	families: [],
	deleteFamily: () => {},
	deleteVariant: () => {},
};

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

const deleteVariantMutation = gql`
	mutation deleteVariant($id: ID!) {
		deleteVariant(id: $id) {
			id
		}
	}
`;

const deleteFamilyMutation = gql`
	mutation deleteFamily($id: ID!) {
		deleteFamily(id: $id) {
			id
		}
	}
`;

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
					family.variants = family.variants.filter(variant => variant.id !== deleteVariant.id);
				});

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
	graphql(deleteFamilyMutation, {
		props: ({mutate, ownProps}) => ({
			deleteFamily: (id) => {
				const family = ownProps.families.find(f => f.id === id);

				if (!family) {
					return Promise.reject();
				}

				// don't worry, mutations are batched, so we're only sending one or two requests
				// in the future, cascade operations should be available on graphcool
				const variants = family.variants.map(variant => ownProps.deleteVariant(variant.id));

				return Promise.all([...variants, mutate({variables: {id}})]);
			},
		}),
		options: {
			update: (store, {data: {deleteFamily}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library = data.user.library.filter(font => font.id !== deleteFamily.id);

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
)(Collection);

class FamilyList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.openFamilyModal = this.openFamilyModal.bind(this);
		this.selectFamily = this.selectFamily.bind(this);
		this.openChangeFamilyName = this.openChangeFamilyName.bind(this);
		this.deleteFamily = this.deleteFamily.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	openFamilyModal() {
		this.client.dispatchAction('/store-value', {openFamilyModal: true});
	}

	selectFamily(family) {
		this.client.dispatchAction('/select-family-collection', family);
	}

	openChangeFamilyName(family) {
		this.client.dispatchAction('/store-value', {
			openChangeFamilyNameModal: true,
			familySelectedVariantCreation: family,
		});
	}

	async deleteFamily(family) {
		try {
			await this.props.deleteFamily(family.id);

			// legacy call use to change the selected family
			this.client.dispatchAction('/delete-family', {
				family,
			});
		}
		catch (err) {
			// TODO: Error handling
		}
	}

	render() {
		const families = this.props.list.map((family) => {
			const templateInfo = this.props.templateInfos.find(
				template => template.templateName === family.template,
			) || {name: 'Undefined'};
			let selected;

			if (this.props.selected) {
				selected = family.id === this.props.selected.id;
			}

			return (
				<Family
					key={family.id}
					family={family}
					selected={selected}
					class={family.template.split('.')[0]}
					templateName={templateInfo.name}
					onSelect={this.selectFamily}
					onDelete={this.deleteFamily}
					askChangeName={this.openChangeFamilyName}
				/>
			);
		});

		return (
			<div className="family-list collection-pan">
				<div className="family-list-create">
					<Button
						className="family-list-create-button"
						onClick={this.openFamilyModal}
						size="small"
						outline
						fluid
					>
						Create a new project
					</Button>
				</div>
				<ScrollArea
					className="family-list-families"
					contentClassName="family-list-families-content"
					horizontal={false}
					style={{overflowX: 'visible'}}
				>
					{families}
				</ScrollArea>
			</div>
		);
	}
}

class VariantList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			deleteSplit: false,
		};

		this.openCreateVariant = this.openCreateVariant.bind(this);
		this.openVariant = this.openVariant.bind(this);
		this.openChangeVariantName = this.openChangeVariantName.bind(this);
		this.openDuplicateVariant = this.openDuplicateVariant.bind(this);
		this.deleteVariant = this.deleteVariant.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			uiAskSubscribeFamily: false,
		});
	}

	openCreateVariant() {
		this.client.dispatchAction('/store-value', {
			openVariantModal: true,
			familySelectedVariantCreation: this.props.family,
		});
	}

	openVariant(variant) {
		this.client.dispatchAction('/select-variant', {
			variant,
			family: this.props.family,
		});
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	openChangeVariantName(variant) {
		this.client.dispatchAction('/store-value', {
			openChangeVariantNameModal: true,
			collectionSelectedVariant: variant,
			familySelectedVariantCreation: this.props.family,
		});
	}

	openDuplicateVariant(variant) {
		this.client.dispatchAction('/store-value', {
			openDuplicateVariantModal: true,
			collectionSelectedVariant: variant,
			familySelectedVariantCreation: this.props.family,
		});
	}

	async deleteVariant(variant) {
		try {
			await this.props.deleteVariant(variant.id);

			// legacy call use to change the selected variant
			this.client.dispatchAction('/delete-variant', {
				variant,
				familyName: this.props.family.name,
			});
		}
		catch (err) {
			// TODO: Error handling
		}
	}

	render() {
		const {deleteSplit} = this.state;

		const variants = this.props.variants.map(variant =>
			(<Variant
				key={variant.id}
				family={this.props.family}
				variant={variant}
				deleteSplit={deleteSplit}
				open={this.openVariant}
				changeName={this.openChangeVariantName}
				duplicate={this.openDuplicateVariant}
				delete={this.deleteVariant}
				onlyVariant={this.props.variants.length === 1}
			/>),
		);

		return (
			<div className="variant-list-container">
				<div className="variant-list-add">
					<Button onClick={this.openCreateVariant} size="small" outline>
						Add a new variant
					</Button>
				</div>
				<ScrollArea
					className="variant-list-variants"
					contentClassName="variant-list-variants-content"
					horizontal={false}
					style={{overflowX: 'visible'}}
				>
					{variants}
				</ScrollArea>
			</div>
		);
	}
}
