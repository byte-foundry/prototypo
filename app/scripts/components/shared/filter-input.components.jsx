import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from './icon.components';

class FilterInput extends React.Component {
	constructor(props) {
		super(props);

		this.handleClear = this.handleClear.bind(this);
	}

	handleClear() {
		// We clear the uncontrolled component
		if (!this.props.value) {
			this.input.value = '';
		}
	}

	render() {
		const {children, onClear, ...rest} = this.props;

		return (
			<div className="filter-input">
				<input
					ref={(node) => {
						if (node) this.input = node;
					}}
					className="filter-input-input"
					type="search"
					{...rest}
				/>
				<button
					className={classnames('filter-input-clear', {
						'filter-input-clear--empty': !rest.value,
					})}
					onClick={onClear}
				>
					<Icon name="delete" />
				</button>
			</div>
		);
	}
}

FilterInput.propTypes = {
	onClear: PropTypes.func,
};

FilterInput.defaultProps = {
	onClear: () => {},
};

export default FilterInput;
