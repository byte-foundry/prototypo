import _get from 'lodash/get';
import React from 'react';

import LocalClient from '../stores/local-client.stores';
import {toileType} from '../toile/toile';

const formatDifference = (number) => {
	if (number > 0) {
		return `+${number}`;
	}
	return number;
};

class EditNodeProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleInput = this.handleInput.bind(this);
		this.savePrevValue = this.savePrevValue.bind(this);
		this.previousInput = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentWillReceiveProps(nextProps) {
		const {glyph, selectedItem: item} = nextProps;
		const node = _get(glyph, item.id);

		if (
			![
				toileType.NODE_SKELETON,
				toileType.CONTOUR_NODE,
				toileType.NODE_OUT,
				toileType.NODE_IN,
				toileType.CONTOUR_NODE_OUT,
				toileType.CONTOUR_NODE_IN,
				toileType.NODE,
			].includes(item.type)
		) {
			return;
		}

		if (
			node.x.toFixed(0) !== this.state.x
			&& node.x.toFixed(0) !== this.previousInput.x
		) {
			this.setState({
				x: node.x.toFixed(0),
			});
		}
		if (
			node.y.toFixed(0) !== this.state.y
			&& node.y.toFixed(0) !== this.previousInput.y
		) {
			this.setState({
				y: node.y.toFixed(0),
			});
		}
		if (node.expand) {
			const angleInDeg = (node.expand.angle / Math.PI * 180).toFixed(0);

			if (
				angleInDeg !== this.state.angle
				&& angleInDeg !== this.previousInput.angle
			) {
				this.setState({
					angle: angleInDeg,
				});
			}
			if (
				node.expand.width.toFixed(0) !== this.state.width
				&& node.expand.width.toFixed(0) !== this.previousInput.width
			) {
				this.setState({
					width: node.expand.width.toFixed(0),
				});
			}
			if (
				node.expand.distr.toFixed(1) !== this.state.distr
				&& node.expand.distr.toFixed(1) !== this.previousInput.distr
			) {
				this.setState({
					distr: node.expand.distr.toFixed(1),
				});
			}
		}
	}

	stopPropagation(e) {
		e.stopPropagation();
		e.nativeEvent.stopPropagation();
	}

	savePrevValue(e) {
		this.previousInput[e.target.name] = e.target.value;
	}

	handleInput(e) {
		const {glyph, selectedItem: item} = this.props;
		const {target: {name, value}} = e;
		const node = _get(glyph, item.id);

		if (name === 'x' || name === 'y') {
			const modData = {
				x: name === 'x' ? parseInt(value, 10) : node.x,
				y: name === 'y' ? parseInt(value, 10) : node.y,
			};

			this.client.dispatchAction('/store-value-font', {
				inputGlyphInteraction: {
					modData,
				},
			});
			this.setState({
				[name]: e.target.value,
			});
		}
		else {
			const modData = {
				angle:
					name === 'angle'
						? parseFloat(value, 10) / 180 * Math.PI - item.data.baseAngle
						: node.expand.angle,
				width:
					name === 'width'
						? parseInt(value, 10) / item.data.baseWidth
						: node.expand.width,
				distr:
					name === 'distr'
						? parseFloat(value, 10) - item.data.baseDistr
						: node.expand.distr,
				x: name === 'x' ? parseInt(value, 10) : node.x,
				y: name === 'y' ? parseInt(value, 10) : node.y,
			};

			this.client.dispatchAction('/store-value-font', {
				inputGlyphInteraction: {
					modData,
					type: name,
				},
			});

			this.setState({
				[name]: e.target.value,
			});
		}
	}

	render() {
		const {glyph, selectedItem} = this.props;
		const {id, type, data} = selectedItem;

		const node = _get(glyph, id);
		const parent = _get(glyph, data.parentId);

		if (type === toileType.NODE_SKELETON) {
			return (
				<div
					className="node-properties skeleton"
					style={{
						position: 'absolute',
						left: '20px',
						top: '70px',
						zIndex: '3',
					}}
					onKeyUp={this.stopPropagation}
					onKeyDown={this.stopPropagation}
				>
					<h4>Skeleton props</h4>
					<p>
						<span>X</span>
						<input
							type="number"
							key="x"
							name="x"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={this.state.x}
						/>
						({formatDifference(Math.round(node.x - node.xBase))})
					</p>
					<p>
						<span>Y</span>
						<input
							type="number"
							name="y"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={this.state.y}
						/>
						({formatDifference(Math.round(node.y - node.yBase))})
					</p>
					<h4>Expand props</h4>
					<p>
						<span>Width</span>
						<input
							type="number"
							name="width"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={this.state.width}
						/>
						({formatDifference(
							(node.expand.width - node.expand.baseWidth).toFixed(
								0,
							),
						)})
					</p>
					<p>
						<span>Angle</span>
						<input
							type="number"
							name="angle"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={this.state.angle}
							min={-180}
							max={180}
						/>
						({formatDifference(
							(
								(node.expand.angle - node.expand.baseAngle)
								/ Math.PI
								* 180
							).toFixed(0),
						)})
					</p>
					<p>
						<span>Distr</span>
						<input
							type="number"
							name="distr"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={this.state.distr}
							min={0}
							max={1}
							step={0.1}
						/>
						({formatDifference(
							(node.expand.distr - node.expand.baseDistr).toFixed(
								2,
							),
						)})
					</p>
				</div>
			);
		}
		else if (type === toileType.CONTOUR_NODE) {
			return (
				<div
					style={{
						position: 'absolute',
						left: '20px',
						top: '70px',
						zIndex: '3',
					}}
					className="node-properties contour"
					onKeyUp={this.stopPropagation}
					onKeyDown={this.stopPropagation}
				>
					<h4>Contour props</h4>
					<p>
						<span>X</span>
						<input
							type="number"
							name="x"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={node.x}
						/>
						({formatDifference(Math.round(node.x - node.xBase))})
					</p>
					<p>
						<span>Y</span>
						<input
							type="number"
							name="y"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={node.y}
						/>
						({formatDifference(Math.round(node.y - node.yBase))})
					</p>
				</div>
			);
		}
		else if (
			type === toileType.NODE_OUT
			|| type === toileType.NODE_IN
			|| type === toileType.CONTOUR_NODE_OUT
			|| type === toileType.CONTOUR_NODE_IN
		) {
			return (
				<div
					style={{
						position: 'absolute',
						left: '20px',
						top: '70px',
						zIndex: '3',
					}}
					className="node-properties handle"
					onKeyUp={this.stopPropagation}
					onKeyDown={this.stopPropagation}
				>
					<h4>Handle props</h4>
					<p>
						<span>Direction in</span>
						{Number.isNaN(parent.dirIn)
							? '-'
							: parent.dirIn.toFixed(0)}
					</p>
					<p>
						<span>Tension in</span>
						{Number.isNaN(parent.tensionIn)
							? '-'
							: `${(
								parent.tensionIn + parent.baseTensionIn
							).toFixed(0)} (${parent.tensionIn.toFixed(0)})`}
					</p>
					<p>
						<span>Direction out</span>
						{Number.isNaN(parent.dirOut)
							? '-'
							: parent.dirOut.toFixed(0)}
					</p>
					<p>
						<span>Tension out</span>
						{Number.isNaN(parent.tensionOut)
							? '-'
							: `${(
								parent.tensionOut + parent.baseTensionOut
							).toFixed(0)} (${parent.tensionOut.toFixed(
								0,
							)})`}
					</p>
				</div>
			);
		}
		else if (type === toileType.NODE) {
			return (
				<div
					style={{
						position: 'absolute',
						left: '20px',
						top: '70px',
						zIndex: '3',
					}}
					className="node-properties node"
					onKeyUp={this.stopPropagation}
					onKeyDown={this.stopPropagation}
				>
					<h4>Node props</h4>
					<p>
						<span>X</span>{' '}
						<input
							type="number"
							name="x"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={this.state.x}
						/>
					</p>
					<p>
						<span>Y</span>
						<input
							type="number"
							name="y"
							onKeyDown={this.savePrevValue}
							onChange={this.handleInput}
							value={this.state.y}
						/>
					</p>
					<h4>Expand props</h4>
					<p>
						<span>Width</span>
						{parent.expand.width.toFixed(0)} ({formatDifference(
							(
								parent.expand.width - parent.expand.baseWidth
							).toFixed(0),
						)})
					</p>
					<p>
						<span>Angle</span>
						{(parent.expand.angle / Math.PI * 180).toFixed(
							0,
						)} ({formatDifference(
							(
								(parent.expand.angle
									- parent.expand.baseAngle)
								/ Math.PI
								* 180
							).toFixed(0),
						)})
					</p>
					<p>
						<span>Distr</span>
						{parent.expand.distr.toFixed(2)} ({formatDifference(
							(
								parent.expand.distr - parent.expand.baseDistr
							).toFixed(2),
						)})
					</p>
				</div>
			);
		}

		return null;
	}
}

export default EditNodeProperties;
