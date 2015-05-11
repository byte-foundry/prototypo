const Typefaces = {};

Typefaces.get = () => {
	const xhr = new XMLHttpRequest();

	return new Promise((resolve,reject) => {
		xhr.open('GET','/genese.ptf/dist/font.json',false);

		xhr.onload = (e) => {
			resolve(JSON.parse(e.target.responseText));
		}

		xhr.onerror = (e) => {
			reject(e);
		}

		xhr.send();
	});
}

export default {
	Typefaces
}
