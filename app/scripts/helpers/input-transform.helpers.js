// test/ampersand //see -> test&/see
export function rawToEscapedContent(rawText) {
	return arrayToEscapedContent(contentToArray(rawText));
}

// ['t', 'e', 's', 't', '/ampersand ', '//', 's', 'e', 'e'] -> test&/see
export function arrayToEscapedContent(textArray) {
  return textArray.map((letter) => {
    if(letter === '//') {
      return '/';
    }
    if(letter.startsWith('/')) {
      return '&';
    }
    return letter;
  }).join('');
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
	  if(slashBefore) {
	    let command = buffer.pop();

	    command += letter;
	    buffer.push(command);

	    if(letter === ' ' || letter === '/') {
	      slashBefore = false;
	    }

	    return;
	  }

	  if(letter === '/') {
	    slashBefore = !slashBefore;
	  }

	  buffer.push(letter);
	});

	return buffer;
}
