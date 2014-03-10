'use strict';

angular.module('prototypo.paramtabsDirective', [])
	.directive('paramtabs', function( throttle ) {
		return {
			restrict: 'E',
			templateUrl: 'views/paramtabs.html',
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
					isDraggingParam,
					draggedParam,
					parentHeight = $element[0].offsetHeight;

				$element.find('.paramtab.dummy').remove();
				$element.data('rangeWidth', rangeWidth);

				$element.on('pointerdown', '.paramctrl-gutter', function( e ) {
					isDraggingParam = true;
					draggedParam = this.parentNode;
					setValue( draggedParam, e.pageX );
				});

				$(window).on('pointerup', function() {
					isDraggingParam = undefined;
				});
				$(window).on('pointermove', function( e ) {
					if ( isDraggingParam ) {
						throttle(function() {
							setValue( draggedParam, e.pageX );
						});
						return false;
					}
				});

				$element.on('pointerdown', '.reset', function() {
					var $item = $(this.parentNode);
						name = $item.data('name');

					$scope.fontValues[ name ] = $scope.typeface.presets[ $scope.appValues.currentPreset ][ name ] || $item.data('init');
					$scope.$digest();
				});

				// scroll handler
				$element.on('wheel', '.toobig', function( e ) {
					var $this = $(this),
						scrollDown = e.deltaY > 0,
						scrollBy = scrollDown ? -20 : 20,
						currentScroll = +$this.data('scroll'),
						tabHeight = this.offsetHeight;

					currentScroll = Math.max( Math.min( currentScroll + scrollBy, 0 ), parentHeight - tabHeight );

					if ( scrollDown && currentScroll === parentHeight - tabHeight ) {
						$this.removeClass('content-below');
					}
					if ( !scrollDown && currentScroll > parentHeight - tabHeight ) {
						$this.addClass('content-below');
					}
					if ( !scrollDown && currentScroll === 0 ) {
						$this.removeClass('content-above');
					}
					if ( scrollDown && currentScroll < 0 ) {
						$this.addClass('content-above');
					}

					$this
						.data('scroll', currentScroll)
						.children().css({transform: 'translateY(' + currentScroll + 'px)'});
				});
			}
		};
	});
