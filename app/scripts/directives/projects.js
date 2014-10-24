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

				$scope.library = [];

				var type = 'fontvalues',
					i = 0;

				hoodie.store.findAll(type)
				  .done(function (tasks) {
				    console.log(tasks);
				    for (var i = 0; i < tasks.length; i++) {
				    	if (!tasks[i].fontName) tasks[i].fontName = tasks[i].id;
				    	$scope.library.push(
				    		{
				    			"name": tasks[i].fontName,
								"type": tasks[i].id,
								"id": tasks[i].id,
								"variant": tasks[i].variant,
								"variants": Math.round(Math.random(0,100) * 10) + 1,
								"version": Math.round(Math.random(0,100) * 10) + 1,
								"comments": Math.round(Math.random(0,1000) * 10) + 1
							}
				    	);
				    }
				  });

				// $scope.library.push(
				// 	{
				// 		"name": "Palatino",
				// 		"type": "Palatino",
				// 		"variants": 1
				// 	},
				// 	{
				// 		"name": "Monaco",
				// 		"type": "Monaco",
				// 		"variants": 4
				// 	},
				// 	{
				// 		"name": "Georgia",
				// 		"type": "Georgia",
				// 		"variants": 6
				// 	},
				// 	{
				// 		"name": "Comic sans MS",
				// 		"type": "Comic sans MS",
				// 		"variants": 6
				// 	},
				// 	{
				// 		"name": "Times new roman",
				// 		"type": "Times new roman",
				// 		"variants": 2
				// 	}
				// );



			}
		};
	});