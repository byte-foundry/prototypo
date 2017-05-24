import React from 'react';
import LocalClient from '../../stores/local-client.stores.jsx';

export default class CanvasShadow extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			zoom: 1,
			eyeX: 0,
			eyeY: 0,
			tX: 0,
			tY: 0,
			imageOriginalWidth: 0,
			imageOriginalHeight: 0,
			image: undefined,
			mouseDown: false,
			lastMouseX: 0,
			lastMouseY: 0,
			glyphZoom: 1,
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
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillReceiveProps(nextProps) {
		const {glyphViewMatrix} = this.props;
		const nextGlyphViewMatrix = nextProps.glyphViewMatrix;
		console.log('new props');

		if (nextProps.canvasMode === 'move' && (
			glyphViewMatrix.matrix._tx !== nextGlyphViewMatrix.matrix._tx || glyphViewMatrix.matrix._ty !== nextGlyphViewMatrix.matrix._ty)) {
			const {delta} = nextProps.glyphViewMatrix;
			console.log(delta);

			switch (this.type) {
				case 'image':
					this.setState({
						eyeX: this.state.eyeX - delta.x / this.state.zoom,
						eyeY: this.state.eyeY - delta.y / this.state.zoom,
						lastMouseX: this.state.lastMouseX - delta.x,
						lastMouseY: this.state.lastMouseY - delta.y,
						glyphZoom: nextProps.glyphViewMatrix.matrix._owner.zoom,
					});
					break;
				case 'font':
					this.setState({
						eyeX: this.state.eyeX + delta.x / this.state.zoom,
						eyeY: this.state.eyeY + delta.y / this.state.zoom,
						lastMouseX: this.state.lastMouseX + delta.x,
						lastMouseY: this.state.lastMouseY + delta.y,
						glyphZoom: nextProps.glyphViewMatrix.matrix._owner.zoom,
					});
					break;
				default:
					break;
			}
		}
	}

	componentDidMount() {
		this.ctx = this.refs.canvas.getContext('2d');
		this.canvas = this.refs.canvas;
		this.canvasWidth = this.props.width;
		this.canvasHeight = this.props.height;
		this.type = this.props.shadowFile.type;
		this.elem = this.props.shadowFile.elem;
		this.glyph = this.props.glyphSelected.src.glyphName;

		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);

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

	componentWillUnmount() {
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
	}

	loadImage() {
		const image = new Image();

		image.src = this.elem;
		image.onload = () => {
			const eyeX = -(this.canvasWidth / 2) + (image.width / 2);
			const eyeY = -(this.canvasHeight / 2) + (image.height / 2);

		    this.setState({
		      imageOriginalWidth: image.width,
		      imageOriginalHeight: image.height,
		      eyeX,
		      eyeY,
			  lastMouseX: eyeX,
			  lastMouseY: eyeY,
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

			this.ctx.font = `${500 * this.state.zoom}px shadowfont`;
			const size = this.ctx.measureText(`${this.glyph}`);

			document.fonts.add(shadowFont);
			shadowFont.load();
			document.fonts.ready.then(() => {
				const eyeX = (this.canvasWidth / 2) - (size.width / 2);
				const eyeY = (this.canvasHeight / 2) + (250 * this.state.zoom / 2);
				this.setState({
					eyeX,
					eyeY,
					zoom: 1,
					shadowFont,
					lastMouseX: eyeX,
					lastMouseY: eyeY,
				});
			});
	}

	drawOnCanvas() {
		const zoom = this.props.canvasMode === 'move' && this.type === 'font' ? this.state.glyphZoom : this.state.zoom;
		const viewW = this.canvasWidth;
		const viewH = this.canvasHeight;
		const srcWidth = viewW / this.state.zoom;
		const srcHeight = viewH / this.state.zoom;
		const viewCenterX = ((this.state.eyeX + viewW / 2) - (srcWidth / 2)).toFixed(2);
		const viewCenterY = ((this.state.eyeY + viewH / 2) - (srcHeight / 2)).toFixed(2);

		this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		switch (this.type) {
			case 'image':
				if (!this.state.image) {
					break;
				}
			    this.ctx.drawImage(this.state.image, viewCenterX, viewCenterY, srcWidth, srcHeight, 0, 0, viewW, viewH);
			    break;
			case 'font':
				this.ctx.font = `${500 * this.state.zoom}px shadowfont`;
				this.ctx.fillStyle = '#fc5454';
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
					eyeX: (this.canvasWidth / 2) - (this.state.imageOriginalWidth / 2),
					eyeY: (this.canvasHeight / 2) - (this.state.imageOriginalHeight / 2),
					lastMouseX: 0,
					lastMouseY: 0,
				});
				break;
			case 'font':
				const size = this.ctx.measureText(`${this.glyph}`);
				const eyeX = (this.canvasWidth / 2) - (size.width / 2);
				const eyeY = (this.canvasHeight / 2) + (250 * this.state.zoom / 2);
				this.setState({
					eyeX,
					eyeY,
					zoom: 1,
					lastMouseX: eyeX,
					lastMouseY: eyeY,
				});
				break;
			default:
				break;
		}
	}

	onKeyUp(e) {
		if (e.keyCode === 83) {
			e.preventDefault();
			e.stopPropagation();
			this.client.dispatchAction('/toggle-canvas-mode');
		}
		if (e.keyCode === 32) {
			e.preventDefault();
			e.stopPropagation();
			this.client.dispatchAction('/toggle-canvas-mode', {canvasMode: 'shadow'});
		}
	}

	onKeyDown(e) {
		if (e.keyCode === 32) {
			e.preventDefault();
			e.stopPropagation();
			this.client.dispatchAction('/toggle-canvas-mode', {canvasMode: 'move'});
		}
	}

	componentDidUpdate() {
		this.glyph = String.fromCharCode(this.props.glyphSelected.src.unicode);
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
				width={this.props.width}
				height={this.props.height}
				/>
		)
		: (
			<canvas className="prototypo-canvas-shadow-canvas"
				ref="canvas"
				width={this.props.width}
				height={this.props.height}
				/>
		);

		return canvas;
	}
}
