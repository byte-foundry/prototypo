import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import {
	LibrarySidebarRight,
	FamilySidebarActions,
	FamilySidebarGlyphs,
	SidebarTags,
} from './library-sidebars.components';
import {Link} from 'react-router';
import FontUpdater from '../font-updater.components';
import LocalClient from '../../stores/local-client.stores';

const isUrl = new RegExp(
	'^(https?:\\/\\/)?'
		+ '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'
		+ '((\\d{1,3}\\.){3}\\d{1,3}))'
		+ '(\\:\\d+)?'
		+ '(\\/[-a-z\\d%@_.~+&:]*)*'
		+ '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'
		+ '(\\#[-a-z\\d_]*)?$',
	'i',
);

class LibrarySee extends React.Component {
	constructor(props) {
		super(props);
		const family = this.props.families.find(
			e => e.id === this.props.params.projectID,
		);

		let teamProject;

		if (this.props.subUsers && this.props.subUsers.length > 0) {
			teamProject = this.props.subUsers
				.find(u =>
					u.library.find(f => f.id === this.props.params.projectID),
				)
				.library.find(f => f.id === this.props.params.projectID);
		}

		if (!family && !teamProject) {
			props.router.push('/library/home');
		}

		this.state = {
			family: family || teamProject,
			isPersonnal: !!family,
		};
		this.generateVariants = this.generateVariants.bind(this);
		this.goToDashboard = this.goToDashboard.bind(this);
		this.exportFamily = this.exportFamily.bind(this);
	}
	goToDashboard() {
		this.props.router.push('/dashboard');
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
			glyphs: this.state.variants[0].glyphs,
			designer: this.state.family.designer,
			designerUrl: this.state.family.designerUrl,
			foundry: this.state.family.foundry,
			foundryUrl: this.state.family.foundryUrl,
		});
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		const prototypoStore = await this.client.fetch('/prototypoStore');
		const templateValues = prototypoStore.head
			.toJS()
			.templatesData.find(e => e.name === this.state.family.template);
		const templateName = prototypoStore.head
			.toJS()
			.templateList.find(
				template => template.templateName === this.state.family.template,
			).templateName;

		this.generateVariants(templateValues, templateName);
	}

	generateVariants(templateValues, templateName, newFamily) {
		const family = newFamily || this.state.family;
		const fontsToGenerate = [];

		const variants = family.variants.map(variant => ({
			...variant,
			fontName: `variant${variant.id}`,
			templateName,
			subset: 'Hamburgefonstiv 123',
			values: {
				...templateValues.initValues,
				...variant.values,
			},
			glyphs: templateValues.glyphs,
		}));

		this.setState({
			variants,
			templateValues,
			templateName,
		});
	}

	renderFont(fontUsed) {
		switch (fontUsed.type) {
		case 'Template':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'Preset':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'Family':
			return (
				<span className="library-fontinuse-font">
					<Link to={`/library/project/${fontUsed.family.id}`}>
						{fontUsed.name}
					</Link>
				</span>
			);
		default:
			return false;
		}
	}

	componentWillReceiveProps(newProps) {
		if (this.props.families !== newProps.families) {
			const family = newProps.families.find(
				e => e.id === newProps.params.projectID,
			);

			let teamProject;

			if (newProps.subUsers && newProps.subUsers.length > 0) {
				teamProject = newProps.subUsers
					.find(u =>
						u.library.find(f => f.id === newProps.params.projectID),
					)
					.library.find(f => f.id === newProps.params.projectID);
			}

			if (!family && !teamProject) {
				this.props.router.push('/library/home');
			}
			this.setState({
				family: family || teamProject,
				isPersonnal: !!family,
			});

			this.generateVariants(
				this.state.templateValues,
				this.state.templateName,
				family || teamProject,
			);
		}
		if (this.props.params.projectID !== newProps.params.projectID) {
			const family = this.props.families.find(
				e => e.id === newProps.params.projectID,
			);
			let teamProject;

			if (newProps.subUsers && newProps.subUsers.length > 0) {
				teamProject = newProps.subUsers
					.find(u =>
						u.library.find(f => f.id === newProps.params.projectID),
					)
					.library.find(f => f.id === newProps.params.projectID);
			}

			if (!family && !teamProject) {
				this.props.router.push('/library/home');
			}
			this.setState({
				family: family || teamProject,
				isPersonnal: !!family,
			});
			this.generateVariants(
				this.state.templateValues,
				this.state.templateName,
				family || teamProject,
			);
		}
	}

	render() {
		const fontInUses = this.props.fontInUses.filter(
			fontInUse =>
				!!fontInUse.fontUsed.find(
					f => f.type === 'Family' && f.family.id === this.state.family.id,
				),
		);

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
							{this.props.user.firstName && this.props.user.firstName.charAt(0)}
							{this.props.user.lastName && this.props.user.lastName.charAt(0)}
						</div>
					</div>
					<div className="library-see-variants">
						{this.state.family
							&& this.state.variants
							&& this.state.variants.map((variant, index) => (
								<VariantItem
									key={`variantItem${variant.id}`}
									variant={variant}
									family={this.state.family}
									goToDashboard={this.goToDashboard}
									values={this.state.variants[index].values}
									template={this.state.variants[index].template}
									glyphs={this.state.variants[index].glyphs}
									open={this.props.open}
									duplicate={this.props.duplicate}
									rename={this.props.rename}
									export={this.props.export}
									delete={this.props.deleteVariant}
									isPersonnal={this.state.isPersonnal}
								/>
							))}
					</div>
					<div className="library-fontinuse-list">
						{fontInUses
							&& fontInUses.map(fontInUse => (
								<div className="library-fontinuse">
									<div className="library-fontinuse-left">
										{fontInUse.images.map(image => (
											<img src={`${image.replace('files.', 'images.')}/800x`} />
										))}
									</div>
									<div className="library-fontinuse-right">
										<p>
											<label>Client</label>
											{isUrl.test(fontInUse.clientUrl) ? (
												<a href={fontInUse.clientUrl} target="_blank">
													{fontInUse.client}
												</a>
											) : (
												<span>{fontInUse.client}</span>
											)}
										</p>
										<p>
											<label>Related fonts</label>
											{fontInUse.fontUsed.map(fontUsed =>
												this.renderFont(fontUsed),
											)}
										</p>
										<p>
											<label>Designer</label>
											{isUrl.test(fontInUse.designerUrl) ? (
												<a href={fontInUse.designerUrl} target="_blank">
													{fontInUse.designer}
												</a>
											) : (
												<span>{fontInUse.designer}</span>
											)}
										</p>
										<p className="library-fontinuse-button">
											<Link to={`/library/fontinuse/${fontInUse.id}/edit`}>
												Edit
											</Link>
										</p>
									</div>
								</div>
							))}
					</div>
				</div>
				<LibrarySidebarRight>
					<FamilySidebarActions
						glyphs={this.state.family.glyphs}
						family={this.state.family}
						familyId={this.props.params.projectID}
						exportFamily={this.exportFamily}
						mode="see"
						isPersonnal={this.state.isPersonnal}
					/>
					<Link className="sidebar-action" to="/library/fontinuse/create">
						Add fontsinuse
					</Link>
					{this.state.templateValues && (
						<FamilySidebarGlyphs glyphs={this.state.templateValues.glyphs} />
					)}
					<SidebarTags
						tags={this.state.family.tags}
						familyId={this.state.family.id}
						updateTags={this.props.updateTags}
						mode="readonly"
						isPersonnal={this.state.isPersonnal}
					/>
				</LibrarySidebarRight>
			</div>
		);
	}
}

export class VariantItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	render() {
		const subset = 'Hamburgefonstiv 123'
			.split('')
			.map(letter => letter.charCodeAt(0));

		return (
			<div
				className="library-item"
				tabIndex={0}
				onBlur={() => {
					this.setState({isOpen: false});
				}}
			>
				<p className="library-item-name">
					{this.props.family.name} {this.props.variant.name}
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `variant${this.props.variant.id}`}}
					onClick={() => {
						this.setState({isOpen: !this.state.isOpen});
					}}
				>
					Hamburgefonstiv 123
				</p>
				<div
					className={`library-item-variant-actions ${
						this.state.isOpen ? 'opened' : ''
					}`}
				>
					<div className="library-item-variant-actions-group">
						<div className="library-item-variant-actions-group-title">
							Actions
						</div>
						{this.props.isPersonnal && (
							<div
								className="library-item-variant-action"
								onClick={() => {
									this.props.open(this.props.variant, this.props.family);
								}}
							>
								Open variant
							</div>
						)}

						<div
							className="library-item-variant-action"
							onClick={() => {
								this.props.export(
									this.props.family.name,
									this.props.variant.name,
									this.props.values,
									this.props.family.template,
									this.props.glyphs,
									this.props.family.designer,
									this.props.family.designerUrl,
									this.props.family.foundry,
									this.props.family.foundryUrl,
									this.props.variant.weight,
									this.props.variant.width,
									this.props.variant.italic,
								);
							}}
						>
							Export variant
						</div>
						{this.props.isPersonnal && (
							<div
								className="library-item-variant-action"
								onClick={() => {
									this.props.rename(this.props.variant, this.props.family);
								}}
							>
								Rename variant
							</div>
						)}
						{this.props.isPersonnal && (
							<div
								className="library-item-variant-action"
								onClick={() => {
									this.props.duplicate(this.props.variant, this.props.family);
								}}
							>
								Duplicate variant
							</div>
						)}
						{this.props.isPersonnal
							&& this.props.family.variants.length > 1 && (
							<div
								className="library-item-variant-action"
								onClick={() => {
									this.props.delete(this.props.variant, this.props.family);
								}}
							>
									Delete variant
							</div>
						)}
						<FontUpdater
							name={this.props.variant.fontName}
							values={this.props.variant.values}
							template={this.props.variant.templateName}
							subset="Hamburgefonstiv 123"
							glyph="0"
						/>
					</div>
					<div className="library-item-variant-actions-group">
						<div className="library-item-variant-actions-group-title">
							Informations
						</div>
						<p>Weight: {this.props.variant.weight}</p>
						<p>Width: {this.props.variant.width}</p>
						{this.props.variant.italic && <p>Italic</p>}
					</div>
				</div>
			</div>
		);
	}
}

export default LibrarySee;
