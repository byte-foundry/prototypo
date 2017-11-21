/* global webkitRequestAnimationFrame, webkitCancelAnimationFrame */
import _get from 'lodash/get';
import _slice from 'lodash/slice';
import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';

import Toile, {mState, toileType, appState, transformCoords, inverseProjectionMatrix, canvasMode} from '../toile/toile';
import {rayRayIntersection} from '../prototypo.js/utils/updateUtils';

import {changeTransformOrigin, toLodashPath, glyphBoundingBox} from '../prototypo.js/utils/generic';
import {matrixMul, dot2D, mulScalar2D, subtract2D, normalize2D, add2D, distance2D} from '../prototypo.js/utils/linear';

import LocalClient from '../stores/local-client.stores';

import FontUpdater from './font-updater.components';

const raf = requestAnimationFrame || webkitRequestAnimationFrame;
const rafCancel = cancelAnimationFrame || webkitCancelAnimationFrame;
let rafId;

function handleModification(client, glyph, draggedItem, newPos, smoothMod, contour) {
	const {parentId, skeletonId, otherNode, otherDir, transforms} = draggedItem.data;
	const selectedNodeParent = _get(glyph, parentId);
	const skeletonNode = contour ? _get(glyph, parentId) : _get(glyph, skeletonId);
	const newVectorPreTransform = subtract2D(newPos, selectedNodeParent);
	const xTransform = transforms.indexOf('scaleX') === -1 ? 1 : -1;
	const yTransform = transforms.indexOf('scaleY') === -1 ? 1 : -1;
	const newVector = {
		x: newVectorPreTransform.x * xTransform,
		y: newVectorPreTransform.y * yTransform,
	};
	const angle = Math.atan2(newVector.y, newVector.x);
	const intersection = rayRayIntersection(selectedNodeParent, angle, otherNode, otherDir);
	let tension = distance2D(newPos, selectedNodeParent)
		/ (distance2D(intersection, selectedNodeParent) || 1);
	const dotProductForOrient = dot2D(
		subtract2D(
			selectedNodeParent, intersection,
		),
		subtract2D(
			newPos, selectedNodeParent,
		),
	);

	if (dotProductForOrient > 0) {
		tension *= -1;
	}

	const dir = toileType.NODE_IN === draggedItem.type || toileType.CONTOUR_NODE_IN === draggedItem.type ? 'In' : 'Out';
	const opposite = toileType.NODE_IN === draggedItem.type || toileType.CONTOUR_NODE_IN === draggedItem.type ? 'Out' : 'In';

	changesDirOfHandle(
		glyph,
		draggedItem,
		dir,
		angle,
		tension,
		skeletonNode,
		selectedNodeParent,
		client,
		opposite,
		smoothMod,
	);
}

function changesDirOfHandle(
	glyph,
	draggedItem,
	direction,
	angle,
	tension,
	node,
	parent,
	client,
	oppositeDirection,
	smoothMod,
) {
	const diff = angle - parent[`baseDir${direction}`];
	const changes = {
		[`${draggedItem.data.parentId}.dir${direction}`]: diff,
		[`${draggedItem.data.parentId}.tension${direction}`]: tension / (0.6 * (parent[`baseTension${direction}`] || (1 / 0.6))),
	};

	if (smoothMod) {
		changes[`${draggedItem.data.parentId}.${oppositeDirection}`] = angle - node[`dir${oppositeDirection}`];
	}

	client.dispatchAction('/change-glyph-node-manually', {
		changes,
		glyphName: glyph.name,
	});
}

function onCurveModification(
	toile,
	client,
	glyph,
	draggedItem,
	newPos,
	appStateValue,
	hotItems,
	moved,
) {
	if (moved) {
		const {baseWidth, oppositeId, baseAngle, skeleton, angleOffset} = draggedItem.data;
		const opposite = _get(glyph, oppositeId);
		// width factor
		const factor = distance2D(opposite, newPos) / baseWidth;

		// angle difference
		const newVec = subtract2D(newPos, skeleton);
		const angleDiff = Math.atan2(newVec.y, newVec.x) - baseAngle;

		const changes = {};

		if (
			(appStateValue ^ appState.ONCURVE_MOD_ANGLE_MODIFIER) // eslint-disable-line no-bitwise
			& appState.ONCURVE_MOD_ANGLE_MODIFIER
		) {
			changes[`${draggedItem.data.modifAddress}.width`] = factor;
		}

		if (
			(appStateValue ^ appState.ONCURVE_MOD_WIDTH_MODIFIER) // eslint-disable-line no-bitwise
			& appState.ONCURVE_MOD_WIDTH_MODIFIER
		) {
			changes[`${draggedItem.data.modifAddress}.angle`] = angleDiff + angleOffset;
		}

		client.dispatchAction('/change-glyph-node-manually', {
			changes,
			glyphName: glyph.name,
		});
	}

	const id = draggedItem.data.parentId;
	const skeletonNode = _get(glyph, id);

	if (skeletonNode) {
		toile.drawNodeTool(skeletonNode, `${id}.angle`, hotItems);
	}
}

function skeletonPosModification(toile, client, glyph, draggedItem, newPos, hotItems, moved) {
	if (moved) {
		const {base, transforms} = draggedItem.data;

		const mouseVec = subtract2D(newPos, base);
		const xTransform = transforms.indexOf('scaleX') === -1 ? 1 : -1;
		const yTransform = transforms.indexOf('scaleY') === -1 ? 1 : -1;

		client.dispatchAction('/change-glyph-node-manually', {
			changes: {
				[`${draggedItem.data.modifAddress}x`]: mouseVec.x * xTransform,
				[`${draggedItem.data.modifAddress}y`]: mouseVec.y * yTransform,
			},
			glyphName: glyph.name,
		});
	}

	const id = draggedItem.id;
	const skeletonNode = _get(glyph, id);

	if (skeletonNode) {
		toile.drawSkeletonPosTool(skeletonNode, `${id}.pos`, hotItems);
	}
}

function skeletonDistrModification(toile, client, glyph, draggedItem, newPos, hotItems, moved) {
	if (moved) {
		const {
			base,
			expandedTo,
			width,
			baseDistr,
		} = draggedItem.data;
		const skelVec = normalize2D(subtract2D(expandedTo[1], expandedTo[0]));
		const distProjOntoSkel = Math.min(Math.max(dot2D(
			subtract2D(newPos, expandedTo[0]),
			skelVec,
		), 0), width);
		const mouseVec = subtract2D(
			add2D(mulScalar2D(distProjOntoSkel, skelVec), expandedTo[0]),
			base,
		);

		client.dispatchAction('/change-glyph-node-manually', {
			changes: {
				[`${draggedItem.data.modifAddress}expand.distr`]: (distProjOntoSkel / width) - baseDistr,
				[`${draggedItem.data.modifAddress}x`]: mouseVec.x,
				[`${draggedItem.data.modifAddress}y`]: mouseVec.y,
			},
			glyphName: glyph.name,
		});
	}

	const id = draggedItem.id;
	const skeletonNode = _get(glyph, id);

	if (skeletonNode) {
		toile.drawSkeletonDistrTool(skeletonNode, `${id}.distr`, hotItems);
	}
}

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
				if (
					this.state.glyph
					&& window.glyph
					&& this.state.glyph.name !== window.glyph.name
				) {
					this.resetAppMode = true;
				}
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

		if (module.hot) {
			module.hot.accept('../toile/toile', () => {
				const ToileConstructor = require('../toile/toile').default; // eslint-disable-line global-require
				const [z,,,, tx, ty] = this.toile.viewMatrix;
				const newTs = {
					x: tx,
					y: ty,
				};

				this.toile = new ToileConstructor(this.canvas);

				this.toile.setCameraCenter(newTs, z, -this.canvas.clientHeight, this.canvas.clientWidth);
			});
		}

		const frameCounters = {
			componentMenu: 0,
		};
		let componentMenuPos = {};
		let draggedItem = null;
		let selectedItem = null;
		let contourSelected;
		let contourSelectedIndex = 0;
		let moving = false;
		// let dragging = true;
		let mouse = this.toile.getMouseState();
		let appStateValue = 0;
		let appMode;
		let oldAppMode;
		let oldAppState;
		let mouseDoubleClick;
		let pause = false;

		const rafFunc = () => {
			if (this.toile.keyboardDownRisingEdge.keyCode === 80) {
				pause = !pause;
			}

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
				if (this.resetAppMode) {
					appStateValue = 0;
					this.resetAppMode = false;
				}

				if (mouse.edge === mState.DOWN) {
					if (mouseDoubleClick) {
						const bbox = glyphBoundingBox(glyph);
						const center = mulScalar2D(1 / 2, add2D(
							bbox[0],
							bbox[1],
						));

						this.toile.setCameraCenter(center, 0.5, -height, width);
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

				// This is the state machine state changing part
				// There is 3 first level state
				if (appMode === canvasMode.MOVE) {
					if (mouse.state === mState.DOWN) {
						appStateValue = appState.MOVING;
					}
					else {
						appStateValue = 0;
					}
				}
				if (appMode === canvasMode.COMPONENTS) {
					let componentMenu = hotItems.filter(
						item => item.type === toileType.COMPONENT_MENU_ITEM_CENTER,
					);
					let componentChoice = hotItems.filter(
						item => item.type === toileType.COMPONENT_MENU_ITEM,
					);
					let components = hotItems.filter(
						item => item.type === toileType.COMPONENT_CHOICE
							|| item.type === toileType.COMPONENT_NONE_CHOICE,
					);

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
						appStateValue = 0;
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
				}
				if (appMode === canvasMode.SELECT_POINTS) {
					const nodes = hotItems.filter(item => item.type <= toileType.CONTOUR_NODE_OUT);
					const contours = hotItems.filter(item =>
						item.type === toileType.GLYPH_CONTOUR
						|| item.type === toileType.GLYPH_COMPONENT_CONTOUR,
					);

					if (appStateValue === 0) {
						if (mouseClickRelease) {
							if (contours.length > 0) {
								if (contours.length >= 1 && !moving) {
									contourSelected = contours[contourSelectedIndex % contours.length];
									contourSelectedIndex++;
								}

								appStateValue = appState.CONTOUR_SELECTED;
							}
						}
						selectedItem = null;
						draggedItem = null;
					}
					else if (
						appStateValue & appState.HANDLE_MOD
						|| appStateValue & appState.ONCURVE_MOD
						|| appStateValue & appState.SKELETON_POS
						|| appStateValue & appState.SKELETON_DISTR
					) {
						if (mouseClickRelease) {
							if (contours.length > 0 && draggedItem === null) {
								if (contours.length >= 1) {
									contourSelected = contours[contourSelectedIndex % contours.length];
									contourSelectedIndex++;
								}

								appStateValue = appState.CONTOUR_SELECTED;
								selectedItem = null;
								draggedItem = null;
							}
							else {
								selectedItem = draggedItem;
								draggedItem = null;
								appStateValue = appState.CONTOUR_SELECTED;
							}
						}
					}
					else if (appStateValue | appState.CONTOUR_SELECTED) {
						if (mouseClickRelease) {
							if (nodes.length > 0) {
								selectedItem = nodes[0];
							}
							else if (draggedItem !== null) { // eslint-disable-line no-negated-condition
								selectedItem = draggedItem;
							}
							else if (contours.length > 0) {
								if (contours.length >= 1 && !moving) {
									contourSelected = contours[contourSelectedIndex % contours.length];
									contourSelectedIndex++;
								}

								appStateValue = appState.CONTOUR_SELECTED;
								selectedItem = null;
								draggedItem = null;
							}
							else {
								selectedItem = null;
								contourSelected = undefined;
								contourSelectedIndex = 0;
								appStateValue = 0;
							}
						}
						else if (mouse.state === mState.DOWN) {
							if (nodes.length > 0) {
								if (draggedItem !== null && nodes[0].id === draggedItem.id) {
									draggedItem = nodes[0];
								}
								else {
									draggedItem = draggedItem === null ? nodes[0] : draggedItem;
								}
							}
							else {
								draggedItem = null;
							}

							selectedItem = null;
						}

						if (draggedItem !== null || selectedItem !== null) {
							const interactedItem = draggedItem || selectedItem;

							appStateValue |= appState.CONTOUR_SELECTED;

							switch (interactedItem.type) {
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
							}
						}
					}
				}

				if (mouse.wheel) {
					appStateValue |= appState.ZOOMING;
				}
				else {
					appStateValue &= ~appState.ZOOMING;
				}


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

				if (appMode === canvasMode.COMPONENTS) {
					this.toile.drawComponents(glyph.components, hotItems);
				}

				if (appStateValue & appState.CONTOUR_SELECTED) {
					this.toile.drawNodes(
						_get(
							glyph,
							toLodashPath(contourSelected.id)),
						contourSelected.id,
						[...hotItems, draggedItem || {}, selectedItem || {}],
						contourSelected.data.componentIdx === undefined ? '' : `components.${contourSelected.data.componentIdx}.`,
					);
					if (contourSelected.data.componentIdx === undefined) {
						this.toile.drawSelectedContour(
							_slice(
								glyph.otContours,
								contourSelected.data.indexes[0],
								contourSelected.data.indexes[1],
							),
						);
					}
					else {
						this.toile.drawSelectedContour(
							_slice(
								glyph.components[contourSelected.data.componentIdx].otContours,
								contourSelected.data.indexes[0],
								contourSelected.data.indexes[1],
							),
						);
					}
				}

				if (selectedItem) {
					if (this.toile.keyboardDownRisingEdge.keyCode === 27) {
						switch (selectedItem.type) {
						case toileType.NODE_IN:
						case toileType.CONTOUR_NODE_IN:
							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${selectedItem.data.parentId}.dirIn`]: undefined,
									[`${selectedItem.data.parentId}.tensionIn`]: undefined,
								},
								glyphName: glyph.name,
							});
							break;
						case toileType.NODE_OUT:
						case toileType.CONTOUR_NODE_OUT:
							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${selectedItem.data.parentId}.dirOut`]: undefined,
									[`${selectedItem.data.parentId}.tensionOut`]: undefined,
								},
								glyphName: glyph.name,
							});
							break;
						case toileType.NODE:
							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${selectedItem.data.modifAddress}.width`]: undefined,
									[`${selectedItem.data.modifAddress}.angle`]: undefined,
								},
								glyphName: glyph.name,
							});
							break;
						case toileType.CONTOUR_NODE:
						case toileType.NODE_SKELETON:
							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${selectedItem.data.modifAddress}x`]: 0,
									[`${selectedItem.data.modifAddress}y`]: 0,
								},
								glyphName: glyph.name,
							});
							break;
						default:
							break;
						}
					}
				}

				let moved = mouse.delta.x !== 0 || mouse.delta.y !== 0;

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

				let newPos;
				let interactedItem;

				if (draggedItem !== null) {
					const [mousePosInWorld] = transformCoords(
						[mouse.pos],
						inverseProjectionMatrix(this.toile.viewMatrix),
						this.toile.height / this.toile.viewMatrix[0],
					);

					newPos = mousePosInWorld;
					interactedItem = draggedItem;
				}
				else if (selectedItem !== null) {
					if (this.toile.keyboardDownRisingEdge.keyCode === 40) {
						newPos = add2D(_get(glyph, selectedItem.id), {x: 0, y: -1});
						moved = true;
					}
					if (this.toile.keyboardDownRisingEdge.keyCode === 38) {
						newPos = add2D(_get(glyph, selectedItem.id), {x: 0, y: 1});
						moved = true;
					}
					if (this.toile.keyboardDownRisingEdge.keyCode === 37) {
						newPos = add2D(_get(glyph, selectedItem.id), {x: -1, y: 0});
						moved = true;
					}
					if (this.toile.keyboardDownRisingEdge.keyCode === 39) {
						newPos = add2D(_get(glyph, selectedItem.id), {x: 1, y: 0});
						moved = true;
					}
					interactedItem = selectedItem;
				}

				if (interactedItem && newPos) {
					if (appStateValue & appState.HANDLE_MOD) {
						const smoothMod = appStateValue & appState.HANDLE_MOD_SMOOTH_MODIFIER;

						handleModification(
							this.client,
							glyph,
							interactedItem,
							newPos,
							smoothMod,
						);
					}
					if (appStateValue & (appState.HANDLE_MOD | appState.CONTOUR_SWITCH)) {
						const smoothMod = appStateValue & appState.HANDLE_MOD_SMOOTH_MODIFIER;

						handleModification(
							this.client,
							glyph,
							interactedItem,
							newPos,
							smoothMod,
							true,
						);
					}
					if (appStateValue & appState.ONCURVE_MOD) {
						onCurveModification(
							this.toile,
							this.client,
							glyph,
							interactedItem,
							newPos,
							appStateValue,
							hotItems,
							moved,
						);
					}
					if (appStateValue & appState.SKELETON_POS) {
						skeletonPosModification(
							this.toile,
							this.client,
							glyph,
							interactedItem,
							newPos,
							hotItems,
							moved,
						);
					}
					if (appStateValue & appState.SKELETON_DISTR) {
						skeletonDistrModification(
							this.toile,
							this.client,
							glyph,
							interactedItem,
							newPos,
							hotItems,
							moved,
						);
					}
				}

				if (interactedItem) {
					if (interactedItem.type === toileType.NODE_SKELETON) {
						const item = _get(glyph, interactedItem.id);

						this.toile.drawNodeProperty(interactedItem.type, item);
					}
					if (interactedItem.type === toileType.NODE) {
						const item = _get(glyph, interactedItem.id);
						const parent = _get(glyph, interactedItem.data.parentId);

						this.toile.drawNodeProperty(interactedItem.type, item, parent);
					}
					if (interactedItem.type === toileType.CONTOUR_NODE) {
						const item = _get(glyph, interactedItem.id);

						this.toile.drawNodeProperty(interactedItem.type, item, parent);
					}
					if (
						interactedItem.type === toileType.NODE_OUT
						|| interactedItem.type === toileType.NODE_IN
						|| interactedItem.type === toileType.CONTOUR_NODE_OUT
						|| interactedItem.type === toileType.CONTOUR_NODE_IN
					) {
						const item = _get(glyph, interactedItem.id);
						const parent = _get(glyph, interactedItem.data.parentId);

						this.toile.drawNodeProperty(interactedItem.type, item, parent);
					}
				}
			}
			this.toile.clearKeyboardEdges();
			this.toile.clearMouseEdges();
			this.toile.clearDelta();
			this.toile.clearWheelDelta();

			rafId = raf(rafFunc);
			/* eslint-enable no-bitwise, max-depth */
		};

		rafId = raf(rafFunc);
	}

	componentWillUnmount() {
		this.lifespan.release();
		rafCancel(rafId);
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
