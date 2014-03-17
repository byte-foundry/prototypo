'use strict';

angular.module('prototypo.singleDirective', ['prototypo.Point', 'prototypo.Utils'])
	.directive('single', function( Point, throttle ) {
		return {
			restrict: 'E',
			templateUrl: 'views/single.html',
			replace: true,
			link: function( $scope, $element ) {
				$element.on('wheel', function( e ) {
					throttle(function() {
						$scope.zoom( e.deltaY );
						$scope.$digest();
					});
					return false;
				});

				// reset scene zoom and position on double-tap
				var counter = 0;
				$element.on('pointerdown', function() {
					setTimeout( function() {
						counter = 0;
					}, 200 );
					counter++;

					if ( counter === 2 ) {
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
					isDraggingScene,
					isDraggingLine,
					isDraggingNode,
					draggedLine,
					draggedNode,
					startLine;

				$(window).on('pointerup', function() {
					isDraggingScene = undefined;
					isDraggingNode = undefined;
					isDraggingLine = undefined;
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

				var space = false;
				$(document).keyup(function(evt) {
					if (evt.keyCode == 32) {
						space = false;
					}
				}).keydown(function(evt) {
					if (evt.keyCode == 32) {
						space = true;
					}
				});
				
				$element.on('pointermove', function( e ) {
					if ( isDraggingScene ) {
						throttle(function() {
							$scope.appValues.scenePanX = e.clientX - startX;
							$scope.appValues.scenePanY = e.clientY - startY;
							$scope.$digest();
						});
						return false;
					}

					if ( isDraggingLine ) {
						throttle(function() {
							// map the dragged deltas to the scene coordinate system
							var p = Point(
									startX - e.clientX,
									0
								),
								m = $transformed[0].getCTM().inverse();

							p.transform( m );

							$scope
								.allGlyphs[ $scope.appValues.singleChar ]
								[ draggedLine ] = startLine + p.x - m.e;

							$scope.$digest();
						});
						return false;
					}

					if ( isDraggingNode ) {
						throttle(function() {
							// map the dragged deltas to the scene coordinate system
							var p = Point(
									e.clientX - startX,
									e.clientY - startY
								),
								m = $transformed[0].getCTM().inverse();

							p.transform( m );

							draggedNode.x = startPoint.x + p.x - m.e;
							draggedNode.y = startPoint.y + p.y - m.f;

							$scope.$digest();
						});
					}
				});

				/* scene drag handler */
				$element.on('pointerdown', function( e ) {
					if ( e.which !== 3 && space ) {
						document.body.style.cursor = 'move';
						startX = e.clientX - $scope.appValues.scenePanX;
						startY = e.clientY - $scope.appValues.scenePanY;

						isDraggingScene = true;
					}
				});

				// contextMenu
				$element.on('pointerdown', function( e ) {
					if ( e.which === 3 ) {
						$('#contextmenu').css({
							display: 'block',
							left: e.clientX + window.pageXOffset + 'px',
							top: e.clientY + window.pageYOffset + 'px'
						});

					} else {
						$('#contextmenu').css( 'display', 'none' );
					}

				// prevent defautlt context-menu
				}).parent().parent().on('contextmenu', function() {
					return false;
				});

				/* node drag handler */
				$element.on('pointerdown', '.node', function( e ) {
					if ( e.which !== 3 ) {
						document.body.style.cursor = 'move';

						isDraggingNode = true;
						draggedNode =
							$scope
								.allGlyphs[ $scope.appValues.singleChar ]
								.segments[ $(this).data('index') ]
								.$render[ $(this).data('type') ];

						startX = e.clientX;
						startY = e.clientY;
						startPoint = Point( draggedNode );

						return false;
					}
				});

				/* spacing lines drag handler */
				$element.on('pointerdown', '.spacingLine', function( e ) {
					if ( e.which !== 3 ) {
						document.body.style.cursor = 'col-resize';

						isDraggingLine = true;
						draggedLine = this.getAttribute('id');
						startLine = $scope
							.allGlyphs[ $scope.appValues.singleChar ]
							[ draggedLine ];
						startX = e.clientX;

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