import React from 'react';

export default class CanvasShadow extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			zoom: 1,
			eyeX: 0,
			eyeY: 0,
			imageOriginalWidth: 0,
			imageOriginalHeight: 0,
			image: undefined,
			mouseDown: false,
			lastMouseX: 0,
			lastMouseY: 0,
		};
		this.loadImage = this.loadImage.bind(this);
		this.loadFont = this.loadFont.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
	}

	componentDidMount() {
		this.ctx = this.refs.canvas.getContext('2d');
		this.canvas = this.refs.canvas;
		this.canvasWidth = this.props.width;
		this.canvasHeight = this.props.height;
		this.type = this.props.shadowFile.type;
		this.elem = this.props.shadowFile.elem;
		this.glyph = this.props.glyphSelected.src.glyphName;

		switch (this.type) {
			case 'image':
				this.loadImage();
				break;
			case 'font':
				this.loadFont();
				break;
			default:
				break;
		}
	}

	loadImage() {
		const image = new Image();

		image.src = this.elem;
		image.onload = () => {
			this.setState({
				imageOriginalWidth: image.width,
				imageOriginalHeight: image.height,
				eyeX: -(this.canvasWidth / 2) + (image.width / 2),
				eyeY: -(this.canvasHeight / 2) + (image.height / 2),
				zoom: 1,
				image,
			});
		};
	}

	loadFont() {
			const shadowFont = new FontFace('shadowfont', this.elem, {
				style: 'normal',
				weight: '400',
			});

			document.fonts.add(shadowFont);
			shadowFont.load();
			document.fonts.ready.then(() => {
				this.setState({
					eyeX: this.canvasWidth / 2,
					eyeY: this.canvasHeight / 2,
					zoom: 1,
					shadowFont,
				});
			});
	}

	drawOnCanvas() {
		const viewW = this.canvasWidth;
		const viewH = this.canvasHeight;
		const srcWidth = viewW / this.state.zoom;
		const srcHeight = viewH / this.state.zoom;
		const viewCenterX = ((this.state.eyeX + viewW / 2) - (srcWidth / 2)).toFixed(2);
		const viewCenterY = ((this.state.eyeY + viewH / 2) - (srcHeight / 2)).toFixed(2);

		this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		switch (this.type) {
			case 'image':
				this.ctx.drawImage(this.state.image, viewCenterX, viewCenterY, srcWidth, srcHeight, 0, 0, viewW, viewH);
				break;
			case 'font':
				this.ctx.font = `${500 * this.state.zoom}px shadowfont`;
				this.ctx.fillText(`${this.glyph}`, viewCenterX, viewCenterY);
				break;
			default:
				break;
		}
	}

	onMouseMove(event) {
		if (this.state.mouseDown && (this.state.lastMouseX !== event.clientX || this.state.lastMouseY !== event.clientY)) {
			switch (this.type) {
				case 'image':
					this.setState({
						eyeX: this.state.lastMouseX === 0 ? this.state.lastMouseX : this.state.eyeX - (event.clientX - this.state.lastMouseX) / this.state.zoom,
						eyeY: this.state.lastMouseY === 0 ? this.state.lastMouseY : this.state.eyeY - (event.clientY - this.state.lastMouseY) / this.state.zoom,
						lastMouseX: event.clientX,
						lastMouseY: event.clientY,
					});
					break;
				case 'font':
					this.setState({
						eyeX: this.state.lastMouseX === 0 ? this.state.lastMouseX : this.state.eyeX + (event.clientX - this.state.lastMouseX) / this.state.zoom,
						eyeY: this.state.lastMouseY === 0 ? this.state.lastMouseY : this.state.eyeY + (event.clientY - this.state.lastMouseY) / this.state.zoom,
						lastMouseX: event.clientX,
						lastMouseY: event.clientY,
					});
					break;
				default:
					break;
			}
		}
	}

	onMouseWheel(event) {
		const zoom = this.state.zoom - event.deltaY / 1000;

		this.setState({
			zoom,
		});
	}

	onMouseDown() {
		this.setState({mouseDown: true, lastMouseX: event.clientX, lastMouseY: event.clientY});
	}

	onMouseUp() {
		this.setState({mouseDown: false, lastMouseX: 0, lastMouseY: 0});
	}

	onDoubleClick() {
		switch (this.type) {
			case 'image':
				this.setState({
					zoom: 1,
					eyeX: -(this.canvasWidth / 2) + (this.state.imageOriginalWidth / 2),
					eyeY: -(this.canvasHeight / 2) + (this.state.imageOriginalHeight / 2),
					lastMouseX: 0,
					lastMouseY: 0,
				});
				break;
			case 'font':
				this.setState({
					zoom: 1,
					eyeX: (this.canvasWidth / 2),
					eyeY: (this.canvasHeight / 2),
					lastMouseX: 0,
					lastMouseY: 0,
				});
				break;
			default:
				break;
		}
	}

	onKeyUp(e) {
		if (e.keyCode === 83) {
			console.log('bite');
			this.client.dispatchAction('/toggle-canvas-mode');
		}
	}

	componentDidUpdate() {
		this.glyph = this.props.glyphSelected.src.glyphName;
		this.drawOnCanvas();
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
				onKeyUp={this.onKeyUp}
				width={this.props.width}
				height={this.props.height}
				/>
		)
		: (
			<canvas className="prototypo-canvas-shadow-canvas nointeraction"
				ref="canvas"
				width={this.props.width}
				height={this.props.height}
				onKeyUp={this.onKeyUp}
				/>
		);

		return canvas;
	}
}
