'use strict';

angular.module('prototypo.paramspanelDirective', [])
	.directive('paramspanel', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/paramspanel.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var $dummyGutter = $element[0].querySelector('.paramctrl-gutter'),
					$dummyHandle = $element[0].querySelector('.paramctrl-handle'),
					gutterWidth = $dummyGutter.offsetWidth,
					handleWidth = $dummyHandle.offsetWidth + parseFloat( window.getComputedStyle( $dummyHandle ).marginLeft ) * 2,
					rangeWidth = gutterWidth - handleWidth,
					gutterOffset = $dummyGutter.offsetLeft,
					setValue = function( gutter, pageX ) {
						var $gutter = $( gutter ),
							min = +$gutter.data('min'),
							max = +$gutter.data('max'),
							step = +$gutter.data('step'),
							name = $gutter.data('name'),
							translateX = Math.min( Math.max( pageX - gutterOffset - handleWidth / 2, 0 ), rangeWidth ) - rangeWidth,
							value = ( translateX + rangeWidth ) / rangeWidth * ( max - min ) + min;

						$scope.fontValues[ name ] = Math.round( Math.round( value / step ) * step * 100 ) / 100;
						$scope.$digest();
					},
					dragging;

				$dummyGutter.remove();

				$element.on('mousedown', '.paramctrl', function( e ) {
					dragging = this;
					setValue( dragging, e.pageX );
				});
				$(window).on('mouseup', function() {
					if ( dragging ) {
						dragging = undefined;
						$scope.processGlyphs();
					}
				});
				$(window).on('mousemove', function( e ) {
					if ( dragging ) {
						setValue( dragging, e.pageX );
					}
				});

				// delegated attr watcher
				(new MutationObserver(function(mutations) {
					mutations.forEach(function( mutation ) {
						var value = +mutation.target.getAttribute('value'),
							min = +$( mutation.target ).data('min'),
							max = +$( mutation.target ).data('max'),
							translateX = Math.round( ( ( value - min ) / ( max - min ) ) * rangeWidth ) - rangeWidth;

						$( mutation.target.querySelector('.paramctrl-bg') )
							.css('transform', 'translateX(' + translateX + 'px)');
					});

				// config
				})).observe( $element[0], {
					attributes: true,
					subtree: true,
					attributeFilter: ['value']
				});

				// tab selection
				$element.on('click', '.paramstab-menuitem', function() {
					$scope.appValues.paramTab = +$(this).data('index');
					$scope.$digest();
				});
			}
		};
	});