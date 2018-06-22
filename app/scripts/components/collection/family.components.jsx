import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ViewPanelsMenu from '../viewPanels/view-panels-menu.components';
import {ContextualMenuItem} from '../viewPanels/contextual-menu.components';

class Family extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			deleteSplit: false,
		};

		this.selectFamily = this.selectFamily.bind(this);
		this.openChangeNameFamily = this.openChangeNameFamily.bind(this);
		this.prepareDeleteOrDelete = this.prepareDeleteOrDelete.bind(this);
		this.cancelDelete = this.cancelDelete.bind(this);
		this.handleContextMenu = this.handleContextMenu.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
	}

	selectFamily() {
		this.props.onSelect(this.props.family);
	}

	openChangeNameFamily() {
		this.toggleContextMenu();
		this.props.askChangeName(this.props.family);
	}

	prepareDeleteOrDelete() {
		this.setState(({deleteSplit}) => {
			if (deleteSplit) {
				this.props.onDelete(this.props.family);
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

		this.toggleContextMenu();
	}

	toggleContextMenu() {
		this.setState(({showContextMenu}) => ({
			showContextMenu: !showContextMenu,
		}));
	}

	render() {
		const {family, templateName} = this.props;
		const {deleteSplit, showContextMenu} = this.state;

		const classes = classNames({
			family: true,
			'is-active': this.props.selected,
		});
		const sampleClasses = classNames({
			'family-sample': true,
			[this.props.class]: true,
		});
		const familyActions = (
			<div>
				<ContextualMenuItem onClick={this.openChangeNameFamily}>
					Rename family
				</ContextualMenuItem>
				<ContextualMenuItem
					danger
					splitButton
					splitted={deleteSplit}
					onClick={this.prepareDeleteOrDelete}
					altLabel="Cancel"
					altClick={this.cancelDelete}
				>
					{deleteSplit ? 'Delete' : 'Delete family'}
				</ContextualMenuItem>
			</div>
		);

		return (
			<div
				role="button"
				tabIndex="0"
				className={classes}
				onClick={this.selectFamily}
				onKeyPress={this.selectFamily}
				onContextMenu={this.handleContextMenu}
			>
				<div className={sampleClasses} />
				<div className="family-info">
					<div className="family-info-name">{family.name}</div>
					<div className="family-info-base">
						FROM<span className="family-info-base-template">
							{' '}
							{templateName}
						</span>
					</div>
				</div>
				<ViewPanelsMenu show={showContextMenu} toggle={this.toggleContextMenu}>
					{familyActions}
				</ViewPanelsMenu>
			</div>
		);
	}
}

Family.defaultProps = {
	onSelect: () => {},
	onDelete: () => {},
	askChangeName: () => {},
};

Family.propTypes = {
	family: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
	}).isRequired,
	templateName: PropTypes.string.isRequired,
	onSelect: PropTypes.func,
	onDelete: PropTypes.func,
	askChangeName: PropTypes.func,
};

export default Family;
