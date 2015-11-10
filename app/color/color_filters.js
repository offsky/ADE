/* ==================================================================
	AngularJS Datatype Editor - Color
	A filter to display a color

	Usage:
	{{ data | color:'#000' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('color', ['ADE', 'colorUtils', function(ADE, utils) {
	'use strict';
	return function(input) {
		var returnValue = '<span class="ade-color">';
		if (utils.parseHex(input) !== "") {
			returnValue =  '<span class="ade-color" style="background-color:' + input + '">';
		}

		return returnValue;
	};
}]);
