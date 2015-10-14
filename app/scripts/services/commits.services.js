const Commits = {};

Commits.getCommits = (repo) => {
	const xhr = new XMLHttpRequest();

	return new Promise((resolve,reject) => {
		// xhr.open('GET','https://api.github.com/repos/byte-foundry/' + repo + '/commits');
		xhr.open('GET','https://api.github.com/repos/byte-foundry/' + repo + '/commits?client_id=a416902f0b5e06b0e403&client_secret=987df84b767c471b30f82735dcbd40db6eb8716b');

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
