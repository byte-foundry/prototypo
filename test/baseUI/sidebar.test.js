module.exports = {
	before: function(browser, done) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in', 'test@registered-annual.com')
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(2000)
			.waitForElementVisible('#dashboard', 20000, done);
	},
	after: function(browser) {
		browser.end();
	},
	'Should display collection' : function (browser) {
		browser
			.click('div[name=fonts-collection]')
			.waitForElementVisible('.fonts-collection',2000);
	},
	'Should display profile' : function (browser) {
		browser
			.click('div[name=subscriptions]')
			.waitForElementVisible('.account', 2000);
	},
	'Should display help' : function (browser) {
		browser
			.click('div[name=help-panel]')
			.waitForElementVisible('.help-panel', 2000);
	},
	'Should display news feed' : function (browser) {
		browser
			.click('div[name=news-feed]')
			.waitForElementVisible('.news-feed', 2000)
			.end()
	},
	'Should display profile when kickstarter' : function (browser) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in', 'test@registered-kickstarter.com')
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(2000)
			.waitForElementVisible('#dashboard', 20000)
			.click('div[name=subscriptions]')
			.waitForElementVisible('.account', 2000);
	},
};
