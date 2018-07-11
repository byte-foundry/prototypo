/* global webkitRequestAnimationFrame, webkitCancelAnimationFrame */
import _get from 'lodash/get';
import _slice from 'lodash/slice';
import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';

import Toile, {
	mState,
	toileType,
	appState,
	transformCoords,
	inverseProjectionMatrix,
	canvasMode,
	specialKey,
} from '../toile/toile';

import {
	changeTransformOrigin,
	glyphBoundingBox,
} from '../prototypo.js/utils/generic';
import {
	matrixMul,
	dot2D,
	mulScalar2D,
	subtract2D,
	normalize2D,
	add2D,
	distance2D,
	round2D,
} from '../prototypo.js/utils/linear';

import LocalClient from '../stores/local-client.stores';

import FontUpdater from './font-updater.components';

const raf = requestAnimationFrame || webkitRequestAnimationFrame;
const rafCancel = cancelAnimationFrame || webkitCancelAnimationFrame;

const MINIMUM_DRAG_THRESHOLD = 6;
const MINIMUM_DRAG_DIRECTIONAL_THRESHOLD = 10;

const agnosticCtrl
	= navigator.platform.indexOf('Mac') === -1 ? specialKey.CTRL : specialKey.META;

const directionalMod = {
	X: 0b1,
	Y: 0b10,
};

const onCurveModMode = {
	WIDTH_MOD: 0b1,
	ANGLE_MOD: 0b10,
};

export function changeGlyphManually(
	changes,
	glyph,
	client,
	globalMode,
	componentName,
) {
	const glyphName = globalMode ? componentName : glyph.base || glyph.name;

	client.dispatchAction('/change-glyph-node-manually', {
		changes,
		glyphName,
		label: 'manual edition',
		force: true,
	});
}

function calculateHandleCoordinateModification(parentRef, newPos, opHandle) {
	const d = subtract2D(newPos, parentRef);
	const zero = {x: 0, y: 0};
	const dr = distance2D(d, zero);
	const radius = distance2D(opHandle, parentRef);
	const pointa = mulScalar2D(1 / dr ** 2, {
		x: Math.sign(d.y) * d.x * Math.sqrt(radius ** 2 * dr ** 2),
		y: Math.abs(d.y) * Math.sqrt(radius ** 2 * dr ** 2),
	});
	const pointb = mulScalar2D(1 / dr ** 2, {
		x: -Math.sign(d.y) * d.x * Math.sqrt(radius ** 2 * dr ** 2),
		y: -Math.abs(d.y) * Math.sqrt(radius ** 2 * dr ** 2),
	});

	const point = dot2D(d, pointa) <= 0 ? pointa : pointb;

	return add2D(point, parentRef);
}

export function handleModification(
	client,
	glyph,
	draggedItem,
	newPos,
	unsmoothMod,
	unparallelMod,
	globalMode,
	toile,
) {
	const {
		parentId,
		parallelId,
		transforms,
		componentPrefixAddress,
		nodeAddress,
		componentName,
		opId,
	} = draggedItem.data;
	const handle = _get(glyph, draggedItem.id);
	const opHandle = _get(glyph, opId);
	const handlePos = {
		x: handle.xBase,
		y: handle.yBase,
	};
	const parent = _get(glyph, parentId);
	let xTransform = 1;
	let yTransform = 1;
	let angleTransform = 0;

	for (let i = 0; i < transforms.length; i++) {
		const transform = transforms[i];

		if (transform) {
			xTransform
				/= transform.name.indexOf('scaleX') === -1 ? 1 : transform.param;
			yTransform
				/= transform.name.indexOf('scaleY') === -1 ? 1 : transform.param;
			angleTransform
				+= transform.name.indexOf('rotate') === -1 ? 0 : transform.param;
		}
	}
	const newVectorPreTransform = subtract2D(newPos, handlePos);
	const newVectorScale = {
		x: newVectorPreTransform.x * xTransform,
		y: newVectorPreTransform.y * yTransform,
	};
	const newVector = {
		x:
			newVectorScale.x * Math.cos(angleTransform)
			+ newVectorScale.y * Math.sin(angleTransform),
		y:
			newVectorScale.y * Math.cos(angleTransform)
			- newVectorScale.x * Math.sin(angleTransform),
	};
	const refLength = distance2D(newPos, parent);
	const tension = refLength / distance2D(handlePos, parent);
	const isIn
		= toileType.NODE_IN === draggedItem.type
		|| toileType.CONTOUR_NODE_IN === draggedItem.type;

	const direction = isIn ? 'handleIn' : 'handleOut';
	const oppositeDirection = isIn ? 'handleOut' : 'handleIn';

	const changes = {
		[`${parentId}.${direction}.x`]: newVector.x,
		[`${parentId}.${direction}.y`]: newVector.y,
	};

	if (
		!unsmoothMod
		&& (parent.baseTypeIn === 'smooth' || parent.baseTypeOut === 'smooth')
	) {
		const opVector = calculateHandleCoordinateModification(
			parent,
			newPos,
			opHandle,
		);
		const modVector = subtract2D(opVector, {
			x: opHandle.xBase,
			y: opHandle.yBase,
		});

		changes[`${parentId}.${oppositeDirection}.x`] = modVector.x;
		changes[`${parentId}.${oppositeDirection}.y`] = modVector.y;
	}

	changeGlyphManually(changes, glyph, client, globalMode, componentName);
}

export function onCurveModification(
	client,
	glyph,
	draggedItem,
	newPos,
	appStateValue,
	modToApply,
	globalMode,
) {
	const {
		baseWidth,
		oppositeId,
		baseAngle,
		skeleton,
		angleOffset,
		transforms,
		componentName,
	} = draggedItem.data;

	if (modToApply & onCurveModMode.WIDTH_MOD) {
	}

	const current = _get(glyph, draggedItem.id);
	const newPosition = round2D(newPos);
	const deltaVector = round2D(
		subtract2D(newPos, round2D({x: current.xBase, y: current.yBase})),
	);

	const inOffest = round2D(subtract2D(current.handleIn, current));
	const outOffset = round2D(subtract2D(current.handleOut, current));

	const inNewPos = round2D(add2D(newPos, inOffest));
	const outNewPos = round2D(add2D(newPos, outOffset));

	const inVector = round2D(
		subtract2D(inNewPos, {
			x: current.handleIn.xBase,
			y: current.handleIn.yBase,
		}),
	);
	const outVector = round2D(
		subtract2D(outNewPos, {
			x: current.handleOut.xBase,
			y: current.handleOut.yBase,
		}),
	);

	const changes = {};

	changes[`${draggedItem.id}.x`] = deltaVector.x;
	changes[`${draggedItem.id}.y`] = deltaVector.y;
	changes[`${draggedItem.id}.handleIn.x`] = inVector.x;
	changes[`${draggedItem.id}.handleIn.y`] = inVector.y;
	changes[`${draggedItem.id}.handleOut.x`] = outVector.x;
	changes[`${draggedItem.id}.handleOut.y`] = outVector.y;

	changeGlyphManually(changes, glyph, client, globalMode, componentName);
}

export function skeletonPosModification(
	client,
	glyph,
	draggedItem,
	newPos,
	globalMode,
) {
	const {base, transforms, componentName} = draggedItem.data;
	const mouseVec = subtract2D(newPos, base);
	let xTransform = 1;
	let yTransform = 1;
	let angleTransform = 0;

	for (let i = 0; i < transforms.length; i++) {
		const transform = transforms[i];

		if (transform) {
			xTransform
				/= transform.name.indexOf('scaleX') === -1 ? 1 : transform.param;
			yTransform
				/= transform.name.indexOf('scaleY') === -1 ? 1 : transform.param;
			angleTransform
				+= transform.name.indexOf('rotate') === -1 ? 0 : transform.param;
		}
	}

	const mouseVecScale = {
		x: mouseVec.x * xTransform,
		y: mouseVec.y * yTransform,
	};

	const mouseVecTransform = {
		x:
			mouseVecScale.x * Math.cos(angleTransform)
			+ mouseVecScale.y * Math.sin(angleTransform),
		y:
			mouseVecScale.y * Math.cos(angleTransform)
			- mouseVecScale.x * Math.sin(angleTransform),
	};

	const changes = {
		[`${draggedItem.data.modifAddress}x`]: mouseVecTransform.x,
		[`${draggedItem.data.modifAddress}y`]: mouseVecTransform.y,
	};

	changeGlyphManually(changes, glyph, client, globalMode, componentName);
}

export function skeletonDistrModification(
	client,
	glyph,
	draggedItem,
	newPos,
	globalMode,
) {
	const {base, expandedTo, width, baseDistr, componentName} = draggedItem.data;
	const skelVec = normalize2D(subtract2D(expandedTo[1], expandedTo[0]));
	const distProjOntoSkel = Math.min(
		Math.max(dot2D(subtract2D(newPos, expandedTo[0]), skelVec), 0),
		width,
	);
	const mouseVec = subtract2D(
		add2D(mulScalar2D(distProjOntoSkel, skelVec), expandedTo[0]),
		base,
	);

	const changes = {
		[`${draggedItem.data.modifAddress}expand.distr`]:
			distProjOntoSkel / width - baseDistr,
		[`${draggedItem.data.modifAddress}x`]: mouseVec.x,
		[`${draggedItem.data.modifAddress}y`]: mouseVec.y,
	};

	changeGlyphManually(changes, glyph, client, globalMode, componentName);
}

function changeSpacing(client, glyph, draggedItem, newPos) {
	if (draggedItem.id === 'spacingLeft') {
		client.dispatchAction('/change-letter-spacing', {
			value: glyph.spacingLeft - glyph.baseSpacingLeft - newPos.x,
			side: 'left',
			letter: String.fromCharCode(glyph.unicode),
		});
	}
	else if (draggedItem.id === 'spacingRight') {
		client.dispatchAction('/change-letter-spacing', {
			value:
				newPos.x
				- glyph.advanceWidth
				+ glyph.spacingRight
				- glyph.baseSpacingRight,
			side: 'right',
			letter: String.fromCharCode(glyph.unicode),
		});
	}
}

export default class GlyphCanvas extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			rafId: 0,
			values: {},
			uiRuler: true,
			guides: [],
			error: null,
		};

		this.changeParam = this.changeParam.bind(this);
		this.download = this.download.bind(this);
	}

	componentWillMount() {
		pleaseWait.instance.finish();
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				if (
					this.state.glyph
					&& window.glyph
					&& this.state.glyph.name !== window.glyph.name
				) {
					this.resetAppMode = true;
				}
				this.setState({
					glyph: window.glyph,
					inputGlyphInteraction: head.toJS().d.inputGlyphInteraction,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					canvasMode: head.toJS().d.canvasMode,
					uiOutline: head.toJS().d.uiOutline,
					uiRuler: head.toJS().d.uiRuler,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					values: head.toJS().d.controlsValues,
					guides: head.toJS().d.guides,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentDidMount() {
		this.toile = new Toile(this.canvas);
		this.setCamera(
			{x: 0, y: 0},
			1,
			this.canvas.clientHeight,
			this.canvas.clientWidth,
		);

		if (module.hot) {
			module.hot.accept('../toile/toile', () => {
				const ToileConstructor = require('../toile/toile').default; // eslint-disable-line global-require
				const [z, , , , tx, ty] = this.toile.viewMatrix;
				const newTs = {
					x: tx,
					y: ty,
				};

				this.toile = new ToileConstructor(this.canvas);

				this.setCameraCenter(
					newTs,
					z,
					-this.canvas.clientHeight,
					this.canvas.clientWidth,
				);
			});
		}

		this.startRaf();
	}

	startRaf() {
		const frameCounters = {
			componentMenu: 0,
		};
		let componentMenuPos = {};
		let componentHovered = {};
		let selectedItems = [];
		let contourSelected;
		const contourSelectedIndex = 0;
		// let dragging = true;
		let mouse = this.toile.getMouseState();
		let appStateValue = appState.DEFAULT;
		let appMode;
		let oldAppMode;
		let oldAppState;
		let oldViewMatrix;
		let oldCanvasMode;
		let mouseDoubleClick;
		let pause = false;
		let firstDraw = true;
		let mouseStart;
		let draggingNotStarted = false;
		let directionalNotStarted = false;
		let directionalValue;
		let globalMode = false;

		// Box select variables
		let mouseBoxStart;

		const rafFunc = () => {
			try {
				// Handling all keyboard event
				let enteringPreview = false;
				let resetManualPoint = false;
				let displacementArrow;
				let exitingPreview = false;
				let previewMode = false;
				let modRange = 1;
				let unparallelMod = false;
				let unsmoothMod = false;
				let curveMode = 0;
				let distrModification = false;
				let directionalModifier = false;
				let deleteMod = false;

				if (this.toile.keyboardUpRisingEdge.keyCode) {
					const {keyCode, special} = this.toile.keyboardUpRisingEdge;

					if (keyCode === 90 && !special) {
						exitingPreview = true;
					}
					else if (keyCode === 46 || keyCode === 8) {
						deleteMod = true;
					}
				}

				if (this.toile.keyboardUp.keyCode) {
					const {keyCode} = this.toile.keyboardUp;

					// Detect space keyboard up event to reset mode to the previous mode
					if (keyCode === 32) {
						appMode = oldAppMode;
						this.client.dispatchAction('/store-value', {
							canvasMode: oldAppMode,
						});
						if (appMode === 'select-points') {
							appStateValue = oldAppState;
						}

						oldAppMode = undefined;
						oldAppState = undefined;
					}
					this.toile.clearKeyboardInput();
				}

				if (this.toile.keyboardDownRisingEdge.keyCode) {
					const {keyCode, special} = this.toile.keyboardDownRisingEdge;

					// On space edge down keyboard event switch to move mode
					// whatever the previous mode is
					if (keyCode === 32) {
						oldAppMode = this.state.canvasMode;
						oldAppState = appStateValue;
						appMode = canvasMode.MOVE;
						this.client.dispatchAction('/store-value', {canvasMode: 'move'});
					}
					else if (keyCode === 80) {
						pause = !pause;
					}
					else if (keyCode === 90 && !special) {
						enteringPreview = true;
					}
					else if (keyCode === 27) {
						resetManualPoint = true;
					}
					else if (keyCode <= 40 && keyCode >= 37) {
						displacementArrow = {
							left: keyCode === 37,
							up: keyCode === 38,
							right: keyCode === 39,
							down: keyCode === 40,
						};
					}
				}

				if (this.toile.keyboardDown.keyCode) {
					const {keyCode, special} = this.toile.keyboardDown;

					if (keyCode === 90 && !special) {
						previewMode = true;
					}
					else if (keyCode === 65) {
						// eslint-disable-next-line no-bitwise
						curveMode |= onCurveModMode.WIDTH_MOD;
					}
					else if (keyCode === 87) {
						// eslint-disable-next-line no-bitwise
						curveMode |= onCurveModMode.ANGLE_MOD;
					}
					else if (keyCode === 68) {
						distrModification = true;
					}

					// eslint-disable-next-line no-bitwise
					if (special & specialKey.SHIFT) {
						modRange = 10;
						directionalModifier = true;
					}
					// eslint-disable-next-line no-bitwise
					if (special & agnosticCtrl) {
						unparallelMod = true;
					}
					// eslint-disable-next-line no-bitwise
					if (special & specialKey.ALT) {
						unsmoothMod = true;
					}
				}

				/* eslint-disable no-bitwise, max-depth */
				const hotItems = this.toile.getHotInteractiveItem();

				let mouseMovement;

				if (mouseBoxStart) {
					hotItems.push(...this.toile.getBoxHotInteractiveItem(mouseBoxStart));
				}
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
					// unselect everything but guides
					selectedItems = selectedItems.filter(
						item => item.type === toileType.GUIDE_HANDLE,
					);
					break;
				case 'select-points':
					appMode = canvasMode.SELECT_POINTS;
					break;
				case 'component-magic':
					appMode = canvasMode.SELECT_POINTS_COMPONENT;
					break;
				case 'move':
				default:
					appMode = canvasMode.MOVE;
					break;
				}

				if (mouse.state === mState.UP && oldMouse.state === mState.DOWN) {
					mouseClickRelease = true;
				}

				const {glyph} = this.state;

				if (glyph) {
					const nodes = hotItems.filter(
						item => item.type <= toileType.CONTOUR_NODE_OUT,
					);
					const spacingHandle = hotItems.filter(
						item => item.type === toileType.SPACING_HANDLE,
					);
					const guideHandle = hotItems.filter(
						item => item.type === toileType.GUIDE_HANDLE,
					);
					const contours = hotItems.filter(
						item =>
							item.type === toileType.GLYPH_CONTOUR
							|| item.type === toileType.GLYPH_COMPONENT_CONTOUR,
					);
					const globalContours = hotItems.filter(
						item => item.type === toileType.GLYPH_GLOBAL_COMPONENT_CONTOUR,
					);
					let componentMenu = hotItems.filter(
						item => item.type === toileType.COMPONENT_MENU_ITEM_CENTER,
					);
					let componentChoice = hotItems.filter(
						item => item.type === toileType.COMPONENT_MENU_ITEM,
					);
					const componentChoiceClass = hotItems.filter(
						item => item.type === toileType.COMPONENT_MENU_ITEM_CLASS,
					);
					let components = hotItems.filter(
						item =>
							item.type === toileType.COMPONENT_CHOICE
							|| item.type === toileType.COMPONENT_NONE_CHOICE,
					);
					const rulers = hotItems.filter(
						item => item.type === toileType.RULER,
					);

					const [mousePosInWorld] = transformCoords(
						[mouse.pos],
						inverseProjectionMatrix(this.toile.viewMatrix),
						this.toile.height / this.toile.viewMatrix[0],
					);

					// This is used to detect a glyph change event that
					// makes it necessary to stop all active mode
					if (this.resetAppMode) {
						appStateValue = appState.DEFAULT;
						selectedItems = [];
						this.resetAppMode = false;
					}

					const outside = this.toile.glyphOutsideView(glyph);

					if (outside && !this.props.glyphOutsideView) {
						this.client.dispatchAction('/store-value', {
							glyphOutsideView: true,
						});
					}
					else if (!outside && this.props.glyphOutsideView) {
						this.client.dispatchAction('/store-value', {
							glyphOutsideView: false,
						});
					}

					// Detection of double click in any mode
					if (mouse.edge === mState.DOWN) {
						// resetting the view is only possible when nothing is selected
						if (
							mouseDoubleClick
							&& (appStateValue === appState.DEFAULT
								|| appStateValue
									& (appState.CONTOUR_SELECTED
										| appState.CONTOUR_GLOBAL_SELECTED))
						) {
							this.resetView(glyph, height, width);
						}
						else {
							mouseDoubleClick = true;
							setTimeout(() => {
								mouseDoubleClick = false;
							}, 400);
						}
					}

					// Managing guides and rulers
					if (
						mouse.edge === mState.DOWN
						&& !(
							appStateValue
							& (appState.DRAGGING_CONTOUR
								| appState.DRAGGING_CONTOUR_POINT
								| appState.DRAGGING_POINTS
								| appState.DRAGGING_SPACING)
						)
					) {
						if (guideHandle.length > 0 && nodes.length === 0) {
							appStateValue = appState.DRAGGING_GUIDE;
							selectedItems = [guideHandle[0]];
							this.storeSelectedItems(selectedItems);
						}
						else if (rulers.length > 0) {
							const axe = rulers[0].id === 'verticalRuler' ? 'x' : 'y';
							const newGuide = {
								id: `guide${Date.now()}`,
								[axe]: mouse.pos[axe],
								isNew: true,
							};

							this.client.dispatchAction('/change-guides', {
								guides: this.state.guides.concat(newGuide),
							});

							appStateValue = appState.DRAGGING_GUIDE;
							selectedItems = [
								{
									id: newGuide.id,
									type: toileType.GUIDE_HANDLE,
									data: {
										x: newGuide.x,
										y: newGuide.y,
										isNew: true,
									},
								},
							];
							this.storeSelectedItems(selectedItems);
						}
					}
					else if (appStateValue & appState.GUIDE_SELECTED) {
						if (mouseClickRelease) {
							appStateValue = appState.DEFAULT;
							selectedItems = [];
							this.storeSelectedItems(selectedItems);
						}
						else if (deleteMod) {
							this.client.dispatchAction('/change-guides', {
								guides: this.state.guides.filter(
									guide => guide.id !== selectedItems[0].id,
								),
								label: 'delete guide',
								force: true,
							});

							appStateValue = appState.DEFAULT;
							selectedItems = [];
							this.storeSelectedItems(selectedItems);
						}
					}
					else if (
						appStateValue & appState.DRAGGING_GUIDE
						&& mouseClickRelease
					) {
						// deleting the guide when it has been released on a ruler
						if (selectedItems[0].type === toileType.GUIDE_HANDLE) {
							if (rulers.length > 0) {
								this.client.dispatchAction('/change-guides', {
									guides: this.state.guides.filter(
										guide => guide.id !== selectedItems[0].id,
									),
									label: 'delete guide',
									force: true,
								});
								appStateValue = appState.DEFAULT;
							}
							else {
								let label = 'move guide';

								if (selectedItems[0].data.isNew) {
									delete selectedItems[0].data.isNew;
									label = 'add guide';
								}

								this.client.dispatchAction('/change-guides', {
									guides: this.state.guides,
									label,
									force: true,
								});
								appStateValue = appState.GUIDE_SELECTED;
								this.storeSelectedItems(selectedItems);
							}
						}
					}

					// =========================================================
					// =========================================================
					// This is the state machine state changing part
					// There is 3 first level state
					if (
						appMode === canvasMode.MOVE
						&& !(
							appStateValue
							& (appState.GUIDE_SELECTED | appState.DRAGGING_GUIDE)
						)
					) {
						if (mouse.state === mState.DOWN) {
							appStateValue = appState.MOVING;
						}
						else {
							appStateValue = appState.DEFAULT;
						}
					}
					if (appMode === canvasMode.COMPONENTS) {
						// On mouse release with look for any hot menu item
						// and change component accordingly
						if (mouseClickRelease) {
							if (componentChoice.length > 0) {
								const [choice] = componentChoice;

								this.client.dispatchAction('/change-component', {
									glyph,
									id: choice.data.componentId,
									name: choice.data.baseId,
								});

								componentChoice = [];
								componentMenu = [];
								components = [];
							}
							if (componentChoiceClass.length > 0) {
								const [choice] = componentChoiceClass;

								this.client.dispatchAction('/change-component-class', {
									componentClass: choice.data.componentClass,
									name: choice.data.baseId,
								});

								componentChoice = [];
								componentMenu = [];
								components = [];
							}
						}

						// If a component geometry is hovered
						// We set the correct mode to draw it
						if (
							(appStateValue === appState.DEFAULT
								|| appStateValue === appState.COMPONENT_HOVERED)
							&& components.length > 0
						) {
							const [candidateComp] = components;

							if (candidateComp.data.bases.length > 1) {
								appStateValue = appState.COMPONENT_HOVERED;
								componentHovered = candidateComp;
							}
						}
						else if (componentMenu.length > 0) {
							appStateValue = appState.COMPONENT_MENU_HOVERED;
						}
						else if (
							!(
								appStateValue
								& (appState.GUIDE_SELECTED | appState.DRAGGING_GUIDE)
							)
						) {
							componentHovered = {};
							appStateValue = appState.DEFAULT;
						}
					}
					if (
						appMode === canvasMode.SELECT_POINTS
						|| appMode === canvasMode.SELECT_POINTS_COMPONENT
					) {
						// Manual edition mode
						if (
							appStateValue === appState.DEFAULT
							&& mouse.edge === mState.DOWN
						) {
							if (nodes.length > 0) {
								selectedItems = [nodes[0]];
								appStateValue = appState.DRAGGING_CONTOUR_POINT;
								mouseStart = nodes[0].data.center;
								draggingNotStarted = true;
								directionalNotStarted = true;
							}
							else if (spacingHandle.length > 0) {
								appStateValue = appState.DRAGGING_SPACING;
								selectedItems = [spacingHandle[0]];
							}
							else {
								appStateValue = appState.BOX_SELECTING;
								mouseBoxStart = mouse.pos;
							}
							this.storeSelectedItems(selectedItems);
						}
						else if (
							appStateValue
								& (appState.BOX_SELECTING | appState.NOT_SELECTING)
							&& mouseClickRelease
						) {
							if (
								this.toile.keyboardDown.keyCode
								&& this.toile.keyboardDown.special & specialKey.SHIFT
							) {
								nodes.forEach((node) => {
									let toAdd = true;
									let toRemove;

									selectedItems.forEach((item, idx) => {
										if (node.id == item.id) {
											toRemove = idx;
											toAdd = false;
										}
									});

									if (toAdd) {
										selectedItems.push(node);
									}
									else {
										selectedItems.splice(toRemove, 1);
									}
								});
								appStateValue = appState.DRAGGING_POINTS;
								selectedItems.forEach((item) => {
									item.offsetVector = subtract2D(
										item.data.center,
										nodes[0].data.center,
									);
								});
								mouseStart = nodes[0].data.center;
								draggingNotStarted = true;
								directionalNotStarted = true;
							}
							else if (hotItems.length > 0) {
								selectedItems = hotItems;
								appStateValue = appState.POINTS_SELECTED;
								mouseBoxStart = undefined;
								globalMode = false;
							}
							else {
								appStateValue = appState.DEFAULT;
								mouseBoxStart = undefined;
								globalMode = false;
							}
							this.client.dispatchAction('/store-value', {
								globalMode,
							});
							this.storeSelectedItems(selectedItems);
						}
						else if (
							appStateValue
								& (appState.DRAGGING_CONTOUR_POINT
									| appState.DRAGGING_SPACING
									| appState.DRAGGING_GUIDE)
							&& mouseClickRelease
						) {
							if (selectedItems[0].type === toileType.NODE_SKELETON) {
								appStateValue = appState.SKELETON_POINT_SELECTED;
							}
							else if (selectedItems[0].type === toileType.SPACING_HANDLE) {
								appStateValue = appState.SPACING_SELECTED;
							}
							else {
								appStateValue = appState.CONTOUR_POINT_SELECTED;
							}
							draggingNotStarted = false;
							directionalNotStarted = false;
							this.client.dispatchAction('/change-glyph-node-manually', {
								label: 'manual edition',
								force: true,
								changes: {},
							});
						}
						else if (
							appStateValue
								& (appState.CONTOUR_POINT_SELECTED
									| appState.SPACING_SELECTED
									| appState.GUIDE_SELECTED
									| appState.SKELETON_POINT_SELECTED)
							&& mouse.edge === mState.DOWN
						) {
							if (nodes.length > 0) {
								selectedItems = [nodes[0]];
								appStateValue = appState.DRAGGING_CONTOUR_POINT;
								mouseStart = nodes[0].data.center;
								draggingNotStarted = true;
								directionalNotStarted = true;
							}
							if (spacingHandle.length > 0) {
								appStateValue = appState.DRAGGING_SPACING;
								selectedItems = [spacingHandle[0]];
							}
							else {
								selectedItems = [];
								appStateValue = appState.BOX_SELECTING;
								mouseBoxStart = mouse.pos;
							}
							this.storeSelectedItems(selectedItems);
						}
						else if (
							appStateValue & appState.POINTS_SELECTED
							&& mouse.edge === mState.DOWN
						) {
							// TODO: shift behavior
							if (nodes.length > 0) {
								let validPoint = false;

								nodes.forEach((node) => {
									validPoint = selectedItems.find(s => s.id === node.id);
								});

								if (!validPoint) {
									selectedItems = [];
									appStateValue = appState.BOX_SELECTING;
									mouseBoxStart = mouse.pos;
								}
								else {
									appStateValue = appState.DRAGGING_POINTS;
									selectedItems.forEach((item) => {
										if (validPoint.id !== item.id) {
											item.offsetVector = subtract2D(
												item.data.center,
												validPoint.data.center,
											);
										}
										else {
											item.offsetVector = {x: 0, y: 0};
										}
									});
									mouseStart = nodes[0].data.center;
									draggingNotStarted = true;
									directionalNotStarted = true;
								}
							}
							else {
								selectedItems = [];
								appStateValue = appState.BOX_SELECTING;
								mouseBoxStart = mouse.pos;
							}
							this.storeSelectedItems(selectedItems);
						}
						else if (
							appStateValue & appState.DRAGGING_POINTS
							&& mouseClickRelease
						) {
							appStateValue = appState.POINTS_SELECTED;
							this.client.dispatchAction('/change-glyph-node-manually', {
								label: 'manual edition',
								force: true,
								changes: {},
							});
						}
					}
					// End of StateMachine
					// =========================================================
					// =========================================================

					if (mouse.wheel) {
						appStateValue |= appState.ZOOMING;
					}
					else {
						appStateValue &= ~appState.ZOOMING;
					}

					if (enteringPreview) {
						oldViewMatrix = this.toile.viewMatrix;
						this.resetView(glyph, height, width);
						appStateValue = appState.PREVIEWING;
					}

					if (appStateValue === appState.PREVIEWING && exitingPreview) {
						const [z, , , , tx, ty] = oldViewMatrix;

						this.setCamera({x: tx, y: ty}, z, -height, width);
						appStateValue = appState.DEFAULT;
					}

					// Drawing basic stuff (glyph, frame, and contours)
					this.toile.clearCanvas(width, height);
					this.toile.drawTypographicFrame(glyph, this.state.values);
					if (firstDraw) {
						firstDraw = false;
						this.resetView(glyph, height, width);
					}
					this.toile.drawGlyph(
						glyph,
						hotItems,
						(this.state.uiOutline || appMode === canvasMode.SELECT_POINTS)
							&& !(appStateValue === appState.PREVIEWING),
					);

					if (previewMode) {
						this.cleanUpFrame();
						this.setState({rafId: raf(rafFunc)});
						return;
					}

					//= ========================================================
					//= ========================================================
					// handle hotness of elements in component mode
					// draw component that are hovered or not
					if (appMode === canvasMode.COMPONENTS) {
						this.toile.drawComponents(glyph.components, [componentHovered]);

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
					// =========================================================
					// =========================================================

					if (
						!(
							appStateValue
							& (appState.DRAGGING_POINTS | appState.DRAGGING_CONTOUR_POINT)
						)
					) {
						if (guideHandle.length > 0) {
							this.canvas.style.cursor = guideHandle[0].data.y
								? 'ns-resize'
								: 'ew-resize';
						}
						else if (
							appMode === canvasMode.SELECT_POINTS
							&& spacingHandle.length > 0
						) {
							this.canvas.style.cursor = 'ew-resize';
						}
						else {
							this.canvas.style.cursor = 'default';
						}
					}
					else {
						this.canvas.style.cursor = 'default';
					}

					if (appMode === canvasMode.SELECT_POINTS) {
						this.toile.drawAllNodes(glyph, [...hotItems, ...selectedItems]);
					}

					// =========================================================
					// =========================================================
					// draw stuff when in select-points mode
					if (
						appStateValue
						& (appState.DRAGGING_CONTOUR_POINT
							| appState.CONTOUR_POINT_SELECTED
							| appState.DRAGGING_POINTS
							| appState.POINTS_SELECTED
							| appState.DRAGGING_CONTOUR
							| appState.SKELETON_POINT_SELECTED)
					) {
						if (draggingNotStarted) {
							const displacement
								= distance2D(mouseStart, mousePosInWorld)
								* this.toile.viewMatrix[0];

							if (displacement > MINIMUM_DRAG_THRESHOLD) {
								draggingNotStarted = false;
							}
						}

						if (directionalNotStarted) {
							const displacement
								= distance2D(mouseStart, mousePosInWorld)
								* this.toile.viewMatrix[0];
							const deltaVec = subtract2D(mouseStart, mousePosInWorld);
							const isXBigger = Math.abs(deltaVec.x) > Math.abs(deltaVec.y);

							directionalValue = isXBigger
								? directionalMod.X
								: directionalMod.Y;

							if (displacement > MINIMUM_DRAG_DIRECTIONAL_THRESHOLD) {
								directionalNotStarted = false;
							}
						}
					}

					if (appStateValue & appState.BOX_SELECTING) {
						const [boxStartPosInWorld] = transformCoords(
							[mouseBoxStart],
							inverseProjectionMatrix(this.toile.viewMatrix),
							this.toile.height / this.toile.viewMatrix[0],
						);

						this.toile.drawRectangleFromCorners(
							mousePosInWorld,
							boxStartPosInWorld,
							'black',
						);
					}

					if (
						this.props.dependencies
						&& appStateValue
							& (appState.CONTOUR_POINT_SELECTED
								| appState.SKELETON_POINT_SELECTED)
						&& selectedItems.length === 1
					) {
						const selectedPointDeps = _get(
							glyph.dependencyTree,
							selectedItems[0].id,
						);
						const selectedPoint = _get(glyph, selectedItems[0].id);

						if (selectedPointDeps) {
							Object.keys(selectedPointDeps).forEach((key) => {
								const deps = selectedPointDeps[key];

								if (deps instanceof Array) {
									deps.forEach((dep) => {
										if (dep.indexOf('anchor') === -1) {
											const pointAddress = dep
												.split('.')
												.slice(0, 4)
												.join('.');
											const dependerPoint = _get(glyph, pointAddress);

											this.toile.drawDependencies(dependerPoint, selectedPoint);
										}
									});
								}
							});
						}
					}

					if (
						appStateValue
						& (appState.POINTS_SELECTED
							| appState.CONTOUR_POINT_SELECTED
							| appState.SKELETON_POINT_SELECTED
							| appState.SPACING_SELECTED)
					) {
						if (resetManualPoint) {
							this.client.dispatchAction('/reset-glyph-points-manually', {
								glyphName: glyph.base || glyph.name,
								unicode: glyph.unicode,
								points: selectedItems,
								globalMode,
							});
						}
					}

					if (appStateValue & appState.MOVING) {
						const [z, , , , tx, ty] = this.toile.viewMatrix;
						const newTs = {
							x: tx + mouse.delta.x,
							y: ty + mouse.delta.y,
						};

						/* if (
							newTs.x !== tx
							|| newTs.y !== ty
						) {
							moving = true;
						} */
						this.setCamera(newTs, z, -height, width);
					}
					else if (appStateValue & appState.ZOOMING) {
						const [z, , , , x, y] = this.toile.viewMatrix;
						const transformMatrix = changeTransformOrigin(mousePosInWorld, [
							1 + mouse.wheel / 1000,
							0,
							0,
							1 + mouse.wheel / 1000,
							0,
							0,
						]);
						const [zoom, , , , newTx, newTy] = matrixMul(
							transformMatrix,
							this.toile.viewMatrix,
						);
						const clampedZoom = Math.max(0.1, Math.min(10, zoom));

						this.setCamera(
							{
								x: z === clampedZoom ? x : newTx,
								y: z === clampedZoom ? y : newTy,
							},
							clampedZoom,
							-height,
							width,
						);
					}
					/* else {
						moving = false;
					} */

					let interactions = [];

					if (
						appStateValue
						& (appState.DRAGGING_CONTOUR_POINT
							| appState.DRAGGING_POINTS
							| appState.DRAGGING_CONTOUR)
					) {
						let postMousePosInWorld = mousePosInWorld;

						if (directionalModifier && !directionalNotStarted) {
							postMousePosInWorld = {
								x:
									directionalValue & directionalMod.X
										? mousePosInWorld.x
										: mouseStart.x,
								y:
									directionalValue & directionalMod.X
										? mouseStart.y
										: mousePosInWorld.y,
							};
						}

						interactions = selectedItems.map(item => ({
							item,
							modData: add2D(
								mousePosInWorld,
								item.offsetVector || {x: 0, y: 0},
							),
						}));
						mouseMovement = true;
					}
					else if (
						appStateValue
							& (appState.POINTS_SELECTED
								| appState.CONTOUR_POINT_SELECTED
								| appState.SKELETON_POINT_SELECTED)
						&& displacementArrow
					) {
						mouseMovement = false;
						interactions = selectedItems.map((item) => {
							let posVector;

							if (displacementArrow.left) {
								posVector = {x: -modRange, y: 0};
							}
							else if (displacementArrow.up) {
								posVector = {x: 0, y: modRange};
							}
							else if (displacementArrow.right) {
								posVector = {x: modRange, y: 0};
							}
							else if (displacementArrow.down) {
								posVector = {x: 0, y: -modRange};
							}

							return {
								item,
								modData: add2D(_get(glyph, item.id), posVector),
							};
						});
					}
					else if (
						appStateValue
						& (appState.DRAGGING_SPACING | appState.DRAGGING_GUIDE)
					) {
						interactions = [
							{
								item: selectedItems[0],
								modData: mousePosInWorld,
							},
						];
						mouseMovement = true;
					}
					else if (
						appStateValue
							& (appState.SPACING_SELECTED | appState.GUIDE_SELECTED)
						&& displacementArrow
					) {
						mouseMovement = false;
						const interaction = {
							item: selectedItems[0],
						};

						let baseCoord = 0;

						if (selectedItems[0].id === 'spacingRight') {
							baseCoord = glyph.advanceWidth;
						}

						if (displacementArrow.left) {
							interaction.modData = {x: baseCoord - modRange, y: 0};
						}
						if (displacementArrow.right) {
							interaction.modData = {x: baseCoord + modRange, y: 0};
						}

						interactions = [interaction];
					}

					if (this.state.inputGlyphInteraction) {
						const {inputGlyphInteraction} = this.state;

						this.client.dispatchAction('/store-value-font', {
							inputGlyphInteraction: undefined,
						});

						interactions.push({
							modData: inputGlyphInteraction.modData,
							item: selectedItems[0],
							type: inputGlyphInteraction.type,
						});
						appStateValue |= appState.INPUT_CHANGE;
					}

					if (
						appStateValue
							& (appState.DRAGGING_POINTS
								| appState.DRAGGING_CONTOUR_POINT
								| appState.DRAGGING_CONTOUR
								| appState.CONTOUR_POINT_SELECTED
								| appState.SKELETON_POINT_SELECTED
								| appState.POINTS_SELECTED
								| appState.DRAGGING_SPACING
								| appState.DRAGGING_GUIDE
								| appState.SPACING_SELECTED
								| appState.INPUT_CHANGE)
						&& !draggingNotStarted
					) {
						interactions.forEach((interaction) => {
							const {item, modData, type} = interaction;

							switch (item.type) {
							case toileType.GUIDE_HANDLE: {
								const guides = this.state.guides.map((guide) => {
									if (guide.id === item.id) {
										return typeof guide.x === 'number'
											? {id: guide.id, x: modData.x}
											: {id: guide.id, y: modData.y};
									}
									return guide;
								});

								this.client.dispatchAction('/change-guides', {
									guides,
								});
								break;
							}
							case toileType.SPACING_HANDLE: {
								changeSpacing(this.client, glyph, item, modData);

								if (item.id === 'spacingLeft') {
									const [z, , , , tx, ty] = this.toile.viewMatrix;
									const newTs = {
										x: tx + modData.x * z,
										y: ty,
									};

									this.setCamera(newTs, z, -height, width);
								}
								break;
							}
							case toileType.NODE_OUT:
							case toileType.NODE_IN: {
								handleModification(
									this.client,
									glyph,
									item,
									modData,
									unsmoothMod,
									unparallelMod,
									globalMode,
									this.toile,
								);

								if (!unparallelMod) {
									const {parallelParameters} = item.data;
									const node = _get(glyph, parallelParameters[1]);

									parallelParameters[0] = node;
									parallelParameters[4] = [{id: parallelParameters[1]}];
								}

								break;
							}
							case toileType.CONTOUR_NODE_OUT:
							case toileType.CONTOUR_NODE_IN: {
								handleModification(
									this.client,
									glyph,
									item,
									modData,
									unsmoothMod,
									true,
									globalMode,
									this.toile,
								);
								break;
							}
							case toileType.CONTOUR_NODE:
							case toileType.NODE: {
								const posModData = modData;

								if (
									directionalModifier
										&& !directionalNotStarted
										&& mouseMovement
								) {
									if (directionalValue & directionalMod.Y) {
										this.toile.drawLine(
											{x: posModData.x, y: 1000000},
											{x: posModData.x, y: -1000000},
											'#ff00ff',
										);
									}
									else {
										this.toile.drawLine(
											{y: posModData.y, x: 1000000},
											{y: posModData.y, x: -1000000},
											'#ff00ff',
										);
									}
								}

								onCurveModification(
									this.client,
									glyph,
									item,
									posModData,
									appStateValue,
									curveMode,
									globalMode,
								);
								break;
							}
							default:
								break;
							}
						});
					}

					if (this.state.uiRuler) {
						this.toile.drawGuides(
							this.state.guides,
							// if component menu is hovered, we don't consider the guide
							componentMenu.length > 0 ? [] : guideHandle,
							selectedItems.filter(
								item => item.type === toileType.GUIDE_HANDLE,
							),
						);
						this.toile.drawRuler(width, height);
					}
				}

				this.cleanUpFrame();

				this.setState({rafId: raf(rafFunc)});
				/* eslint-enable no-bitwise, max-depth */
			}
			catch (error) {
				this.setState({error});
			}
		};

		this.setState({rafId: raf(rafFunc)});
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.glyph !== prevState.glyph) {
			this.props.onUpdateGlyph(this.state.glyph);
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
		rafCancel(this.state.rafId);
	}

	setCamera(t, z, height, width) {
		this.toile.setCamera(t, z, height, width);
		this.client.dispatchAction('/store-value', {
			glyphViewMatrix: {
				t,
				z,
			},
		});
	}

	setCameraCenter(t, z, height, width) {
		this.toile.setCameraCenter(t, z, height, width);
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

	resetView(glyph, height, width) {
		const bbox = glyphBoundingBox(glyph);
		const center = mulScalar2D(1 / 2, add2D(bbox[0], bbox[1]));

		this.setCameraCenter(center, 0.5, -height, width);
	}

	cleanUpFrame() {
		this.toile.clearKeyboardEdges();
		this.toile.clearMouseEdges();
		this.toile.clearDelta();
		this.toile.clearWheelDelta();
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

	storeSelectedItems(selectedItems) {
		this.props.onSelectedItems(selectedItems);
	}

	render() {
		// Rethrow raf error
		if (this.state.error) {
			throw this.state.error;
		}

		return (
			<div className="prototypo-canvas-container">
				<canvas
					id="hello"
					ref={(canvas) => {
						this.canvas = canvas;
					}}
					style={{
						width: '100%',
						height: '100%',
						WebkitUserDrag: 'none',
						userSelect: 'none',
						WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
					}}
				/>
				<FontUpdater />
			</div>
		);
	}
}
