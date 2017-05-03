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
		this.canvasWidth = this.refs.canvas.getBoundingClientRect().width;
		this.canvasHeight = this.refs.canvas.getBoundingClientRect().height;
		const image = new Image();

		image.src = this.props.shadowFile;
		image.onload = () => {
			this.setState({
				imageWidth: image.width,
				imageHeight: image.height,
				eyeX: this.canvasWidth / 2,
				eyeY: this.canvasHeight / 2,
				image,
			});
		};
	}

	drawImage() {
		this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.ctx.drawImage(
			this.state.image,
			-this.state.eyeX * this.state.zoom + this.state.imageWidth / 2,
			-this.state.eyeY * this.state.zoom + this.state.imageHeight / 2,
			this.state.imageWidth * this.state.zoom,
			this.state.imageHeight * this.state.zoom,
		);
	}

	onMouseMove(event) {
		if (this.state.mouseDown) {
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
			eyeX: this.canvasWidth / 2,
			eyeY: this.canvasWidth / 2,
			lastMouseX: 0,
			lastMouseY: 0,
		});
	}

	componentDidUpdate() {
		this.drawImage();
	}

	render() {
		return (
			<canvas className="prototypo-canvas-shadow-image"
				ref="canvas"
				onMouseMove={this.onMouseMove}
				onMouseDown={this.onMouseDown}
				onMouseUp={this.onMouseUp}
				onWheel={this.onMouseWheel}
				onDoubleClick={this.onDoubleClick}
				/>
		);
	}
}
