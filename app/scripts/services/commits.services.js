const Commits = {};

Commits.getCommits = (repo) => {
	const xhr = new XMLHttpRequest();

	return new Promise((resolve,reject) => {
		xhr.open('GET','https://api.github.com/repos/byte-foundry/prototypo/commits?client_id=a416902f0b5e06b0e403&client_secret=ded50803deff8ad95dadb8f0f6b6a7bff6202ce0');

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
