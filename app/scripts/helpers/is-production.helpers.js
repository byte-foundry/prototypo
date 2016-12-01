export default function isProduction() {
	return process.env.TRAVIS_BRANCH === 'master' || process.env.TRAVIS_BRANCH === 'release';
};
