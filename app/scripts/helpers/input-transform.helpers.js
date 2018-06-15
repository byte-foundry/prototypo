// test/ampersand //see -> test&/see
export function rawToEscapedContent(rawText, glyphs = {}) {
	return arrayToEscapedContent(contentToArray(rawText), glyphs);
}

// ['t', 'e', 's', 't', '/ampersand ', '//', 's', 'e', 'e'] -> test&/see
export function arrayToEscapedContent(textArray, glyphs = {}) {
	return textArray
		.map((letter) => {
			if (letter === '//') {
				return '/';
			}
			if (letter.startsWith('/')) {
				const glyphName = letter.slice(1).trim();

				const [glyph]
					= Object.values(glyphs).find(([g]) => glyphName === g.glyphName) || [];

				if (glyph) {
					return String.fromCharCode(glyph.unicode);
				}
				return '';
			}
			return letter;
		})
		.join('');
}

// ['t', 'e', 's', 't', '/ampersand ', '//', 's', 'e', 'e'] -> test&//see
export function arrayToRawContent(textArray) {
	return textArray.join('');
}

// test&/see -> ['t', 'e', 's', 't', '&', '//', 's', 'e', 'e']
export function contentToArray(rawText) {
	const buffer = [];
	let slashBefore = false;

	rawText.split('').forEach((letter) => {
		if (slashBefore) {
			buffer[buffer.length - 1] += letter;

			if (letter === ' ' || letter === '/') {
				slashBefore = false;
			}

			return;
		}

		if (letter === '/') {
			slashBefore = !slashBefore;
		}

		buffer.push(letter);
	});

	return buffer;
}
