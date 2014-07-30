'use strict';

angular.module('prototypo.projectsDirective', [])
	.directive('projects', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/admin/projects.html',
			replace: true,
			link: function postLink( $scope, $element ) {

				$scope.toggleClass = function (id) {
					if ( id == $scope.active ) {
						$('li.line').removeClass('active');
						$scope.active = undefined;
					}
					else {
						$scope.active = id;
						$('li.line').removeClass('active');
						$('#line-'+id).addClass('active');
					}
				};

				$scope.library = [
					{
						"name": "A",
						"type": "Times new roman",
						"variants": 2
					},
					{
						"name": "A",
						"type": "Palatino",
						"variants": 1
					},
					{
						"name": "A",
						"type": "Monaco",
						"variants": 4
					},
					{
						"name": "A",
						"type": "Georgia",
						"variants": 6
					},
					{
						"name": "A",
						"type": "Comic sans MS",
						"variants": 6
					},
					{
						"name": "A",
						"type": "Tahoma",
						"variants": 2
					},
					{
						"name": "A",
						"type": "Palatino",
						"variants": 1
					},
					{
						"name": "A",
						"type": "Arial",
						"variants": 4
					},
					{
						"name": "A",
						"type": "Comic sans MS",
						"variants": 6
					},
					{
						"name": "A",
						"type": "Times new roman",
						"variants": 2
					},
					{
						"name": "A",
						"type": "Palatino",
						"variants": 1
					},
					{
						"name": "A",
						"type": "Arial",
						"variants": 4
					},
					{
						"name": "A",
						"type": "monaco",
						"variants": 4
					}
				];



			}
		};
	});