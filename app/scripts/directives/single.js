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
					$contextMenu = $element.find('#contextMenu'),
					startX,
					startY,
					startPoint,
					draggingScene,
					draggingLine,
					lineId,
					startLine,
					draggingNode;

				$(window).on('pointerup', function() {
					draggingScene = undefined;
					draggingNode = undefined;
					draggingLine = undefined;
					document.body.style.cursor = 'default';

					/*if ( draggingLine ) {
						$scope
							.allGlyphs[ $scope.appValues.singleChar ]
							[ lineId ] -= dx;

						$scope.$digest();
						document.getElementById("tempSpacing").style.borderWidth = '0px';
						draggingLine = false;
					}*/

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

					if ( draggingLine ) {
						throttle(function() {
							// map the dragged deltas to the scene coordinate system
							var p = Point(
									startX - e.originalEvent.clientX,
									0
								),
								m = $transformed[0].getCTM().inverse();

							p.transform( m );

							$scope
								.allGlyphs[ $scope.appValues.singleChar ]
								[ draggingLine ] = startLine + p.x - m.e;

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
					if ( e.which != 3 ) {
						document.body.style.cursor = 'move';
						startX = e.originalEvent.clientX - $scope.appValues.scenePanX;
						startY = e.originalEvent.clientY - $scope.appValues.scenePanY;
						draggingScene = true;
					}
				});

				$element.on('pointerdown', function( e ) {
					if ( e.which == 3 ) {
						var posx = e.clientX +window.pageXOffset +'px';
			            var posy = e.clientY + window.pageYOffset + 'px';
			            contextMenu.style.position = 'absolute';
			            contextMenu.style.display = 'block';
			            contextMenu.style.left = posx;
			            contextMenu.style.top = posy;
					}
					else {
						contextMenu.style.display = 'none';
					}
				});

				/* node drag handler */
				$element.on('pointerdown', '.node', function( e ) {
					if ( e.which != 3 ) {
						document.body.style.cursor = 'move';

						draggingNode =
							$scope
								.allGlyphs[ $scope.appValues.singleChar ]
								.segments[ $(this).data('index') ]
								.$render[ $(this).data('type') ];

						startX = e.originalEvent.clientX;
						startY = e.originalEvent.clientY;
						startPoint = Point( draggingNode );

						return false;
					}
				});

				/* spacing lines drag handler */
				$element.on('pointerdown', '.spacingLine', function( e ) {
					if ( e.which != 3 ) {
						document.body.style.cursor = 'col-resize';

						draggingLine = this.getAttribute('id');
						startLine = $scope
							.allGlyphs[ $scope.appValues.singleChar ]
							[ draggingLine ];
						startX = e.originalEvent.clientX;

						//document.getElementById("tempSpacing").style.borderWidth = '1px';
						//document.getElementById("tempSpacing").style.left = startX + 'px';

						return false;
					}
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