import React from 'react';
import onClickOutside from 'react-onclickoutside';
import Portal from 'react-portal';
import classNames from 'classnames';
import {TransitionGroup, CSSTransition} from 'react-transition-group';

import {ContextualMenu} from './contextual-menu.components';

class ViewPanelsMenu extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			x: 0,
			y: 0,
			clickOutsideMenu: false,
		};

		this.reposition = this.reposition.bind(this);
		this.handleTrigger = this.handleTrigger.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
		this.handleClickOutsideMenu = this.handleClickOutsideMenu.bind(this);
		this.handleClose = this.handleClose.bind(this);
	}

	componentDidMount() {
		this.reposition();

		window.addEventListener('resize', this.reposition);
		// as long as react-scrollbar doesn't support scroll event,
		// we need to do this
		// see https://github.com/souhe/reactScrollbar/issues/65
		// and... https://github.com/souhe/reactScrollbar/issues/75
		window.addEventListener('wheel', this.handleClickOutside);
		window.addEventListener('keydown', this.handleClickOutside);
	}

	componentWillReceiveProps({show}) {
		if (show) {
			this.reposition();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.reposition);
		window.removeEventListener('wheel', this.handleClickOutside);
		window.removeEventListener('keydown', this.handleClickOutside);

		this.unmount = true; // quickfix for react-portal
	}

	handleTrigger(e) {
		e.preventDefault();
		e.stopPropagation();

		this.reposition();

		this.props.toggle();
		this.setState({clickOutsideMenu: false});
	}

	handleClickOutside() {
		this.setState({clickOutsideMenu: true});
	}

	// We need this as the onClickOutside doesn't work
	// with <Portal>
	handleClickOutsideMenu() {
		if (this.state.clickOutsideMenu && this.props.show) {
			this.props.toggle();

			this.setState({clickOutsideMenu: false});
		}
	}

	// Temporary solution as long as react-portal finds a way to
	// deal with react css transition group
	handleClose(node, removeFromDOM) {
		const menu = node.querySelector('.contextual-menu');

		menu.classList.add('contextual-menu-exit');
		menu.classList.add('contextual-menu-exit-active');

		setTimeout(() => {
			if (!this.props.show || this.unmount) {
				removeFromDOM();
				return;
			}

			menu.classList.remove('contextual-menu-exit');
			menu.classList.remove('contextual-menu-exit-active');
			menu.classList.add('contextual-menu-appear');
			menu.classList.add('contextual-menu-appear-active');
		}, 200);
	}

	reposition() {
		const rect = this.button.getBoundingClientRect();

		this.setState({
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		});
	}

	render() {
		const {
			show,
			alignLeft,
			left,
			upper,
			wideRight,
			shifted,
			textPanelClosed,
			intercomShift,
			children,
			text,
		} = this.props;

		const iconClasses = classNames({
			'view-panels-menu-icon': true,
			'is-active': show,
		});

		const textClasses = classNames({
			'view-panels-menu-text': true,
			'is-active': show,
		});

		const classes = classNames({
			'view-panels-menu': true,
			'is-aligned-left': alignLeft,
			'is-wide-right': wideRight,
			'is-shifted': shifted,
			'textpanel-closed': textPanelClosed,
			'is-intercom-shift': intercomShift,
		});

		const button = text
			? (<div className={textClasses}>
				{text}
			</div>)
			: <div className={iconClasses} />;

		return (
			<div className={classes}>
				{React.cloneElement(button, {
					onClick: this.handleTrigger,
					ref: (node) => {
						if (node) this.button = node;
					},
				})}
				<Portal ref={node => this.portal = node} isOpened={show} beforeClose={this.handleClose}>
					<TransitionGroup
						component="div"
						style={{left: this.state.x, top: this.state.y}}
						className="settings-menu-toolbox"
					>
						<CSSTransition
							timeout={200}
							onBeforeEnter={this.reposition}
							classNames="contextual-menu"
							appear
						>
							<ContextualMenu
								onClickOutside={this.handleClickOutsideMenu}
								upper={upper}
								left={left}
							>
								{children}
							</ContextualMenu>
						</CSSTransition>
					</TransitionGroup>
				</Portal>
			</div>
		);
	}
}

export default onClickOutside(ViewPanelsMenu);
