import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import {Link} from 'react-router-dom';

import {
	LibrarySidebarRight,
	FamilySidebarActions,
	FamilySidebarGlyphs,
	SidebarTags,
} from './library-sidebars.components';
import {Link} from 'react-router';
import Lifespan from 'lifespan';
import FontUpdater from '../font-updater.components';
import LocalClient from '../../stores/local-client.stores';

import LibraryButton from './library-button.components';

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

		const {projectID} = props.match.params;

		const family = props.families.find(
			e => e.id === projectID,
		);

		let teamProject;

		if (props.subUsers && props.subUsers.length > 0) {
			teamProject = props.subUsers
				.find(u =>
					u.library.find(f => f.id === projectID),
				)
				.library.find(f => f.id === projectID);
		}

		if (!family && !teamProject) {
			props.history.push('/library');
		}

		this.state = {
			family: family || teamProject,
			isPersonal: !!family,
		};
		this.generateVariants = this.generateVariants.bind(this);
		this.goToDashboard = this.goToDashboard.bind(this);
		this.exportFamily = this.exportFamily.bind(this);
	}
	goToDashboard() {
		this.props.history.push('/dashboard');
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
		this.lifespan = new Lifespan();
		this.client.getStore('/prototypoStore', this.lifespan).onUpdate((head) => {
			this.setState({
				exporting: head.toJS().d.export,
				errorExport: head.toJS().d.errorExport,
			});
		});
		const prototypoStore = await this.client.fetch('/prototypoStore');
		const templatesData = await prototypoStore.head.toJS().templatesData;
		const templateList = await prototypoStore.head.toJS().templateList;

		this.setState({templatesData, templateList});
		this.generateVariants(this.state.family, templatesData, templateList);
	}

	generateVariants(newFamily, newTemplatesData, newTemplateList) {
		const family = newFamily || this.state.family;
		const templatesData = newTemplatesData || this.state.templatesData;
		const templateList = newTemplateList || this.state.templateList;
		const templateValues = templatesData.find(
			e => e.name === family.template,
		);
		const templateName = templateList.find(
			template => template.templateName === family.template,
		).templateName;

		const variants = family.variants.map(variant => ({
			...variant,
			fontName: `variant${variant.id}`,
			templateName,
			subset: 'Hamburgefonstiv 123',
			values: {
				...templateValues.initValues,
				...(typeof variant.values === 'object'
					? variant.values
					: JSON.parse(variant.values)),
			},
			glyphs: templateValues.glyphs,
		}));

		this.setState({
			variants,
			templateValues,
		});
	}

	renderFont(fontUsed) {
		switch (fontUsed.type) {
		case 'TEMPLATE':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'PRESET':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'VARIANT':
			return fontUsed.variant ? (
				<span className="library-fontinuse-font">
					<Link to={`/library/project/${fontUsed.variant.family.id}`}>
						{fontUsed.name}
					</Link>
				</span>
			) : (
				<span className="library-fontinuse-font">{fontUsed.name}</span>
			);
		default:
			return false;
		}
	}

	componentWillReceiveProps(newProps) {
		const {projectID: oldProjectID} = this.props.match.params;
		const {projectID} = newProps.match.params;

		if (this.props.families !== newProps.families) {
			const family = newProps.families.find(
				e => e.id === newProps.params.projectID,
			);

			let teamProject;

			if (newProps.subUsers && newProps.subUsers.length > 0) {
				teamProject = newProps.subUsers
					.find(u =>
						u.library.find(f => f.id === projectID),
					)
					.library.find(f => f.id === projectID);
			}

			if (!family && !teamProject) {
				this.props.history.push('/library');
			}
			this.setState({
				family: family || teamProject,
				isPersonal: !!family,
			});

			this.generateVariants(family || teamProject);
		}
		if (oldProjectID !== projectID) {
			const family = this.props.families.find(
				e => e.id === projectID,
			);
			let teamProject;

			if (newProps.subUsers && newProps.subUsers.length > 0) {
				teamProject = newProps.subUsers
					.find(u =>
						u.library.find(f => f.id === projectID),
					)
					.library.find(f => f.id === projectID);
			}

			if (!family && !teamProject) {
				this.props.history.push('/library');
			}
			this.setState({
				family: family || teamProject,
				isPersonal: !!family,
			});
			this.generateVariants(family || teamProject);
		}
	}

	render() {
		const {projectID} = this.props.match.params;

		const fontInUses = this.props.fontInUses.filter(
			fontInUse =>
				!!fontInUse.fontUsed.find(
					f =>
						f.type === 'VARIANT'
						&& f.variant
						&& this.state.family.variants.find(v => v.id === f.variant.id),
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
									isPersonal={this.state.isPersonal}
									exporting={this.state.exporting}
									errorExport={this.state.errorExport}
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
												<a href={`//${fontInUse.clientUrl}`} target="_blank">
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
												<a href={`//${fontInUse.desigherUrl}`} target="_blank">
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
				<LibrarySidebarRight router={this.props.router}>
					<FamilySidebarActions
						glyphs={this.state.family.glyphs}
						family={this.state.family}
						familyId={projectID}
						exportFamily={this.exportFamily}
						mode="see"
						isPersonal={this.state.isPersonal}
						router={this.props.router}
						exporting={this.state.exporting}
						errorExport={this.state.errorExport}
					/>
					<LibraryButton
						name="Add fontsinuse"
						bold
						full
						onClick={() => {
							this.props.router.push('/library/fontinuse/create');
						}}
					/>
					{this.state.templateValues && (
						<FamilySidebarGlyphs glyphs={this.state.templateValues.glyphs} />
					)}
					<SidebarTags
						tags={this.state.family.tags}
						familyId={this.state.family.id}
						updateTags={this.props.updateTags}
						mode="readonly"
						isPersonal={this.state.isPersonal}
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
			keyDowns: 0,
			confirmDelete: false,
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
					this.setState({isOpen: false, confirmDelete: false});
				}}
				onKeyDown={(e) => {
					this.setState({keyDowns: this.state.keyDowns + e.keyCode});
				}}
				onKeyUp={() => {
					this.setState({keyDowns: 0});
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
						{this.props.isPersonal && (
							<LibraryButton
								name="Open variant"
								dark
								onClick={() => {
									this.props.open(this.props.variant, this.props.family);
								}}
							/>
						)}
						<LibraryButton
							name={
								this.state.keyDowns === 33 ? 'Export source' : 'Export variant'
							}
							dark
							loading={this.props.exporting}
							error={this.props.errorExport}
							onClick={() => {
								this.props.export(
									!this.state.keyDowns === 33,
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
						/>
						{this.props.isPersonal && (
							<LibraryButton
								name="Rename variant"
								dark
								onClick={() => {
									this.props.rename(this.props.variant, this.props.family);
								}}
							/>
						)}
						{this.props.isPersonal && (
							<LibraryButton
								name="Duplicate variant"
								dark
								onClick={() => {
									this.props.duplicate(this.props.variant, this.props.family);
								}}
							/>
						)}
						{this.props.isPersonal
							&& this.props.family.variants.length > 1 && (
							<LibraryButton
								name={`${
									this.state.confirmDelete ? 'Confirm' : 'Delete variant'
								}`}
								dark
								error={this.state.confirmDelete}
								onClick={(e) => {
									if (this.state.confirmDelete) {
										this.props.delete(this.props.variant, this.props.family);
									}
									else {
										this.setState({confirmDelete: true});
									}
									setTimeout(() => {
										this.setState({confirmDelete: false});
									}, 600);
									e.preventDefault();
								}}
							/>
						)}
						<FontUpdater
							name={this.props.variant.fontName}
							values={
								typeof this.props.variant.values === 'object'
									? this.props.variant.values
									: JSON.parse(this.props.variant.values)
							}
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
