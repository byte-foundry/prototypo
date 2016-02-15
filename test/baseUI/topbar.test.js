module.exports = {
	before: function(browser, done) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in', 'test@registered-annual.com')
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(20000)
			.waitForElementVisible('#dashboard', 20000, false, done);
	},
	after: function(browser) {
		browser.end();
	},
	'Should contain File, Edit, toggle views and glyph list': function(browser) {
		browser
			.elements('css selector', '#topbar > ul > li', function(result) {
				browser.assert.equal(result.value.length, 8);
			});
	},
	'Should display file menu' : function (browser) {
		browser
			.elements('css selector', '#topbar > ul > li', function(result) {
				browser.moveTo(result.value[0].ELEMENT)
					.waitForElementVisible('#file-dropdown', 2000);
			})
	},
	'Should display edit menu' : function (browser) {
		browser
			.elements('css selector', '#topbar > ul > li', function(result) {
				browser.moveTo(result.value[1].ELEMENT)
				.waitForElementVisible('#topbar > ul > li:nth-child(2) > ul', 2000);
			});
	},
	'Should display toggle views' : function (browser) {
		browser
			.elements('css selector', '#topbar > ul > li', function(result) {
				browser.moveTo(result.value[2].ELEMENT)
				.waitForElementVisible('#topbar > ul > li:nth-child(3) > ul', 2000);
			});
	},
	'Should display glyph list': function (browser) {
		browser
			.elements('css selector', '#topbar > ul > li', function(result) {
				browser.elementIdClick(result.value[4].ELEMENT)
					.waitForElementVisible('.glyph-list-glyphs', 2000)
					.elementIdClick(result.value[4].ELEMENT)
					.waitForElementNotVisible('.glyph-list-glyphs', 2000).end();
			});
	},
};
