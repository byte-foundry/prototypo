import React from 'react';
import LocalClient from '../../stores/local-client.stores.jsx';
import Toile,
{
	mState,
	toileType,
	appState,
	transformCoords,
	inverseProjectionMatrix,
	canvasMode,
	specialKey,
} from '../../toile/toile';

const raf = requestAnimationFrame || webkitRequestAnimationFrame;
const rafCancel = cancelAnimationFrame || webkitCancelAnimationFrame;
let rafId;

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
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillReceiveProps(nextProps) {
		const {glyphViewMatrix} = this.props;
		const nextGlyphViewMatrix = nextProps.glyphViewMatrix;

		console.log('new props');

		if (nextProps.canvasMode === 'move' && (
			glyphViewMatrix.t.x !== nextGlyphViewMatrix.t.x || glyphViewMatrix.t.y !== nextGlyphViewMatrix.t.y)) {
			const delta = {
				x: nextGlyphViewMatrix.t.x - glyphViewMatrix.t.x,
				y: nextGlyphViewMatrix.t.y - glyphViewMatrix.t.y,
			};

			console.log(delta);

			switch (this.type) {
			case 'image':
				this.setState({
					eyeX: this.state.eyeX - delta.x / this.state.zoom,
					eyeY: this.state.eyeY - delta.y / this.state.zoom,
					lastMouseX: this.state.lastMouseX - delta.x,
					lastMouseY: this.state.lastMouseY - delta.y,
					zoom: nextProps.glyphViewMatrix.z,
				});
				break;
			case 'font':
				this.setState({
					eyeX: this.state.eyeX + delta.x / this.state.zoom,
					eyeY: this.state.eyeY + delta.y / this.state.zoom,
					lastMouseX: this.state.lastMouseX + delta.x,
					lastMouseY: this.state.lastMouseY + delta.y,
					zoom: nextProps.glyphViewMatrix.z,
				});
				break;
			default:
				break;
			}
		}
	}

	async componentDidMount() {
		this.toile = new Toile(this.canvas);
		this.type = this.props.shadowFile.type;
		this.elem = this.props.shadowFile.elem;
		this.glyph = this.props.glyphSelected.name;
		this.toile.setCameraCenter({x: 0, y: 0}, 1, -this.canvas.clientHeight, this.canvas.clientWidth);

		switch (this.type) {
		case 'image':
			await this.loadImage();
			break;
		case 'font':
			await this.loadFont();
			break;
		default:
			break;
		}

		let appStateValue = appState.DEFAULT;
		let mouse = this.toile.getMouseState();
		let appMode = canvasMode.UNDEF;

		const rafFunc = () => {
			const height = this.canvas.clientHeight;
			const width = this.canvas.clientWidth;

			this.toile.clearCanvas(width, height);

			switch (this.props.canvasMode) {
			case 'move':
				appMode = canvasMode.MOVE;
				break;
			default:
				appMode = canvasMode.UNDEF;
				break;
			}

			mouse = this.toile.getMouseState();

			if (appMode === canvasMode.MOVE) {
				// when in move mode the only action possible is to move
				// this happen if mouse is in down state
				if (mouse.state === mState.DOWN) {
					appStateValue = appState.MOVING;
				}
				else {
					appStateValue = appState.DEFAULT;
				}
			}

			if (appStateValue & appState.MOVING) {
				const [z,,,, tx, ty] = this.toile.viewMatrix;
				const newTs = {
					x: tx + mouse.delta.x,
					y: ty + mouse.delta.y,
				};
			}

			this.toile.setCamera(this.props.glyphViewMatrix.t, this.props.glyphViewMatrix.z, -height, width);

			this.toile.drawText(`${this.glyph}`, {x: 0, y: 0}, 1000 * this.props.glyphViewMatrix.z, '#fc5454', 'shadowfont');
			rafId = raf(rafFunc);
		};

		rafId = raf(rafFunc);
	}

	componentWillUnmount() {
		rafCancel(rafId);
	}

	loadImage() {
		return new Promise((resolve) => {
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

				resolve();
			};
		});
	}

	loadFont() {
		return new Promise((resolve) => {
			const shadowFont = new FontFace('shadowfont', this.elem, {
				style: 'normal',
				weight: '400',
			});

			document.fonts.add(shadowFont);
			shadowFont.load();
			document.fonts.ready.then(() => {
				resolve();
			});
		});
	}

	drawOnCanvas() {
		const zoom = this.props.canvasMode === 'move' && this.type === 'font' ? this.state.glyphZoom : this.state.zoom;
		const viewW = this.canvasWidth;
		const viewH = this.canvasHeight;
		const srcWidth = viewW * this.state.zoom;
		const srcHeight = viewH * this.state.zoom;
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

	componentDidUpdate() {
		this.glyph = String.fromCharCode(this.props.glyphSelected.unicode);
	}

	render() {
		const canvas = this.props.canvasMode === 'shadow'
			? (
				<canvas
					className="prototypo-canvas-shadow-canvas"
					ref={(canvas) => {this.canvas = canvas;}}
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
				<canvas
					className="prototypo-canvas-shadow-canvas"
					ref={(canvas) => {this.canvas = canvas;}}
					width={this.props.width}
					height={this.props.height}
				/>
			);

		return canvas;
	}
}
