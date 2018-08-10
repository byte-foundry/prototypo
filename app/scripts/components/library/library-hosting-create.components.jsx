import React from 'react';
import {Link} from 'react-router';
import Lifespan from 'lifespan';
import {graphql, gql, compose} from 'react-apollo';
import {LibrarySidebarRight} from './library-sidebars.components';
import {tmpUpload} from '../../services/graphcool.services';
import LocalClient from '../../stores/local-client.stores';
import FontUpdater from '../font-updater.components';

class LibraryHostingCreate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hostedDomains: [],
			domain: '',
			autocompleteText: '',
			autocompleteSuggestions: [],
			addedFonts: [],
			errors: {
				domain: false,
				hostedFonts: false,
			},
		};
		this.updateAutocompleteSuggestions = this.updateAutocompleteSuggestions.bind(
			this,
		);
		this.addSuggestion = this.addSuggestion.bind(this);
		this.hostFonts = this.hostFonts.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.client.getStore('/prototypoStore', this.lifespan).onUpdate((head) => {
			this.setState({
				buffers: head.toJS().d.hostingBuffers,
			});
		});
		this.setState({
			templateInfos: await prototypoStore.head.toJS().templateList,
			templatesData: await prototypoStore.head.toJS().templatesData,
		});
	}
	async componentDidUpdate(prevState) {
		if (
			prevState.buffers !== this.state.buffers
			&& this.state.status === 'generating'
		) {
			this.setState({status: 'uploading'});

			const urls = await Promise.all(
				this.state.buffers.map(async (buffer, index) =>
					tmpUpload(
						new Blob([new Uint8Array(buffer)]),
						`${this.state.addedFonts[index]} ${
							this.state.addedFonts[index].variant.name
						}`,
					),
				),
			);

			const hostedFonts = await Promise.all(
				urls.map(({url}, index) =>
					this.props.hostFont(this.state.addedFonts[index].variant.id, url),
				),
			);

			this.props
				.createHostedDomain(
					this.state.domain,
					hostedFonts.map(({data}) => data.hostFont.id),
				)
				.then(() => this.props.router.push('/library/hosting'));
			this.setState({status: 'hosting'});
		}
	}
	addSuggestion(suggestion, variant) {
		if (
			!this.state.addedFonts.find(
				f => f.id === `${suggestion.id}${variant.id}`,
			)
		) {
			let template;
			let values;
			let templateData;
			let preset;
			let family;
			let glyphs;

			this.setState({
				errors: {
					domain: false,
					hostedFonts: false,
				},
			});

			switch (suggestion.type) {
			case 'Template':
				templateData = this.state.templatesData.find(
					e => e.name === suggestion.templateName,
				);
				glyphs = templateData.glyphs;
				values = templateData.initValues;
				template = templateData.templateName;
				break;
			case 'Preset':
				preset
						= this.props.presets
						&& this.props.presets.find(p => p.id === suggestion.id);
				values = preset.baseValues;
				template = this.state.templateInfos.find(
					t => preset.template === t.templateName,
				).templateName;
				templateData = this.state.templatesData.find(
					e => e.name === preset.template,
				);
				glyphs = templateData.glyphs;
				break;
			case 'Family':
				family
						= this.props.families
						&& this.props.families.find(p => p.id === suggestion.id);
				templateData = this.state.templatesData.find(
					e => e.name === family.template,
				);
				glyphs = templateData.glyphs;
				values = {
					...templateData.initValues,
					...(typeof variant.values === 'object'
						? variant.values
						: JSON.parse(variant.values)),
				};
				template = this.state.templateInfos.find(
					t => t.templateName === family.template,
				).templateName;
				break;
			default:
				break;
			}

			this.setState({
				addedFonts: this.state.addedFonts.concat([
					{
						...suggestion,
						id: `${suggestion.id}${variant.id}`,
						variant,
						template,
						values,
						glyphs,
					},
				]),
			});
		}
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
					id: `template${t.familyName}`,
					templateName: t.templateName,
					variants: [
						{
							id: 'base',
							name: 'regular',
							weight: 500,
							italic: false,
							width: 'normal',
						},
					],
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
					id: p.id,
					variants: [
						{
							id: 'base',
							name: 'regular',
							weight: 500,
							italic: false,
							width: 'normal',
						},
					],
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
					id: f.id,
					name: `${f.name}`,
					variants: f.variants,
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
					name: `${f.name}`,
					variants: f.variants,
				}),
			);
		this.setState({
			autocompleteSuggestions:
				event.target.value.replace(/\s+/g, '') === ''
					? []
					: autocompleteSuggestions,
		});
	}

	hostFonts() {
		const domain = this.state.domain
			.replace('http://', '')
			.replace('https://', '')
			.split(/[/?#]/)[0]
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');

		this.setState({domain});
		const isUrl = /^([a-zA-Z0-9]+(([\-]?[a-zA-Z0-9]+)*\.)+)*[a-zA-Z]{2,}$/;

		if (!isUrl.test(domain)) {
			this.setState({
				errors: {
					domain: true,
					hostedFonts: false,
				},
			});
			return;
		}

		if (this.state.addedFonts.length === 0) {
			this.setState({
				errors: {
					domain: false,
					hostedFonts: true,
				},
			});
			return;
		}
		this.setState({
			errors: {
				domain: false,
				hostedFonts: false,
			},
		});
		const familyNames = [];
		const variantNames = [];
		const valueArray = [];
		const metadataArray = [];
		const templateArray = [];
		const glyphsArray = [];

		this.state.addedFonts.forEach((addedFont) => {
			familyNames.push(addedFont.name);
			variantNames.push(addedFont.variant.name);
			valueArray.push(addedFont.values);
			metadataArray.push({
				weight: addedFont.variant.weight,
				width: addedFont.variant.width,
				italic: !!addedFont.variant.italic,
			});
			templateArray.push(addedFont.template);
			glyphsArray.push(addedFont.glyphs);
		});
		try {
			this.setState({status: 'generating'});

			// generate the font
			this.client.dispatchAction('/host-from-library', {
				familyNames,
				variantNames,
				valueArray,
				metadataArray,
				templateArray,
				glyphsArray,
			});
		}
		catch (err) {
			console.log(err.message);
		}
	}

	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-hosting-plan">
						Free plan: 1000 views / month / website
					</div>
					<div className="library-hosting">
						<div className="library-see-title">Add a new website</div>
						<div className="library-hosting-form">
							<div className="library-hosting-form-elem">
								<label htmlFor="domain">
									Domain where your fonts will be displayed
								</label>
								<input
									type="url"
									id="domain"
									name="hosting_domain"
									placeholder="www.mysite.com"
									className={`library-hosting-form-elem-input-big ${
										this.state.errors.domain ? 'is-error' : ''
									}`}
									value={this.state.domain}
									onChange={(e) => {
										this.setState({
											domain: e.target.value,
											errors: {
												...this.state.errors,
												domain: false,
											},
										});
									}}
								/>
								{this.state.errors.domain && (
									<p className="library-hosting-form-elem-error">
										The domain you entered is incorrect. Please re-check it.
									</p>
								)}
							</div>
							<div className="library-hosting-form-elem">
								<label htmlFor="list">Hosted fonts</label>
								<div className="library-hosting-font-list">
									{this.state.addedFonts.length === 0 ? (
										<div>
											Add a font to your website using our autocomplete search
											input below!
										</div>
									) : (
										this.state.addedFonts.map(font => (
											<div className="hosted-font">
												<span
													style={{
														fontFamily: `preview${font.id}`,
													}}
												>
													{font.name} {font.variant.name} {font.variant.weight}{' '}
													{font.variant.width}{' '}
													{font.variant.italic ? 'italic' : 'normal'}
												</span>
												<FontUpdater
													name={`preview${font.id}`}
													values={font.values}
													template={font.template}
													subset={`${font.name}${font.variant.name}${' '}${
														font.variant.weight
													}${font.variant.width}${
														font.variant.italic ? 'italic' : 'normal'
													}`}
													glyph="0"
												/>
											</div>
										))
									)}
									{this.state.errors.domain && (
										<p className="library-hosting-form-elem-error">
											Please add at least one font to your website.
										</p>
									)}
								</div>
							</div>
							<div className="library-hosting-form-elem">
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
											<div className="suggestion">
												<div className="suggestion-family" onClick={() => {}}>
													{suggestion.name}
												</div>
												{suggestion.variants.map(variant => (
													<div
														className="suggestion-variant"
														onClick={() => {
															this.addSuggestion(suggestion, variant);
														}}
													>
														{suggestion.name} {variant.name} {variant.weight}{' '}
														{variant.width}{' '}
														{variant.italic ? 'italic' : 'normal'}
													</div>
												))}
											</div>
										))}
									</div>
								)}
							</div>
							<div className="library-hosting-form-elem">
								<div
									className="library-hosting-form-button"
									onClick={() => {
										this.hostFonts();
									}}
								>
									Add website
								</div>
							</div>
						</div>
					</div>
				</div>
				<LibrarySidebarRight>
					<Link to="/library/hosting" className="sidebar-action">
						Back to the list
					</Link>
				</LibrarySidebarRight>
			</div>
		);
	}
}

const hostVariantMutation = gql`
	mutation hostVariant($id: ID!, $tmpFileUrl: String!) {
		hostFont(variantId: $id, tmpFileUrl: $tmpFileUrl) {
			id
			url
			version
			createdAt
		}
	}
`;

const createHostedDomainMutation = gql`
	mutation createHostedDomain(
		$domain: String!
		$creatorId: ID!
		$hostedVariantsIds: [ID!]!
	) {
		createHostedDomain(
			domain: $domain
			creatorId: $creatorId
			hostedVariantsIds: $hostedVariantsIds
		) {
			id
			domain
			hostedVariants {
				id
				url
				createdAt
				origin {
					id
				}
				version
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
				name
				updatedAt
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
			hostedDomains {
				id
				domain
				hostedVariants {
					id
					createdAt
					origin {
						id
					}
					url
					version
				}
			}
		}
	}
`;

export default compose(
	graphql(hostVariantMutation, {
		props: ({mutate}) => ({
			hostFont: (id, tmpFileUrl) =>
				mutate({
					variables: {
						id,
						tmpFileUrl,
					},
				}),
		}),
	}),
	graphql(createHostedDomainMutation, {
		props: ({mutate, ownProps}) => ({
			createHostedDomain: (domain, hostedVariantsIds) =>
				mutate({
					variables: {
						domain,
						hostedVariantsIds,
						creatorId: ownProps.user.id,
					},
				}),
		}),
		options: {
			update: (store, {data: {createHostedDomain}}) => {
				const data = store.readQuery({query: libraryUserQuery});

				data.user.hostedDomains.push(createHostedDomain);
				store.writeQuery({
					query: libraryUserQuery,
					data,
				});
			},
		},
	}),
)(LibraryHostingCreate);
