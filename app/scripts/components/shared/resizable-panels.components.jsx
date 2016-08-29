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
			x: null,
			y: null,
		};

		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.handleDrag = _.throttle(this.handleDrag.bind(this), 50);
		this.updateHandlePosition = this.updateHandlePosition.bind(this);
	}

	handleDrag(e, {x, y}) {
		this.updateHandlePosition({x, y});
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
	}

	componentDidMount() {
		const {width, height} = ReactDOM.findDOMNode(this.refs.firstChild).getBoundingClientRect();

		this.updateHandlePosition(this.props.direction === 'vertical' ? {x: width} : {y: height});
	}

	preventSelection(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	render() {
		const {
			children: [firstChild, lastChild],
			direction = 'horizontal', property = 'width',
			style,
			...rest,
		} = this.props;
		const isVertical = direction === 'vertical';
		const axis = isVertical ? 'x' : 'y';
		let handlePosition = {};

		if (this.state.x || this.state.y) {
			handlePosition = isVertical ? {
				left: `calc(${this.state.x}% - 5px)`,
				top: '0',
			} : {
				left: '0',
				top: `calc(${this.state.y}% - 5px)`,
			};
		}

		return (
			<div {...rest} style={{...style, position: 'relative'}}>
				{React.cloneElement(firstChild, {ref: 'firstChild', style: {...firstChild.props.style, [property]: `${this.state[axis]}%`}})}
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
				{React.cloneElement(lastChild, {style: {...lastChild.props.style, [property]: `${100 - this.state[axis]}%`}})}
			</div>
		);
	}
}
