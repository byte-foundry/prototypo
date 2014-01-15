'use strict';

angular.module('prototypo.singleDirective', [])
	.directive('single', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/single.html',
			replace: true,
			link: function( $scope, $element ) {
				$element.on('wheel', function( e ) {
					$scope.zoom( e.originalEvent.deltaY );
					$scope.$digest();
					return false;
				});

				// translate the scene with space bar + mouse
				var startX, startY, endX, endY, pointerDown, space;
			
				$(document).keyup(function(evt) {
					if (evt.keyCode == 32) { space = false; }
				}).keydown(function(evt) { 
					if (evt.keyCode == 32) { space = true; }
				});
				
				$element.on('pointerdown', function( e ) {
					if (space) {
						document.body.style.cursor = 'move';
						if ($scope.appValues.translateSceneY) {
							startX = e.originalEvent.clientX - $scope.appValues.translateSceneX;
							startY = e.originalEvent.clientY - $scope.appValues.translateSceneY;
						} else {
							startX = e.originalEvent.clientX;
							startY = e.originalEvent.clientY;
						}
						pointerDown = true;
					}
				});
				
				$element.on('pointermove', function( e ) {
					if (pointerDown) {
						var endX = e.originalEvent.clientX;
						var endY = e.originalEvent.clientY;	
						var deltaY =  endY - startY;
						var deltaX =  endX - startX;
						$scope.translateSceneY( deltaY );
						$scope.translateSceneX( deltaX );
						$scope.$digest();
						return false;
					}
				});

				$(window).on('pointerup', function( e ) {
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

				$element[0].style.setProperty('display', '');
			}
		};
	});