import React from 'react';
import Dropzone from 'react-dropzone';
import {graphql, gql, compose} from 'react-apollo';
import {LibrarySidebarRight} from './library-sidebars.components';
import LocalClient from '../../stores/local-client.stores';

class LibraryFontInUseCreate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fontInUseMetadata: {
				designer: '',
				designerUrl: '',
				client: '',
				clientUrl: '',
				isModified: false,
				images: [],
				fonts: [],
			},
			autocompleteText: '',
			autocompleteSuggestions: [],
		};
		this.updateFontInUseData = this.updateFontInUseData.bind(this);
		this.addSuggestion = this.addSuggestion.bind(this);
		this.removeFont = this.removeFont.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.removeImage = this.removeImage.bind(this);
		this.updateAutocompleteSuggestions = this.updateAutocompleteSuggestions.bind(
			this,
		);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
		});
	}
	addSuggestion(suggestion) {
		const fonts = this.state.fontInUseMetadata.fonts;
		const alreadyAdded = fonts.find(
			e =>
				(e.type === 'Family'
					? e.id === suggestion.id
					: e.value === suggestion.value),
		);

		if (!alreadyAdded) {
			fonts.push(suggestion);
		}
		this.setState({
			fontInUseMetadata: {
				...this.state.fontInUseMetadata,
				fonts,
			},
			autocompleteText: '',
			autocompleteSuggestions: [],
		});
	}
	removeFont(font) {
		const fonts = this.state.fontInUseMetadata.fonts;
		const fontIndex = fonts.findIndex(
			e =>
				(e.type === 'Family' ? e.id === font.id : e.value === font.value),
		);

		fonts.splice(fontIndex, 1);

		this.setState({
			fontInUseMetadata: {
				...this.state.fontInUseMetadata,
				fonts,
			},
		});
	}
	updateFontInUseData(event, field) {
		const fontInUseMetadata = {...this.state.fontInUseMetadata};

		fontInUseMetadata[field] = event.target.value;
		fontInUseMetadata.isModified = true;
		this.setState({fontInUseMetadata});
	}
	updateAutocompleteSuggestions(event) {
		this.setState({autocompleteText: event.target.value});
		const autocompleteSuggestions = [];

		const templateFound
			= this.state.templateInfos
			&& this.state.templateInfos.filter(template =>
				template.familyName
					.toLowerCase()
					.includes(event.target.value.toLowerCase()),
			);

		templateFound
			&& templateFound.forEach(t =>
				autocompleteSuggestions.push({
					type: 'Template',
					value: t.familyName,
				}),
			);

		const presetFound
			= this.props.presets
			&& this.props.presets.filter(preset =>
				preset.variant.family.name
					.toLowerCase()
					.includes(event.target.value.toLowerCase()),
			);

		presetFound
			&& presetFound.forEach(p =>
				autocompleteSuggestions.push({
					type: 'Preset',
					value: `${p.variant.family.name}`,
				}),
			);

		const familyFound
			= this.props.families
			&& this.props.families.filter(family =>
				family.name
					.toLowerCase()
					.includes(event.target.value.toLowerCase()),
			);

		familyFound
			&& familyFound.forEach(f =>
				autocompleteSuggestions.push({
					type: 'Family',
					id: f.id,
					isPersonnal: true,
					value: `${f.name}`,
				}),
			);

		const teamFound = [];

		this.props.subUsers
			&& this.props.subUsers.forEach((subUser) => {
				subUser.id !== this.props.user.id
					&& subUser.library.forEach((family) => {
						if (
							family.name
								.toLowerCase()
								.includes(event.target.value.toLowerCase())
						) {
							teamFound.push(family);
						}
					});
			});

		teamFound
			&& teamFound.forEach(f =>
				autocompleteSuggestions.push({
					type: 'Family',
					isPersonnal: false,
					id: f.id,
					value: `${f.name}`,
				}),
			);
		this.setState({
			autocompleteSuggestions:
				event.target.value.replace(/\s+/g, '') === ''
					? []
					: autocompleteSuggestions,
		});
	}
	onDrop(acceptedFiles) {
		const images = this.state.fontInUseMetadata.images;

		acceptedFiles.forEach((file) => {
			images.push(file.preview);
			const formData = new FormData();

			formData.append('data', file);
			fetch('https://api.graph.cool/file/v1/prototypo-new-dev', {
				method: 'POST',
				body: formData,
			}).then((response) => {
				console.log(response);
				if (response.status === 200) {
					return response.json().then((data) => {
						console.log(data);
						if (data.url) {
							const placeHolderIndex = images.findIndex(i => i === file.preview)
							const newImages = this.state.fontInUseMetadata.images;

							newImages[placeHolderIndex] = data.url;
							this.setState({
								fontInUseMetadata: {
									...this.state.fontInUseMetadata,
									images: newImages,
								},
							});
						}
					});
				}
			});
		});

		this.setState({
			fontInUseMetadata: {
				...this.state.fontInUseMetadata,
				images,
			},
		});
	}
	removeImage(image) {
		const images = this.state.fontInUseMetadata.images;
		const imageIndex = images.find(i => i === image);

		images.splice(imageIndex, 1);
		this.setState({
			fontInUseMetadata: {
				...this.state.fontInUseMetadata,
				images,
			},
		});
	}
	render() {
		console.log(this.state);
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-see-title">Add a font in use</div>
					<div className="library-details-form">
						<form action="" method="">
							<div className="library-details-form-elem">
								<label htmlFor="mail">Designer</label>
								<input
									type="text"
									id="name"
									name="user_name"
									value={
										this.state.fontInUseMetadata.designer
									}
									onChange={(e) => {
										this.updateFontInUseData(e, 'designer');
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
										this.state.fontInUseMetadata.designerUrl
									}
									onChange={(e) => {
										this.updateFontInUseData(
											e,
											'designerUrl',
										);
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Client</label>
								<input
									type="text"
									id="name"
									name="user_name"
									value={this.state.fontInUseMetadata.client}
									onChange={(e) => {
										this.updateFontInUseData(e, 'client');
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Client URL</label>
								<input
									type="text"
									id="name"
									name="user_name"
									value={
										this.state.fontInUseMetadata.clientUrl
									}
									onChange={(e) => {
										this.updateFontInUseData(
											e,
											'clientUrl',
										);
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Fonts used</label>
								{this.state.fontInUseMetadata.fonts.length
									> 0 && (
									<div className="font-list">
										{this.state.fontInUseMetadata.fonts.map(
											font => (
												<span
													className="font-list-elem"
													onClick={() =>
														this.removeFont(font)
													}
												>
													{font.value}
												</span>
											),
										)}
									</div>
								)}
								<input
									type="text"
									id="name"
									name="user_name"
									autoComplete="off"
									className={`${
										this.state.autocompleteSuggestions
											.length > 0
											? 'opened'
											: ''
									}`}
									value={this.state.autocompleteText}
									onChange={(e) => {
										this.updateAutocompleteSuggestions(e);
									}}
								/>
								{this.state.autocompleteSuggestions.length
									> 0 && (
									<div className="suggestions">
										{this.state.autocompleteSuggestions.map(
											suggestion => (
												<div
													className="suggestion"
													onClick={() =>
														this.addSuggestion(
															suggestion,
														)
													}
												>
													{suggestion.value}
												</div>
											),
										)}
									</div>
								)}
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Visuals</label>
								{this.state.fontInUseMetadata.images.length
									> 0 && (
									<div className="images">
										{this.state.fontInUseMetadata.images.map(
											image => (
												<img
													src={image}
													onClick={() => {
														this.removeImage(image);
													}}
												/>
											),
										)}
									</div>
								)}
								<Dropzone
									className="dropzone-content"
									accept="image/jpeg,image/png"
									multiple={true}
									onDrop={this.onDrop}
									rejectClassName="rejected"
								>
									Drop images, or click to select files to
									upload.
								</Dropzone>
							</div>
							{this.state.fontInUseMetadata.isModified && (
								<div
									className="library-details-form-button"
									onClick={() => {
										this.updateFontInUse();
									}}
								>
									Update
								</div>
							)}
						</form>
					</div>
				</div>
				<LibrarySidebarRight />
			</div>
		);
	}
}

const addFontInUseMutation = gql`
	mutation addFontInUse(
		$designer: String!
		$designerUrl: String
		$client: String!
		$clientUrl: String
		$fontUsedIds: [ID]
		$images: [String]
	) {
		updateVariant(
			designer: $designer
			designerUrl: $designerUrl
			client: $client
			clientUrl: $clientUrl
			fontUsedIds: $fontUsedIds
			images: $images
		) {
			id
			designer
			designerUrl
			client
			clientUrl
			fontUsed {
				id
				name
			}
			images
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
)(LibraryFontInUseCreate);
