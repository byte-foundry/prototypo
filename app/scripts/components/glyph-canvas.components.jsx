/*global _, webkitRequestAnimationFrame */
import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';

import Toile, {mState, toileType, appState, transformCoords, inverseProjectionMatrix} from '../toile/toile.js';

import {changeTransformOrigin} from '../prototypo.js/helpers/utils.js';
import {matrixMul, dot2D, mulScalar2D, subtract2D, normalize2D, add2D} from '../plumin/util/linear.js';

import LocalClient from '../stores/local-client.stores.jsx';

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

		const frameCounters = {
			pointMenu: 0,
		};
		let selectedItem;
		let draggedItem;
		let moving = false;
		let mouse = this.toile.getMouseState();
		let appStateValue;

		const raf = requestAnimationFrame || webkitRequestAnimationFrame;
		const rafFunc = () => {
			const width = this.canvas.clientWidth;
			const height = this.canvas.clientHeight;

			this.canvas.height = height;
			this.canvas.width = width;
			const oldMouse = mouse;
			let mouseClickRelease = false;

			mouse = this.toile.getMouseState();

			if (mouse.state === mState.UP
				&& oldMouse.state === mState.DOWN) {
				mouseClickRelease = true;
			}
			const glyph = this.state.glyph;

			if (this.toile.keyboardInput) {
				switch (appStateValue) {
					case appState.ONCURVE_ANGLE:
					case appState.ONCURVE_THICKNESS:
					case appState.SKELETON_POS:
					case appState.SKELETON_DISTR: {
						const {keyCode} = this.toile.keyboardInput;

						if (keyCode === 69) {
							appStateValue = appState.ONCURVE_THICKNESS;
						}
						if (keyCode === 82) {
							appStateValue = appState.ONCURVE_ANGLE;
						}
						if (keyCode === 68) {
							appStateValue = appState.SKELETON_POS;
						}
						if (keyCode === 70) {
							appStateValue = appState.SKELETON_DISTR;
						}
						this.toile.clearKeyboardInput();
						break;
					}
					default:
						break;
				}
			}

			if (
				mouse.state === mState.DOWN
				&& glyph
				&& !draggedItem
			) {
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

				this.toile.clearDelta();
				this.toile.setCamera(newTs, z, -height);
			}

			if (mouse.wheel) {
				const [z] = this.toile.viewMatrix;
				const [mousePosInWorld] = transformCoords(
					[mouse.pos],
					inverseProjectionMatrix(this.toile.viewMatrix),
					this.toile.height / z,
				);
				const transformMatrix = changeTransformOrigin(mousePosInWorld, [1 + mouse.wheel / 1000, 0, 0, 1 + mouse.wheel / 1000, 0, 0]);
				const [zoom,,,, newTx, newTy] = matrixMul(transformMatrix, this.toile.viewMatrix);

				this.toile.clearWheelDelta();
				this.toile.setCamera({
					x: newTx,
					y: newTy,
				}, zoom, -height);
			}

			if (glyph) {
				const hotItems = this.toile.getHotInteractiveItem();

				this.toile.clearCanvas(width, height);
				this.toile.drawGlyph(glyph, hotItems);

				const nodes = hotItems.filter((item) => {
					return item.type <= toileType.NODE_SKELETON;
				});
				const pointMenu = hotItems.filter((item) => {
					return item.type === toileType.POINT_MENU;
				});
				const pointMenuItems = hotItems.filter((item) => {
					return item.type === toileType.POINT_MENU_ITEM;
				});
				const tools = hotItems.filter((item) => {
					return item.type === toileType.THICKNESS_TOOL
						|| item.type === toileType.THICKNESS_TOOL_CANCEL
						|| item.type === toileType.ANGLE_TOOL
						|| item.type === toileType.DISTR_TOOL
						|| item.type === toileType.POS_TOOL;
				});

				if (nodes.length > 1 && !draggedItem && !selectedItem) {
					this.toile.drawMultiplePointsMenu(nodes, frameCounters.pointMenu);
					frameCounters.pointMenu += 1;
				}
				else if (pointMenu.length > 0 && !draggedItem && !selectedItem) {
					this.toile.drawMultiplePointsMenu(pointMenu[0].data.points, frameCounters.pointMenu, pointMenuItems);
					frameCounters.pointMenu += 1;
				}
				else {
					frameCounters.pointMenu = 0;
				}

				if (mState.DOWN === mouse.state) {
					this.toile.clearDelta();
					if (hotItems.length > 0) {
						if (tools.length === 1) {
							draggedItem = draggedItem || tools[0];
						}
						else if (nodes.length === 1) {
							draggedItem = draggedItem || nodes[0];
						}
					}
				}

				if (mouseClickRelease) {
					if (hotItems.length > 0) {
						if (pointMenuItems.length === 1) {
							selectedItem = pointMenuItems[0].data.point;
						}
						else if (nodes.length === 1) {
							selectedItem = nodes[0];
						}
					}
					else if (hotItems.length === 0 && !moving) {
						selectedItem = undefined;
					}
				}

				if (mState.UP === mouse.state) {
					draggedItem = undefined;
					moving = false;
				}

				if (draggedItem) {
					switch (draggedItem.type) {
						case toileType.NODE_IN:
						case toileType.NODE_OUT: {
							appStateValue = appState.HANDLE_MOD;
							const selectedNode = _.get(glyph, draggedItem.id);
							const selectedNodeParent = _.get(glyph, draggedItem.data.parentId);

							this.toile.drawAngleBetweenHandleAndMouse(selectedNodeParent, selectedNode);
							break;
						}
						case toileType.THICKNESS_TOOL: {
							const {baseWidth, opposite, center} = draggedItem.data;
							const [mousePosInWorld] = transformCoords(
								[mouse.pos],
								inverseProjectionMatrix(this.toile.viewMatrix),
								this.toile.height / this.toile.viewMatrix[0],
							);

							const factor = dot2D(subtract2D(opposite, mousePosInWorld), normalize2D(subtract2D(opposite, center))) / baseWidth;

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[draggedItem.data.modifAddress]: factor,
								},
								glyphName: glyph.name,
							});

							break;
						}
						case toileType.ANGLE_TOOL: {
							const {baseAngle, skeleton} = draggedItem.data;
							const [mousePosInWorld] = transformCoords(
								[mouse.pos],
								inverseProjectionMatrix(this.toile.viewMatrix),
								this.toile.height / this.toile.viewMatrix[0],
							);

							const mouseVec = subtract2D(mousePosInWorld, skeleton);
							const angleDiff = Math.atan2(mouseVec.y, mouseVec.x) - baseAngle;

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[draggedItem.data.modifAddress]: angleDiff,
								},
								glyphName: glyph.name,
							});

							break;
						}
						case toileType.POS_TOOL: {
							const {base} = draggedItem.data;
							const [mousePosInWorld] = transformCoords(
								[mouse.pos],
								inverseProjectionMatrix(this.toile.viewMatrix),
								this.toile.height / this.toile.viewMatrix[0],
							);

							const mouseVec = subtract2D(mousePosInWorld, base);

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${draggedItem.data.modifAddress}x`]: mouseVec.x,
									[`${draggedItem.data.modifAddress}y`]: mouseVec.y,
								},
								glyphName: glyph.name,
							});
							break;
						}
						case toileType.DISTR_TOOL: {
							const {base, expandedTo, width} = draggedItem.data;
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

							const mouseVec = subtract2D(add2D(mulScalar2D(distProjOntoSkel, skelVec), expandedTo[0]), base);

							this.client.dispatchAction('/change-glyph-node-manually', {
								changes: {
									[`${draggedItem.data.modifAddress}expand.distr`]: distProjOntoSkel / width,
									[`${draggedItem.data.modifAddress}x`]: mouseVec.x,
									[`${draggedItem.data.modifAddress}y`]: mouseVec.y,
								},
								glyphName: glyph.name,
							});
							break;
						}
						default:
							break;
					}
				}
				else if (selectedItem) {
					switch (selectedItem.type) {
						case toileType.NODE: {
							appStateValue = appStateValue <= appState.SKELETON_DISTR
								&& appStateValue >= appState.ONCURVE_THICKNESS
								? appStateValue : appState.ONCURVE_THICKNESS;
							break;
						}
						case toileType.NODE_SKELETON: {
							appStateValue = appStateValue <= appState.SKELETON_DISTR
								&& appStateValue >= appState.ONCURVE_THICKNESS
								? appStateValue : appState.SKELETON_POS;
							break;
						}
						default:
							break;
					}
				}
				else {
					appStateValue = appState.UNSELECTED;
				}

				switch (appStateValue) {
					case appState.ONCURVE_THICKNESS: {
						const id = selectedItem.data.parentId ? selectedItem.data.parentId : selectedItem.id;
						const node = _.get(glyph, id);

						if (node) {
							this.toile.drawThicknessTool(node, `${id}.thickness`, hotItems);
						}
						this.toile.drawNodeToolsLib(appStateValue);
						break;
					}
					case appState.ONCURVE_ANGLE: {
						const id = selectedItem.data.parentId ? selectedItem.data.parentId : selectedItem.id;
						const node = _.get(glyph, id);

						if (node) {
							this.toile.drawAngleTool(node, `${id}.angle`, hotItems);
						}
						this.toile.drawNodeToolsLib(appStateValue);
						break;
					}
					case appState.SKELETON_POS: {
						const id = selectedItem.data.parentId ? selectedItem.data.parentId : selectedItem.id;
						const node = _.get(glyph, id);

						if (node) {
							this.toile.drawSkeletonPosTool(node, `${id}.pos`, hotItems);
						}
						this.toile.drawNodeToolsLib(appStateValue);
						break;
					}
					case appState.SKELETON_DISTR: {
						const id = selectedItem.data.parentId ? selectedItem.data.parentId : selectedItem.id;
						const node = _.get(glyph, id);

						if (node) {
							this.toile.drawSkeletonDistrTool(node, id, hotItems);
						}
						this.toile.drawNodeToolsLib(appStateValue);
						break;
					}
					default:
						break;
				}

				/* #if dev */
				this.toile.getHotInteractiveItem();
				/* #end */
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

		return (
			<div style={{width: '100%', height: '100%', position: 'relative'}}>
				<div style={{position: 'fixed', bottom: '10px', left: '100px', background: '#24d390', color: '#fefefe'}}>
					<div style={{display: 'flex', flexDirection: 'column', width: '200px'}}>
						{(() => {
							return _.map(this.state.workers, (worker) => {
								return <div style={{width: '100%', marginBottom: '2px', height: '5px', background: worker ? 'red' : 'green'}}></div>;
							});
						})()}
					</div>
				</div>
				<canvas
					id="hello"
					ref={(canvas) => {this.canvas = canvas;}}
					style={{width: '100%', height: '100%'}}
					>
				</canvas>
			</div>
		);
	}
}
