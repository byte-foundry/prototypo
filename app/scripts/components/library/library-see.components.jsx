import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import {
	LibrarySidebarRight,
	FamilySidebarActions,
	FamilySidebarGlyphs,
	SidebarTags,
} from './library-sidebars.components';
import FontUpdater from '../font-updater.components';
import LocalClient from '../../stores/local-client.stores';

class LibrarySee extends React.Component {
	constructor(props) {
		super(props);
		const family = this.props.families.find(
			e => e.id === this.props.params.projectID,
		);

		if (!family) {
			props.history.push('/library/home');
		}

		this.state = {
			family,
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

		this.client.dispatchAction('/export-family-from-library', {
			familyName: this.state.family.name,
			variantNames,
			valueArray,
			template: this.state.family.template,
			glyphs: this.state.variants[0].glyphs,
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
				template =>
					template.templateName === this.state.family.template,
			).templateName;

		this.generateVariants(templateValues, templateName);
	}

	generateVariants(templateValues, templateName, families) {
		const family = families
			? families.find(e => e.id === this.props.params.projectID)
			: this.state.family;
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
			family: families ? family : this.state.family,
		});
	}

	componentWillReceiveProps(newProps) {
		if (this.props.families !== newProps.families) {
			this.generateVariants(
				this.state.templateValues,
				this.state.templateName,
				newProps.families,
			);
		}
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
									template={
										this.state.variants[index].template
									}
									glyphs={this.state.variants[index].glyphs}
									open={this.props.open}
									duplicate={this.props.duplicate}
									rename={this.props.rename}
									export={this.props.export}
									delete={this.props.deleteVariant}
								/>
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
					/>
					{this.state.templateValues && (
						<FamilySidebarGlyphs
							glyphs={this.state.templateValues.glyphs}
						/>
					)}
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
						<div
							className="library-item-variant-action"
							onClick={() => {
								this.props.open(
									this.props.variant,
									this.props.family,
								);
							}}
						>
							Open variant
						</div>
						<div
							className="library-item-variant-action"
							onClick={() => {
								this.props.export(
									this.props.family.name,
									this.props.variant.name,
									this.props.values,
									this.props.family.template,
									this.props.glyphs,
								);
							}}
						>
							Export variant
						</div>
						<div
							className="library-item-variant-action"
							onClick={() => {
								this.props.rename(
									this.props.variant,
									this.props.family,
								);
							}}
						>
							Rename variant
						</div>
						<div
							className="library-item-variant-action"
							onClick={() => {
								this.props.duplicate(
									this.props.variant,
									this.props.family,
								);
							}}
						>
							Duplicate variant
						</div>
						{this.props.family.variants.length > 1 && (
							<div
								className="library-item-variant-action"
								onClick={() => {
									this.props.delete(
										this.props.variant,
										this.props.family,
									);
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
				</div>
			</div>
		);
	}
}

export default LibrarySee;
