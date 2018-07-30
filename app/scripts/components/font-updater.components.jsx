import _uniq from 'lodash/uniq';
import React from 'react';
import Lifespan from 'lifespan';
import {graphql, gql, compose} from 'react-apollo';
import PropTypes from 'prop-types';

import FontMediator from '../prototypo.js/mediator/FontMediator';

import LocalClient from '../stores/local-client.stores';

class FontUpdater extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.fontMediatorInstance = FontMediator.instance();
		this.fontMediatorInstance.setupInfo({
			email: this.props.email,
		});

		this.client
			.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					changingFont: head.toJS().d.changingFont,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentDidUpdate() {
		if (
			this.props.template !== undefined
			&& this.props.name !== undefined
			&& this.props.subset !== undefined
			&& this.props.glyph !== undefined
			&& this.props.values !== undefined
			&& !this.state.changingFont
		) {
			const subset = _uniq(this.props.subset.split('')).map(letter =>
				letter.charCodeAt(0),
			);

			this.fontMediatorInstance.getFont(
				this.props.name,
				this.props.template,
				{...this.props.values},
				subset,
				this.props.glyph,
			);
		}

		this.fontMediatorInstance.setupInfo({
			family: this.props.family,
			style: this.props.variant,
			template: this.props.template,
		});

		return false;
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return false;
	}
}

const userProfileQuery = gql`
	query getUserProfile {
		user {
			email
		}
	}
`;

FontUpdater.propTypes = {
	family: PropTypes.string,
	variant: PropTypes.string,
	name: PropTypes.string.isRequired,
	template: PropTypes.string.isRequired,
	values: PropTypes.object.isRequired,
	subset: PropTypes.string.isRequired,
	glyph: PropTypes.string.isRequired,
};

FontUpdater.defaultProps = {
	fonts: [],
};

export default compose(
	graphql(userProfileQuery, {
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			return data.user;
		},
	}),
)(FontUpdater);
