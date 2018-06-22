import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import {
	LibrarySidebarRight,
	FamilySidebarActions,
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
	}
	goToDashboard() {
		this.props.router.push('/dashboard');
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

		family.variants.forEach((variant) => {
			fontsToGenerate.push({
				name: `variant${variant.id}`,
				template: templateName,
				subset: 'Hamburgefonstiv 123',
				values: {
					...templateValues.initValues,
					...variant.values,
				},
				glyphs: templateValues.glyphs,
			});
		});
		this.setState({
			fontsToGenerate,
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
								backgroundColor: this.state.family.background,
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
							&& this.state.family.variants
							&& this.state.fontsToGenerate
							&& this.state.family.variants.map((variant, index) => (
								<VariantItem
									key={`variantItem${variant.id}`}
									variant={variant}
									family={this.state.family}
									goToDashboard={this.goToDashboard}
									values={
										this.state.fontsToGenerate[index].values
									}
									template={
										this.state.fontsToGenerate[index]
											.template
									}
									glyphs={
										this.state.fontsToGenerate[index].glyphs
									}
									open={this.props.open}
									duplicate={this.props.duplicate}
									rename={this.props.rename}
									export={this.props.export}
									delete={this.props.deleteVariant}
								/>
							))}
					</div>
					<FontUpdater extraFonts={this.state.fontsToGenerate} />
				</div>
				<LibrarySidebarRight>
					<FamilySidebarActions
						glyphs={this.state.family.glyphs}
						family={this.state.family}
						familyId={this.props.params.projectID}
						mode="see"
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
									this.props.template,
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
					</div>
				</div>
			</div>
		);
	}
}

export default LibrarySee;
