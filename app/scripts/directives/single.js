'use strict';

angular.module('prototypo.singleDirective', ['prototypo.Point', 'prototypo.Utils'])
	.directive('single', function( Point, throttle ) {
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

				// reset scene zoom and position on double-tap
				var counter = 0;
				$element.on('pointerdown', function( e ) {
					setTimeout( function() {
						counter = 0;
					}, 200 );
					counter++
					if(counter == 2) {
						$scope.appValues.zoom = 1.5;
						$scope.appValues.scenePanX = -120;
						$scope.appValues.scenePanY = 0;
						$scope.$digest();
						return false;
					}
				});

				var $transformed = $element.find('#transformed'),
					startX,
					startY,
					startPoint,
					draggingScene,
					draggingNode;

				$(window).on('pointerup', function() {
					draggingScene = false;
					draggingNode = false;
					document.body.style.cursor = 'default';
				});

				$element.on('pointermove', function( e ) {
					if ( draggingScene ) {
						throttle(function() {
							$scope.appValues.scenePanX = e.originalEvent.clientX - startX;
							$scope.appValues.scenePanY = e.originalEvent.clientY - startY;
							$scope.$digest();
						});
						return false;
					}

					if ( draggingNode ) {
						throttle(function() {
							// map the dragged deltas to the scene coordinate system
							var p = Point(
									e.originalEvent.clientX - startX,
									e.originalEvent.clientY - startY
								),
								m = $transformed[0].getCTM().inverse();

							p.transform( m );

							draggingNode.x = startPoint.x + p.x - m.e;
							draggingNode.y = startPoint.y + p.y - m.f;

							$scope.$digest();
						});
					}
				});

				/* scene drag handler */
				$element.on('pointerdown', function( e ) {
					document.body.style.cursor = 'move';
					startX = e.originalEvent.clientX - $scope.appValues.scenePanX;
					startY = e.originalEvent.clientY - $scope.appValues.scenePanY;
					draggingScene = true;
				});

				/* node drag handler */
				$element.on('pointerdown', '.node', function( e ) {
					document.body.style.cursor = 'move';

					draggingNode =
						$scope
							.allGlyphs[ $scope.appValues.singleChar ]
							.segments[ $(this).data('index') ]
							.$render[ $(this).data('type') === 'end' ? 'end' : 'controls' ];

					if ( draggingNode.length ) {
						draggingNode = draggingNode[ $(this).data('type') === 'control0' ? 0 : 1 ];
					}

					startX = e.originalEvent.clientX;
					startY = e.originalEvent.clientY;
					startPoint = Point( draggingNode );

					return false;
				});


				/* Set <svg> dimension during postLink */
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