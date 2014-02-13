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
					start = {},
					prev = {},
					isDraggingScene,
					isDraggingLine,
					isDraggingNode,
					draggedLine,
					draggedNode;

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

				$element.on('pointermove', function( e ) {
					if ( isDraggingScene ) {
						throttle(function() {
							$scope.appValues.scenePanX = e.clientX - start.x;
							$scope.appValues.scenePanY = e.clientY - start.y;
							$scope.$digest();
						});
						return false;
					}

					if ( isDraggingLine ) {
						throttle(function() {
							// map the dragged deltas to the scene coordinate system
							var p = Point(
									start.x - e.clientX,
									0
								),
								m = $transformed[0].getCTM().inverse();

							p.transform( m );

							$scope
								.allGlyphs[ $scope.appValues.singleChar ]
								[ draggedLine ] = start.line + p.x - m.e;

							$scope.$digest();
						});
						return false;
					}

					if ( isDraggingNode ) {
						throttle(function() {
							// map the dragged deltas to the scene coordinate system
							var p = Point(
									e.clientX - prev.clientX,
									e.clientY - prev.clientY
								),
								m = $transformed[0].getCTM().inverse();

							p.transform( m );

							start.segment.translatePoint(
								start.type,
								p.x - m.e,
								p.y - m.f
							);

							// dirty outline update
							$scope.allGlyphs[ $scope.appValues.singleChar ].svg =
								$scope.font.glyphs[ $scope.appValues.singleChar ]
									.smooth()
									.toSVG();

							$scope.$digest();

							prev.clientX = e.clientX;
							prev.clientY = e.clientY;
						});
					}
				});

				/* scene drag handler */
				$element.on('pointerdown', function( e ) {
					if ( e.which !== 3 ) {
						document.body.style.cursor = 'move';
						start.x = e.clientX - $scope.appValues.scenePanX;
						start.y = e.clientY - $scope.appValues.scenePanY;

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

						prev.clientX = e.clientX;
						prev.clientY = e.clientY;
						start.segment = $(this).scope().$parent.segment;
						start.type = $(this).data('type');

						return false;
					}
				});

				/* spacing lines drag handler */
				$element.on('pointerdown', '.spacingLine', function( e ) {
					if ( e.which !== 3 ) {
						document.body.style.cursor = 'col-resize';

						isDraggingLine = true;
						draggedLine = this.getAttribute('id');
						start.line = $scope
							.allGlyphs[ $scope.appValues.singleChar ]
							[ draggedLine ];
						start.x = e.clientX;

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