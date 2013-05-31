'use strict';


angular.module('prototyp0App')
	.controller('MainCtrl', function ( $scope, normalize, calcSegments, glyphs ) {
		$scope.sliders = {

			s_width: 0,
			s_height: 0,
			s_median: 1,
			s_curve: 0,
			s_arc: 0,
			s_terminal: 0,
			s_symmetry: 0,
			x_height: 465,
			cap_height: 0,
			ascender: 0,
			descender: 0,
			crossbar: 0,
			thickness: 80,
			width: 0,
			slant: 0,
			vert_contrast: 0,
			hor_contrast: 0,
			contrast: 0,
			break_path: 0,
			counter: 0,
			inktrap: 0,
			roundness: 0.55,
			baseline: 0
		};

		$scope.glyphs = glyphs;
		$scope.currentGlyph = glyphs['i'];

		$scope.segments = [];
		$scope.normalize = normalize;
		$scope.calcSegments = calcSegments;

		var uiWatcher = function() {
			$scope.normalize();
			$scope.segments = $scope.currentGlyph( $scope.sliders );
		};
		$scope.$watch('sliders', uiWatcher, true);
		$scope.$watch('currentGlyph', uiWatcher);
	})

	// FIXME: Why do we need this dummy controller to achieve to way binding across views?
	.controller('InterfaceCtrl', function( $scope ) {
		$scope.$watch('currentGlyph', function() {
			$scope.$parent.$parent.currentGlyph = $scope.currentGlyph;
		});
	});