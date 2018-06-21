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
			.templatesData.find(e => e.name === this.state.family.template).initValues;
		const templateName = prototypoStore.head
			.toJS()
			.templateList.find(
				template => template.templateName === this.state.family.template,
			).templateName;

		this.generateVariants(templateValues, templateName);
	}

	generateVariants(templateValues, templateName) {
		const fontsToGenerate = [];

		this.state.family.variants.forEach((variant) => {
			fontsToGenerate.push({
				name: `variant${variant.id}`,
				template: templateName,
				subset: 'Hamburgefonstiv 123',
				values: {
					...templateValues,
					...variant.values,
				},
			});
		});
		this.setState({
			fontsToGenerate,
		});
	}

	render() {
		console.log(this.state)
		console.log(this.props)
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
		this.open = this.open.bind(this);
		this.export = this.export.bind(this);
		this.rename = this.rename.bind(this);
		this.duplicate = this.duplicate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	open() {
		this.client.dispatchAction('/select-variant', {
			selectedVariant: this.props.variant,
			family: this.props.family,
		});
		this.props.goToDashboard();
	}

	rename() {
		this.client.dispatchAction('/store-value', {
			openChangeVariantNameModal: true,
			collectionSelectedVariant: this.props.variant,
			familySelectedVariantCreation: this.props.family,
		});
	}

	duplicate() {
		this.client.dispatchAction('/store-value', {
			openDuplicateVariantModal: true,
			collectionSelectedVariant: this.props.variant,
			familySelectedVariantCreation: this.props.family,
		});
	}

	export() {
		console.log(this.props.family);
		this.client.dispatchAction('/export-otf-from-library', {
			merged: true,
			familyName: this.props.family.name,
			variantName: this.props.variant.name,
			exportAs: false,
			values: this.props.values,
			template: this.props.template,
			glyphs: this.props.family.glyphs,
		});
	}

	render() {
		console.log(this.props.family);
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
								this.open();
							}}
						>
							Open variant
						</div>
						<div
							className="library-item-variant-action"
							onClick={() => {
								this.export();
							}}
						>
							Export variant
						</div>
						<div
							className="library-item-variant-action"
							onClick={() => {
								this.rename();
							}}
						>
							Rename variant
						</div>
						<div
							className="library-item-variant-action"
							onClick={() => {
								this.duplicate();
							}}
						>
							Duplicate variant
						</div>
						{this.props.family.variants.length > 1 && (
							<div
								className="library-item-variant-action"
								onClick={() => {
									this.props.deleteVariant(
										this.props.variant.id,
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

const libraryQuery = gql`
	query {
		user {
			id
			library {
				id
				name
				template
				variants {
					id
					name
					values
				}
			}
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
)(LibrarySee);
