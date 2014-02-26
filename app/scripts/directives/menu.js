'use strict';

		var active;

angular.module('prototypo.menuDirective', [])
	.directive('menu', function() {


		return {
			restrict: 'E',
			templateUrl: 'views/menu.html',
			replace: true,
			link: function postLink( $scope, $element ) {

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

				$('html').click(function() {
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
			}
		};
	});