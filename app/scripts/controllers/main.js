'use strict';

angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, glyphs, slidersUI, slidersWatcher, processGlyph ) {
		$scope.slidersUI = slidersUI;
		$scope.inputs = {};
		$scope.glyphsUI = Object.keys( glyphs );
		$scope.glyph = 'A';
		$scope.processGlyph = processGlyph;

		$scope.$watch('inputs', slidersWatcher, true);
	})

	// FIXME: Why do we need those dummy controllers to achieve two way binding across views?
	.controller('InterfaceCtrl', function( $scope ) {

		$scope.$watch('glyph', function() {
			$scope.$parent.$parent.glyph = $scope.glyph;
		});
	});