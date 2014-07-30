'use strict';

angular.module('prototypo.communityDirective', [])
	.directive('community', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/admin/community.html',
			replace: true,
			link: function postLink( $scope, $element ) {

			$scope.library = [
				{
					"name": "A",
					"type": "arial",
					"variants": 4,
					"stars": 34
				},
				{
					"name": "A",
					"type": "comic sans ms",
					"variants": 12,
					"stars": 59
				},
				{
					"name": "A",
					"type": "times",
					"variants": 2,
					"stars": 10
				},
				{
					"name": "A",
					"type": "Palatino",
					"variants": 1,
					"stars": 10
				},
				{
					"name": "A",
					"type": "arial",
					"variants": 4,
					"stars": 89
				},
				{
					"name": "A",
					"type": "monaco",
					"variants": 4,
					"stars": 10
				},				{
					"name": "A",
					"type": "arial",
					"variants": 4,
					"stars": 34
				},
				{
					"name": "A",
					"type": "comic sans ms",
					"variants": 12,
					"stars": 59
				},
				{
					"name": "A",
					"type": "times",
					"variants": 2,
					"stars": 10
				},
				{
					"name": "A",
					"type": "Palatino",
					"variants": 1,
					"stars": 10
				},
				{
					"name": "A",
					"type": "arial",
					"variants": 4,
					"stars": 89
				},
				{
					"name": "A",
					"type": "monaco",
					"variants": 4,
					"stars": 10
				},				{
					"name": "A",
					"type": "arial",
					"variants": 4,
					"stars": 34
				},
				{
					"name": "A",
					"type": "comic sans ms",
					"variants": 12,
					"stars": 59
				},
				{
					"name": "A",
					"type": "times",
					"variants": 2,
					"stars": 10
				},
				{
					"name": "A",
					"type": "Palatino",
					"variants": 1,
					"stars": 10
				},
				{
					"name": "A",
					"type": "arial",
					"variants": 4,
					"stars": 89
				},
				{
					"name": "A",
					"type": "monaco",
					"variants": 4,
					"stars": 10
				}
			];

			}
		};
	});