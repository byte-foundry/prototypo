/* eslint-disable no-param-reassign, no-bitwise */
import _find from 'lodash/find';
import _slice from 'lodash/slice';
import _flatten from 'lodash/flatten';
import _reduce from 'lodash/reduce';

import {distance2D, subtract2D, add2D, mulScalar2D, normalize2D} from '../prototypo.js/utils/linear';
import {getIntersectionTValue, getPointOnCurve} from '../prototypo.js/utils/updateUtils';
import DOM from '../helpers/dom.helpers';

export const mState = {
	DOWN: 0,
	UP: 1,
};

export const toileType = {
	NODE: 0,
	NODE_IN: 1,
	NODE_OUT: 2,
	NODE_SKELETON: 3,
	CONTOUR_NODE: 4,
	CONTOUR_NODE_IN: 5,
	CONTOUR_NODE_OUT: 6,
	GLYPH_CONTOUR: 7,
	GLYPH_COMPONENT_CONTOUR: 8,
	COMPONENT_CHOICE: 9,
	COMPONENT_NONE_CHOICE: 10,
	COMPONENT_MENU_ITEM: 11,
	COMPONENT_MENU_ITEM_CLASS: 12,
	COMPONENT_MENU_ITEM_CENTER: 13,
	SPACING_HANDLE: 14,
	PERF_RECT: 15,
};

export const canvasMode = {
	UNDEF: -1,
	MOVE: 0,
	SELECT_POINTS: 1,
	COMPONENTS: 2,
	SHADOW: 3,
};

export const specialKey = {
	CTRL: 0b1,
	SHIFT: 0b10,
	ALT: 0b100,
	META: 0b1000,
};

export const appState = {
	DEFAULT:	0,
	BOX_SELECTING:	0b1,
	POINTS_SELECTED:	0b10,
	DRAGGING_POINTS:	0b100,
	POINTS_SELECTED_SHIFT:	0b1000,
	CONTOUR_SELECTED:	0b10000,
	DRAGGING_CONTOUR_POINT:	0b100000,
	CONTOUR_POINT_SELECTED:	0b1000000,
	DRAGGING_CONTOUR:	0b10000000,
	SKELETON_POINT_SELECTED:	0b100000000,
	SKELETON_POINT_SELECTED_SHIFT:	0b1000000000,
	ZOOMING:	0b10000000000,
	MOVING:	0b100000000000,
	COMPONENT_HOVERED:	0b1000000000000,
	COMPONENT_MENU_HOVERED:	0b10000000000000,
	DRAGGING_SPACING:	0b100000000000000,
	SPACING_SELECTED:	0b1000000000000000,
};

const green = '#24d390';
const blue = '#00c4d6';
const darkBlue = '#00a4b2'; // eslint-disable-line no-unused-vars
const yellow = '#f5e462';
const grey = '#3b3b3b';
const darkestGrey = '#333333';
const mediumGrey = '#7e7e7e';
const lightGrey = '#c6c6c6';
const lightestGrey = '#f6f6f6';
const white = '#fefefe';
const red = '#ff725e';

const transparent = 'transparent';
const inHandleColor = red;
const outHandleColor = red;
const onCurveColor = blue;
const skeletonColor = green;
const ringBackground = 'rgba(255,114,94,0.4)';
const nodePropertyBackground = 'rgba(198, 198, 198, 0.4)';
const baseSpaceHandleColor = 'rgba(255, 0, 255, 0.3)';
const frameBackground = 'rgba(0, 0, 0, 0.036)';

const pointMenuAnimationLength = 10;
const componentMenuAnimationLength = 20;
const menuMass = 0.5;
const pixelPerMeter = 500;

const nodeDrawRadius = 3;
const nodeHotDrawRadius = 3;
const nodeHotRadius = 6;
const componentHotRadius = 50; // eslint-disable-line no-unused-vars

const labelForMenu = {
	[toileType.NODE]: 'On curve control point',
	[toileType.NODE_IN]: 'Handle in',
	[toileType.NODE_OUT]: 'Handle out',
	[toileType.NODE_SKELETON]: 'Skeleton control point',
};
const menuTextSize = 30;
const propsTextSize = 21;
const componentMenuTextSize = 12;
const componentMenuWidth = 70;
const componentMenuInfluenceRadius = 100;
const componentMenuNoneRadius = 20;
const componentLeashDistance = 50;
const spacingInfluence = 5;

const infinityDistance = 10000000;

export function inverseProjectionMatrix([a, b, c, d, e, f]) {
	return [
		1 / a,
		b,
		c,
		1 / d,
		-e / a,
		-f / d,
	];
}

export function transformCoords(coordsArray, matrix, height) {
	const [a, b, c, d, tx, ty] = matrix;

	return coordsArray.map(coords =>
		({
			x: (a * coords.x) + (b * coords.y) + tx,
			y: (c * coords.x) + (d * coords.y) + (ty - height),
		}));
}

export default class Toile {
	constructor(canvas) {
		if (canvas) {
			this.context = canvas.getContext('2d');
			this.mouse = {x: 0, y: 0};
			this.mouseDelta = {x: 0, y: 0};
			this.height = canvas.height;
			this.mouseWheelDelta = 0;
			this.keyboardUp = {};
			this.keyboardDown = {};
			this.keyboardDownRisingEdge = {};

			canvas.addEventListener('mousemove', (e) => {
				const {offsetLeft, offsetTop} = DOM.getAbsOffset(canvas);
				const mouseX = e.clientX - offsetLeft;
				const mouseY = e.clientY - offsetTop;

				if (this.mouseState === mState.DOWN) {
					this.mouseDelta = {
						x: this.mouseDelta.x + (mouseX - this.mouse.x),
						y: this.mouseDelta.y + (mouseY - this.mouse.y),
					};
				}

				this.mouse = {
					x: mouseX,
					y: mouseY,
				};
			});

			canvas.addEventListener('mousedown', () => {
				this.mouseState = mState.DOWN;
				this.mouseStateEdge = mState.DOWN;
			});

			canvas.addEventListener('mouseup', () => {
				this.mouseState = mState.UP;
				this.mouseStateEdge = mState.UP;
			});

			canvas.addEventListener('wheel', (e) => {
				this.mouseWheelDelta -= e.deltaY;
			});

			document.addEventListener('keyup', (e) => {
				const {
					keyCode,
					ctrlKey,
					shiftKey,
					altKey,
					metaKey,
				} = e;

				this.keyboardUp = {
					keyCode,
					special: (ctrlKey ? specialKey.CTRL : 0)
						+ (shiftKey ? specialKey.SHIFT : 0)
						+ (altKey ? specialKey.ALT : 0)
						+ (metaKey ? specialKey.META : 0),
				};
			});

			document.addEventListener('keydown', (e) => {
				const {
					keyCode,
					ctrlKey,
					shiftKey,
					altKey,
					metaKey,
				} = e;
				const eventData = {
					keyCode,
					special: (ctrlKey ? specialKey.CTRL : 0)
						+ (shiftKey ? specialKey.SHIFT : 0)
						+ (altKey ? specialKey.ALT : 0)
						+ (metaKey ? specialKey.META : 0),
				};

				if (this.keyboardDown.keyCode !== keyCode) {
					this.keyboardDownRisingEdge = eventData;
				}

				this.keyboardDown = eventData;
			});
		}


		// This is the view matrix schema
		// [ a  b  tx ]   [ x ]   [ ax + by + tx ]
		// [ c  d  ty ] x [ y ] = [ cx + dy + ty ]
		// [ 0  0  1  ]   [ 1 ]   [ 0  + 0  + 1  ]
		// a is x scaling
		// d is y scaling
		// b is y on x influence
		// c is x on y influence
		// tx is x translation
		// ty is y translation
		this.viewMatrix = [1, 0, 0, -1, 0, 0];
		this.interactionList = [];
	}

	clearDelta() {
		this.mouseDelta = {
			x: 0,
			y: 0,
		};
	}

	clearWheelDelta() {
		this.mouseWheelDelta = 0;
	}

	clearKeyboardInput() {
		this.keyboardUp = {};
		this.keyboardDown = {};
		this.keyboardDownRisingEdge = {};
	}

	clearKeyboardEdges() {
		this.keyboardDownRisingEdge = {};
	}

	clearMouseEdges() {
		this.mouseStateEdge = undefined;
	}

	clearCanvas(width, height, context = this.context) {
		context.clearRect(0, 0, width, height);
		this.interactionList = [];
	}

	getMouseState() {
		return {
			pos: this.mouse,
			delta: this.mouseDelta,
			state: this.mouseState,
			edge: this.mouseStateEdge,
			wheel: this.mouseWheelDelta,
		};
	}

	drawTypographicFrame(glyph, values) {
		const lowerCornerRightRectangle = {
			x: -infinityDistance,
			y: -infinityDistance,
		};
		const upperCornerRightRectangle = {
			x: 0,
			y: infinityDistance,
		};
		const bottomZeroLine = {
			x: 0,
			y: -infinityDistance,
		};
		const upperCornerRightRectangleBase = {
			x: glyph.spacingLeft - glyph.baseSpacingLeft,
			y: infinityDistance,
		};
		const bottomZeroLineBase = {
			x: glyph.spacingLeft - glyph.baseSpacingLeft,
			y: -infinityDistance,
		};
		const bottomAdvanceWidthLine = {
			x: glyph.advanceWidth,
			y: -infinityDistance,
		};
		const topAdvanceWidthLine = {
			x: glyph.advanceWidth,
			y: infinityDistance,
		};
		const bottomAdvanceWidthLineBase = {
			x: glyph.advanceWidth - glyph.spacingRight + glyph.baseSpacingRight,
			y: -infinityDistance,
		};
		const topAdvanceWidthLineBase = {
			x: glyph.advanceWidth - glyph.spacingRight + glyph.baseSpacingRight,
			y: infinityDistance,
		};
		const lowerCornerLeftRectangle = {
			x: glyph.advanceWidth,
			y: -infinityDistance,
		};
		const upperCornerLeftRectangle = {
			x: infinityDistance,
			y: infinityDistance,
		};

		this.drawRectangleFromCorners(
			lowerCornerRightRectangle,
			upperCornerRightRectangle,
			frameBackground,
			frameBackground,
		);
		this.drawRectangleFromCorners(
			lowerCornerLeftRectangle,
			upperCornerLeftRectangle,
			frameBackground,
			frameBackground,
		);

		// base spacing lines
		this.drawLine(
			bottomZeroLineBase,
			upperCornerRightRectangleBase,
			baseSpaceHandleColor,
		);
		this.drawLine(
			bottomAdvanceWidthLineBase,
			topAdvanceWidthLineBase,
			baseSpaceHandleColor,
		);


		// spacing handle
		this.drawLine(
			bottomZeroLine,
			upperCornerRightRectangle,
			green,
		);
		this.drawLine(
			bottomAdvanceWidthLine,
			topAdvanceWidthLine,
			green,
		);

		this.drawLine(
			{x: -infinityDistance, y: values.xHeight},
			{x: infinityDistance, y: values.xHeight},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: values.xHeight + values.overshoot},
			{x: infinityDistance, y: values.xHeight + values.overshoot},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: values.xHeight + values.capDelta},
			{x: infinityDistance, y: values.xHeight + values.capDelta},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: values.xHeight + values.capDelta + values.overshoot},
			{x: infinityDistance, y: values.xHeight + values.capDelta + values.overshoot},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: 0},
			{x: infinityDistance, y: 0},
			mediumGrey,
		);
		this.drawLine(
			{x: -infinityDistance, y: -values.overshoot},
			{x: infinityDistance, y: -values.overshoot},
			lightGrey,
		);

		this.interactionList.push({
			id: 'spacingLeft',
			type: toileType.SPACING_HANDLE,
			data: {
				x: 0,
				baseSpacing: glyph.baseSpacingLeft,
			},
		});

		this.interactionList.push({
			id: 'spacingRight',
			type: toileType.SPACING_HANDLE,
			data: {
				x: glyph.advanceWidth,
				baseSpacing: glyph.baseSpacingRight,
			},
		});
	}

	drawControlPoint(node, hotness, fillColor) {
		this.drawCircle(
			node,
			hotness ? nodeHotDrawRadius : nodeDrawRadius,
			fillColor,
			hotness ? fillColor : transparent,
		);
	}

	drawSkeletonPoint(node, hotness, fillColor) {
		const offset = {
			x: nodeDrawRadius / this.viewMatrix[0],
			y: nodeDrawRadius / this.viewMatrix[0],
		};

		this.drawRectangleFromCorners(
			subtract2D(node, offset),
			add2D(node, offset),
			fillColor,
			hotness ? fillColor : transparent,
		);
	}

	drawContourNode(node, id, prevNode, nextNode, hotItems, componentPrefixAddress) {
		const hot = _find(hotItems, item => item.id === id);
		const inId = `${id}.handleIn`;
		const outId = `${id}.handleOut`;
		const inHot = _find(hotItems, item => item.id === outId);
		const outHot = _find(hotItems, item => item.id === inId);

		if (hot || inHot || outHot) {
			this.drawHandleNode({
				node,
				otherNode: prevNode,
				otherDir: prevNode.dirOut,
				handle: node.handleIn,
				id,
				handleId: inId,
				type: toileType.CONTOUR_NODE_IN,
				hotItems,
				color: inHandleColor,
			}); // in
			this.drawHandleNode({
				node,
				otherNode: nextNode,
				otherDir: nextNode.dirIn,
				handle: node.handleOut,
				id,
				handleId: outId,
				type: toileType.CONTOUR_NODE_OUT,
				hotItems,
				color: outHandleColor,
			}); // out
		}

		const modifAddress = `${componentPrefixAddress}${node.nodeAddress}`;

		this.drawControlPoint(node, hot, onCurveColor);
		this.interactionList.push({
			id,
			type: toileType.CONTOUR_NODE,
			data: {
				center: {
					x: node.x,
					y: node.y,
				},
				base: {
					x: node.xBase,
					y: node.yBase,
				},
				transforms: node.addedTransform,
				radius: nodeHotRadius,
				modifAddress,
			},
		});
	}

	drawExpandedNode(
		node,
		id,
		parentNode,
		parentId,
		hotItems,
		prevNode,
		nextNode,
		prevDir,
		nextDir,
		componentPrefixAddress,
		parallelId,
		parallelParameters,
	) {
		const hot = _find(hotItems, item => item.id === id);
		const inId = `${id}.handleIn`;
		const outId = `${id}.handleOut`;
		const inHot = _find(hotItems, item => item.id === outId);
		const outHot = _find(hotItems, item => item.id === inId);

		if (hot || inHot || outHot) {
			this.drawHandleNode({
				node,
				otherNode: prevNode,
				otherDir: prevDir || 0,
				handle: node.handleIn,
				id,
				parentId,
				handleId: inId,
				type: toileType.NODE_IN,
				hotItems,
				color: inHandleColor,
				parallelId,
				parallelParameters,
			}); // in
			this.drawHandleNode({
				node,
				otherNode: nextNode,
				otherDir: nextDir || 0,
				handle: node.handleOut,
				id,
				parentId,
				handleId: outId,
				type: toileType.NODE_OUT,
				hotItems,
				color: outHandleColor,
				parallelId,
				parallelParameters,
			}); // out
		}

		const drawNode = !(parentNode
			&& parentNode.x === node.x
			&& parentNode.y === node.y);

		if (drawNode) {
			this.drawControlPoint(node, hot, node.handleIn ? onCurveColor : skeletonColor);
		}

		if (id) {
			if (node.handleIn || node.handleOut) {
				if (drawNode) {
					const {oppositeId, angleOffset} = parentNode.expandedTo[0] === node
						? {
							oppositeId: `${parentId}.expandedTo[1]`,
							angleOffset: Math.PI,
						}
						: {
							oppositeId: `${parentId}.expandedTo[0]`,
							angleOffset: 0,
						};
					const modifAddress = `${componentPrefixAddress}${parentNode.nodeAddress}expand`;

					this.interactionList.push({
						id,
						type: toileType.NODE,
						data: {
							parentId,
							center: {
								x: node.x,
								y: node.y,
							},
							base: {
								x: node.xBase,
								y: node.yBase,
							},
							radius: nodeHotRadius,
							oppositeId,
							baseWidth: parentNode.expand.baseWidth,
							modifAddress,
							skeleton: parentNode,
							baseAngle: parentNode.expand.baseAngle,
							angleOffset,
							parallelParameters,
						},
					});
				}
			}
		}
	}

	drawHandleNode({
		node,
		otherNode,
		otherDir,
		handle,
		id,
		parentId,
		handleId,
		type,
		hotItems,
		color,
		parallelId,
		parallelParameters,
	}) {
		let handleNode = handle;

		if (handle.x === node.x && handle.y === node.y) {
			const prevVec = subtract2D(otherNode, handle);
			const prevDist = distance2D(otherNode, handle);
			const normalizePrev = normalize2D(prevVec);
			const handleVec = add2D(mulScalar2D(prevDist / 3, normalizePrev), handle);

			handleNode = handleVec;
		}

		const inHot = _find(hotItems, item => item.id === handleId);

		this.drawLine(handleNode, node, color, color);
		this.drawControlPoint(handleNode, inHot, color);

		if (handleId) {
			this.interactionList.push({
				id: handleId,
				type,
				data: {
					center: {
						x: handleNode.x,
						y: handleNode.y,
					},
					radius: nodeHotRadius,
					transforms: node.addedTransform,
					parentId: id,
					skeletonId: parentId,
					otherNode,
					otherDir,
					parallelId,
					parallelParameters,
				},
			});
		}
	}

	drawSkeletonNode(node, id, hotItems, j, nodes, contour, componentPrefixAddress) {
		const hot = _find(hotItems, item => item.id === id);
		const modifAddress = `${componentPrefixAddress}${node.nodeAddress}`;

		if (node.expand) {
			this.drawSkeletonPoint(node, hot, node.handleIn ? onCurveColor : skeletonColor);
			this.interactionList.push({
				id,
				type: toileType.NODE_SKELETON,
				data: {
					center: {
						x: node.x,
						y: node.y,
					},
					base: {
						x: node.xBase,
						y: node.yBase,
					},
					transforms: node.addedTransform,
					expandedTo: node.expandedTo,
					width: node.expand.width,
					baseDistr: node.expand.baseDistr,
					radius: nodeHotRadius,
					modifAddress,
				},
			});
		}


		let prevNode = nodes[(j - 1) - (nodes.length * Math.floor((j - 1) / nodes.length))];
		let nextNode = nodes[(j + 1) % nodes.length];

		if (!contour.closed) {
			if (j === nodes.length - 1) {
				nextNode = {
					dirIn: nodes[j].dirOut,
					dirOut: nodes[j].dirOut,
					expandedTo: [
						nodes[j].expandedTo[1],
						nodes[j].expandedTo[0],
					],
				};
			}
			else if (j === 0) {
				prevNode = {
					dirIn: nodes[j].dirIn,
					dirOut: nodes[j].dirIn,
					expandedTo: [
						nodes[j].expandedTo[1],
						nodes[j].expandedTo[0],
					],
				};
			}
		}

		const parametersZero = [
			node.expandedTo[0],
			`${id}.expandedTo.0`,
			node,
			id,
			hotItems,
			prevNode.expandedTo[0],
			nextNode.expandedTo[0],
			prevNode.dirOut,
			nextNode.dirIn,
			componentPrefixAddress,
			`${id}.expandedTo.1`,
		];
		const parametersOne = [
			node.expandedTo[1],
			`${id}.expandedTo.1`,
			node,
			id,
			hotItems,
			nextNode.expandedTo[1],
			prevNode.expandedTo[1],
			nextNode.dirIn,
			prevNode.dirOut,
			componentPrefixAddress,
			`${id}.expandedTo.0`,
			parametersZero,
		];

		parametersZero.push(parametersOne);

		this.drawExpandedNode(...parametersZero);
		this.drawExpandedNode(...parametersOne);
	}


	drawNodes(contour = {nodes: []}, contourCursor, hotItems, componentPrefixAddress) {
		const nodes = contour.nodes;

		nodes.forEach((node, j) => {
			const id = `${contourCursor}.nodes.${j}`;

			if (contour.skeleton && node.expand) {
				this.drawSkeletonNode(node, id, hotItems, j, nodes, contour, componentPrefixAddress);
			}
			else if (node.expandedTo) {
				const prevNode = nodes[(j - 1) - (nodes.length * Math.floor((j - 1) / nodes.length))];
				const nextNode = nodes[(j + 1) % nodes.length];

				this.drawContourNode(node.expandedTo[0], `${id}.expandedTo.0`, prevNode.expandedTo[0], nextNode.expandedTo[0], hotItems, componentPrefixAddress);
				this.drawContourNode(node.expandedTo[1], `${id}.expandedTo.1`, nextNode.expandedTo[1], prevNode.expandedTo[1], hotItems, componentPrefixAddress);
			}
			else {
				const prevNode = nodes[(j - 1) - (nodes.length * Math.floor((j - 1) / nodes.length))];
				const nextNode = nodes[(j + 1) % nodes.length];

				this.drawContourNode(node, id, prevNode, nextNode, hotItems, componentPrefixAddress);
			}
		});
	}

	drawAllNodes(glyph, hotItems, componentPrefixAddress = '') {
		glyph.contours.forEach((contour, i) => {
			this.drawNodes(contour, `${componentPrefixAddress}contours.${i}`, hotItems);
		});

		glyph.components.forEach((component, i) => {
			this.drawAllNodes(component, hotItems, `components.${i}.`);
		});
	}

	drawGlyph(glyph, hotItems, outline, context = this.context) {
		context.fillStyle = outline ? transparent : darkestGrey;
		context.strokeStyle = darkestGrey;
		context.beginPath();
		for (let i = 0; i < glyph.otContours.length; i++) {
			this.drawContour(glyph.otContours[i], undefined, undefined, true, context);
		}

		context.stroke();
		context.fill();
	}

	drawSelectableContour(glyph, hotItems, parentId = '', type = toileType.GLYPH_CONTOUR, componentIdx) {
		let startIndexBeziers = 0;

		glyph.contours.forEach((contour, i) => {
			const id = `${parentId}contours.${i}`;
			const hot = _find(hotItems, item => item.id === id);
			let length;

			if (contour.skeleton && contour.closed) {
				length = 2;
			}
			else {
				length = 1;
			}
			const deepListOfBeziers = _slice(
				glyph.otContours,
				startIndexBeziers,
				startIndexBeziers + length,
			);
			const listOfBezier = _flatten(deepListOfBeziers);


			if (hot) {
				this.context.strokeStyle = green;
				this.context.lineWidth = 1;
				this.context.beginPath();
				deepListOfBeziers.forEach((bez) => {
					this.drawContour(bez, undefined, undefined, true);
				});
				this.context.stroke();
				this.context.lineWidth = 1;
			}

			this.interactionList.push({
				id,
				type,
				data: {
					componentIdx,
					beziers: listOfBezier,
					contour,
					indexes: [startIndexBeziers, startIndexBeziers + length],
				},
			});

			startIndexBeziers += length;
		});

		glyph.components.forEach((component, i) => {
			this.drawSelectableContour(component, hotItems, `components.${i}.`, toileType.GLYPH_COMPONENT_CONTOUR, i);
		});
	}

	drawSelectedContour(contour) {
		this.context.strokeStyle = green;
		this.context.lineWidth = 1;
		this.context.beginPath();
		contour.forEach((bez) => {
			this.drawContour(bez, undefined, undefined, true);
		});
		this.context.stroke();
		this.context.lineWidth = 1;
	}

	drawComponents(components, hotItems) {
		components.forEach((component, i) => {
			let startIndexBeziers = 0;
			const id = `components.${i}`;

			if (component.name === 'none') {
				const hot = _find(hotItems, item => item.id === id);
				const fillColor = hot ? blue : 'transparent';

				this.drawCircle(component.contours[0].nodes[0], 10, blue, fillColor);
				this.interactionList.push({
					id,
					type: toileType.COMPONENT_NONE_CHOICE,
					data: {
						center: component.contours[0].nodes[0],
						radius: componentMenuNoneRadius,
						id: component.id,
						bases: component.base,
					},
				});
			}
			else {
				component.contours.forEach((contour) => {
					const hot = _find(hotItems, item => item.id === id);
					let length;

					if (contour.skeleton && contour.closed) {
						length = 2;
					}
					else {
						length = 1;
					}
					const deepListOfBeziers = _slice(
						component.otContours,
						startIndexBeziers,
						startIndexBeziers + length,
					);
					const listOfBezier = _flatten(deepListOfBeziers);

					if (hot) {
						const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
						const [mouseTransformed] = transformCoords(
							[this.mouse],
							inverseMatrix,
							this.height / this.viewMatrix[0],
						);

						this.context.strokeStyle = blue;
						this.context.fillStyle = blue;
					}
					else {
						this.context.strokeStyle = green;
						this.context.fillStyle = green;
					}
					this.context.lineWidth = 1;
					this.context.beginPath();
					deepListOfBeziers.forEach((bez) => {
						this.drawContour(bez, undefined, undefined, true);
					});
					this.context.stroke();
					this.context.fill();
					this.context.fillStyle = transparent;
					this.context.lineWidth = 1;

					this.interactionList.push({
						id,
						type: toileType.COMPONENT_CHOICE,
						data: {
							beziers: listOfBezier,
							id: component.id,
							bases: component.base,
						},
					});

					startIndexBeziers += length;
				});
			}
		});
	}

	setCamera(point, zoom, height, width) {
		this.height = height;
		this.width = width;
		this.viewMatrix = [zoom, 0, 0, -1 * zoom, point.x, point.y];
	}

	setCameraCenter(point, zoom, height, width) {
		this.setCamera(
			subtract2D({x: width / 2, y: height / 2}, mulScalar2D(zoom, {x: point.x, y: -point.y})),
			zoom,
			height,
			width,
		);
	}

	// A drawn contour must be closed
	drawContour(listOfBezier, strokeColor = 'transparent', fillColor = 'transparent', noPathCreation, context = this.context) {
		if (!noPathCreation) {
			context.fillStyle = fillColor;
			context.strokeStyle = strokeColor;
			context.beginPath();
		}

		for (let i = 0; i < listOfBezier.length; i++) {
			this.drawBezierCurve(listOfBezier[i], undefined, true, !i, context);
		}

		if (!noPathCreation) {
			context.stroke();
			context.fill();
		}
	}

	drawBezierCurve(aBezier, strokeColor, noPathCreation, move, context = this.context) {
		const bezier = transformCoords(
			aBezier,
			this.viewMatrix,
			this.height,
		);

		if (!noPathCreation) {
			context.fillStyle = 'transparent';
			context.strokeStyle = strokeColor;
			context.beginPath();
		}
		if (move) {
			context.moveTo(bezier[0].x, bezier[0].y);
		}

		context.bezierCurveTo(
			bezier[1].x,
			bezier[1].y,
			bezier[2].x,
			bezier[2].y,
			bezier[3].x,
			bezier[3].y,
		);

		if (!noPathCreation) {
			context.stroke();
		}
	}

	drawLine(aStart, aEnd, strokeColor = 'transparent', id, dash = []) {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix,
			this.height,
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.setLineDash(dash);
		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);
		this.context.stroke();
		this.context.setLineDash([]);
	}

	drawRectangleFromCorners(aStart, aEnd, strokeColor = 'transparent', fillColor = 'transparent') {
		const [start, end] = transformCoords(
			[aStart, aEnd],
			this.viewMatrix,
			this.height,
		);
		const widthHeight = subtract2D(end, start);

		this.context.fillStyle = fillColor;
		this.context.strokeStyle = strokeColor;
		this.context.fillRect(start.x, start.y, widthHeight.x, widthHeight.y);
		this.context.strokeRect(start.x, start.y, widthHeight.x, widthHeight.y, strokeColor);
	}

	drawCircle(aCenter, radius, strokeColor = 'black', fillColor = 'transparent') {
		const [center] = transformCoords(
			[aCenter],
			this.viewMatrix,
			this.height,
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.fillStyle = fillColor;
		this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
		this.context.stroke();
		this.context.fill();
	}

	drawArcBetweenVector(aOrigin, startVec, endVec, strokeColor, radius = 50) {
		const startAngle = Math.atan2(startVec.y, startVec.x);
		const endAngle = Math.atan2(endVec.y, endVec.x);

		const [origin] = transformCoords(
			[aOrigin],
			this.viewMatrix,
			this.height,
		);

		this.context.strokeStyle = strokeColor;
		this.context.beginPath();
		this.context.arc(origin.x, origin.y, radius, startAngle, endAngle, true);
		this.context.stroke();
	}

	drawRing(aCenter, innerRadius, outerRadius, strokeColor = 'transparent', fillColor = 'transparent') {
		const [center] = transformCoords(
			[aCenter],
			this.viewMatrix,
			this.height,
		);

		this.context.beginPath();
		this.context.strokeStyle = strokeColor;
		this.context.fillStyle = fillColor;
		this.context.arc(center.x, center.y, innerRadius, 0, 2 * Math.PI);
		this.context.arc(center.x, center.y, outerRadius, 0, 2 * Math.PI, true);
		this.context.stroke();
		this.context.fill();
	}

	drawText(text, point, textSize, textColor, font = 'Fira sans') {
		const [transformedPoint] = transformCoords(
			[point],
			this.viewMatrix,
			this.height,
		);

		this.context.font = `${textSize}px '${font}', sans-serif`;
		this.context.fillStyle = textColor;

		this.context.fillText(text, transformedPoint.x, transformedPoint.y);
	}

	measureNodeMenuName(point) {
		const text = labelForMenu[point.type] || 'hello';

		return this.measureText(text, menuTextSize, 'Fira sans');
	}

	measureText(text, size = 20, font = 'Fira sans') {
		this.context.font = `${size}px '${font}', sans-serif`;

		return this.context.measureText(text);
	}

	drawNodeMenuName(point, pos, size, hotItems) {
		const text = labelForMenu[point.type] || 'hello';
		const hot = _find(hotItems, item => item.id === `${point.id}_menuItem`);

		this.drawText(text, pos, menuTextSize, hot ? '#24d390' : '#fefefe');
		this.interactionList.push({
			id: `${point.id}_menuItem`,
			type: toileType.POINT_MENU_ITEM,
			data: {
				point,
				size,
				pos,
			},
		});
	}

	drawMultiplePointsMenu(points, frameCounters, hotItems = []) {
		const offset = mulScalar2D(1 / this.viewMatrix[0], {x: 20, y: 20});
		const start = add2D(points[0].data.center, offset);
		let textWidth = 0;


		let textPos = add2D(
			points[0].data.center,
			add2D(offset, mulScalar2D(1 / this.viewMatrix[0], {x: 10, y: 10})),
		);
		const textStep = {x: 0, y: 50 / this.viewMatrix[0]};
		const nameSizes = [];

		points.forEach((point) => {
			const size = this.measureNodeMenuName(point).width;

			textWidth = Math.max(textWidth, (size + 20) / this.viewMatrix[0]);
			nameSizes.push(size);
		});

		const size = mulScalar2D(
			Math.min(1, frameCounters / pointMenuAnimationLength),
			{x: textWidth, y: ((40 * points.length) + (10 * points.length) - 10) / this.viewMatrix[0]},
		);
		const end = add2D(start, size);

		this.drawRectangleFromCorners(start, end, undefined, '#333');

		points.forEach((point, i) => {
			this.drawNodeMenuName(point, textPos, nameSizes[i], hotItems);
			textPos = add2D(textPos, textStep);
		});

		this.interactionList.push({
			id: 'multiple_points',
			type: toileType.POINT_MENU,
			data: {
				start,
				size,
				points,
			},
		});
	}

	drawComponentMenu(
		{
			id, bases, beziers, center,
		},
		frameCounters,
		hotItems = [],
		width,
		{position = {}},
	) {
		let menuCenter;
		const t = Math.min(1, frameCounters / componentMenuAnimationLength);
		const t2 = t ** 2;
		const y = (3 * t * (1 - t2) * 0.1) + (3 * t2 * (1 - t) * 1) + ((t ** 3) * 1);

		if (center) {
			menuCenter = center;
		}
		else {
			const flatBezier = _flatten(beziers);

			menuCenter = _reduce(
				flatBezier,
				(acc, point) => add2D(mulScalar2D(1 / flatBezier.length, point), acc),
				{x: 0, y: 0},
			);
		}

		const corners = [0, 1, 2, 3].map(i =>
			({
				x: width * (i & 0b01),
				y: -this.height * (i > 1 & 0b01),
			}));
		const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
		const [viewMenuCenter] = transformCoords(
			[menuCenter],
			this.viewMatrix,
			this.height,
		);
		let [viewMenuPos] = transformCoords(
			[position],
			this.viewMatrix,
			this.height,
		);

		if (frameCounters === 0) {
			viewMenuPos = {
				x: viewMenuCenter.x + (Math.random() - 0.5),
				y: viewMenuCenter.y + (Math.random() - 0.5),
			};
		}

		const centerFactor = (distance2D(viewMenuCenter, viewMenuPos) / pixelPerMeter);
		const centerRepulsor = mulScalar2D(
			400 / Math.max(20, centerFactor),
			normalize2D(subtract2D(viewMenuPos, viewMenuCenter)),
		);

		const leftTopRepulsor = mulScalar2D(
			300 * (distance2D(corners[0], viewMenuPos) - 100) / pixelPerMeter,
			normalize2D(subtract2D(corners[0], viewMenuPos)),
		);
		const rightTopRepulsor = mulScalar2D(
			300 * (distance2D(corners[1], viewMenuPos) - 100) / pixelPerMeter,
			normalize2D(subtract2D(corners[1], viewMenuPos)),
		);
		const leftBottomRepulsor = mulScalar2D(
			300 * (distance2D(corners[2], viewMenuPos) - 100) / pixelPerMeter,
			normalize2D(subtract2D(corners[2], viewMenuPos)),
		);
		const rightBottomRepulsor = mulScalar2D(
			300 * (distance2D(corners[3], viewMenuPos) - 100) / pixelPerMeter,
			normalize2D(subtract2D(corners[3], viewMenuPos)),
		);

		const sumAttractorRepulsor = _reduce(
			[
				centerRepulsor,
				leftTopRepulsor,
				rightTopRepulsor,
				leftBottomRepulsor,
				rightBottomRepulsor,
			],
			(acc, force) => add2D(acc, force),
			{x: 0, y: 0},
		);

		let resultMenu = {
			...add2D(mulScalar2D(1 / (menuMass * 60), sumAttractorRepulsor), viewMenuPos),
		};

		const maxDistance = componentLeashDistance;
		const distanceToBezierCenter = distance2D(resultMenu, viewMenuCenter);

		if (distanceToBezierCenter > maxDistance) {
			const vectorToBezierCenter = subtract2D(resultMenu, viewMenuCenter);

			resultMenu = {
				...add2D(
					viewMenuCenter,
					mulScalar2D(maxDistance / distanceToBezierCenter, vectorToBezierCenter),
				),
			};
		}

		const [componentCenter] = transformCoords(
			[resultMenu],
			inverseMatrix,
			this.height / this.viewMatrix[0],
		);

		bases.forEach(({id: baseId, label, componentClass}, i) => {
			const inHot = _find(hotItems, item => item.id === baseId);
			const magicHot = _find(hotItems, item => item.id === `${baseId}magic`);
			const textSize = componentMenuTextSize * y;

			const boxHeight = componentMenuTextSize * 2 * y;
			const yOffset = ((i - (bases.length / 2)) * boxHeight);
			const boxWidth = componentMenuWidth * y;
			const rectStart = add2D(
				{
					x: -1.5 * boxWidth / this.viewMatrix[0],
					y: yOffset / this.viewMatrix[0],
				},
				componentCenter,
			);
			const rectEnd = add2D(
				{
					x: -0.2 * boxWidth / this.viewMatrix[0],
					y: (yOffset + boxHeight) / this.viewMatrix[0],
				},
				componentCenter,
			);
			const magicStart = add2D(
				{
					x: -0.2 * boxWidth / this.viewMatrix[0],
					y: yOffset / this.viewMatrix[0],
				},
				componentCenter,
			);
			const magicEnd = add2D(
				{
					x: 1.7 * boxWidth / this.viewMatrix[0],
					y: (yOffset + boxHeight) / this.viewMatrix[0],
				},
				componentCenter,
			);

			this.drawRectangleFromCorners(
				rectStart,
				rectEnd,
				darkestGrey,
				inHot ? green : white,
			);
			this.drawText(
				label.value,
				add2D(
					{
						x: 10 / this.viewMatrix[0],
						y: textSize / 2 / this.viewMatrix[0],
					},
					rectStart,
				),
				textSize,
				inHot ? white : darkestGrey,
			);

			this.interactionList.push({
				id: baseId,
				type: toileType.COMPONENT_MENU_ITEM,
				data: {
					componentId: id,
					baseId,
					rectStart,
					rectEnd,
				},
			});

			if (componentClass) {
				this.drawRectangleFromCorners(
					magicStart,
					magicEnd,
					darkestGrey,
					magicHot ? green : white,
				);

				this.drawText(
					'Change All similar',
					add2D(
						{
							x: 10 / this.viewMatrix[0],
							y: textSize / 2 / this.viewMatrix[0],
						},
						magicStart,
					),
					textSize,
					magicHot ? white : darkestGrey,
				);

				this.interactionList.push({
					id: `${baseId}magic`,
					type: toileType.COMPONENT_MENU_ITEM_CLASS,
					data: {
						componentClass,
						baseId,
						rectStart: magicStart,
						rectEnd: magicEnd,
					},
				});
			}
		});

		const newPosition = componentCenter;

		const points = [menuCenter, newPosition];
		const barycenter = mulScalar2D(1 / points.length, _reduce( // eslint-disable-line no-unused-vars
			points,
			(acc, point) => add2D(acc, point),
			{x: 0, y: 0},
		));

		this.interactionList.push({
			id,
			type: toileType.COMPONENT_MENU_ITEM_CENTER,
			data: {
				component: {
					id, bases, beziers, center,
				},
				center: componentCenter,
			},
		});

		return {
			id,
			position: newPosition,
		};
	}

	drawToolsLib(toolsLib, appStateValue) {
		const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
		const [mouseTransformed] = transformCoords(
			[this.mouse],
			inverseMatrix,
			this.height / this.viewMatrix[0],
		);

		toolsLib.forEach((tools, i) => {
			const offset = mulScalar2D(1 / this.viewMatrix[0], {x: 20, y: -20 - (30 * i)});
			const start = add2D(mouseTransformed, offset);
			const size = mulScalar2D(1 / this.viewMatrix[0], {x: 30 * tools.length, y: -30});
			const end = add2D(start, size);

			this.drawRectangleFromCorners(start, end, undefined, '#24d390');
			tools.forEach((tool, j) => {
				const width = this.measureText(tool.key, 15, 'Fira sans').width;
				const toolStart = add2D(start, mulScalar2D(j / this.viewMatrix[0], {x: 30, y: 0}));
				const toolSize = mulScalar2D(1 / this.viewMatrix[0], {x: 30, y: -30});
				const toolEnd = add2D(toolStart, toolSize);
				const textPoint = add2D(
					mulScalar2D(
						1 / this.viewMatrix[0],
						{
							x: -width / 2,
							y: -7.5,
						},
					),
					mulScalar2D(
						1 / 2,
						add2D(toolStart, toolEnd),
					),
				);
				let color;

				if (appStateValue === tool.mode) {
					color = blue;
				}
				this.drawRectangleFromCorners(toolStart, toolEnd, undefined, color);
				this.drawText(tool.key, textPoint, 15, grey);
			});
		});
	}

	drawNodeToolsLib(appStateValue) {
		this.drawToolsLib(
			[
				[
					{
						key: 'e',
						mode: appState.ONCURVE_THICKNESS,
					},
					{
						key: 'r',
						mode: appState.ONCURVE_ANGLE,
					},
					{
						key: 'd',
						mode: appState.SKELETON_POS,
					},
					{
						key: 'f',
						mode: appState.SKELETON_DISTR,
					},
				],
			],
			appStateValue,
		);
	}

	drawNodeSkeletonToolsLib(appStateValue) {
		this.drawToolsLib([
			{
				key: 'o',
				mode: appState.SKELETON_POS,
			},
			{
				key: 'p',
				mode: appState.SKELETON_DISTR,
			},
		], appStateValue);
	}

	drawNodeHandleToolsLib(appStateValue) {
		this.drawToolsLib([
			{},
			{},
			{},
		], appStateValue);
	}

	drawAngleBetweenHandleAndMouse(node, handle) {
		const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
		const [mouseTransformed] = transformCoords(
			[this.mouse],
			inverseMatrix,
			this.height / this.viewMatrix[0],
		);
		const [nodeTransformed, handleTransformed, mouseSuperTransformed] = transformCoords(
			[node, handle, mouseTransformed],
			this.viewMatrix,
			this.height,
		);

		const startVec = subtract2D(handleTransformed, nodeTransformed);
		const endVec = subtract2D(mouseSuperTransformed, nodeTransformed);

		this.drawLine(node, mouseTransformed, '#24d390');
		this.drawLine(node, handle, '#ff00ff');
		this.drawArcBetweenVector(node, startVec, endVec, '#24d390');
	}

	drawAngleTool(node) {
		const radiusOne = distance2D(node.expandedTo[1], node) * this.viewMatrix[0];
		const radiusZero = distance2D(node.expandedTo[0], node) * this.viewMatrix[0];

		this.drawRing(node, Math.max(radiusOne - 0.5, 0), radiusOne + 0.5, undefined, ringBackground);
		this.drawRing(node, Math.max(radiusZero - 0.5, 0), radiusZero + 0.5, undefined, ringBackground);
	}

	drawWidthTool(node) {
		const vector = subtract2D(node.expandedTo[0], node.expandedTo[1]);
		const start = add2D(node.expandedTo[0], mulScalar2D(100000, vector));
		const end = subtract2D(node.expandedTo[0], mulScalar2D(100000, vector));

		this.drawLine(start, end, onCurveColor, undefined);
	}

	drawSkeletonDistrTool(node) {
		const [zoom] = this.viewMatrix;
		const normalVector = normalize2D({
			x: node.expandedTo[1].y - node.expandedTo[0].y,
			y: node.expandedTo[0].x - node.expandedTo[1].x,
		});
		const toolPos = add2D(node, mulScalar2D(20 / zoom, normalVector));

		this.drawLine(node.expandedTo[0], node.expandedTo[1], red, undefined, [5, 5, 15, 5]);
		this.drawLine(node, add2D(node, mulScalar2D(20 / zoom, normalVector)), red);
		this.drawCircle(toolPos, 8, 'transparent', red);

		const distribText = node.expand.distr.toFixed(1);
		const distribTextSize = this.measureText(distribText, 15, 'Fira sans');
		const distribCoordsPos = add2D(mulScalar2D(1 / zoom, {x: 20, y: 0}), node);

		this.drawText(
			distribText,
			add2D(
				distribCoordsPos,
				{
					x: -distribTextSize.width / (2 * zoom),
					y: 0,
				},
			),
			20,
			red,
		);
	}

	drawSkeletonPosTool(node) {
		if (node.expandedTo) {
			this.drawLine(node.expandedTo[0], node.expandedTo[1], red, undefined, [5, 5, 15, 5]);
		}
	}

	drawSkeletonProps(node, start, end, zoom, index) {
		this.drawText('Skeleton node props', {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * index / zoom),
		}, 14, darkestGrey);
		this.drawText(`x: ${node.x} (${Math.round(node.x - node.xBase)})`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 1) / zoom),
		}, 12, darkestGrey);

		this.drawText(`y: ${node.y} (${Math.round(node.y - node.yBase)})`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 2) / zoom),
		}, 12, darkestGrey);
	}

	drawExpandProps(node, start, end, zoom, index) {
		this.drawText('Skeleton expand props', {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * index / zoom),
		}, 14, darkestGrey);
		this.drawText(`width: ${node.expand.width.toFixed(1)} (${(node.expand.width - node.expand.baseWidth).toFixed(1)})`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 1) / zoom),
		}, 12, darkestGrey);

		this.drawText(`angle: ${node.expand.angle.toFixed(2)} (${(node.expand.angle - node.expand.baseAngle).toFixed(2)})`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 2) / zoom),
		}, 12, darkestGrey);

		this.drawText(`distr: ${node.expand.distr.toFixed(2)} (${(node.expand.distr - node.expand.baseDistr).toFixed(2)})`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 3) / zoom),
		}, 12, darkestGrey);
	}

	drawExpandedNodeProps(node, start, end, zoom, index) {
		this.drawText('Node props', {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * index / zoom),
		}, 14, darkestGrey);
		this.drawText(`x: ${node.x}`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 1) / zoom),
		}, 12, darkestGrey);
		this.drawText(`y: ${node.y}`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 2) / zoom),
		}, 12, darkestGrey);
	}

	drawHandleProps(node, start, end, zoom, index) {
		this.drawText('Handle props', {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * index / zoom),
		}, 14, darkestGrey);
		this.drawText(`direction in: ${node.dirIn.toFixed(2)}`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 1) / zoom),
		}, 14, darkestGrey);
		this.drawText(`tension in: ${(node.tensionIn + node.baseTensionIn).toFixed(2)} (${node.tensionIn.toFixed(2)})`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 2) / zoom),
		}, 14, darkestGrey);
		this.drawText(`direction out: ${node.dirOut.toFixed(2)}`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 3) / zoom),
		}, 14, darkestGrey);
		this.drawText(`tension in: ${(node.tensionOut + node.baseTensionOut).toFixed(2)} (${node.tensionOut.toFixed(2)})`, {
			x: start.x + (10 / zoom),
			y: start.y - (propsTextSize * (index + 4) / zoom),
		}, 14, darkestGrey);
	}

	drawNodeProperty(type, node, parent) {
		const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
		const [zoom] = this.viewMatrix;
		const [start, end] = transformCoords(
			[
				{
					x: 20,
					y: 70,
				},
				{
					x: 190,
					y: 240,
				},
			],
			inverseMatrix,
			this.height / zoom,
		);

		this.drawRectangleFromCorners(
			start,
			end,
			undefined,
			nodePropertyBackground,
		);

		if (type === toileType.NODE_SKELETON) {
			this.drawSkeletonProps(node, start, end, zoom, 1);
			this.drawExpandProps(node, start, end, zoom, 4);
		}
		else if (type === toileType.CONTOUR_NODE) {
			this.drawSkeletonProps(node, start, end, zoom, 1);
		}
		else if (
			type === toileType.NODE_OUT
			|| type === toileType.NODE_IN
			|| type === toileType.CONTOUR_NODE_OUT
			|| type === toileType.CONTOUR_NODE_IN
		) {
			this.drawHandleProps(parent, start, end, zoom, 1);
		}
		else {
			this.drawExpandedNodeProps(node, start, end, zoom, 1);
			this.drawExpandProps(parent, start, end, zoom, 4);
		}
	}

	drawDependencies(depender, dependee) {
		this.drawLine(depender, dependee, 'orange');
		this.drawCircle(depender, nodeDrawRadius, skeletonColor);
	}

	getBoxHotInteractiveItem(mouseBoxStart) {
		const [mousePosInWorld, boxStartPosInWorld] = transformCoords(
			[this.mouse, mouseBoxStart],
			inverseProjectionMatrix(this.viewMatrix),
			this.height / this.viewMatrix[0],
		);
		const result = [];
		const minX = Math.min(mousePosInWorld.x, boxStartPosInWorld.x);
		const maxX = Math.max(mousePosInWorld.x, boxStartPosInWorld.x);
		const minY = Math.min(mousePosInWorld.y, boxStartPosInWorld.y);
		const maxY = Math.max(mousePosInWorld.y, boxStartPosInWorld.y);

		this.interactionList.forEach((interactionItem) => {
			switch (interactionItem.type) {
			case toileType.CONTOUR_NODE:
			case toileType.CONTOUR_NODE_IN:
			case toileType.CONTOUR_NODE_OUT:
			case toileType.NODE_OUT:
			case toileType.NODE_IN:
			case toileType.NODE:
			case toileType.NODE_SKELETON: {
				const {center} = interactionItem.data;

				if (center.x < maxX
						&& center.x > minX
						&& center.y < maxY
						&& center.y > minY) {
					result.push(interactionItem);
				}
				break;
			}
			default:
				break;
			}
		});

		return result;
	}

	glyphOutsideView(glyph) {
		for (let i = 0; i < glyph.otContours.length; i++) {
			for (let j = 0; j < glyph.otContours[i].length; j++) {
				const pointArray = transformCoords(
					glyph.otContours[i][j],
					this.viewMatrix,
					this.height,
				);

				for (let k = 0; k < pointArray.length; k++) {
					const point = pointArray[k];

					if (
						point.x > 0
						&& point.x < this.width
						&& point.y > 0
						&& point.y < -this.height
					) {
						return false;
					}
				}
			}
		}

		return true;
	}

	getHotInteractiveItem() {
		const result = [];

		this.interactionList.forEach((interactionItem) => {
			switch (interactionItem.type) {
			case toileType.SPACING_HANDLE: {
				const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				const [mouseTransformed] = transformCoords(
					[this.mouse],
					inverseMatrix,
					this.height / this.viewMatrix[0],
				);
				const {x} = interactionItem.data;
				const distance = Math.abs(x - mouseTransformed.x);

				if (distance <= spacingInfluence / this.viewMatrix[0]) {
					result.push(interactionItem);
				}
				break;
			}
			case toileType.COMPONENT_MENU_ITEM_CENTER: {
				const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				const [mouseTransformed] = transformCoords(
					[this.mouse],
					inverseMatrix,
					this.height / this.viewMatrix[0],
				);
				const {center} = interactionItem.data;
				const distance = distance2D(mouseTransformed, center);

				if (distance <= componentMenuInfluenceRadius / this.viewMatrix[0]) {
					result.push(interactionItem);
				}
				break;
			}
			case toileType.COMPONENT_CHOICE:
			case toileType.GLYPH_COMPONENT_CONTOUR:
			case toileType.GLYPH_CONTOUR: {
				const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				const [mouseTransformed] = transformCoords(
					[this.mouse],
					inverseMatrix,
					this.height / this.viewMatrix[0],
				);

				const lineEnd = add2D(mouseTransformed, {x: 1, y: 0});

				let polyNumber = 0;

				interactionItem.data.beziers.forEach((bezier) => {
					if (!(
						bezier[0].x === bezier[1].x
						&& bezier[0].x === bezier[2].x
						&& bezier[0].x === bezier[3].x
						&& bezier[0].y === bezier[1].y
						&& bezier[0].y === bezier[2].y
						&& bezier[0].y === bezier[3].y
					)) {
						const ts = getIntersectionTValue(
							bezier[0],
							bezier[1],
							bezier[3],
							bezier[2],
							mouseTransformed,
							lineEnd,
						);

						if (ts) {
							ts.forEach((t) => {
								const point = getPointOnCurve(bezier, t);

								this.drawCircle(point, 5, '#ff00ff', '#ff00ff');

								if (t !== undefined && point.x > mouseTransformed.x) {
									polyNumber++;
								}
							});
						}
					}
				});

				if (polyNumber % 2) {
					result.push(interactionItem);
				}

				break;
			}
			case toileType.COMPONENT_NONE_CHOICE:
			case toileType.NODE_IN:
			case toileType.NODE_OUT:
			case toileType.NODE_SKELETON:
			case toileType.CONTOUR_NODE:
			case toileType.CONTOUR_NODE_OUT:
			case toileType.CONTOUR_NODE_IN:
			case toileType.NODE: {
				let refDistance = interactionItem.data.radius / this.viewMatrix[0];
				const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				const [mouseTransformed] = transformCoords(
					[this.mouse],
					inverseMatrix,
					this.height / this.viewMatrix[0],
				);
				const distance = distance2D(interactionItem.data.center, mouseTransformed);

				if (distance <= refDistance) {
					refDistance = distance;
					result.push(interactionItem);
				}

				break;
			}
			case toileType.COMPONENT_MENU_ITEM:
			case toileType.COMPONENT_MENU_ITEM_CLASS:
			case toileType.PERF_RECT: {
				const {rectStart, rectEnd} = interactionItem.data;
				const inverseMatrix = inverseProjectionMatrix(this.viewMatrix);
				const [mouseTransformed] = transformCoords(
					[this.mouse],
					inverseMatrix,
					this.height / this.viewMatrix[0],
				);

				if (
					mouseTransformed.x >= rectStart.x
					&& mouseTransformed.x <= rectEnd.x
					&& mouseTransformed.y >= rectStart.y
					&& mouseTransformed.y <= rectEnd.y
				) {
					result.push(interactionItem);
				}
				break;
			}
			default:
				break;
			}
		});

		return result;
	}

	drawPerf(logPerf, origin, hotItems, index = 0, offsetX = 0, offsetY = 0) {
		let internalYOffset = offsetY;
		const start = logPerf[index];

		for (let j = index + 1; j < logPerf.length; j++) {
			const item = logPerf[j];

			if (item.label === start.label) {
				const ySize = 20 * (item.time - start.time);
				const rectStart = add2D(
					origin,
					{
						x: offsetX,
						y: offsetY,
					},
				);
				const rectEnd = add2D(
					rectStart,
					{
						x: 10,
						y: ySize,
					},
				);
				const inHot = _find(hotItems, hItem => hItem.id === item.label);

				this.drawRectangleFromCorners(
					rectStart,
					rectEnd,
					grey,
					inHot ? blue : red,
				);

				if (inHot) {
					this.drawText(
						`${item.label} ${item.time - start.time}`,
						add2D(
							rectStart,
							{
								x: 15,
								y: 0,
							},
						),
						20,
						darkestGrey,
					);
				}

				this.interactionList.push({
					id: item.label,
					type: toileType.PERF_RECT,
					data: {
						time: item.time - start.time,
						rectStart,
						rectEnd,
					},
				});
				return {ySize, k: j};
			}

			const {ySize, k} = this.drawPerf(logPerf, origin, hotItems, j, offsetX + 20, internalYOffset);

			j = k;
			internalYOffset += ySize;
		}

		return undefined;
	}
}
/* eslint-enable no-param-reassign, no-bitwise */

