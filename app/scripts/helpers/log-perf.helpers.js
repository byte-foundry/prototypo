import Toile from '../toile/toile';

let logPerfArray = [];
let canvas;
let toile;

export function pushToPerf(item) {
	return logPerfArray.push(item);
}

export function resetArray() {
	logPerfArray = [];
}

export function setupPerf() {
	canvas = document.createElement('canvas');
	canvas.style.cssText
		= 'background: transparent; position: fixed; width: 20%; height: 100%; margin-left: 80%;top: 0;';

	document.body.appendChild(canvas);

	toile = new Toile(canvas);

	const raf = requestAnimationFrame || webkitRequestAnimationFrame;
	const height = canvas.clientHeight;

	toile.setCamera({x: 40, y: -40}, 1, -height);

	function rafFunc() {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;

		canvas.width = width;
		canvas.height = height;
		const hotItems = toile.getHotInteractiveItem();

		toile.clearCanvas(width, height);

		toile.drawPerf(logPerfArray, {x: 10, y: 10}, hotItems);
		raf(rafFunc);
	}

	rafFunc();
}
