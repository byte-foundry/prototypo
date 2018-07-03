import gql from 'graphql-tag';
import Lifespan from 'lifespan';
import PropTypes from 'prop-types';
import React from 'react';
import {compose, graphql} from 'react-apollo';
import {Link, withRouter} from 'react-router-dom';

import LocalClient from '../../stores/local-client.stores';
import {AddFamily} from '../familyVariant/add-family-variant.components';
import Button from '../shared/new-button.components';

const FamilyRow = ({open, selected, ...family}) => {
	const openFamily = () => open(family);

	return (
		<li
			onDoubleClick={openFamily}
			className={`load-project-project-item ${selected ? 'selected' : ''}`}
		>
			<span className="load-project-project-item-name">{family.name}</span>
			<Button
				className="load-project-project-item-button"
				onClick={openFamily}
				outline
				size="small"
			>
				Open
			</Button>
		</li>
	);
};

class StartApp extends React.PureComponent {
	constructor(props) {
		super(props);

		this.returnToDashboard = this.returnToDashboard.bind(this);
		this.open = this.open.bind(this);
		this.create = this.create.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan).onUpdate((head) => {
			const {fonts, collectionSelectedFamily} = head.toJS().d;

			if (collectionSelectedFamily === {} && fonts[0]) {
				this.client.dispatchAction('/select-family-collection', fonts[0]);
				this.client.dispatchAction(
					'/select-variant-collection',
					fonts[0].variants[0],
				);
			}
		});
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	returnToDashboard() {
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
	}

	open(family) {
		this.client.dispatchAction('/select-variant', {
			variant: family.variants[0],
			family,
		});
		this.props.history.push('/dashboard');
	}
	create(family) {
		this.client.dispatchAction('/select-variant', {
			variant: family.variants[0],
			family,
		});
		this.client.dispatchAction('/store-value', {onboardingFrom: 'start'});
		this.props.history.push('/onboarding');
	}

	render() {
		const {loading, families} = this.props;

		if (loading) {
			return <p>loading</p>;
		}

		return (
			<div
				className={`start-app ${
					families && families.length ? '' : 'noproject'
				}`}
			>
				<div className="go-to-account">
					<Link className="go-to-account-link" to="/account">
						Go to my account instead →
					</Link>
				</div>
				<div className="start-app-container">
					<div className="start-base">
						<div className="start-base-create">
							<AddFamily
								start="true"
								firstTime={!families.length}
								onCreateFamily={this.create}
							/>
						</div>
						<div className="start-base-projects">
							<div className="load-project">
								<label className="load-project-label">
									<span className="load-project-label-order">OR. </span>
									Continue recent project
								</label>
								<ul className="load-project-project">
									{families.map(family => (
										<FamilyRow key={family.id} open={this.open} {...family} />
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

StartApp.defaultProps = {
	families: [],
};

StartApp.propTypes = {
	families: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		}),
	),
};

const getUserLibraryQuery = gql`
	query {
		user {
			id
			appValues
			library {
				id
				name
				template
				variants {
					id
					updatedAt
					name
				}
			}
		}
	}
`;

export default compose(
	graphql(getUserLibraryQuery, {
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			const {library, appValues} = data.user;

			return {
				families: library.map((family) => {
					const selected
						= appValues.familySelected
						&& family.id === appValues.familySelected.id;

					return {
						...family,
						selected,
					};
				}),
			};
		},
	}),
	withRouter,
)(StartApp);
