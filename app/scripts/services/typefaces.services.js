const Typefaces = {};

Typefaces.get = () => {
	const xhr = new XMLHttpRequest();

	return Promise((resolve,reject) => {
		xhr.open('GET','/genese.ptf/dist/font.json',false);

		xhr.onload = (e) => {
			resolve(e.target.responseText);
		}

		xhr.onerror = (e) => {
			reject(e);
		}
	});
}

export default {
	Typefaces
}
