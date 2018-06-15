const DOM = {};

DOM.getAbsOffset = (element) => {
	let offsetLeft = element.offsetLeft;
	let offsetTop = element.offsetTop;
	let currentElement = element;

	while (currentElement.offsetParent) {
		currentElement = currentElement.offsetParent;

		offsetLeft += currentElement.offsetLeft;
		offsetTop += currentElement.offsetTop;
	}

	return {offsetLeft, offsetTop};
};

DOM.getProperFontSize = (text, style, targetWidth) => {
	const span = document.createElement('span');
	let oldFontSize = style.fontSize;
	let tries = 0;

	span.style.fontSize = style.fontSize;
	span.style.fontFamily = style.fontFamily;
	span.style.position = 'absolute';
	span.style.top = '100000px';
	span.innerText = text;
	document.body.appendChild(span);

	if (
		span.clientWidth > targetWidth - 50
		|| span.clientWidth < targetWidth - 150
	) {
		oldFontSize
			= span.clientWidth < targetWidth
				? `${parseFloat(oldFontSize) + 400}px`
				: oldFontSize;
		do {
			if (span.clientWidth > targetWidth) {
				oldFontSize = span.style.fontSize;
				span.style.fontSize = `${parseFloat(span.style.fontSize) / 2}px`;
			}
			else {
				span.style.fontSize = `${(parseFloat(span.style.fontSize)
					+ parseFloat(oldFontSize))
					/ 2}px`;
			}
			tries++;
		} while (
			(span.clientWidth > targetWidth - 50
				|| span.clientWidth < targetWidth - 150)
			&& tries < 25
		);
	}

	const result = parseFloat(span.style.fontSize);

	document.body.removeChild(span);
	return result;
};

export default DOM;
