'use strict';

angular.module('prototypo.libraryDirective', [])
	.directive('library', function( $location, FontValues ) {
		return {
			restrict: 'E',
			templateUrl: 'views/library.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				
				function fillInLibrary() {
					$('.fonts ul').empty();
					FontValues.findAll().then( function( object ) {
						var list = '';
						for (var key in object) {

							var modifyTypeface  = '<ul class="modifyTypeface" name="' + object[key].id + '">';
								// modifyTypeface += '<li class="">Fonts</li>';
								modifyTypeface += '<li class="renameFont">Rename</li>';
								modifyTypeface += '<li class="removeFont">Delete</li>';
								modifyTypeface += '<li>Duplicate</li>';
								modifyTypeface += '</ul>';
							// console.log(object[key]);
							console.log('ID font : ' + object[key]['id']);
							console.log('font name : ' + object[key].values.fontName);
							console.log('');
							
							if ( object[key].values.fontName == undefined ) {
								var type = 'fontvalues',
									id = object[key].id,
									update = {fontName: 'default'};

								hoodie.store.update(type, id, update)
								  .done(function (updatedObject) {
								  	object[key].values.fontName = 'default';
								  });
							}

							$('.fonts ul.typeface').append( '<li name="' + object[key].id + '"><div class="load" name="' + object[key].id + '">' + object[key].values.fontName + '</div>' + modifyTypeface + '</li>' );
						
							list += object[key].values.fontName + ' ' + object[key].id + '<br/>';

							// var savedFonts = '<li>aaaa</li>';
							// $('ul.savedFonts').append( savedFonts );
						
						}
						$('.fonts ul.typeface').append(list);
					});
					// hoodie.store.findAll('fontvalues').done(function(object){console.log(object);})
				};
				fillInLibrary();

				// load font
				$element.on('pointerdown', '.fonts li .load', function() {
					var name = $(this).attr('name'),
						url = name + '/regular';

					$location.path( url );
					$scope.$apply();
				});

				// rename font
				// TODO: display input panel
				$element.on('pointerdown', '.renameFont', this, function() {

					// $scope.appValues.displayNewFontInput = !$scope.appValues.displayNewFontInput
					var newName = $('input[name="inputFontName"]').val();

					var type = 'fontvalues',
					id = $(this).closest('ul').attr('name'),
					update = {starred: false};

						hoodie.store.update(type, id, update)
						.done(function (updatedObject) {

							// console.log(this);

						  	// console.log(updatedObject);
						  	console.log('avant : ', updatedObject.values.fontName);
						  	updatedObject.values.fontName = 'Nouveau nom';
						  	console.log('pendant : ', updatedObject.values.fontName);
						  	// $scope.$apply();
							console.log('juste après : ', updatedObject.values.fontName);
							// console.log('juste après : ', updatedObject.values);

							// FontValues.save({
							// 	typeface: $routeParams.typeface,
							// 	values: $scope.fontValues
							// });

						  	return updatedObject;
						  	// console.log(updatedObject);
					  });


					// debug
					hoodie.store.find(type, id)
					.done(function (object) {
						console.log('après : ', object.values.fontName);
					});

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