export function delayAfterCall(fn, delay) {
	fn();
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}
