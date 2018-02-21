import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ViewPanelsMenu from '../viewPanels/view-panels-menu.components';
import {ContextualMenuItem} from '../viewPanels/contextual-menu.components';
import Button from '../shared/new-button.components';

class Variant extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			deleteSplit: false,
		};

		this.open = this.open.bind(this);
		this.changeName = this.changeName.bind(this);
		this.duplicate = this.duplicate.bind(this);
		this.prepareDeleteOrDelete = this.prepareDeleteOrDelete.bind(this);
		this.cancelDelete = this.cancelDelete.bind(this);
		this.handleContextMenu = this.handleContextMenu.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
	}

	open() {
		this.props.open(this.props.variant);
		this.setState({showContextMenu: false});
	}

	changeName() {
		this.props.changeName(this.props.variant);
		this.setState({showContextMenu: false});
	}

	duplicate() {
		this.props.duplicate(this.props.variant);
		this.setState({showContextMenu: false});
	}

	prepareDeleteOrDelete() {
		this.setState(({deleteSplit}) => {
			if (deleteSplit) {
				this.props.delete(this.props.variant);
				return {deleteSplit: false};
			}

			return {deleteSplit: true};
		});
	}

	cancelDelete() {
		this.setState({deleteSplit: false});
	}

	handleContextMenu(e) {
		e.preventDefault();

		if (!this.state.showContextMenu) {
			this.toggleContextMenu();
		}
	}

	toggleContextMenu() {
		this.setState(({showContextMenu}) => ({
			showContextMenu: !showContextMenu,
		}));
	}

	render() {
		const {deleteSplit} = this.state;
		const {selected, variant, onlyVariant} = this.props;

		const classes = ClassNames({
			'variant-list-item': true,
			'is-active': selected,
		});

		return (
			<div
				role="button"
				tabIndex="0"
				className={classes}
				onClick={this.selectVariant}
				onDoubleClick={this.open}
				onContextMenu={this.handleContextMenu}
			>
				<div className="variant-list-item-name">
					{variant.name}
				</div>
				<Button className="variant-list-open-button" onClick={this.open} size="tiny" outline>
					Open
				</Button>
				<ViewPanelsMenu show={this.state.showContextMenu} toggle={this.toggleContextMenu}>
					<div className="variant-info-container">
						<ContextualMenuItem onClick={this.changeName}>
							Change variant name
						</ContextualMenuItem>
						<ContextualMenuItem onClick={this.duplicate}>
							Duplicate variant
						</ContextualMenuItem>
						{!onlyVariant && (
							<ContextualMenuItem
								danger
								splitButton
								splitted={deleteSplit}
								onClick={this.prepareDeleteOrDelete}
								altLabel="Cancel"
								altClick={this.cancelDelete}
							>
								{deleteSplit ? 'Delete' : 'Delete variant'}
							</ContextualMenuItem>
						)}
					</div>
				</ViewPanelsMenu>
			</div>
		);
	}
}

Variant.defaultProps = {
	selected: false,
	open: () => {},
	changeName: () => {},
	duplicate: () => {},
	delete: () => {},
	onlyVariant: false,
};

Variant.propTypes = {
	variant: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	}),
	selected: PropTypes.bool,
	open: PropTypes.func,
	changeName: PropTypes.func,
	duplicate: PropTypes.func,
	delete: PropTypes.func,
	onlyVariant: PropTypes.bool,
};

export default Variant;
