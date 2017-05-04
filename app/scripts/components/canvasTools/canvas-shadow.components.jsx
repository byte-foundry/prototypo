import React from 'react';
import {findDOMNode} from 'react-dom';

export default class CanvasShadow extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			zoom: 1,
			eyeX: 0,
			eyeY: 0,
			imageWidth: 0,
			imageHeight: 0,
			imageOriginalWidth: 0,
			imageOriginalHeight: 0,
			image: undefined,
			mouseDown: false,
			lastMouseX: 0,
			lastMouseY: 0,
		};
		this.drawImage = this.drawImage.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	componentDidMount() {
		this.ctx = this.refs.canvas.getContext('2d');
		this.canvas = this.refs.canvas;
		this.canvasWidth = this.props.width;
		this.canvasHeight = this.props.height;
		const image = new Image();

		image.src = this.props.shadowFile;
		image.onload = () => {
			this.setState({
				imageWidth: image.width,
				imageHeight: image.height,
				imageOriginalWidth: image.width,
				imageOriginalHeight: image.height,
				eyeX: -(this.canvasWidth / 2) + (image.width / 2),
				eyeY: -(this.canvasHeight / 2) + (image.height / 2),
				zoom: 1,
				image,
			});
		};
	}

	drawImage() {
		const viewW = this.canvasWidth;
		const viewH = this.canvasHeight;
		const srcWidth = viewW / this.state.zoom;
		const srcHeight = viewH / this.state.zoom;
		const viewCenterX = ((this.state.eyeX + viewW / 2) - (srcWidth / 2)).toFixed(2);
		const viewCenterY = ((this.state.eyeY + viewH / 2) - (srcHeight / 2)).toFixed(2);

		this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.ctx.drawImage(this.state.image, viewCenterX, viewCenterY, srcWidth, srcHeight, 0, 0, viewW, viewH);
	}

	onMouseMove(event) {
		if (this.state.mouseDown && (this.state.lastMouseX !== event.clientX || this.state.lastMouseY !== event.clientY)) {
			this.setState({
				eyeX: this.state.lastMouseX === 0 ? this.state.lastMouseX : this.state.eyeX - (event.clientX - this.state.lastMouseX),
				eyeY: this.state.lastMouseY === 0 ? this.state.lastMouseY : this.state.eyeY - (event.clientY - this.state.lastMouseY),
				lastMouseX: event.clientX,
				lastMouseY: event.clientY,
			});
		}
	}

	onMouseWheel(event) {
		this.setState({zoom: this.state.zoom - event.deltaY / 1000})
	}

	onMouseDown() {
		this.setState({mouseDown: true, lastMouseX: event.clientX, lastMouseY: event.clientY});
	}

	onMouseUp() {
		this.setState({mouseDown: false, lastMouseX: 0, lastMouseY: 0});
	}

	onDoubleClick() {
		this.setState({
			zoom: 1,
			eyeX: -(this.canvasWidth / 2) + (this.state.imageOriginalWidth / 2),
			eyeY: -(this.canvasHeight / 2) + (this.state.imageOriginalHeight / 2),
			lastMouseX: 0,
			lastMouseY: 0,
		});
	}

	componentDidUpdate() {
		this.drawImage();
	}

	render() {
		const canvas = this.props.canvasMode === 'shadow'
		? (
			<canvas className="prototypo-canvas-shadow-canvas"
				ref="canvas"
				onMouseMove={this.onMouseMove}
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseUp}
				onWheel={this.onMouseWheel}
				onDoubleClick={this.onDoubleClick}
				width={this.props.width}
				height={this.props.height}
				/>
		)
		: (
			<canvas className="prototypo-canvas-shadow-canvas nointeraction"
				ref="canvas"
				width={this.props.width}
				height={this.props.height}
				/>
		);

		return canvas;
	}
}
