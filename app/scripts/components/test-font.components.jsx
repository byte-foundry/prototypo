/*global _, webkitRequestAnimationFrame */
import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar';
import InputRange from 'react-input-range';

import Toile, {mState} from '../toile/toile.js';

import LocalClient from '../stores/local-client.stores.jsx';


export default class TestFont extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {glyph: 'A_cap', solved: [], values: {}, workers: Array(4).fill(false)};

		this.changeParam = this.changeParam.bind(this);
		this.download = this.download.bind(this);

	}

	componentWillMount() {
		pleaseWait.instance.finish();
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState(head.toJS().d);
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					workers: head.toJS().d.workers,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					values: head.toJS().d.controlsValues,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentDidMount() {
		this.toile = new Toile(this.canvas);
		this.toile.setCamera({x: 0, y: 0}, 1, this.canvas.height);

		const raf = requestAnimationFrame || webkitRequestAnimationFrame;
		const rafFunc = () => {
			const {width, height} = this.canvas;
			const mouse = this.toile.getMouseState();

			this.setState({
				mouse,
			});

			if (mouse.state === mState.DOWN && this.state.font.glyphs[this.state.glyph]) {
				const [,,,, tx, ty] = this.toile.viewMatrix;
				const newTs = {
					x: tx + mouse.delta.x,
					y: ty + mouse.delta.y,
				};

				this.toile.clearDelta();
				this.toile.setCamera(newTs, 1, height);
				this.toile.clearCanvas(width, height);
				this.toile.drawGlyph(this.state.font.glyphs[this.state.glyph]);
			}
			raf(rafFunc);
		};

		raf(rafFunc);
	}

	changeParam(param) {
		return (e) => {
			const params = {
				values: {
					...this.state.values,
					[param]: parseFloat(e),
					trigger: false,
				},
				demo: true,
			};

			this.client.dispatchAction('/change-param', params);
		};
	}

	download() {
		const params = {
			values: {
				...this.state.values,
				trigger: true,
			},
			demo: true,
		};

		this.client.dispatchAction('/change-param', params);
	}

	render() {
		let list;

		if (this.state.typedata) {
			list = _.map(Object.keys(this.state.typedata.glyphs), (glyphName) => {
				return (
					<div
						style={{
							width: '50px',
							height: '50px',
							border: 'solid 1px #333333',
							background: this.state.solved.indexOf(glyphName) === -1
								? '#e98734'
								: '#24d390',
						}}
						onClick={
							() => {
								this.setState({glyph: glyphName, values: {...this.state.values}});
							}}
					>
						{String.fromCharCode(this.state.typedata.glyphs[glyphName].unicode)}
					</div>
				);
			});
		}
		else {
			list = null;
		}

		return (
			<div style={{display: 'flex', height: '100%'}}>
				<div style={{position: 'fixed', bottom: '10px', left: '10px', background: '#24d390', color: '#fefefe'}}>
					{JSON.stringify(this.state.mouse)}
					<div style={{display: 'flex', flexDirection: 'column'}}>
						{(() => {
							return _.map(this.state.workers, (worker) => {
								return <div style={{width: '100%', marginBottom: '2px', height: '5px', background: worker ? 'red' : 'green'}}></div>;
							});
						})()}
					</div>
				</div>
				<div>
					<canvas
						id="hello"
						ref={(canvas) => {this.canvas = canvas;}}
						width="1000"
						height="1000">
					</canvas>
				</div>
				<div style={{height: '100%', display: 'flex', 'flex-direction': 'column'}}>
					<div style={{'height': '200px'}}>
						<ScrollArea horizontal={false}>
							<div style={{display: 'flex', 'flex-flow': 'row wrap'}}>
								{list}
							</div>
						</ScrollArea>
					</div>
					<InputRange minValue="0" maxValue="200" value={this.state.values.thickness} onChange={this.changeParam('thickness')}/>
					<InputRange minValue="0" maxValue="200" value={this.state.values.serifWidth} onChange={this.changeParam('serifWidth')}/>
					<InputRange minValue="0" maxValue="200" value={this.state.values.serifHeight} onChange={this.changeParam('serifHeight')}/>
					<InputRange minValue="0" maxValue="200" value={this.state.values.serifCurve} onChange={this.changeParam('serifCurve')}/>
					<div style={{fontFamily: 'Prototypo web font', fontSize: '70px', wordWrap: 'break-word', width: '900px'}}>abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
					<button onClick={this.download}>Download</button>
				</div>
			</div>
		);
	}
}
