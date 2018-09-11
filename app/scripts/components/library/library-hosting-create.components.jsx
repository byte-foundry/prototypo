import React from 'react';
import {Link} from 'react-router';
import Lifespan from 'lifespan';
import cloneDeep from 'lodash/cloneDeep';
import {graphql, gql, compose} from 'react-apollo';
import {LibrarySidebarRight} from './library-sidebars.components';
import {tmpUpload} from '../../services/graphcool.services';
import LocalClient from '../../stores/local-client.stores';
import FontUpdater from '../font-updater.components';
import LibraryButton from './library-button.components';
import {
	libraryQuery,
	presetQuery,
	libraryUserQuery,
} from './library-main.components';

class LibraryHostingCreate extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			domain: '',
			autocompleteText: '',
			autocompleteSuggestions: [],
			addedFonts: [],
			fontsToRemove: [],
			errors: {
				domain: false,
				hostedFonts: false,
				hosting: false,
				integrity: false,
			},
			loading: false,
		};
		this.updateAutocompleteSuggestions = this.updateAutocompleteSuggestions.bind(
			this,
		);
		this.addSuggestion = this.addSuggestion.bind(this);
		this.hostFonts = this.hostFonts.bind(this);
		this.removeAddedFont = this.removeAddedFont.bind(this);
		this.checkIntegrity = this.checkIntegrity.bind(this);
		this.removeDuplicates = this.removeDuplicates.bind(this);
		this.updateVersion = this.updateVersion.bind(this);
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

		const templateInfos = await prototypoStore.head.toJS().templateList;
		const templatesData = await prototypoStore.head.toJS().templatesData;
		let hostedDomainMetadata;

		if (this.props.params && this.props.params.hostedDomainId) {
			const hostedDomain = this.props.hostedDomains.find(
				e => e.id === this.props.params.hostedDomainId,
			);

			let template;
			let values;
			let templateData;
			let preset;
			let family;
			let glyphs;
			let abstractedFontMeta;
			let variantData;
			let templateInfo;

			hostedDomainMetadata = {
				domain: hostedDomain.domain,
				autocompleteText: '',
				fontsToRemove: [],
				autocompleteSuggestions: [],
				errors: {
					domain: false,
					hostedFonts: false,
					hosting: false,
					integrity: false,
				},
				loading: false,
				addedFonts: hostedDomain.hostedVariants.map((variant) => {
					if (!variant.abstractedFont) return false;
					switch (variant.abstractedFont.type) {
					case 'PRESET':
						preset = this.props.presets.find(
							p => p.id === variant.abstractedFont.preset.id,
						);
						values = preset.baseValues;
						template = templateInfos.find(
							t => preset.template === t.templateName,
						).templateName;
						templateData = templatesData.find(
							e => e.name === preset.template,
						);
						glyphs = templateData.glyphs;
						abstractedFontMeta = {
							type: 'PRESET',
							familyId: undefined,
							template: undefined,
							presetId: preset.id,
							name: preset.name,
						};
						return {
							type: 'PRESET',
							name: `${preset.variant.family.name}`,
							id: `${preset.id}${preset.id}`,
							presetId: preset.id,
							familyId: undefined,
							isOld: true,
							hostedId: variant.id,
							template,
							values,
							glyphs,
							abstractedFontMeta,
							variant: {
								id: preset.id,
								name: 'regular',
								weight: 500,
								italic: false,
								width: 'normal',
								abstractedFont: {
									id: variant.abstractedFont.id,
								},
							},
						};
					case 'TEMPLATE':
						templateInfo = templateInfos.find(
							e => e.name === variant.abstractedFont.template,
						);
						templateData = templatesData.find(
							e => e.name === templateInfo.templateName,
						);
						glyphs = templateData.glyphs;
						values = templateData.initValues;
						template = templateData.name;
						abstractedFontMeta = {
							type: 'TEMPLATE',
							familyId: undefined,
							template: templateData.name,
							presetId: undefined,
							name: variant.abstractedFont.template,
						};
						return {
							type: 'TEMPLATE',
							name: variant.abstractedFont.template,
							id: `template${templateData.familyName}base`,
							templateName: templateData.templateName,
							presetId: undefined,
							familyId: undefined,
							isOld: true,
							hostedId: variant.id,
							template,
							values,
							glyphs,
							abstractedFontMeta,
							variant: {
								id: 'base',
								name: 'regular',
								weight: 500,
								italic: false,
								width: 'normal',
								abstractedFont: {
									id: variant.abstractedFont.id,
								},
							},
						};
					case 'VARIANT':
						if (!variant.abstractedFont.variant) {
							return false;
						}
						family
								= this.props.families
								&& this.props.families.find(
									p => p.id === variant.abstractedFont.variant.family.id,
								);
						templateData = templatesData.find(
							e => e.name === family.template,
						);
						glyphs = templateData.glyphs;
						variantData = family.variants.find(
							v => variant.abstractedFont.variant.id,
						);
						values = {
							...templateData.initValues,
							...(typeof variantData.values === 'object'
								? variantData.values
								: JSON.parse(variantData.values)),
						};
						template = templateInfos.find(
							t => t.templateName === family.template,
						).templateName;
						abstractedFontMeta = {
							type: 'VARIANT',
							familyId: variant.abstractedFont.variant.family.id,
							template: undefined,
							presetId: undefined,
							name: family.name,
						};
						return {
							type: 'VARIANT',
							id: `${family.id}${variantData.id}`,
							name: `${family.name}`,
							isOld: true,
							hostedId: variant.id,
							template,
							values,
							glyphs,
							abstractedFontMeta,
							variant: variantData,
						};
					default:
						return false;
					}
				}),
			};
		}

		this.setState({
			templateInfos,
			templatesData,
			...hostedDomainMetadata,
		});
	}
	async componentDidUpdate(prevState) {
		if (
			prevState.buffers !== this.state.buffers
			&& this.state.status === 'generating'
		) {
			const addedFonts = cloneDeep(this.state.addedFonts);

			console.log('Buffers recieved:');
			this.setState({status: 'uploading'});
			const buffers = [...this.state.buffers];
			const exportedFonts = [];

			buffers.forEach(b =>
				exportedFonts.push({
					buffer: b.buffer,
					...addedFonts.find(f => f.id === b.id),
				}),
			);

			const urls = await Promise.all(
				exportedFonts
					.filter(f => !f.isOld)
					.map(async (buffer, index) =>
						tmpUpload(
							new Blob([new Uint8Array(buffer.buffer)]),
							`${exportedFonts[index].id}`,
						),
					),
			);
			// TODO: Delete the hosted files if a font is removed / to updated

			const exportedWithoutAbstracted = exportedFonts.filter(
				f => !!(!f.variant.abstractedFont || !f.variant.abstractedFont.id),
			);

			console.log('exported without abstracted:');
			console.log(exportedWithoutAbstracted);
			console.log(urls);
			const abstractedFontIds = await Promise.all(
				exportedWithoutAbstracted.map(async addedFont =>
					this.props.createAbstractedFont(
						addedFont.abstractedFontMeta.type,
						addedFont.abstractedFontMeta.type === 'VARIANT'
							? addedFont.variant.id
							: undefined,
						addedFont.abstractedFontMeta.template,
						addedFont.abstractedFontMeta.presetId,
						addedFont.abstractedFontMeta.name,
					),
				),
			);

			exportedWithoutAbstracted.forEach((e, index) => {
				e.variant.abstractedFont
					? (e.variant.abstractedFont.id
							= abstractedFontIds[index].data.createAbstractedFont.id)
					: (e.variant.abstractedFont = {
						id: abstractedFontIds[index].data.createAbstractedFont.id,
					});
			});

			const hostedFonts = await Promise.all(
				urls.map(({url}, index) =>
					this.props.hostFont(
						exportedFonts[index].variant.abstractedFont.id,
						url,
					),
				),
			);

			if (this.state.updating) {
				const allHostedFonts = [
					...hostedFonts.map(({data}) => data.hostFont.id),
					...addedFonts.filter(f => f.isOld).map(f => f.hostedId),
				];

				console.log('all hosted fonts');
				console.log(allHostedFonts);
				console.log('---');
				console.log(hostedFonts);
				console.log(addedFonts);
				this.props
					.updateHostedDomain(this.state.domain, allHostedFonts)
					.then(() => {
						this.props.router.push('/library/hosting');
						clearTimeout(this.state.hostingTimeout);
						this.setState({
							errors: {
								domain: false,
								hostedFonts: false,
								hosting: false,
							},
							hostingTimeout: undefined,
							loading: false,
						});
					});
			}
			else {
				this.props
					.createHostedDomain(
						this.state.domain,
						hostedFonts.map(({data}) => data.hostFont.id),
					)
					.then(() => {
						this.props.router.push('/library/hosting');
						clearTimeout(this.state.hostingTimeout);
						this.setState({
							errors: {
								domain: false,
								hostedFonts: false,
								hosting: false,
							},
							hostingTimeout: undefined,
							loading: false,
						});
					});
			}
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
			let abstractedFontMeta;

			this.setState({
				errors: {
					domain: false,
					hostedFonts: false,
				},
			});

			switch (suggestion.type) {
			case 'TEMPLATE':
				templateData = this.state.templatesData.find(
					e => e.name === suggestion.templateName,
				);
				glyphs = templateData.glyphs;
				values = templateData.initValues;
				template = templateData.name;
				abstractedFontMeta = {
					type: 'TEMPLATE',
					familyId: undefined,
					template: templateData.name,
					presetId: undefined,
					name: suggestion.name,
				};
				break;
			case 'PRESET':
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
				abstractedFontMeta = {
					type: 'PRESET',
					familyId: undefined,
					template: undefined,
					presetId: suggestion.id,
					name: suggestion.name,
				};
				break;
			case 'VARIANT':
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
				abstractedFontMeta = {
					type: 'VARIANT',
					familyId: suggestion.id,
					template: undefined,
					presetId: undefined,
					name: suggestion.name,
				};
				break;
			default:
				break;
			}

			this.checkIntegrity({
				...suggestion,
				id: `${suggestion.id}${variant.id}`,
				variant,
				template,
				values,
				glyphs,
				abstractedFontMeta,
			});
		}
	}
	checkIntegrity(font, af) {
		const addedFonts = af || this.state.addedFonts;
		const fontToAdd = font;

		fontToAdd.integrity = undefined;
		fontToAdd.integrityType = undefined;

		if (fontToAdd.type === 'VARIANT') {
			if (
				addedFonts.find(
					f =>
						f.type === 'VARIANT'
						&& f.name === fontToAdd.name
						&& f.abstractedFontMeta.familyId
							!== fontToAdd.abstractedFontMeta.familyId,
				)
			) {
				fontToAdd.integrity
					= 'A project with a similar name already exists in this website';
				fontToAdd.integrityType = 'familyName';
			}
			if (
				addedFonts.find(
					f =>
						f.type === 'VARIANT'
						&& f.abstractedFontMeta.familyId
							=== fontToAdd.abstractedFontMeta.familyId
						&& f.variant.width === fontToAdd.variant.width
						&& f.variant.weight === fontToAdd.variant.weight
						&& f.variant.italic === fontToAdd.variant.italic,
				)
			) {
				fontToAdd.integrity
					= 'A variant with the same metadatas is already added';
				fontToAdd.integrityType = 'metadata';
			}
		}
		this.setState({
			addedFonts: addedFonts.concat([
				{
					...fontToAdd,
				},
			]),
		});
	}
	updateVersion(font) {
		const {addedFonts} = this.state;
		const addedFont = addedFonts.find(f => f.id === font.id);

		addedFont.isOld = false;
		addedFont.isUpdated = true;
		this.setState({addedFonts});
	}
	removeAddedFont(addedFont) {
		const {addedFonts, fontsToRemove} = this.state;

		if (addedFont.isOld) {
			fontsToRemove.concat([
				{
					...addedFont,
				},
			]);
		}
		addedFonts.splice(addedFonts.findIndex(f => f.id === addedFont.id), 1);
		this.setState({addedFonts, fontsToRemove});
	}
	removeDuplicates(addedFont) {
		let {addedFonts} = this.state;

		switch (addedFont.integrityType) {
		case 'familyName':
			addedFonts = addedFonts.filter(
				f =>
					!(
						f.type === 'VARIANT'
							&& f.name === addedFont.name
							&& f.abstractedFontMeta.familyId
								!== addedFont.abstractedFontMeta.familyId
					),
			);
			break;
		case 'metadata':
			addedFonts = addedFonts.filter(
				f =>
					!(
						f.type === 'VARIANT'
							&& f.abstractedFontMeta.familyId
								=== addedFont.abstractedFontMeta.familyId
							&& f.variant.width === addedFont.variant.width
							&& f.variant.weight === addedFont.variant.weight
							&& f.variant.italic === addedFont.variant.italic
					),
			);
			break;
		default:
			break;
		}
		this.checkIntegrity(addedFont, addedFonts);
	}
	updateAutocompleteSuggestions(event) {
		this.setState({autocompleteText: event.target.value});
		const autocompleteSuggestions = [];
		const abstractedTemplates = this.props.abstractedTemplates;

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
					type: 'TEMPLATE',
					name: t.familyName,
					id: `template${t.familyName}`,
					templateName: t.templateName,
					presetId: undefined,
					familyId: undefined,
					template: t.templateName,
					variants: [
						{
							id: 'base',
							name: 'regular',
							weight: 500,
							italic: false,
							width: 'normal',
							abstractedFont: {
								id: abstractedTemplates.find(at => at.template === t.name).id,
							},
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
					type: 'PRESET',
					name: `${p.variant.family.name}`,
					id: p.id,
					presetId: p.id,
					familyId: undefined,
					template: undefined,
					variants: [
						{
							id: p.id,
							name: 'regular',
							weight: 500,
							italic: false,
							width: 'normal',
							abstractedFont: {
								id: p.abstractedFont && p.abstractedFont.id,
							},
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
					type: 'VARIANT',
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
					type: 'VARIANT',
					name: `${f.name}`,
					variants: f.variants,
					presetId: undefined,
					familyId: f.id,
					template: undefined,
				}),
			);
		this.setState({
			autocompleteSuggestions:
				event.target.value.replace(/\s+/g, '') === ''
					? []
					: autocompleteSuggestions,
		});
	}

	hostFonts(update = false) {
		if (this.state.hostingTimeout) {
			return;
		}
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
					integrity: false,
				},
			});
			return;
		}

		const integrity = this.state.addedFonts.find(f => f.integrity);

		if (integrity) {
			this.setState({
				errors: {
					domain: false,
					hostedFonts: false,
					integrity: true,
				},
			});
			return;
		}

		const timerId = setTimeout(() => {
			clearTimeout(this.state.hostingTimeout);
			this.setState({
				errors: {
					domain: false,
					hostedFonts: false,
					hosting: true,
					integrity: false,
				},
				loading: false,
				hostingTimeout: undefined,
			});
		}, 20000);

		this.setState({
			errors: {
				domain: false,
				hostedFonts: false,
				integrity: false,
			},
			loading: true,
			autocompleteText: '',
			autocompleteSuggestions: [],
			hostingTimeout: timerId,
		});

		const familyNames = [];
		const variantNames = [];
		const valueArray = [];
		const metadataArray = [];
		const templateArray = [];
		const glyphsArray = [];

		console.log('fonts to host:');
		console.log(this.state.addedFonts.filter(f => !f.isOld));
		this.state.addedFonts.filter(f => !f.isOld).forEach((addedFont) => {
			familyNames.push(addedFont.name);
			variantNames.push(addedFont.variant.name);
			valueArray.push(addedFont.values);
			metadataArray.push({
				weight: addedFont.variant.weight,
				width: addedFont.variant.width,
				italic: !!addedFont.variant.italic,
				id: addedFont.id,
			});
			templateArray.push(addedFont.template);
			glyphsArray.push(addedFont.glyphs);
		});
		try {
			this.setState({status: 'generating', updating: update});

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
			clearTimeout(this.state.hostingTimeout);
			this.setState({
				errors: {
					domain: false,
					hostedFonts: false,
					hosting: true,
				},
				hostingTimeout: undefined,
			});
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
										this.state.addedFonts.map(
											font =>
												font.name && (
													<div className="hosted-font">
														<span
															style={{
																fontFamily: `preview${font.id}`,
															}}
														>
															{font.name} {font.variant.name}{' '}
															{font.variant.weight} {font.variant.width}{' '}
															{font.variant.italic ? 'italic' : 'normal'}
														</span>
														{font.isUpdated && <span> (Updated)</span>}
														<div
															className="button-edit"
															onClick={() => {
																this.removeAddedFont(font);
															}}
														>
															Remove
														</div>
														{font.isOld
															&& !font.integrity
															&& font.type === 'VARIANT' && (
															<div
																className="button-edit"
																onClick={() => {
																	this.updateVersion(font);
																}}
															>
																	Update version
															</div>
														)}
														{font.integrity && (
															<div
																className="button-edit"
																onClick={() => {
																	this.removeDuplicates(font);
																}}
															>
																Use this version
															</div>
														)}
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
														{font.integrity && (
															<p className="integrity-error">
																{font.integrity}
															</p>
														)}
													</div>
												),
										)
									)}
									{this.state.errors.hostedFonts && (
										<p className="library-hosting-form-elem-error">
											Please add at least one font to your website.
										</p>
									)}
									{this.state.errors.integrity && (
										<p className="library-hosting-form-elem-error">
											There is some integrity issues in your domain. Please fix
											them before continuing.
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
								{this.state.errors.hosting && (
									<p className="library-hosting-form-elem-error">
										Something happenened while trying to host your fonts. Please
										retry or contact us using the in-app chat.
									</p>
								)}
								<LibraryButton
									name={
										this.props.params && this.props.params.hostedDomainId
											? 'Update domain'
											: 'Add domain'
									}
									floated
									disabled={
										this.state.addedFonts.length === 0
										|| this.state.domain === ''
									}
									error={this.state.errors.hosting}
									loading={this.state.loading}
									onClick={() => {
										if (
											this.state.addedFonts.length > 0
											&& this.state.domain !== ''
										) {
											this.hostFonts(
												!!(
													this.props.params && this.props.params.hostedDomainId
												),
											);
										}
									}}
								/>
							</div>
						</div>
					</div>
				</div>
				<LibrarySidebarRight>
					<LibraryButton
						name="Back to the list"
						bold
						full
						onClick={() => {
							this.props.router.push('/library/hosting');
						}}
					/>
				</LibrarySidebarRight>
			</div>
		);
	}
}

const hostVariantMutation = gql`
	mutation hostVariant($id: ID!, $tmpFileUrl: String!) {
		hostFont(id: $id, tmpFileUrl: $tmpFileUrl) {
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
			updatedAt
			hostedVariants {
				id
				createdAt
				abstractedFont {
					id
					name
					type
					template
					preset {
						id
					}
					variant {
						id
						family {
							id
						}
					}
				}
				url
				version
			}
		}
	}
`;

const updateHostedDomainMutation = gql`
	mutation updateHostedDomain(
		$hostedDomainId: ID!
		$domain: String!
		$creatorId: ID!
		$hostedVariantsIds: [ID!]!
	) {
		updateHostedDomain(
			id: $hostedDomainId
			domain: $domain
			creatorId: $creatorId
			hostedVariantsIds: $hostedVariantsIds
		) {
			id
			domain
			updatedAt
			hostedVariants {
				id
				createdAt
				abstractedFont {
					id
					type
					name
					template
					preset {
						id
					}
					variant {
						id
						family {
							id
						}
					}
				}
				url
				version
			}
		}
	}
`;

const createAbstractedFontMutation = gql`
	mutation createAbstractedFont(
		$type: FontType!
		$variantId: ID
		$template: String
		$presetId: ID
		$name: String!
	) {
		createAbstractedFont(
			type: $type
			variantId: $variantId
			template: $template
			presetId: $presetId
			name: $name
		) {
			id
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
	graphql(updateHostedDomainMutation, {
		props: ({mutate, ownProps}) => ({
			updateHostedDomain: (domain, hostedVariantsIds) =>
				mutate({
					variables: {
						hostedDomainId: ownProps.params.hostedDomainId,
						domain,
						hostedVariantsIds,
						creatorId: ownProps.user.id,
					},
				}),
		}),
		options: {
			update: (store, {data: {updateHostedDomain}}) => {
				const data = store.readQuery({query: libraryUserQuery});
				const hostedDomainIndex = data.user.hostedDomains.findIndex(
					f => f.id === updateHostedDomain.id,
				);

				data.user.hostedDomains[hostedDomainIndex] = updateHostedDomain;
				store.writeQuery({
					query: libraryUserQuery,
					data,
				});
			},
		},
	}),
	graphql(createAbstractedFontMutation, {
		props: ({mutate}) => ({
			createAbstractedFont: (type, variantId, template, presetId, name) =>
				mutate({
					variables: {
						type,
						variantId,
						template,
						presetId,
						name,
					},
				}),
		}),
		options: {
			update: (store, {data: {createAbstractedFont}}) => {
				const dataLibrary = store.readQuery({query: libraryQuery});
				const dataPreset = store.readQuery({query: presetQuery});
				let variant;
				let preset;

				switch (createAbstractedFont.type) {
				case 'PRESET':
					preset = dataPreset.allPresets.find(
						p => p.id === createAbstractedFont.preset.id,
					);
					preset.abstractedFont = {id: createAbstractedFont.id};
					break;
				case 'VARIANT':
					variant = dataLibrary.user.library
						.find(f => f.id === createAbstractedFont.variant.family.id)
						.variants.find(v => v.id === createAbstractedFont.variant.id);

					variant.abstractedFont = {id: createAbstractedFont.id};
					break;
				default:
					break;
				}
				store.writeQuery({
					query: libraryQuery,
					data: dataLibrary,
				});
				store.writeQuery({
					query: presetQuery,
					data: dataPreset,
				});
			},
		},
	}),
)(LibraryHostingCreate);
