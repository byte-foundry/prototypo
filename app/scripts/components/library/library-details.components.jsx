import React from 'react';
import pleaseWait from 'please-wait';
import { LibrarySidebarRight, FamilySidebarActions, FamilySidebarGlyphs } from './library-sidebars.components';
import { graphql, gql, compose } from 'react-apollo';
import FontUpdater from "../font-updater.components";
import LocalClient from '../../stores/local-client.stores';

class LibraryDetails extends React.Component {
	constructor(props) {
		super(props)
		const family = this.props.families.find(
			e => e.id === this.props.params.projectID,
		);
		if (!family) { props.history.push('/library/home') };
		this.state = {
			family,
		}
		this.goToDashboard = this.goToDashboard.bind(this);
	}
	async componentWillMount() {
		this.client = LocalClient.instance();
		const prototypoStore = await this.client.fetch('/prototypoStore');
		const familyGlyphs = prototypoStore.head
			.toJS()
			.templatesData.find(e => e.name === this.state.family.template).glyphs;

		this.setState({familyGlyphs});
	}
	goToDashboard() {
		this.props.history.push('/dashboard');
	}
	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-see-title">
						{this.state.family.name} family
						<div
							className={`provider provider-custom`}
							style={{ backgroundColor: this.state.family.background }}
						>
							{this.props.user.firstName && this.props.user.firstName.charAt(0)}
							{this.props.user.lastName && this.props.user.lastName.charAt(0)}
						</div>
					</div>
					<div className="library-details-form">
						<form action="" method="">
							<div className="library-details-form-elem">
								<label htmlFor="name">Family name</label>
								<input type="text" id="name" name="family_name" value={this.state.family.name} />
							</div>
							<div className="library-details-form-elem" />
							<div className="library-details-form-elem">
								<label htmlFor="mail">Designer</label>
								<input type="text" id="name" name="user_name" value={`${this.props.user.firstName} ${this.props.user.lastName}`} />
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Designer URL</label>
								<input type="text" id="name" name="user_name" />
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Foundry</label>
								<input type="text" id="name" name="user_name" value="Prototypo" />
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Foundry URL</label>
								<input type="text" id="name" name="user_name" value="https://prototypo.io/"/>
							</div>
						</form>
					</div>
					<div className="library-details-variants">
						<div className="details-header">
							<div className="details-header-elem">
								Styles settings
							</div>
							<div className="details-header-elem">
								Weight
							</div>
							<div className="details-header-elem">
								Width
							</div>
							<div className="details-header-elem">
								Italic
							</div>
							<div className="details-header-elem">&nbsp;</div>
						</div>
						{this.state.family && this.state.family.variants && this.state.family.variants.map((variant, index) => (
							<div className="details-form">
								<div className="details-form-elem">
									<input type="text" id="settings" name="style_settings" value={variant.name} />
								</div>
								<div className="details-form-elem">
									<select name="style-weight">
										<option value="200">200</option>
										<option value="300">300</option>
										<option value="400">400</option>
										<option value="500">500</option>
										<option value="600">600</option>
										<option value="700">700</option>
										<option value="800">800</option>
										<option value="900">900</option>
									</select>
								</div>
								<div className="details-form-elem">
								<select name="style-width">
										<option value="normal">normal</option>
										<option value="condensed">condensed</option>
										<option value="extended">extended</option>
									</select>
								</div>
								<div className="details-form-elem checkbox">
									<div className="checkbox">
										<input type="checkbox" id="italic" name="italic" />
										<label htmlFor="italic" />
									</div>
								</div>
								<div className="details-form-elem">
									{this.state.family.variants.length > 1 && (
										<div className="button-remove" onClick={() => {this.props.deleteVariant(variant.id)}}>
											Remove
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
				<LibrarySidebarRight><FamilySidebarActions familyId={this.props.params.projectID} family={this.state.family} mode="details" /><FamilySidebarGlyphs glyphs={this.state.familyGlyphs} /></LibrarySidebarRight>
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
					family.variants = family.variants.filter(variant => variant.id !== deleteVariant.id);
				});

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	})
)(LibraryDetails);
