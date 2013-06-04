'use strict';


angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, glyphs, slidersUI ) {
		$scope.slidersUI = slidersUI;
		$scope.sliders = {};
		$scope.glyph = 'A';
	})

	// FIXME: Why do we need those dummy controllers to achieve two way binding across views?
	.controller('InterfaceCtrl', function( $scope, glyphs ) {
		$scope.glyphs = glyphs;

		/*$scope.$watch('glyph', function() {
			$scope.$parent.$parent.glyph = $scope.glyph;
		});*/
	});