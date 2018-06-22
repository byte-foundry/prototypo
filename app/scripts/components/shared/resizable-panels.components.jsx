import _throttle from 'lodash/throttle';
import React from 'react';
import ReactDOM from 'react-dom';
import {DraggableCore} from 'react-draggable';
import classNames from 'classnames';

export default class ResizablePanels extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			dragging: false,
			x: props.defaultX || null,
			y: props.defaultY || null,
		};

		this.handleDrag = _throttle(this.handleDrag.bind(this), 50);
		this.updateHandlePosition = this.updateHandlePosition.bind(this);
	}

	handleDrag(e, {x, y}) {
		e.stopPropagation();
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
		return newPosition[this.props.direction === 'vertical' ? 'x' : 'y'];
	}

	preventSelection(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	render() {
		const {
			children: [firstChild, lastChild],
			direction = 'horizontal',
			property = 'width',
			defaultX,
			defaultY,
			style,
			onlyOne,
			onlyTwo,
			x,
			y,
			onChange,
			...rest
		} = this.props;
		const isVertical = direction === 'vertical';
		const axis = isVertical ? 'x' : 'y';
		let handlePosition = {};

		const realX = x || defaultX;
		const realY = y || defaultY;

		if (realX || realY) {
			handlePosition = isVertical
				? {
					left: `calc(${onlyOne ? 100 : onlyTwo ? 0 : realX}% - 5px)`,
					top: '0',
				}
				: {
					left: '0',
					top: `calc(${onlyOne ? 0 : onlyTwo ? 100 : realY}% - 5px)`,
				};
		}

		const realAxis = realX || realY;

		// TODO(franz): Display none when onlyone or onlytwo
		return (
			<div {...rest} style={{...style, position: 'relative'}}>
				{React.cloneElement(firstChild, {
					ref: 'firstChild',
					style: {
						...firstChild.props.style,
						display: onlyTwo ? 'none' : firstChild.props.display || 'flex',
						[property]: `${realAxis}%`,
					},
				})}
				<DraggableCore
					bounds="parent"
					axis={axis}
					onDrag={this.handleDrag}
					onStart={() => {
						this.setState({dragging: true});
						document.addEventListener('selectstart', this.preventSelection);
					}}
					onStop={() => {
						this.setState({dragging: false});
						document.removeEventListener('selectstart', this.preventSelection);
					}}
				>
					<div
						className={classNames('prototypo-panel-handle', {
							vertical: isVertical,
							dragging: this.state.dragging,
						})}
						style={handlePosition}
					>
						<div className="prototypo-panel-handle-bar" />
					</div>
				</DraggableCore>
				{React.cloneElement(lastChild, {
					style: {
						...lastChild.props.style,
						display: onlyOne ? 'none' : lastChild.props.display || 'flex',
						[property]: `${100 - realAxis}%`,
					},
				})}
			</div>
		);
	}
}
