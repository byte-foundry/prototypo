const Commits = {};

Commits.getCommits = (repo) => {
	const xhr = new XMLHttpRequest();

	return new Promise((resolve,reject) => {
		xhr.open('GET','https://api.github.com/repos/byte-foundry/prototypo/commits');

		xhr.onload = (e) => {
			resolve(e.target.responseText);
		}

		xhr.onerror = (e) => {
			reject(e);
		}

		xhr.send();
	});
}

export default {
	Commits
}
