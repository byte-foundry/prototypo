'use strict';

angular.module('prototypo.paramtabsDirective', [])
	.directive('paramtabs', function() {
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
					dragging,
					parentHeight = $element[0].offsetHeight;

				$dummyGutter.parentNode.remove();

				$element.on('pointerdown', '.paramctrl-gutter', function( e ) {
					dragging = this.parentNode;
					setValue( dragging, e.originalEvent.pageX );
				});
				$(document.body).on('pointerup', function() {
					if ( dragging ) {
						dragging = undefined;
						$scope.processGlyphs();
					}
				});
				$(document.body).on('pointermove', function( e ) {
					if ( dragging ) {
						setValue( dragging, e.originalEvent.pageX );
						return false;
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

				// scroll handler
				$element.on('wheel', '.toobig', function( e ) {
					var $this = $(this),
						scrollDown = e.originalEvent.deltaY > 0,
						scrollBy = scrollDown ? -40 : 40,
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
						.children().css('transform', 'translateY(' + currentScroll + 'px)');
				});
			}
		};
	});
