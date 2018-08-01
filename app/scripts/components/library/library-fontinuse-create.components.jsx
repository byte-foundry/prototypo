import React from 'react';
import Dropzone from 'react-dropzone';
import {graphql, gql, compose} from 'react-apollo';
import {LibrarySidebarRight} from './library-sidebars.components';
import LocalClient from '../../stores/local-client.stores';

class LibraryFontInUseCreate extends React.Component {
	constructor(props) {
		super(props);

		let fontInUseMetadata;

		if (this.props.params && this.props.params.fontinuseID) {
			const fontInUse = this.props.fontInUses.find(
				e => e.id === this.props.params.fontinuseID,
			);

			fontInUseMetadata = {
				id: fontInUse.id,
				designer: fontInUse.designer,
				designerUrl: fontInUse.designer,
				client: fontInUse.client,
				clientUrl: fontInUse.clientUrl,
				isModified: false,
				images: fontInUse.images,
				fonts: fontInUse.fontUsed.map(fontUsed => ({
					id: fontUsed.id,
					type: fontUsed.type,
					name: fontUsed.name,
					familyId: fontUsed.family && fontUsed.family.id,
					template: fontUsed.template,
					presetId: fontUsed.preset && fontUsed.preset.id,
				})),
			};
		}

		this.state = {
			fontInUseMetadata: fontInUseMetadata || {
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
			isEdit: !!fontInUseMetadata,
		};
		this.updateFontInUseData = this.updateFontInUseData.bind(this);
		this.addSuggestion = this.addSuggestion.bind(this);
		this.removeFont = this.removeFont.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.removeImage = this.removeImage.bind(this);
		this.updateAutocompleteSuggestions = this.updateAutocompleteSuggestions.bind(
			this,
		);
		this.createFontInUse = this.createFontInUse.bind(this);
		this.updateFontInUse = this.updateFontInUse.bind(this);
		this.deleteFontInUse = this.deleteFontInUse.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: prototypoStore.head.toJS().templateList,
		});
	}
	addSuggestion(suggestion) {
		const fonts = [...this.state.fontInUseMetadata.fonts];
		const alreadyAdded = fonts.find(
			e =>
				(e.type === 'Family'
					? e.familyId === suggestion.familyId
					: e.name === suggestion.name),
		);

		if (!alreadyAdded) {
			fonts.push({...suggestion, isNew: true});
		}
		this.setState({
			fontInUseMetadata: {
				...this.state.fontInUseMetadata,
				isModified: true,
				fonts,
			},
			autocompleteText: '',
			autocompleteSuggestions: [],
		});
	}
	removeFont(font) {
		const fonts = this.state.fontInUseMetadata.fonts;
		const fontIndex = fonts.findIndex(
			e => (e.type === 'Family' ? e.id === font.id : e.name === font.name),
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
					name: t.familyName,
					familyId: undefined,
					template: t.familyName,
					presetId: undefined,
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
					name: `${p.variant.family.name}`,
					familyId: undefined,
					template: undefined,
					presetId: p.id,
				}),
			);

		const familyFound
			= this.props.families
			&& this.props.families.filter(family =>
				family.name.toLowerCase().includes(event.target.value.toLowerCase()),
			);

		familyFound
			&& familyFound.forEach(f =>
				autocompleteSuggestions.push({
					type: 'Family',
					familyId: f.id,
					template: undefined,
					presetId: undefined,
					isPersonnal: true,
					name: `${f.name}`,
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
					familyId: f.id,
					template: undefined,
					presetId: undefined,
					name: `${f.name}`,
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
		const images = [...this.state.fontInUseMetadata.images];

		acceptedFiles.forEach((file) => {
			images.push(file.preview);
			const formData = new FormData();

			formData.append('data', file);
			fetch('https://api.graph.cool/file/v1/prototypo-new-dev', {
				method: 'POST',
				body: formData,
			}).then((response) => {
				if (response.status === 200) {
					return response.json().then((data) => {
						if (data.url) {
							const placeHolderIndex = images.findIndex(
								i => i === file.preview,
							);
							const newImages = this.state.fontInUseMetadata.images;

							newImages[placeHolderIndex] = data.url;
							this.setState({
								fontInUseMetadata: {
									...this.state.fontInUseMetadata,
									isModified: true,
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
				isModified: true,
				images,
			},
		});
	}
	removeImage(image) {
		const images = [...this.state.fontInUseMetadata.images];
		const imageIndex = images.find(i => i === image);

		images.splice(imageIndex, 1);
		this.setState({
			fontInUseMetadata: {
				...this.state.fontInUseMetadata,
				isModified: true,
				images,
			},
		});
	}
	createFontInUse() {
		this.props
			.addFontInUse(
				this.state.fontInUseMetadata.designer,
				this.state.fontInUseMetadata.designerUrl,
				this.state.fontInUseMetadata.client,
				this.state.fontInUseMetadata.clientUrl,
				this.state.fontInUseMetadata.fonts,
				this.state.fontInUseMetadata.images,
			)
			.then(() => this.props.router.push('/library/fontinuse'));
	}
	updateFontInUse() {
		this.props
			.editFontInUse(
				this.state.fontInUseMetadata.id,
				this.state.fontInUseMetadata.designer,
				this.state.fontInUseMetadata.designerUrl,
				this.state.fontInUseMetadata.client,
				this.state.fontInUseMetadata.clientUrl,
				this.state.fontInUseMetadata.fonts,
				this.state.fontInUseMetadata.images,
			)
			.then(() => this.props.router.push('/library/fontinuse'));
	}
	deleteFontInUse() {
		this.props
			.deleteFontInUse(
				this.state.fontInUseMetadata.id,
				this.state.fontInUseMetadata.fonts,
			)
			.then(() => this.props.router.push('/library/fontinuse'));
	}
	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-see-title">
						{this.state.isEdit ? 'Edit' : 'Add'} a font in use
					</div>
					<div className="library-details-form">
						<form action="" method="">
							<div className="library-details-form-elem">
								<label htmlFor="mail">Designer</label>
								<input
									type="text"
									id="name"
									name="user_name"
									placeholder="Designer name"
									value={this.state.fontInUseMetadata.designer}
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
									placeholder="Designer website"
									value={this.state.fontInUseMetadata.designerUrl}
									onChange={(e) => {
										this.updateFontInUseData(e, 'designerUrl');
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Client</label>
								<input
									type="text"
									id="name"
									name="user_name"
									placeholder="Client name"
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
									placeholder="Client url"
									value={this.state.fontInUseMetadata.clientUrl}
									onChange={(e) => {
										this.updateFontInUseData(e, 'clientUrl');
									}}
								/>
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Fonts used</label>
								{this.state.fontInUseMetadata.fonts.length > 0 && (
									<div className="font-list">
										{this.state.fontInUseMetadata.fonts.map(font => (
											<span
												className="font-list-elem"
												onClick={() => this.removeFont(font)}
											>
												{font.name}
											</span>
										))}
									</div>
								)}
								<input
									type="text"
									id="name"
									name="user_name"
									autoComplete="off"
									placeholder="Type your font name..."
									className={`${
										this.state.autocompleteSuggestions.length > 0
											? 'opened'
											: ''
									}`}
									value={this.state.autocompleteText}
									onChange={(e) => {
										this.updateAutocompleteSuggestions(e);
									}}
								/>
								{this.state.autocompleteSuggestions.length > 0 && (
									<div className="suggestions">
										{this.state.autocompleteSuggestions.map(suggestion => (
											<div
												className="suggestion"
												onClick={() => this.addSuggestion(suggestion)}
											>
												{suggestion.name}
											</div>
										))}
									</div>
								)}
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Visuals</label>
								{this.state.fontInUseMetadata.images.length > 0 && (
									<div className="images">
										{this.state.fontInUseMetadata.images.map(image => (
											<img
												src={image}
												onClick={() => {
													this.removeImage(image);
												}}
											/>
										))}
									</div>
								)}
								<Dropzone
									className="dropzone-content"
									accept="image/jpeg,image/png"
									multiple={true}
									onDrop={this.onDrop}
									rejectClassName="rejected"
								>
									Drop images, or click to select files to upload.
								</Dropzone>
							</div>
							{this.state.isEdit && (
								<div
									className="library-details-form-button"
									onClick={() => {
										this.deleteFontInUse();
									}}
								>
									Delete font in use
								</div>
							)}
							{this.state.fontInUseMetadata.isModified && (
								<div
									className="library-details-form-button"
									onClick={() => {
										this.state.isEdit
											? this.updateFontInUse()
											: this.createFontInUse();
									}}
								>
									{this.state.isEdit ? 'Save' : 'Create'} font in use
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
				name
				type
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

const deleteAbstractedFontMutation = gql`
	mutation deleteAbstractedFont($id: ID!) {
		deleteAbstractedFont(id: $id) {
			id
		}
	}
`;

const createAbstractedFontMutation = gql`
	mutation createAbstractedFont(
		$type: FontType!
		$familyId: ID
		$template: String
		$presetId: ID
		$name: String!
	) {
		createAbstractedFont(
			type: $type
			familyId: $familyId
			template: $template
			presetId: $presetId
			name: $name
		) {
			id
		}
	}
`;

const addFontInUseMutation = gql`
	mutation createFontInUse(
		$designer: String!
		$designerUrl: String
		$client: String!
		$clientUrl: String
		$fontUsedIds: [ID!]
		$images: [String!]
		$creatorId: ID
	) {
		createFontInUse(
			designer: $designer
			designerUrl: $designerUrl
			client: $client
			clientUrl: $clientUrl
			fontUsedIds: $fontUsedIds
			images: $images
			creatorId: $creatorId
		) {
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
	}
`;

const editFontInUseMutation = gql`
	mutation updateFontInUse(
		$id: ID!
		$designer: String!
		$designerUrl: String
		$client: String!
		$clientUrl: String
		$fontUsedIds: [ID!]
		$images: [String!]
		$creatorId: ID
	) {
		updateFontInUse(
			id: $id
			designer: $designer
			designerUrl: $designerUrl
			client: $client
			clientUrl: $clientUrl
			fontUsedIds: $fontUsedIds
			images: $images
			creatorId: $creatorId
		) {
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
	}
`;

const deleteFontInUseMutation = gql`
	mutation deleteFontInUse($id: ID!) {
		deleteFontInUse(id: $id) {
			id
		}
	}
`;

export default compose(
	graphql(createAbstractedFontMutation, {
		props: ({mutate}) => ({
			createAbstractedFont: (type, familyId, template, presetId, name) =>
				mutate({
					variables: {
						type,
						familyId,
						template,
						presetId,
						name,
					},
				}),
		}),
	}),
	graphql(deleteAbstractedFontMutation, {
		props: ({mutate}) => ({
			deleteAbstractedFont: id =>
				mutate({
					variables: {
						id,
					},
				}),
		}),
	}),
	graphql(addFontInUseMutation, {
		props: ({mutate, ownProps}) => ({
			addFontInUse: (
				designer,
				designerUrl,
				client,
				clientUrl,
				fontUsed,
				images,
			) => {
				const abstractedFonts = fontUsed.map(font =>
					ownProps.createAbstractedFont(
						font.type,
						font.familyId,
						font.template,
						font.presetId,
						font.name,
					),
				);

				return Promise.all(abstractedFonts).then(createdFonts =>
					mutate({
						variables: {
							designer,
							designerUrl,
							client,
							clientUrl,
							fontUsedIds: createdFonts.map(
								font => font.data.createAbstractedFont.id,
							),
							images,
							creatorId: ownProps.user.id,
						},
					}),
				);
			},
		}),
		options: {
			update: (store, {data: {createFontInUse}}) => {
				const data = store.readQuery({query: libraryUserQuery});

				data.user.fontInUses.push(createFontInUse);
				store.writeQuery({
					query: libraryUserQuery,
					data,
				});
			},
		},
	}),
	graphql(editFontInUseMutation, {
		props: ({mutate, ownProps}) => ({
			editFontInUse: (
				id,
				designer,
				designerUrl,
				client,
				clientUrl,
				fontUsed,
				images,
			) => {
				const abstractedFontsCreated = fontUsed
					.filter(font => !font.isNew)
					.map(font => font.id);
				const abstractedFontsToCreate = fontUsed
					.filter(font => font.isNew)
					.map(font =>
						ownProps.createAbstractedFont(
							font.type,
							font.familyId,
							font.template,
							font.presetId,
							font.name,
						),
					);

				return Promise.all(abstractedFontsToCreate).then(createdFonts =>
					mutate({
						variables: {
							id,
							designer,
							designerUrl,
							client,
							clientUrl,
							fontUsedIds: [
								...abstractedFontsCreated,
								...createdFonts.map(
									font => font.data.createAbstractedFont.id,
								),
							],
							images,
							creatorId: ownProps.user.id,
						},
					}),
				);
			},
		}),
		options: {
			update: (store, {data: {updateFontInUse}}) => {
				const data = store.readQuery({query: libraryUserQuery});

				const fontInUseIndex = data.user.fontUsed.findIndex(
					f => f.id === updateFontInUse.id,
				);

				data.user.fontInUses[fontInUseIndex] = updateFontInUse;
				store.writeQuery({
					query: libraryUserQuery,
					data,
				});
			},
		},
	}),
	graphql(deleteFontInUseMutation, {
		props: ({mutate, ownProps}) => ({
			deleteFontInUse: (id, fontUsed) => {
				const deletedAbstractedFont = [];

				fontUsed.forEach(
					font =>
						font.id
						&& deletedAbstractedFont.push(ownProps.deleteAbstractedFont(font.id)),
				);

				return Promise.all(deletedAbstractedFont).then(() =>
					mutate({
						variables: {
							id,
						},
					}),
				);
			},
		}),
		update: (store, {data: {deleteFontInUse}}) => {
			const data = store.readQuery({query: libraryUserQuery});

			data.user.fontInUses.splice(
				data.user.fontInUses.findIndex(f => f.id === deleteFontInUse.id),
				1,
			);
			store.writeQuery({
				query: libraryUserQuery,
				data,
			});
		},
	}),
)(LibraryFontInUseCreate);
