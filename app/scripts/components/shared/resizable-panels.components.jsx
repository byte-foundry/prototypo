import React from 'react';
import ReactDOM from 'react-dom';
import {DraggableCore} from 'react-draggable';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class ResizablePanels extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dragging: false,
			x: props.defaultX || null,
			y: props.defaultY || null,
		};

		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.handleDrag = _.throttle(this.handleDrag.bind(this), 50);
		this.updateHandlePosition = this.updateHandlePosition.bind(this);
	}

	handleDrag(e, {x, y}) {
		this.props.onChange(this.updateHandlePosition({x, y}));
	}

	updateHandlePosition({x, y}) {
		const {width, height} = ReactDOM.findDOMNode(this).getBoundingClientRect();
		const newPosition = {};

		if (typeof x === 'number') {
			newPosition.x = x / width * 100;
		}

		if (typeof y === 'number') {
			newPosition.y = y / height * 100;
		}

		this.setState(newPosition);

		return newPosition;
	}

	componentWillReceiveProps(nextProps) {
		if (
			(!this.state.x && nextProps.defaultX)
			|| (!this.state.y && nextProps.defaultY)
		) {
			this.setState({
				x: nextProps.defaultX,
				y: nextProps.defaultY,
			});
		}
	}

	preventSelection(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	render() {
		const {
			children: [firstChild, lastChild],
			direction = 'horizontal', property = 'width', defaultX, defaultY,
			style,
			onlyOne,
			onlyTwo,
			...rest,
		} = this.props;
		const isVertical = direction === 'vertical';
		const axis = isVertical ? 'x' : 'y';
		let handlePosition = {};

		if (this.state.x || this.state.y) {
			handlePosition = isVertical ? {
				left: `calc(${onlyOne ? 100 : onlyTwo ? 0 : this.state.x}% - 5px)`,
				top: '0',
			} : {
				left: '0',
				top: `calc(${onlyOne ? 0 : onlyTwo ? 100 : this.state.y}% - 5px)`,
			};
		}

		//TODO(franz): Display none when onlyone or onlytwo
		return (
			<div {...rest} style={{...style, position: 'relative'}}>
				{React.cloneElement(firstChild, {ref: 'firstChild', style: {...firstChild.props.style, display: onlyTwo ? 'none' : firstChild.props.display || 'flex', [property]: `${this.state[axis]}%`}})}
				<DraggableCore
					bounds="parent"
					axis={axis}
					onDrag={this.handleDrag}
					onStart={() => {this.setState({dragging: true}); document.addEventListener('selectstart', this.preventSelection);}}
					onStop={() => {this.setState({dragging: false}); document.removeEventListener('selectstart', this.preventSelection);}}
				>
					<div
						className={classNames('prototypo-panel-handle', {
							'vertical': isVertical,
							'dragging': this.state.dragging,
						})}
						style={handlePosition}
					>
						<div className="prototypo-panel-handle-bar" />
					</div>
				</DraggableCore>
				{React.cloneElement(lastChild, {style: {...lastChild.props.style, display: onlyOne ? 'none' : lastChild.props.display || 'flex', [property]: `${100 - this.state[axis]}%`}})}
			</div>
		);
	}
}
