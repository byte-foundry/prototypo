'use strict';

angular.module('prototypo.singleDirective', [])
	.directive('single', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/single.html',
			replace: true,
			link: function( $scope, $element ) {
				$element.on('wheel', function( e ) {
					var mouseX = e.originalEvent.clientX;
					var mouseY = e.originalEvent.clientY;
					// console.log(mouseX, mouseY);
					$scope.mouseZoomY( mouseY );
					$scope.mouseZoomX( mouseX );
					$scope.zoom( e.originalEvent.deltaY);
					$scope.$digest();
					return false;
				});

				// translate the scene with space bar + mouse
				var startX,
					startY,
					//spaceDown,
					pointerDown;

				/*$(document)
					.on('keyup', function( e ) {
						if ( e.keyCode === 32 ) {
							spaceDown = false;
						}
					}).on('keydown', function( e ) {
						if ( e.keyCode === 32) {
							spaceDown = true;
						}
					});*/

				$element.on('pointerdown', function( e ) {
					//if ( spaceDown ) {
					document.body.style.cursor = 'move';
					startX = e.originalEvent.clientX - $scope.appValues.scenePanX;
					startY = e.originalEvent.clientY - $scope.appValues.scenePanY;
					pointerDown = true;
					//}
				});

				$element.on('pointermove', function( e ) {
					if ( pointerDown ) {
						$scope.appValues.scenePanX = e.originalEvent.clientX - startX;
						$scope.appValues.scenePanY = e.originalEvent.clientY - startY;
						$scope.$digest();
						return false;
					}
				});

				$(window).on('pointerup', function() {
					pointerDown = false;
					document.body.style.cursor = 'default';
				});


				// override 'display: none !important' set by .ng-hide
				$element[0].style.setProperty('display', 'block', 'important');

				// <svg> is totally unable to handle % dimensions
				$element
					.find('svg')
					.attr({
						width: $element[0].offsetWidth,
						height: $element[0].offsetHeight
					})
					.addClass('active')
					.css('display', 'block');

				var viewBox = $element.find('svg')[0].viewBox.baseVal;
				$scope.viewboxScale = $element[0].offsetWidth / ( viewBox.height - viewBox.y );

				$element[0].style.setProperty('display', '');
			}
		};
	});