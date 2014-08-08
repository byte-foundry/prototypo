'use strict';

angular.module('prototypo.menuDirective', [])
	.directive('menu', function() {


		return {
			restrict: 'E',
			templateUrl: 'views/menu.html',
			replace: true,
			link: function postLink( $scope, $element ) {

				var active;

				// prevent clicks on disabled items
				$element[0].addEventListener('click', function( event ) {
					if ( $( event.target ).is('li.disabled') ) {
						event.stopPropagation();
						event.preventDefault();
					}
				}, true);

				$element.on('pointerdown', 'ul.level-1 li', function() {
					$('.menu ul.level-1 li').removeClass('active');
					$(this).addClass('active');
					active = true;
				});

				$element.on('mouseover', 'li:has(> ul)', function() {
					if(active) {
						$('.menu ul.level-1 li').removeClass('active');
						$(this).addClass('active');
						$('.menu ul.level-2').css('display', 'none');
						$('ul.level-2', this).css('display', 'block');
					}
				});

				$element.on('mouseover', 'li:has(> ul.level-3)', function() {
					$('ul.level-3', this).css('display', 'block');
				});

				$element.on('mouseout', 'li:has(> ul.level-3)', function() {
					$('ul.level-3', this).css('display', 'none');
				});

				$element.on('pointerdown', 'li:has(> ul)', function() {
					$('.menu ul.level-2').css('display', 'none');
					$('ul.level-2', this).css('display', 'block');
				});

				$('html, .closeSubLevel').click(function() {
					$('.menu ul.sub-level').css('display', 'none');
					$('.menu ul.level-1 li').removeClass('active');
					active = false;
				});

				$('.menu').click(function(event){
				    event.stopPropagation();
				});

				$element.on('pointerdown', '.preset-menu-item', function() {
					$scope.applyPreset( $(this).data('name') );
				});

				$element.on('pointerover', '.preset-menu-item', function() {
					$scope.selectedPreset = 'preset-' + $(this).data('i');
					$scope.$apply();
				});

				$element.find('.preset-menu').on('pointerleave', function() {
					$scope.selectedPreset = '';
					$scope.$apply();
				});

				var groups = [],
					randomOutlines = [],
					rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame,
					template = Handlebars.templates.planche;

				$scope.randomOutline = function randomOutline() {
					var allGlyphs = Object.keys( $scope.typeface.order ),
						randomIndex = Math.round( Math.random() * ( allGlyphs.length - 14 ) ),
						randomGlyph = allGlyphs[ randomIndex ];

					// pick random font values
					$scope.typeface.parameters.forEach(function( group ) {
						group.parameters.forEach(function( param ) {
							// There's 1/4 chance to set the param randomly, otherwise it's reset
							$scope.fontValues[ param.name ] = Math.random() * 4 > 3 ?
								param.min + Math.random() * ( param.max - param.min ):
								param.init;
						});
					});
					$scope.updateCalculatedParams( $scope.fontValues );

					if ( Math.random() * 4 > 3 ) {
						$scope.fontValues.serifWidth = 1 + Math.random() * 100;
						$scope.fontValues.serifHeight = 0 + Math.random() * 80;
					}

					$scope.fontValues.serifWidth = Math.max( $scope.fontValues.serifWidth, 1 );
					$scope.fontValues.serifTerminal = Math.max( $scope.fontValues.serifTerminal, 0 );

					$scope.appValues.singleChar = randomGlyph;

					return $scope.font.read( randomGlyph, $scope.fontValues, true );
				};

				$scope.randomOutlines = function() {
					randomOutlines.push({
						svg: $scope.randomOutline().svg.replace(/\s/g, ' '),
						transform:
							'translate(' +
							( 1500 * ( randomOutlines.length % 12 ) ) +
							', ' +
							( 1500 * Math.floor( randomOutlines.length / 12 ) ) +
							')'
					});

					if ( groups.length < 2 || randomOutlines.length < 216 ) {
						rAF(function() {
							$scope.randomOutlines();
							$scope.$digest();
						});
					}

					if ( randomOutlines.length === 216 ) {
						groups.push({
							transform: 'translate(' + ( groups.length * 12000 ) + ',0)',
							outlines: randomOutlines
						});

						randomOutlines = [];
					}
				};

				$scope.exportOutlines = function() {
					saveAs(
						new Blob(
							[template({groups: groups})],
							{type: 'application/svg+xml;charset=utf-8'}
						),
						'default.svg'
					);
				};

				$(window).keydown(function( event ) {
					if ( ( event.keyCode === 90 && event.metaKey && event.shiftKey ) ||
						 ( event.keyCode === 90 && event.ctrlKey && event.shiftKey ) ||
						 ( event.keyCode === 89 && event.metaKey ) ||
						 ( event.keyCode === 89 && event.ctrlKey ) ) {

						$scope.redo();
						return false;
					}

					else if ( ( event.keyCode === 90 && event.metaKey ) ||
							  ( event.keyCode === 90 && event.ctrlKey ) ) {

						$scope.undo();
						return false;
					}
				});

			}
		};
	});