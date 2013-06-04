'use strict';

angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, glyphs, slidersUI, slidersWatcher ) {
		$scope.slidersUI = slidersUI;
		$scope.sliders = {};
		$scope.glyphsUI = Object.keys( glyphs );
		$scope.glyph = 'A';

		$scope.$watch('sliders', slidersWatcher, true);
	})

	// FIXME: Why do we need those dummy controllers to achieve two way binding across views?
	.controller('InterfaceCtrl', function( $scope ) {
		//$scope.glyphs = Object.keys( glyphs );

		$scope.$watch('glyph', function() {
			$scope.$parent.$parent.glyph = $scope.glyph;
		});
	});