describe('Account', function() {
	it('Should be true', function(done) {
		document.body.innerHTML = __html__['app/index.html'];
		var scriptsTag = document.querySelectorAll('script');
		var promises = [];
		Array.prototype.forEach.call(scriptsTag, function(script) {
			if (script.src != '' && script.src.indexOf('localhost') != -1) {
				var newScript = document.createElement('script');
				var urlArray = script.src.split('/');
				var newUrl = urlArray.slice(4, urlArray.length).join('/');
				newScript.setAttribute('src', 'http://localhost:9876/__karma__/base/dist/' + newUrl);
				promises.push(new Promise(function(resolve, reject) {
					newScript.onload = function() {
						resolve();
					}
				}));
				document.body.appendChild(newScript);
			}
			else {
				//eval(script.text);
			}
		});
		
		Promise.all(promises)
			.then(function() {
				expect(document.getElementById('content')).to.not.be.undefined;
				done();
			});
	});
});
