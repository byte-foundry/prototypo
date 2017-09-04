/* global _, webkitRequestAnimationFrame */
import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';

import Toile, {mState, toileType, appState, transformCoords, inverseProjectionMatrix, canvasMode} from '../toile/toile';
import {rayRayIntersection} from '../prototypo.js/utils/updateUtils';

import {changeTransformOrigin, toLodashPath, glyphBoundingBox} from '../prototypo.js/helpers/utils';
import {matrixMul, dot2D, mulScalar2D, subtract2D, normalize2D, add2D, distance2D} from '../plumin/util/linear';

import {pushToPerf, resetArray} from '../helpers/log-perf.helpers';

import LocalClient from '../stores/local-client.stores';

import FontUpdater from './font-updater.components';

export default class GlyphCanvas extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			solved: [],
			values: {},
			workers: Array(4).fill(false),
			font: {
				glyphs: [],
			},
		};

		this.changeParam = this.changeParam.bind(this);
		this.download = this.download.bind(this);
	}

	componentWillMount() {
		pleaseWait.instance.finish();
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate(() => {
				this.setState({
					glyph: window.glyph,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					workers: head.toJS().d.workers,
					canvasMode: head.toJS().d.canvasMode,
					uiOutline: head.toJS().d.uiOutline,
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
		this.toile.setCamera({x: 0, y: 0}, 1, this.canvas.clientHeight);

		const frameCounters = {
			componentMenu: 0,
		};
		let componentMenuPos = {};
		let draggedItem;
		let selectedItem;
		let contourSelectedCursor;
		let contourIndexes;
		let contourComponentIdx;
		let contourSelectedIndex = 0;
		let moving = false;
		let mouse = this.toile.getMouseState();
		let appStateValue;
		let appMode;
		let oldAppMode;
		let oldAppState;
		let mouseDoubleClick;
		let pause = false;

		const raf = requestAnimationFrame || webkitRequestAnimationFrame;
		const rafFunc = () => {

			if (this.toile.keyboardDownRisingEdge.keyCode === 80) {
				pause = !pause;
			}

			if (!pause) {
				resetArray();
				pushToPerf({time: performance.now(), label: 'raf'});
				/* eslint-disable no-bitwise, max-depth */
				const hotItems = this.toile.getHotInteractiveItem();
				const width = this.canvas.clientWidth;
				const height = this.canvas.clientHeight;

				this.canvas.height = height;
				this.canvas.width = width;
				const oldMouse = mouse;
				let mouseClickRelease = false;

				mouse = this.toile.getMouseState();

				switch (this.state.canvasMode) {
				case 'components':
					appMode = canvasMode.COMPONENTS;
					break;
				case 'select-points':
					appMode = canvasMode.SELECT_POINTS;
					break;
				case 'move':
				default:
					appMode = canvasMode.MOVE;
					break;
				}

				if (mouse.state === mState.UP
					&& oldMouse.state === mState.DOWN) {
					mouseClickRelease = true;
				}

				const glyph = this.state.glyph;


				if (glyph) {
					if (mouse.edge === mState.DOWN) {
						if (mouseDoubleClick) {
							const bbox = glyphBoundingBox(glyph);
							const center = mulScalar2D(1 / 2, add2D(
								bbox[0],
								bbox[1],
							));

							this.toile.setCameraCenter(center, this.toile.viewMatrix[0], -height, width);
						}
						else {
							mouseDoubleClick = true;
							setTimeout(() => {
								mouseDoubleClick = false;
							}, 400);
						}
					}

					if (this.toile.keyboardUp.keyCode) {
						const {keyCode} = this.toile.keyboardUp;

						if (keyCode === 32) {
							appMode = oldAppMode;
							this.client.dispatchAction('/store-value', {canvasMode: oldAppMode});
							if (appMode === 'select-points') {
								appStateValue = oldAppState;
							}

							oldAppMode = undefined;
							oldAppState = undefined;
						}
						this.toile.clearKeyboardInput();
					}

					if (this.toile.keyboardDownRisingEdge.keyCode) {
						const {keyCode} = this.toile.keyboardDownRisingEdge;

						if (keyCode === 32) {
							oldAppMode = this.state.canvasMode;
							oldAppState = appStateValue;
							appMode = canvasMode.MOVE;
							this.client.dispatchAction('/store-value', {canvasMode: 'move'});
						}
					}

					pushToPerf({time: performance.now(), label: 'filter'});
					const nodes = hotItems.filter(item => item.type <= toileType.CONTOUR_NODE_OUT);
					const tools = hotItems.filter(item => item.type === toileType.DISTR_TOOL);
					let components = hotItems.filter(
						item => item.type === toileType.COMPONENT_CHOICE
							|| item.type === toileType.COMPONENT_NONE_CHOICE,
					);
					let componentMenu = hotItems.filter(
						item => item.type === toileType.COMPONENT_MENU_ITEM_CENTER,
					);
					let componentChoice = hotItems.filter(
						item => item.type === toileType.COMPONENT_MENU_ITEM,
					);
					const contours = hotItems.filter(item =>
						item.type === toileType.GLYPH_CONTOUR || item.type === toileType.GLYPH_COMPONENT_CONTOUR,
					);
					pushToPerf({time: performance.now(), label: 'filter'});

					if (appMode === canvasMode.MOVE) {
						if (mouse.state === mState.DOWN) {
							appStateValue = appState.MOVING;
						}
						else {
							appStateValue = undefined;
						}
					}
					if (appMode === canvasMode.SELECT_POINTS) {
						if (mouse.state === mState.DOWN) {
							if (tools.length === 1) {
								draggedItem = draggedItem.type !== undefined ? draggedItem : tools[0];
							}
							else if (nodes.length > 0) {
								if (draggedItem && nodes[0].id === draggedItem.id) {
									draggedItem = nodes[0];
								}
								else {
									draggedItem = draggedItem.type !== undefined ? draggedItem : nodes[0];
								}
							}
							else {
								draggedItem = draggedItem || {};
							}

							switch (draggedItem.type) {
							case toileType.CONTOUR_NODE_IN:
							case toileType.CONTOUR_NODE_OUT: {
								appStateValue = appState.HANDLE_MOD
									| appState.CONTOUR_SWITCH
									| appState.CONTOUR_SELECTED;
								if (this.toile.keyboardDown.keyCode === 17) {
									appStateValue |= appState.HANDLE_MOD_SMOOTH_MODIFIER;
								}
								break;
							}
							case toileType.NODE_IN:
							case toileType.NODE_OUT: {
								appStateValue = appState.HANDLE_MOD | appState.CONTOUR_SELECTED;
								if (this.toile.keyboardDown.keyCode === 17) {
									appStateValue |= appState.HANDLE_MOD_SMOOTH_MODIFIER;
								}
								break;
							}
							case toileType.NODE: {
								appStateValue = appState.ONCURVE_MOD | appState.CONTOUR_SELECTED;
								if (this.toile.keyboardDown.keyCode === 17) {
									appStateValue |= appState.ONCURVE_MOD_ANGLE_MODIFIER;
								}
								else if (this.toile.keyboardDown.keyCode === 16) {
									appStateValue |= appState.ONCURVE_MOD_WIDTH_MODIFIER;
								}
								break;
							}
							case toileType.NODE_SKELETON:
							case toileType.CONTOUR_NODE: {
								if (this.toile.keyboardDown.keyCode === 17) {
									appStateValue = appState.SKELETON_DISTR | appState.CONTOUR_SELECTED;
								}
								else {
									appStateValue = appState.SKELETON_POS | appState.CONTOUR_SELECTED;
								}
								break;
							}
							default:
								appStateValue = undefined;
							}
						}
						else if (mouseClickRelease) {
							if (hotItems.length > 0) {
								if (nodes.length > 0) {
									selectedItem = nodes[0];
								}
								else if (contours.length === 1 && !moving) {
									contourSelectedCursor = contours[0].id;
									contourIndexes = contours[0].data.indexes;
									contourComponentIdx = contours[0].data.componentIdx;
								}
								else if (contours.length > 1 && !moving) {
									contourSelectedCursor = contours[contourSelectedIndex % contours.length].id;
									contourComponentIdx = contours[contourSelectedIndex
										% contours.length].data.componentIdx;
									contourIndexes = contours[contourSelectedIndex % contours.length].data.indexes;
									contourSelectedIndex++;
								}

								appStateValue = appState.CONTOUR_SELECTED;
							}
							else if (hotItems.length === 0 && !moving && draggedItem !== {}) {
								contourSelectedCursor = undefined;
								contourIndexes = undefined;
								contourSelectedIndex = 0;
								contourComponentIdx = undefined;
								selectedItem = undefined;
							}
							else {
								appStateValue = undefined;
							}

							draggedItem = {};
						}
					}
					if (appMode === canvasMode.COMPONENTS) {
						if (mouseClickRelease) {
							if (componentChoice.length > 0) {
								const [choice] = componentChoice;

								this.client.dispatchAction('/change-component', {
									glyph,
									id: choice.data.componentId,
									name: choice.id,
								});

								componentChoice = [];
								componentMenu = [];
								components = [];
							}
						}

						if (components.length > 0) {
							appStateValue = appState.COMPONENT_HOVERED;
						}
						else if (componentMenu.length > 0) {
							appStateValue = appState.COMPONENT_MENU_HOVERED;
						}
						else {
							appStateValue = undefined;
						}
					}

					if (mouse.wheel) {
						appStateValue |= appState.ZOOMING;
					}


					pushToPerf({time: performance.now(), label: 'draw'});
					this.toile.clearCanvas(width, height);
					this.toile.drawTypographicFrame(
						glyph,
						this.state.values,
					);
					this.toile.drawGlyph(glyph, hotItems, this.state.uiOutline);
					this.toile.drawSelectableContour(
						glyph,
						appMode === canvasMode.SELECT_POINTS ? hotItems : [],
					);
					pushToPerf({time: performance.now(), label: 'draw'});

					if (appMode === canvasMode.COMPONENTS) {
						this.toile.drawComponents(glyph.components, hotItems);
					}

					if (appStateValue & appState.CONTOUR_SELECTED) {
						this.toile.drawNodes(
							_.get(
								glyph,
								toLodashPath(contourSelectedCursor)),
							contourSelectedCursor,
							hotItems,
							contourComponentIdx === undefined ? '' : `components.${contourComponentIdx}.`,
						);
						if (contourComponentIdx === undefined) {
							this.toile.drawSelectedContour(
								_.slice(
									glyph.otContours,
									contourIndexes[0],
									contourIndexes[1],
								),
							);
						}
						else {
							this.toile.drawSelectedContour(
								_.slice(
									glyph.components[contourComponentIdx].otContours,
									contourIndexes[0],
									contourIndexes[1],
								),
							);
						}
					}

					if (nodes.length > 0) {
						if (this.toile.keyboardDownRisingEdge.keyCode === 27) {
							nodes.forEach((node) => {
								switch (node.type) {
								case toileType.NODE_IN:
								case toileType.CONTOUR_NODE_IN:
									this.client.dispatchAction('/change-glyph-node-manually', {
										changes: {
											[`${node.data.parentId}.dirIn`]: undefined,
											[`${node.data.parentId}.tensionIn`]: undefined,
										},
										glyphName: glyph.name,
									});
									break;
								case toileType.NODE_OUT:
								case toileType.CONTOUR_NODE_OUT:
									this.client.dispatchAction('/change-glyph-node-manually', {
										changes: {
											[`${node.data.parentId}.dirOut`]: undefined,
											[`${node.data.parentId}.tensionOut`]: undefined,
										},
										glyphName: glyph.name,
									});
									break;
								case toileType.NODE:
									this.client.dispatchAction('/change-glyph-node-manually', {
										changes: {
											[`${node.data.modifAddress}.width`]: undefined,
											[`${node.data.modifAddress}.angle`]: undefined,
										},
										glyphName: glyph.name,
									});
									break;
								case toileType.CONTOUR_NODE:
								case toileType.NODE_SKELETON:
									this.client.dispatchAction('/change-glyph-node-manually', {
										changes: {
											[`${node.data.modifAddress}x`]: 0,
											[`${node.data.modifAddress}y`]: 0,
										},
										glyphName: glyph.name,
									});
									break;
								default:
									break;
								}
							});
						}
					}


					if (appStateValue === appState.COMPONENT_HOVERED) {
						const [component] = components;

						if (componentMenuPos.id !== component.data.id) {
							frameCounters.componentMenu = 0;
						}

						componentMenuPos = this.toile.drawComponentMenu(
							component.data,
							frameCounters.componentMenu,
							hotItems,
							width,
							componentMenuPos,
						);

						frameCounters.componentMenu += 1;
					}
					else if (appStateValue === appState.COMPONENT_MENU_HOVERED) {
						const [component] = componentMenu;

						componentMenuPos = this.toile.drawComponentMenu(
							component.data.component,
							frameCounters.componentMenu,
							hotItems,
							width,
							componentMenuPos,
						);
						frameCounters.componentMenu += 1;
					}
					else {
						componentMenuPos = {};
						frameCounters.componentMenu = 0;
					}

					const mouseMoved = mouse.delta.x !== 0 || mouse.delta.y !== 0;

					if (appStateValue & appState.MOVING) {
						const [z,,,, tx, ty] = this.toile.viewMatrix;
						const newTs = {
							x: tx + mouse.delta.x,
							y: ty + mouse.delta.y,
						};

						if (
							newTs.x !== tx
							|| newTs.y !== ty
						) {
							moving = true;
						}
						this.toile.setCamera(newTs, z, -height);
					}
					else if (appStateValue & appState.ZOOMING) {
						const [z,,,, x, y] = this.toile.viewMatrix;
						const [mousePosInWorld] = transformCoords(
							[mouse.pos],
							inverseProjectionMatrix(this.toile.viewMatrix),
							this.toile.height / z,
						);
						const transformMatrix = changeTransformOrigin(
							mousePosInWorld,
							[1 + (mouse.wheel / 1000), 0, 0, 1 + (mouse.wheel / 1000), 0, 0],
						);
						const [zoom,,,, newTx, newTy] = matrixMul(transformMatrix, this.toile.viewMatrix);
						const clampedZoom = Math.max(0.1, Math.min(10, zoom));

						this.toile.setCamera({
							x: z === clampedZoom ? x : newTx,
							y: z === clampedZoom ? y : newTy,
						}, clampedZoom, -height);
					}
					else {
						moving = false;
					}

					pushToPerf({time: performance.now(), label: 'mod'});
					if (appStateValue & appState.HANDLE_MOD) {
						const {parentId, skeletonId, otherNode, otherDir} = draggedItem.data;
						const selectedNodeParent = _.get(glyph, parentId);
						const skeletonNode = _.get(glyph, skeletonId);
						const [mousePosInWorld] = transformCoords(
							[mouse.pos],
							inverseProjectionMatrix(this.toile.viewMatrix),
							this.toile.height / this.toile.viewMatrix[0],
						);
						const mouseVec = subtract2D(mousePosInWorld, selectedNodeParent);
						const angle = Math.atan2(mouseVec.y, mouseVec.x);
						const intersection = rayRayIntersection(selectedNodeParent, angle, otherNode, otherDir);
						let tension = distance2D(mousePosInWorld, selectedNodeParent)
							/ (distance2D(intersection, selectedNodeParent) || 1);
						const dotProductForOrient = dot2D(
							subtract2D(
								selectedNodeParent, intersection,
							),
							subtract2D(
								mousePosInWorld, selectedNodeParent,
							),
						);
						let dirDiff;

						if (dotProductForOrient > 0) {
							tension *= -1;
						}

						if (toileType.NODE_IN === draggedItem.type) {
							dirDiff = angle - selectedNodeParent.baseDirIn;
							const changes = {
								[`${draggedItem.data.parentId}.dirIn`]: dirDiff,
								[`${draggedItem.data.parentId}.tensionIn`]: tension / (0.6 * (selectedNodeParent.baseTensionIn || (1 / 0.6))),
							};

							if (appStateValue & appState.HANDLE_MOD_SMOOTH_MODIFIER) {
								changes[`${draggedItem.data.parentId}.dirOut`] = angle - skeletonNode.dirOut;
							}

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes,
								glyphName: glyph.name,
							});
						}
						else if (toileType.NODE_OUT === draggedItem.type) {
							dirDiff = angle - selectedNodeParent.baseDirOut;
							const changes = {
								[`${draggedItem.data.parentId}.dirOut`]: dirDiff,
								[`${draggedItem.data.parentId}.tensionOut`]: tension / (0.6 * (selectedNodeParent.baseTensionOut || (1 / 0.6))),
							};

							if (appStateValue & appState.HANDLE_MOD_SMOOTH_MODIFIER) {
								changes[`${draggedItem.data.parentId}.dirIn`] = angle - skeletonNode.dirIn;
							}

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes,
								glyphName: glyph.name,
							});
						}
					}
					if (appStateValue & (appState.HANDLE_MOD | appState.CONTOUR_SWITCH)) {
						const {parentId, otherNode, otherDir} = draggedItem.data;
						const selectedNodeParent = _.get(glyph, parentId);
						const [mousePosInWorld] = transformCoords(
							[mouse.pos],
							inverseProjectionMatrix(this.toile.viewMatrix),
							this.toile.height / this.toile.viewMatrix[0],
						);
						const mouseVec = subtract2D(mousePosInWorld, selectedNodeParent);
						const angle = Math.atan2(mouseVec.y, mouseVec.x);
						const intersection = rayRayIntersection(selectedNodeParent, angle, otherNode, otherDir);
						let tension = distance2D(mousePosInWorld, selectedNodeParent)
							/ distance2D(intersection, selectedNodeParent);
						const dotProductForOrient = dot2D(
							subtract2D(selectedNodeParent, intersection),
							subtract2D(mousePosInWorld, selectedNodeParent),
						);
						let dirDiff;

						if (dotProductForOrient > 0) {
							tension *= -1;
						}

						if (toileType.CONTOUR_NODE_IN === draggedItem.type) {
							dirDiff = angle - selectedNodeParent.dirIn;
							const changes = {
								[`${draggedItem.data.parentId}.dirIn`]: dirDiff,
								[`${draggedItem.data.parentId}.tensionIn`]: tension / (0.6 * (selectedNodeParent.baseTensionIn || (1 / 0.6))),
							};

							if (appStateValue & appState.HANDLE_MOD_SMOOTH_MODIFIER) {
								changes[`${draggedItem.data.parentId}.dirOut`] = angle - selectedNodeParent.dirOut;
							}

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes,
								glyphName: glyph.name,
							});
						}
						else if (toileType.CONTOUR_NODE_OUT === draggedItem.type) {
							dirDiff = angle - selectedNodeParent.dirOut;
							const changes = {
								[`${draggedItem.data.parentId}.dirOut`]: dirDiff,
								[`${draggedItem.data.parentId}.tensionOut`]: tension / (0.6 * (selectedNodeParent.baseTensionOut || (1 / 0.6))),
							};

							if (appStateValue & appState.HANDLE_MOD_SMOOTH_MODIFIER) {
								changes[`${draggedItem.data.parentId}.dirIn`] = angle - selectedNodeParent.dirIn;
							}

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes,
								glyphName: glyph.name,
							});
						}
					}
					if (appStateValue & appState.ONCURVE_MOD) {
						const {baseWidth, oppositeId, baseAngle, skeleton, angleOffset} = draggedItem.data;
						const [mousePosInWorld] = transformCoords(
							[mouse.pos],
							inverseProjectionMatrix(this.toile.viewMatrix),
							this.toile.height / this.toile.viewMatrix[0],
						);
						const opposite = _.get(glyph, oppositeId);
						// width factor
						const factor = distance2D(opposite, mousePosInWorld) / baseWidth;

						// angle difference
						const mouseVec = subtract2D(mousePosInWorld, skeleton);
						const angleDiff = Math.atan2(mouseVec.y, mouseVec.x) - baseAngle;

						if (mouseMoved) {
							const changes = {};

							if (
								(appStateValue ^ appState.ONCURVE_MOD_ANGLE_MODIFIER)
								& appState.ONCURVE_MOD_ANGLE_MODIFIER
							) {
								changes[`${draggedItem.data.modifAddress}.width`] = factor;
							}

							if (
								(appStateValue ^ appState.ONCURVE_MOD_WIDTH_MODIFIER)
								& appState.ONCURVE_MOD_WIDTH_MODIFIER
							) {
								changes[`${draggedItem.data.modifAddress}.angle`] = angleDiff + angleOffset;
							}

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes,
								glyphName: glyph.name,
							});
						}

						const id = draggedItem.data.parentId;
						const skeletonNode = _.get(glyph, id);

						if (skeleton) {
							this.toile.drawNodeTool(skeletonNode, `${id}.angle`, hotItems);
						}
					}
					if (appStateValue & appState.SKELETON_POS) {
						const {base} = draggedItem.data;
						const [mousePosInWorld] = transformCoords(
							[mouse.pos],
							inverseProjectionMatrix(this.toile.viewMatrix),
							this.toile.height / this.toile.viewMatrix[0],
						);

						const mouseVec = subtract2D(mousePosInWorld, base);

						if (mouseMoved) {
							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${draggedItem.data.modifAddress}x`]: mouseVec.x,
									[`${draggedItem.data.modifAddress}y`]: mouseVec.y,
								},
								glyphName: glyph.name,
							});
						}

						const id = draggedItem.id;
						const skeletonNode = _.get(glyph, id);

						if (skeletonNode) {
							this.toile.drawSkeletonPosTool(skeletonNode, `${id}.pos`, hotItems);
						}
					}
					if (appStateValue & appState.SKELETON_DISTR) {
						const {base, expandedTo, width, baseDistr} = draggedItem.data;
						const [mousePosInWorld] = transformCoords(
							[mouse.pos],
							inverseProjectionMatrix(this.toile.viewMatrix),
							this.toile.height / this.toile.viewMatrix[0],
						);

						const skelVec = normalize2D(subtract2D(expandedTo[1], expandedTo[0]));
						const distProjOntoSkel = Math.min(Math.max(dot2D(
							subtract2D(mousePosInWorld, expandedTo[0]),
							skelVec,
						), 0), width);

						const mouseVec = subtract2D(
							add2D(mulScalar2D(distProjOntoSkel, skelVec), expandedTo[0]),
							base,
						);

						if (mouseMoved) {
							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${draggedItem.data.modifAddress}expand.distr`]: (distProjOntoSkel / width) - baseDistr,
									[`${draggedItem.data.modifAddress}x`]: mouseVec.x,
									[`${draggedItem.data.modifAddress}y`]: mouseVec.y,
								},
								glyphName: glyph.name,
							});
						}

						const id = draggedItem.id;
						const skeletonNode = _.get(glyph, id);

						if (skeletonNode) {
							this.toile.drawSkeletonDistrTool(skeletonNode, `${id}.distr`, hotItems);
						}
					}
					pushToPerf({time: performance.now(), label: 'mod'});

					if (selectedItem) {
						if (selectedItem.type === toileType.NODE_SKELETON) {
							this.toile.drawSkeletonProperty(selectedItem);
						}
					}
				}
				this.toile.clearKeyboardEdges();
				this.toile.clearMouseEdges();
				this.toile.clearDelta();
				this.toile.clearWheelDelta();

				pushToPerf({time: performance.now(), label: 'raf'});
			}
			else {
				this.toile.clearKeyboardEdges();
				this.toile.clearKeyboardInput();
			}
			raf(rafFunc);
			/* eslint-enable no-bitwise, max-depth */
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
		return (
			<div className="prototypo-canvas-container">
				<canvas
					id="hello"
					ref={(canvas) => {this.canvas = canvas;}}
					style={{width: '100%', height: '100%', '-webkit-user-drag': 'none', userSelect: 'none', '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'}}
				/>
				<FontUpdater />
			</div>
		);
	}
}
