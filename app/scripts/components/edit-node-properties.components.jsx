import _get from 'lodash/get';
import React from 'react';

import {
	skeletonPosModification,
	changeGlyphManually,
	// handleModification,
} from './glyph-canvas.components';
import LocalClient from '../stores/local-client.stores';
import {toileType} from '../toile/toile';
import {
	normalize2D,
	subtract2D,
	add2D,
	mulScalar2D,
} from '../prototypo.js/utils/linear';

const formatDifference  = (number) => {
	console.log(number)
	if (number > 0) {
		return `+${number}`;
	}
	else return number;
}

class EditNodeProperties extends React.Component {
	constructor(props) {
		super(props);

		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		const {glyph, selectedItem: item} = this.props;
		const {target: {name, value}} = e;
		const node = _get(glyph, item.id);

		switch (item.type) {
		case toileType.NODE_OUT:
		case toileType.NODE_IN:
		case toileType.CONTOUR_NODE_OUT:
		case toileType.CONTOUR_NODE_IN:
			// handleModification(
			// 	LocalClient.instance(),
			// 	glyph,
			// 	item,
			// 	{
			// 		x: name === 'x' ? parseInt(value, 10) : node.x,
			// 		y: name === 'y' ? parseInt(value, 10) : node.y,
			// 	},
			// 	false, // unsmoothMod ?
			// 	true,
			// 	false,
			// );
			break;
		case toileType.NODE:
			// onCurveModification(
			// 	this.client,
			// 	glyph,
			// 	item,
			// 	modData,
			// 	appStateValue,
			// 	curveMode,
			// 	globalMode,
			// );
			break;
		case toileType.NODE_SKELETON:
		case toileType.CONTOUR_NODE:
			if (name === 'distr' || name === 'angle' || name === 'width') {
				const changes = {};

				if (name === 'distr') {
					const newDistr = parseFloat(value);
					const skelVec = normalize2D(subtract2D(node.expandedTo[1], node.expandedTo[0]));
					const newPosition = subtract2D(
						add2D(mulScalar2D(newDistr * node.expand.width, skelVec), node.expandedTo[0]),
						item.data.base,
					);

					changes[`${item.data.modifAddress}expand.distr`] = newDistr - node.expand.baseDistr;
					changes[`${item.data.modifAddress}x`] = newPosition.x;
					changes[`${item.data.modifAddress}y`] = newPosition.y;
				}
				else if (name === 'angle') {
					changes[`${item.data.modifAddress}expand.angle`] = parseFloat(value) * 2 * Math.PI / 360 - node.expand.baseAngle;
				}
				else if (name === 'width') {
					changes[`${item.data.modifAddress}expand.width`] = parseFloat(value) / node.expand.baseWidth;
				}

				changeGlyphManually(
					changes,
					glyph,
					LocalClient.instance(),
					false,
				);
			}
			else {
				skeletonPosModification(
					LocalClient.instance(),
					glyph,
					item,
					{
						x: name === 'x' ? parseInt(value, 10) : node.x,
						y: name === 'y' ? parseInt(value, 10) : node.y,
					},
					false,
				);
			}
			break;
		default:
			break;
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
				>
					<h4>Skeleton props</h4>
					<p><span>X</span><input type="number" name="x" onChange={this.handleInput} value={node.x} />
					({formatDifference(Math.round(node.x - node.xBase))})</p>
					<p><span>Y</span><input type="number" name="y" onChange={this.handleInput} value={node.y} />
					({formatDifference(Math.round(node.y - node.yBase))})</p>
					<h4>Expand props</h4>
					<p><span>Width</span><input type="number" name="width" onChange={this.handleInput} value={node.expand.width} />
					({formatDifference((node.expand.width - node.expand.baseWidth).toFixed(0))})</p>
					<p><span>Angle</span><input type="number" name="angle" onChange={this.handleInput} value={node.expand.angle / (2 * Math.PI) * 360} min={-180} max={180} />
					({formatDifference(((node.expand.angle - node.expand.baseAngle) / (2 * Math.PI) * 360).toFixed(0))})</p>
					<p><span>Distr</span><input type="number" name="distr" onChange={this.handleInput} value={node.expand.distr} min={0} max={1} step={0.1} />
					({formatDifference((node.expand.distr - node.expand.baseDistr).toFixed(2))})</p>
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
				>
					<h4>Contour props</h4>
					<p><span>X</span><input type="number" name="x" onChange={this.handleInput} value={node.x} />
					({formatDifference(Math.round(node.x - node.xBase))})</p>
					<p><span>Y</span><input type="number" name="y" onChange={this.handleInput} value={node.y} />
					({formatDifference(Math.round(node.y - node.yBase))})</p>
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
				>
					<h4>Handle props</h4>
					<p><span>Direction in</span>{Number.isNaN(parent.dirIn) ? '-' : parent.dirIn.toFixed(0)}</p>
					<p><span>Tension in</span>{Number.isNaN(parent.tensionIn) ? '-' : `${(parent.tensionIn + parent.baseTensionIn).toFixed(0)} (${parent.tensionIn.toFixed(0)})`}</p>
					<p><span>Direction out</span>{Number.isNaN(parent.dirOut) ? '-' : parent.dirOut.toFixed(0)}</p>
					<p><span>Tension out</span>{Number.isNaN(parent.tensionOut) ? '-' : `${(parent.tensionOut + parent.baseTensionOut).toFixed(0)} (${parent.tensionOut.toFixed(0)})`}</p>
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
				>
					<h4>Node props</h4>
					<p><span>X</span> <input type="number" name="x" onChange={this.handleInput} value={node.x} /></p>
					<p><span>Y</span><input type="number" name="y" onChange={this.handleInput} value={node.y} /></p>
					<h4>Expand props</h4>
					<p><span>Width</span>{parent.expand.width.toFixed(0)} ({formatDifference((parent.expand.width - parent.expand.baseWidth).toFixed(0))})</p>
					<p><span>Angle</span>{parent.expand.angle.toFixed(0)} ({formatDifference((parent.expand.angle - parent.expand.baseAngle).toFixed(0))})</p>
					<p><span>Distr</span>{parent.expand.distr.toFixed(2)} ({(formatDifference(parent.expand.distr - parent.expand.baseDistr).toFixed(2))})</p>
				</div>
			);
		}

		return null;
	}
}

export default EditNodeProperties;
