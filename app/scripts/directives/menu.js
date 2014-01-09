'use strict';

angular.module('prototypo.menuDirective', [])
	.directive('menu', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/menu.html',
			replace: true,
			link: function postLink( $scope, $element ) {

				$element.on('pointerdown', '.btn', function() {
					$('.menu ul.level-1').slideToggle('fast');
				});

				$element.on('mouseover', 'li:has(> ul)', function() {
					$('ul', this).css('display', 'block');
				});

				$element.on('mouseout', 'li:has(> ul)', function() {
					$('ul', this).css('display', 'none');
				});

				$element.on('pointerdown', '#ui-guidelines', function() {
					$('#guidelines *').fadeToggle();
				});

				$element.on('pointerdown', '#ui-grid', function() {
					$('#grid').fadeToggle();
				});

				$element.on('pointerdown', '#ui-nodes', function() {
					$('.scene #nodes *').fadeToggle();
				});

				$('html').click(function() {
					$('.menu ul.level-1').css('display', 'none');
				});

				$('.menu').click(function(event){
				    event.stopPropagation();
				});
			}
		};
	});