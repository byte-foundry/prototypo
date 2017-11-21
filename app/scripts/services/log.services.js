import XXHash from 'xxhashjs';

const hasher = XXHash(0xDEADBEEF);

// log things using google analytics events
function Log(category, action, label) {
	if (!window.ga) {
		return;
	}

	window.ga('send', 'event', category, action, label);
}

Log.ui = function (action, label) {
	Log('ui', action, label);
};

Log.setUserId = function (email) {
	window.ga('set', '&uid', hasher.update(email).digest().toString(16));
};

export default Log;
