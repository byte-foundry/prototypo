import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {Link} from 'react-router';
import {graphql, gql} from 'react-apollo';

import FilterInput from '../shared/filter-input.components';
import FilterableTable from '../shared/filterable-table.components';
import Icon from '../shared/icon.components';
import IconButton from '../shared/icon-button.components';
import Button from '../shared/new-button.components';
import WaitForLoad from '../wait-for-load.components';

let HoodieApi;

// Temporary catch to avoid errors in Storybook, should be removed later anyway
try {
	HoodieApi = require('../../services/hoodie.services').default;
}
catch (err) {}

const STATUS_ICONS = {
	pending: (
		<Icon className="manage-sub-users-icon" name="sub-account-pending" />
	),
	active: <Icon className="manage-sub-users-icon" name="sub-account-active" />,
	loading: <WaitForLoad loading />,
};

class MemberRow extends React.Component {
	constructor(props) {
		super(props);

		this.handleRemoveButton = this.handleRemoveButton.bind(this);
	}

	handleRemoveButton() {
		this.props.onRemoveRow(this.props.member);
	}

	render() {
		const {member, filter, onRemoveRow} = this.props;

		return (
			<tr
				key={member.email}
				className={classnames('sortable-table-row', {
					'sortable-table-row--loading': member.status === 'loading',
				})}
			>
				<td className="sortable-table-cell sortable-table-status">
					{STATUS_ICONS[member.status]}
				</td>
				<td className="sortable-table-cell sortable-table-email">
					{filter
						? member.email
							.split(new RegExp(`(${filter})`))
							.map(text => (
								<span
									className={
										new RegExp(`(${filter})`).test(text)
											? 'sortable-table-cell-filter'
											: ''
									}
								>
									{text}
								</span>
							))
						: member.email}
				</td>
				<td className="sortable-table-cell sortable-table-name">
					{[member.firstName, member.lastName].join(' ')}
				</td>
				{onRemoveRow && (
					<td className="sortable-table-cell sortable-table-actions">
						<IconButton name="delete" onClick={this.handleRemoveButton} />
					</td>
				)}
			</tr>
		);
	}
}

MemberRow.propTypes = {
	member: PropTypes.shape({
		id: PropTypes.string,
		email: PropTypes.string,
		status: PropTypes.string,
	}).isRequired,
	filter: PropTypes.string,
	onRemoveRow: PropTypes.func,
};

export class AccountManageSubUsers extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			userCreation: null,
			loadingCreation: false,
			loadingRemoval: false,
			filter: '',
			sort: {
				property: 'email',
				asc: false,
			},
		};

		this.changeFilter = this.changeFilter.bind(this);
		this.clearFilter = this.clearFilter.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCreate = this.handleCreate.bind(this);
		this.handleRemoveButton = this.handleRemoveButton.bind(this);
		this.cancelUserCreation = this.cancelUserCreation.bind(this);
		this.sortByStatus = () => this.sortBy('status');
		this.sortByEmail = () => this.sortBy('email');
		this.sortByName = () => this.sortBy('name');
	}

	async handleCreate(e) {
		e.preventDefault();

		const email = this.email.value;
		const firstName = this.firstName.value;
		const lastName = this.lastName.value;

		this.setState({
			error: null,
			userCreation: null,
			loadingCreation: email,
		});

		try {
			await this.props.onAddUser({
				email,
				firstName,
				lastName,
			});

			this.setState({userCreation: null, loadingCreation: false});
		}
		catch (err) {
			this.setState({error: err.message, loadingCreation: false});
		}
	}

	async handleSubmit(e) {
		e.preventDefault();

		const email = this.email.value;

		this.setState({error: null, loadingCreation: email});

		try {
			await this.props.onAddUser({email});

			this.setState({loadingCreation: false});
		}
		catch (err) {
			if (err.type === 'NotFound') {
				this.setState({
					userCreation: {email},
					loadingCreation: false,
					error: "This user doesn't exist, would you like to create it?",
				});
			}
			else {
				this.setState({error: err.message, loadingCreation: false});
			}
		}
	}

	async handleRemoveButton(member) {
		this.setState({error: null, loadingRemoval: member});

		try {
			await this.props.onRemoveUser(member);

			this.setState({loadingRemoval: false});
		}
		catch (err) {
			this.setState({error: err.message, loadingRemoval: false});
		}
	}

	cancelUserCreation() {
		this.setState({userCreation: null, error: null});
	}

	changeFilter(e) {
		this.setState({filter: e.target.value});
	}

	clearFilter() {
		this.setState({filter: ''});
	}

	sortBy(property) {
		this.setState(({sort}) => ({
			sort: {
				property,
				asc: (sort.property !== property && sort.asc) || !sort.asc,
			},
		}));
	}

	renderCreateUserForm() {
		return (
			<tr key="create-user" className="sortable-table-create-user-form">
				<td>
					<IconButton name="delete" onClick={this.cancelUserCreation} />
				</td>
				<td>
					<input
						className="sortable-table-add-user-form-email"
						type="email"
						name="email"
						placeholder="email@example.com"
						defaultValue={this.state.userCreation.email}
						disabled
						ref={(node) => {
							if (node) this.email = node;
						}}
					/>
				</td>
				<td style={{display: 'flex'}}>
					<input
						className="sortable-table-add-user-form-name"
						type="text"
						name="firstName"
						placeholder="John"
						ref={(node) => {
							if (node) this.firstName = node;
						}}
					/>
					<input
						className="sortable-table-add-user-form-name"
						type="text"
						name="lastName"
						placeholder="Doe"
						ref={(node) => {
							if (node) this.lastName = node;
						}}
					/>
				</td>
				<td>
					<Button size="small" onClick={this.handleCreate}>
						Create user
					</Button>
				</td>
			</tr>
		);
	}

	renderAddUserForm() {
		return (
			<tr key="add-user" className="sortable-table-add-user-form">
				<td />
				<td colSpan={2}>
					<input
						className="sortable-table-add-user-form-email"
						type="email"
						name="email"
						placeholder="email@example.com"
						ref={(node) => {
							if (node) this.email = node;
						}}
					/>
				</td>
				<td>
					<Button size="small" onClick={this.handleSubmit}>
						Add User
					</Button>
				</td>
			</tr>
		);
	}

	renderForm() {
		const {members, max} = this.props;
		const {userCreation} = this.state;

		if (max && max - members.length <= 0) {
			return null;
		}

		if (userCreation) {
			return this.renderCreateUserForm();
		}

		return this.renderAddUserForm();
	}

	render() {
		const {loading, members, max, onAddUser} = this.props;
		const {filter, sort, loadingCreation, loadingRemoval, error} = this.state;
		const slotsLeft = max - members.length;

		const sortClass = sort.asc ? 'asc' : 'desc';
		const headersClasses = ['status', 'email', 'name'].reduce(
			(obj, header) => ({
				...obj,
				[header]: classnames(
					'sortable-table-header-cell',
					`sortable-table-${header}`,
					{
						[`sortable-table-header-cell-sort-${sortClass}`]:
							sort.property === header,
					},
				),
			}),
			{},
		);

		let filteredMembers = members
			.filter(({email}) => email.includes(filter))
			.sort((a, b) => a[sort.property] < b[sort.property]);

		if (!sort.asc) {
			filteredMembers.reverse();
		}

		if (loadingCreation) {
			filteredMembers.unshift({email: loadingCreation, status: 'loading'});
		}

		if (loadingRemoval) {
			filteredMembers = filteredMembers.map((member) => {
				if (member.email === loadingRemoval.email) {
					return {...loadingRemoval, status: 'loading'};
				}

				return member;
			});
		}

		const caption = (
			<span>
				{slotsLeft} slots left on {max}
				{slotsLeft < 4 && ' • '}
				{slotsLeft < 4 && (
					<Link to="/account/details/change-plan">
						Update your subscription
					</Link>
				)}
			</span>
		);

		const tableHeaders = [
			{
				styleClass: headersClasses.status,
				label: 'Status',
				onClick: this.sortByStatus,
			},
			{
				styleClass: headersClasses.email,
				label: 'Email',
				onClick: this.sortByEmail,
			},
			{
				styleClass: headersClasses.name,
				label: 'Name',
				onClick: this.sortByName,
				colSpan: 1,
			},
		];

		return (
			<div className="manage-sub-users">
				<header className="manage-sub-users-header">
					<h1 className="manage-sub-users-title">Manage Sub Users</h1>
					<div className="manage-sub-users-action-bar">
						<FilterInput
							placeholder="Filter"
							onChange={this.changeFilter}
							onClear={this.clearFilter}
							value={filter}
						/>
					</div>
				</header>
				<WaitForLoad loading={loading}>
					<FilterableTable
						captionCondition={max > 0}
						caption={caption}
						tableHeaders={tableHeaders}
					>
						{error && (
							<tr key="warning">
								<td className="sortable-table-warning-message" colSpan={4}>
									{error}
								</td>
							</tr>
						)}
						{onAddUser && !filter && !loadingCreation && this.renderForm()}
						{!members.length && (
							<tr>
								<td colSpan={4}>
									<p style={{textAlign: 'center'}}>
										You don't manage any user for now.
									</p>
								</td>
							</tr>
						)}
						{!!members.length
							&& !filteredMembers.length && (
							<tr>
								<td colSpan={4}>
									<p style={{textAlign: 'center'}}>
											No user match this filter
									</p>
								</td>
							</tr>
						)}
						{filteredMembers.map((member, i) => (
							<MemberRow
								member={member}
								key={i}
								filter={filter}
								onRemoveRow={this.handleRemoveButton}
							/>
						))}
					</FilterableTable>
				</WaitForLoad>
			</div>
		);
	}
}

AccountManageSubUsers.propTypes = {
	members: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string,
			email: PropTypes.string,
			status: PropTypes.string,
		}).isRequired,
	).isRequired,
	max: PropTypes.number,
	onAddUser: PropTypes.func,
	onRemoveUser: PropTypes.func,
};

AccountManageSubUsers.defaultProps = {
	members: [],
};

const query = gql`
	query getSubUsers {
		user {
			id
			subUsers {
				id
				firstName
				lastName
				email
			}
			pendingSubUsers {
				id
				firstName
				lastName
				email
			}
		}
	}
`;

export default graphql(query, {
	options: {
		fetchPolicy: 'cache-and-network',
	},
	props: ({data}) => {
		// TMP: don't fail if there's no graphcool account
		if (data.loading || !data.user) {
			return {loading: true};
		}

		const members = [
			...data.user.subUsers.map(e => ({...e, status: 'active'})),
			...data.user.pendingSubUsers.map(e => ({...e, status: 'pending'})),
		].sort((a, b) => a.email > b.email);

		return {
			members,
			onAddUser: async (infos) => {
				await HoodieApi.addManagedUser(data.user.id, infos);

				await data.refetch();
			},
			onRemoveUser: async ({id}) => {
				await HoodieApi.removeManagedUser(data.user.id, id);

				await data.refetch();
			},
		};
	},
})(AccountManageSubUsers);
