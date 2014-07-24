'use strict';

angular.module('prototypo.paramtabDirective', [])
	.directive('paramtab', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/paramtab.html',
			replace: true,
			link: function postLink( $scope, $element ) {
				var rangeWidth = $element.parent().data('rangeWidth'),

					changeHandler = function( newValues, oldValues ) {
						var li;

						for ( var i in newValues ) {
							if ( newValues[i] !== oldValues[i] && ( li = $element[0].querySelector('#param-' + i) ) ) {
								var value = newValues[i],
									bg = li.querySelector('.paramctrl-bg'),
									$li = $(li),
									min = +$li.data('min'),
									max = +$li.data('max'),
									minAdvised = +$li.data('minadvised'),
									maxAdvised = +$li.data('maxadvised'),
									translateX = Math.round( ( ( value - min ) / ( max - min ) ) * rangeWidth ) - rangeWidth;

								$( bg ).css({transform: 'translateX(' + translateX + 'px)'});

								// TODO: this could be optimized to only touch classList when needed
								if ( value < minAdvised || value > maxAdvised ) {
									$( bg ).addClass('ill-advised');
								} else {
									$( bg ).removeClass('ill-advised');
								}
							}
						}
					},

					stopWatching = $scope.$watch('parameters', function( parameters ) {
						if ( !parameters || !parameters.length ) {
							return;
						}

						var parentHeight = $element[0].parentNode.offsetHeight,
							selfHeight = $element[0].offsetHeight;

						if ( selfHeight > parentHeight ) {
							$element
								.addClass('toobig content-below')
								.data({ scroll: 0 });
						}

						changeHandler( $scope.fontValues, {} );

						$element.addClass('initialized');
						// we shouldn't need to watch longer than that
						stopWatching();
					});

				$scope.$watch('fontValues', changeHandler, true);
			}
		};
	});