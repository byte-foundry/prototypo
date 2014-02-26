'use strict';

angular.module('prototypo.stringDirective', [])
	.directive('string', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/string.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var translations = [0],
					wrapper = $element[0].querySelector('div');

				$scope.getTranslate = function( $index, char ) {
					// TODO: we shouldn't need this check
					if ( $scope.allGlyphs[char] ) {
						translations[$index +1] =
							$scope.allGlyphs[char].left +
							$scope.allGlyphs[char].advance -
							$scope.allGlyphs[char].right +
							translations[$index];

						return Math.round(
							$scope.allGlyphs[char].left +
							translations[$index]
						);
					}

					return 0;
				};

				// contextMenu
				$element.on('pointerdown', function( e ) {
					if ( e.which === 3 ) {
						$('#contextmenuString').css({
							display: 'block',
							left: e.clientX + window.pageXOffset + 'px',
							top: e.clientY + window.pageYOffset + 'px'
						});

					} else {
						$('#contextmenuString').css( 'display', 'none' );
					}

				// prevent defautlt context-menu
				}).parent().parent().on('contextmenu', function() {
					return false;
				});

				// override 'display: none !important' set by .ng-hide
				$element[0].style.setProperty('display', 'block', 'important');

				// <svg> is totally unable to handle % dimensions
				$element
					.find('svg')
					.attr({
						width: wrapper.offsetWidth,
						height: wrapper.offsetHeight
					})
					.addClass('active')
					.css('display', 'block');

				$element[0].style.setProperty('display', '');

				// go to glyph on double-tap
				var counter = 0;
				$element.on('pointerdown', 'path', function( e ) {
					var id = e.target.getAttribute('glyph-contour');
					setTimeout( function() {
						counter = 0;
					}, 200 );
					counter++
					if(counter == 2) {
						$scope.appValues.viewMode = 'single';
						$scope.appValues.singleChar = id;
						$scope.$digest();
						return false;
					}
				});


			}
		};
	});