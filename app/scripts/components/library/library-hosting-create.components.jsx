import React from 'react';
import {Link} from 'react-router';
import {LibrarySidebarRight} from './library-sidebars.components';
import LocalClient from '../../stores/local-client.stores';
import FontUpdater from '../font-updater.components';

export default class LibraryHostingCreate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hostedDomains: [],
			domain: '',
			autocompleteText: '',
			autocompleteSuggestions: [],
			addedFonts: [],
		};
		this.updateAutocompleteSuggestions = this.updateAutocompleteSuggestions.bind(
			this,
		);
		this.addSuggestion = this.addSuggestion.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		const prototypoStore = await this.client.fetch('/prototypoStore');

		this.setState({
			templateInfos: await prototypoStore.head.toJS().templateList,
			templatesData: await prototypoStore.head.toJS().templatesData,
		});
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

			switch (suggestion.type) {
			case 'Template':
				templateData = this.state.templatesData.find(
					e => e.name === suggestion.templateName,
				);
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
				break;
			case 'Family':
				family
						= this.props.families
						&& this.props.families.find(p => p.id === suggestion.id);
				templateData = this.state.templatesData.find(
					e => e.name === family.template,
				);
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
									className="library-hosting-form-elem-input-big"
									value={this.state.domain}
									onChange={(e) => {
										this.setState({domain: e.target.value});
									}}
								/>
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
								<div className="library-hosting-form-button" onClick={() => {}}>
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
