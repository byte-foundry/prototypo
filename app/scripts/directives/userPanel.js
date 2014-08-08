'use strict';

angular.module('prototypo.userPanelDirective', [])
	.directive('userPanel', function( FontValues, $location) {
		return {
			restrict: 'E',
			templateUrl: 'views/user-panel.html',
			replace: true,
			link: function postLink( $scope, $element ) {

				var mail = hoodie.account.username;
				$('.mail').html(mail);

				// hoodie.account.changeUsername('currentpassword', 'newusername');

				function fillInLibrary() {
					$('.fonts ul').empty();
					FontValues.findAll().then( function( object ) {
						for (var key in object) {

							var modifyTypeface  = '<ul class="modifyTypeface" name="' + object[key].id + '">';
								modifyTypeface += '<li class="renameFont">Rename</li>';
								modifyTypeface += '<li class="removeFont">Delete</li>';
								modifyTypeface += '<li>Duplicate</li>';
								modifyTypeface += '</ul>';
							// console.log('ID font : ' + object[key]['id']);
							// console.log(object[key]);
							console.log('font name : ' + object[key].values._name);
							$('.fonts ul.typeface').append( '<li name="' + object[key].id + '"><div class="load" name="' + object[key].id + '">' + object[key].values._name + '</div>' + modifyTypeface + '</li>' );
						}
					});
				};
				fillInLibrary();

				// load font
				$element.on('pointerdown', '.fonts li .load', function() {
					var name = $(this).attr('name'),
						url = 'typeface/' + name + '/font/default';

					$location.path( url );
					$scope.$apply();
				});

				// rename font
				// TODO: display input panel
				$element.on('pointerdown', '.renameFont', this, function() {

					$scope.appValues.displayNewFontInput = !$scope.appValues.displayNewFontInput
					var newName = $('input[name="inputFontName"]').val();

					var type = 'fontvalues',
						id = $(this).closest('ul').attr('name'),
						update = {starred: true};
						
					hoodie.store.update(type, id, update)
					  .done(function (updatedObject) {
					  	console.log(updatedObject);
					  	console.log(updatedObject.values._name);
					  	updatedObject.values._name = 'kkkkk';
					  	console.log(updatedObject.values._name);
					  });

					// console.log($scope.fontValues['_name']);
					$scope.$apply();
					fillInLibrary();
				});

				// remove font
				$element.on('pointerdown', '.removeFont', function() {
					var id = $(this).closest('ul').attr('name'),
						type = 'fontvalues';

					hoodie.store.remove(type, id)
						.done(function (removedObject) {});

					fillInLibrary();
				});

				// reset font library
				$element.on('pointerdown', '#removeAll', function() {
					var type = 'fontvalues';

					hoodie.store.removeAll(type)
					.done(function (objects) {});
					
					fillInLibrary();
				});


			}
		};
	});