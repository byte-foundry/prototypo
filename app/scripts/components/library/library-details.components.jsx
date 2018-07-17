import React from 'react';
import pleaseWait from 'please-wait';
import {
	LibrarySidebarRight,
	FamilySidebarActions,
	FamilySidebarGlyphs,
	SidebarTags,
} from './library-sidebars.components';
import {graphql, gql, compose} from 'react-apollo';
import FontUpdater from '../font-updater.components';
import LocalClient from '../../stores/local-client.stores';

class LibraryDetails extends React.Component {
	constructor(props) {
		super(props);
		const family = this.props.families.find(
			e => e.id === this.props.params.projectID,
		);

		if (!family) {
			props.router.push('/library/home');
		}
		this.state = {
			family,
			familyMetadata: {
				name: family.name,
				designer: family.designer,
				designerUrl: family.designerUrl,
				foundry: family.foundry,
				foundryUrl: family.foundryUrl,
				isModified: false,
			},
			variantMetadata: family.variants.map(variant => ({
				isModified: false,
				width: variant.width,
				italic: variant.italic,
				weight: variant.weight,
				name: variant.name,
			})),
		};
		this.goToDashboard = this.goToDashboard.bind(this);
		this.deleteFamily = this.deleteFamily.bind(this);
		this.exportFamily = this.exportFamily.bind(this);
		this.updateFamilyData = this.updateFamilyData.bind(this);
		this.updateVariantData = this.updateVariantData.bind(this);
		this.updateFamily = this.updateFamily.bind(this);
		this.updateVariant = this.updateVariant.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		const prototypoStore = await this.client.fetch('/prototypoStore');
		const familyGlyphs = prototypoStore.head
			.toJS()
			.templatesData.find(e => e.name === this.state.family.template)
			.glyphs;
		const templateValues = prototypoStore.head
			.toJS()
			.templatesData.find(e => e.name === this.state.family.template);

		this.setState({familyGlyphs, templateValues});
	}
	componentWillReceiveProps(newProps) {
		if (newProps.families !== this.props.families) {
			const family = newProps.families.find(
				e => e.id === newProps.params.projectID,
			);

			if (!family) {
				newProps.router.push('/library/home');
			}
			this.setState({
				family,
				familyMetadata: {
					name: family.name,
					designer: family.designer,
					designerUrl: family.designerUrl,
					foundry: family.foundry,
					foundryUrl: family.foundryUrl,
					isModified: false,
				},
				variantMetadata: family.variants.map(variant => ({
					isModified: false,
					width: variant.width,
					italic: variant.italic,
					weight: variant.weight,
					name: variant.name,
				})),
			});
		}
	}
	updateFamilyData(event, field) {
		const familyMetadata = {...this.state.familyMetadata};

		familyMetadata[field] = event.target.value;
		familyMetadata.isModified = true;
		this.setState({familyMetadata});
	}
	updateVariantData(event, field, index) {
		const variantMetadata = {...this.state.variantMetadata};

		variantMetadata[index][field] = field === 'italic' ? !variantMetadata[index].italic : event.target.value;
		variantMetadata[index].isModified = true;
		this.setState({variantMetadata});
	}
	exportFamily() {
		const valueArray = this.state.family.variants.map(variant => ({
			...this.state.templateValues.initValues,
			...variant.values,
		}));
		const variantNames = this.state.family.variants.map(
			variant => variant.name,
		);
		const metadataArray = this.state.family.variants.map(variant => ({
			width: variant.width,
			weight: variant.weight,
			italic: variant.italic,
		}));

		this.client.dispatchAction('/export-family-from-library', {
			familyName: this.state.family.name,
			variantNames,
			valueArray,
			metadataArray,
			template: this.state.family.template,
			glyphs: this.state.familyGlyphs,
			designer: this.state.family.designer,
			designerUrl: this.state.family.designerUrl,
			foundry: this.state.family.foundry,
			foundryUrl: this.state.family.foundryUrl,
		});
	}
	deleteFamily() {
		this.props.deleteFamily(this.props.params.projectID);
		this.props.router.push('/library/home');
	}
	updateFamily() {
		this.props.updateFamily(
			this.state.family.id,
			this.state.familyMetadata.name,
			this.state.familyMetadata.designer,
			this.state.familyMetadata.designerUrl,
			this.state.familyMetadata.foundry,
			this.state.familyMetadata.foundryUrl,
		);
		const familyMetadata = {...this.state.familyMetadata};

		familyMetadata.isModified = true;
		this.setState({familyMetadata});
	}
	updateVariant(id, index) {
		this.props.updateVariant(
			id,
			this.state.variantMetadata[index].name,
			parseInt(this.state.variantMetadata[index].weight, 10),
			this.state.variantMetadata[index].width,
			this.state.variantMetadata[index].italic,
		);
		const variantMetadata = {...this.state.variantMetadata};

		variantMetadata[index].isModified = false;
		this.setState({variantMetadata});
	}
	goToDashboard() {
		this.props.router.push('/dashboard');
	}
	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-see-title">
						{this.state.family.name} family
						<div
							className={'provider provider-custom'}
							style={{
								backgroundColor: '#29ABE2',
							}}
						>
							{this.props.user.firstName
								&& this.props.user.firstName.charAt(0)}
							{this.props.user.lastName
								&& this.props.user.lastName.charAt(0)}
						</div>
					</div>
					<div className="library-details-form">
						<form action="" method="">
							<div className="library-details-form-elem">
								<label htmlFor="name">Family name</label>
								<input
									type="text"
									id="name"
									name="family_name"
									value={this.state.familyMetadata.name}
									onChange={(e) => {
										this.updateFamilyData(e, 'name');
									}}
								/>
							</div>
							<div className="library-details-form-elem" />
							<div className="library-details-form-elem">
								<label htmlFor="mail">Designer</label>
								<input
									type="text"
									id="name"
									name="user_name"
									value={this.state.familyMetadata.designer}
									onChange={(e) => {
										this.updateFamilyData(e, 'designer');
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Designer URL</label>
								<input
									type="text"
									id="name"
									name="user_name"
									value={
										this.state.familyMetadata.designerUrl
									}
									onChange={(e) => {
										this.updateFamilyData(e, 'designerUrl');
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Foundry</label>
								<input
									type="text"
									id="name"
									name="user_name"
									value={this.state.familyMetadata.foundry}
									onChange={(e) => {
										this.updateFamilyData(e, 'foundry');
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Foundry URL</label>
								<input
									type="text"
									id="name"
									name="user_name"
									value={this.state.familyMetadata.foundryUrl}
									onChange={(e) => {
										this.updateFamilyData(e, 'foundryUrl');
									}}
								/>
							</div>
							{this.state.familyMetadata.isModified && (
								<div
									className="library-details-form-button"
									onClick={() => {
										this.updateFamily();
									}}
								>
									Update
								</div>
							)}
						</form>
					</div>
					<div className="library-details-variants">
						<div className="details-header">
							<div className="details-header-elem">
								Styles settings
							</div>
							<div className="details-header-elem">Weight</div>
							<div className="details-header-elem">Width</div>
							<div className="details-header-elem">Italic</div>
							<div className="details-header-elem">&nbsp;</div>
						</div>
						{this.state.family
							&& this.state.family.variants
							&& this.state.family.variants.map((variant, index) => (
								<div className="details-form">
									<div className="details-form-elem">
										<input
											type="text"
											id={`name${index}`}
											name={`name${index}`}
											value={
												this.state.variantMetadata[
													index
												].name
											}
											onChange={(e) => {
												this.updateVariantData(
													e,
													'name',
													index,
												);
											}}
										/>
									</div>
									<div className="details-form-elem">
										<select
											name={`weight${index}`}
											value={
												this.state.variantMetadata[
													index
												].weight
											}
											onChange={(e) => {
												this.updateVariantData(
													e,
													'weight',
													index,
												);
											}}
										>
											{[
												200,
												300,
												400,
												500,
												600,
												700,
												800,
												900,
											].map(weight => (
												<option value={weight}>
													{weight}
												</option>
											))}
										</select>
									</div>
									<div className="details-form-elem">
										<select
											name={`width${index}`}
											value={
												this.state.variantMetadata[
													index
												].width
											}
											onChange={(e) => {
												this.updateVariantData(
													e,
													'width',
													index,
												);
											}}
										>
											{[
												'medium',
												'condensed',
												'expanded',
											].map(width => (
												<option value={width}>
													{width}
												</option>
											))}
										</select>
									</div>
									<div className="details-form-elem checkbox">
										<div className="checkbox">
											<input
												type="checkbox"
												id={`italic${index}`}
												name={`italic${index}`}
												checked={
													!!this.state.variantMetadata[
														index
													].italic
												}
												onChange={(e) => {
													this.updateVariantData(
														e,
														'italic',
														index,
													);
												}}
											/>
											<label htmlFor={`italic${index}`} />
										</div>
									</div>
									{this.state.variantMetadata[index]
										.isModified && (
										<div className="details-form-elem">
											<div
												className="library-details-form-button"
												onClick={() => {
													this.updateVariant(
														variant.id,
														index,
													);
												}}
											>
												Update
											</div>
										</div>
									)}
									<div className="details-form-elem">
										{this.state.family.variants.length
											> 1 && (
											<div
												className="button-remove"
												onClick={() => {
													this.props.deleteVariant(
														variant.id,
													);
												}}
											>
												Remove
											</div>
										)}
									</div>
								</div>
							))}
					</div>
				</div>
				<LibrarySidebarRight>
					<FamilySidebarActions
						familyId={this.props.params.projectID}
						deleteFamily={this.deleteFamily}
						exportFamily={this.exportFamily}
						family={this.state.family}
						mode="details"
					/>
					<FamilySidebarGlyphs glyphs={this.state.familyGlyphs} />
					<SidebarTags
						tags={this.state.family.tags}
						familyId={this.state.family.id}
						updateTags={this.props.updateTags}
						mode="readonly"
					/>
				</LibrarySidebarRight>
			</div>
		);
	}
}

const libraryQuery = gql`
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

const deleteFamilyMutation = gql`
	mutation deleteFamily($id: ID!) {
		deleteFamily(id: $id) {
			id
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

const updateFamilyDataMutation = gql`
	mutation updateFamily(
		$id: ID!
		$name: String!
		$designer: String!
		$designerUrl: String!
		$foundry: String!
		$foundryUrl: String!
	) {
		updateFamily(
			id: $id
			name: $name
			designer: $designer
			designerUrl: $designerUrl
			foundry: $foundry
			foundryUrl: $foundryUrl
		) {
			id
			name
			designer
			designerUrl
			foundry
			foundryUrl
		}
	}
`;

const updateVariantDataMutation = gql`
	mutation updateVariant(
		$id: ID!
		$name: String!
		$weight: Int!
		$width: String!
		$italic: Boolean!
	) {
		updateVariant(
			id: $id
			name: $name
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
			family {
				id
			}
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
	graphql(deleteFamilyMutation, {
		props: ({mutate, ownProps}) => ({
			deleteFamily: (id) => {
				const family = ownProps.families.find(f => f.id === id);

				if (!family) {
					return Promise.reject();
				}
				const variants = family.variants.map(variant =>
					ownProps.deleteVariant(variant.id),
				);

				return Promise.all([...variants, mutate({variables: {id}})]);
			},
		}),
		options: {
			update: (store, {data: {deleteFamily}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library = data.user.library.filter(
					font => font.id !== deleteFamily.id,
				);

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
	graphql(updateFamilyDataMutation, {
		props: ({mutate}) => ({
			updateFamily: (
				id,
				name,
				designer,
				designerUrl,
				foundry,
				foundryUrl,
			) =>
				mutate({
					variables: {
						id,
						name,
						designer,
						designerUrl,
						foundry,
						foundryUrl,
					},
				}),
		}),
		options: {
			update: (store, {data: {updateFamily}}) => {
				const data = store.readQuery({query: libraryQuery});

				const family = data.user.library.find(
					f => f.id === updateFamily.id,
				);

				family.name = updateFamily.name;
				family.designer = updateFamily.designer;
				family.designerUrl = updateFamily.designerUrl;
				family.foundry = updateFamily.foundry;
				family.foundryUrl = updateFamily.foundryUrl;
				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
	graphql(updateVariantDataMutation, {
		props: ({mutate}) => ({
			updateVariant: (id, name, weight, width, italic) =>
				mutate({
					variables: {id, name, weight, width, italic},
				}),
		}),
		options: {
			update: (store, {data: {updateVariant}}) => {
				const data = store.readQuery({query: libraryQuery});

				const family = data.user.library.find(
					f => f.id === updateVariant.family.id,
				);
				const variant = family.variants.find(
					v => v.id === updateVariant.id,
				);

				variant.name = updateVariant.name;
				variant.designer = updateVariant.weight;
				variant.designerUrl = updateVariant.width;
				variant.foundry = updateVariant.italic;
				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
)(LibraryDetails);
