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
					style={{
						position: 'absolute',
						left: '20px',
						top: '70px',
						zIndex: '3',
					}}
				>
					Skeleton node props<br />
					x: <input type="number" name="x" onChange={this.handleInput} value={node.x} />
					({Math.round(node.x - node.xBase)})
					<br />
					y: <input type="number" name="y" onChange={this.handleInput} value={node.y} />
					({Math.round(node.y - node.yBase)})
					<br />
					Skeleton expand props<br />
					width: <input type="number" name="width" onChange={this.handleInput} value={node.expand.width} />
					({(node.expand.width - node.expand.baseWidth).toFixed(1)})<br />
					angle: <input type="number" name="angle" onChange={this.handleInput} value={node.expand.angle / (2 * Math.PI) * 360} min={-180} max={180} />
					({((node.expand.angle - node.expand.baseAngle) / (2 * Math.PI) * 360).toFixed(2)})<br />
					distr: <input type="number" name="distr" onChange={this.handleInput} value={node.expand.distr} min={0} max={1} step={0.1} />
					({(node.expand.distr - node.expand.baseDistr).toFixed(2)})
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
				>
					Contour node props<br />
					x: <input type="number" name="x" onChange={this.handleInput} value={node.x} />
					({Math.round(node.x - node.xBase)})
					<br />
					y: <input type="number" name="y" onChange={this.handleInput} value={node.y} />
					({Math.round(node.y - node.yBase)})
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
				>
					Handle props<br />
					direction in: {Number.isNaN(parent.dirIn) ? '-' : parent.dirIn.toFixed(2)}<br />
					tension in: {Number.isNaN(parent.tensionIn) ? '-' : `${(parent.tensionIn + parent.baseTensionIn).toFixed(2)} (${parent.tensionIn.toFixed(2)})`}<br />
					direction out: {Number.isNaN(parent.dirOut) ? '-' : parent.dirOut.toFixed(2)}<br />
					tension in: {Number.isNaN(parent.tensionOut) ? '-' : `${(parent.tensionOut + parent.baseTensionOut).toFixed(2)} (${parent.tensionOut.toFixed(2)})`}
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
				>
					Node props<br />
					x: <input type="number" name="x" onChange={this.handleInput} value={node.x} /><br />
					y: <input type="number" name="y" onChange={this.handleInput} value={node.y} />
					<br />
					Skeleton expand props<br />
					width: {parent.expand.width.toFixed(1)} ({(parent.expand.width - parent.expand.baseWidth).toFixed(1)})<br />
					angle: {parent.expand.angle.toFixed(2)} ({(parent.expand.angle - parent.expand.baseAngle).toFixed(2)})<br />
					distr: {parent.expand.distr.toFixed(2)} ({(parent.expand.distr - parent.expand.baseDistr).toFixed(2)})
				</div>
			);
		}

		return null;
	}
}

export default EditNodeProperties;
