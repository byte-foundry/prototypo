const DOM = {};

DOM.getAbsOffset = (element) => {
	let offsetLeft = element.offsetLeft;
	let offsetTop = element.offsetTop;
	let currentElement = element;

	while(currentElement.offsetParent) {
		currentElement = currentElement.offsetParent;

		offsetLeft += currentElement.offsetLeft;
		offsetTop += currentElement.offsetTop;
	}

	return {offsetLeft,offsetTop};
}

export default DOM;
