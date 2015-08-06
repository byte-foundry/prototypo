const Typefaces = {};

Typefaces.getFont = (repo) => {
	const xhr = new XMLHttpRequest();

	return new Promise((resolve,reject) => {
		// xhr.open('GET','/genese.ptf/dist/font.json');
		xhr.open('GET',`/${repo}/dist/font.json`);

		xhr.onload = (e) => {
			resolve(e.target.responseText);
		}

		xhr.onerror = (e) => {
			reject(e);
		}

		xhr.send();
	});
}

Typefaces.getPrototypo = () => {
	const xhr = new XMLHttpRequest();

	return new Promise((resolve,reject) => {
		xhr.open('GET',document.querySelector('script[src*=prototypo\\.]').src);

		xhr.onload = (e) => {
			resolve(e.target.responseText);
		}

		xhr.onerror = (e) => {
			reject(e);
		}

		xhr.send();

	})
}

export default {
	Typefaces
}
