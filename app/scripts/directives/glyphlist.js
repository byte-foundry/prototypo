'use strict';

angular.module('prototypo.glyphlistDirective', [])
	.directive('glyphlist', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/glyphlist.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var stopWatching,
					parentWidth = $element[0].parentNode.offsetWidth;

				$element.on('mousedown', 'li', function() {
					$scope.appValues.singleChar = $( this ).data( 'id' );
					$scope.$apply();
				});

				stopWatching = $scope.$watch('typeface.order', function( order ) {
					if ( !order || !Object.keys(order).length ) {
						return;
					}

					var selfWidth = $element[0].offsetWidth;

					if ( selfWidth > parentWidth ) {
						$element
							.addClass('toobig content-right')
							.data({ scroll: 0 });

					}

					$element.addClass('initialized');
					// we shouldn't need to watch longer than that
					stopWatching();
				});

				// scroll handler
				$element.parent().on('wheel', '.toobig', function( e ) {
					var $this = $(this),
						scrollDown = e.originalEvent.deltaY > 0,
						scrollBy = scrollDown ? -40 : 40,
						currentScroll = +$this.data('scroll'),
						selfWidth = this.offsetWidth;

					currentScroll = Math.max( Math.min( currentScroll + scrollBy, 0 ), parentWidth - selfWidth );

					if ( scrollDown && currentScroll === parentWidth - selfWidth ) {
						$this.removeClass('content-below');
					}
					if ( !scrollDown && currentScroll > parentWidth - selfWidth ) {
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
						.children().css('transform', 'translateX(' + currentScroll + 'px)');
				});
			}

		};
	});