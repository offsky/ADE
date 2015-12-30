/* ==================================================================
	AngularJS Datatype Editor - Color
	A filter to display a color

	Usage:
	{{ data | color:'#000' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('color', ['ADE', 'colorUtils', function(ADE, utils) {
	'use strict';
	return function(hexColor, selectedHexColor) {
		var checkmark = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">' +
			'<path d="m8.1,13.4c-1.66667,-1.43333 -3.13333,-3.36667 -4.8,-4.8l-3,3c2.76667,2.36667 5.53334,4.73333 ' +
				'8.3,7.1c3.86667,-4.03333 6.73334,-8.56667 10.60001,-12.6c-1,-0.93333 -2,-1.86667 ' +
				'-3,-2.8c-3.03331,3.03333 -6.1667,6.76667 -8.10001,10.1z" /></svg>';

		var returnValue = '<span class="ade-color">';

		if (utils.parseHex(hexColor) !== "") {
			returnValue =  '<span class="ade-color" data-color="'+hexColor+'" style="background-color:' + hexColor + '">';
		}

		if (hexColor === selectedHexColor && selectedHexColor!==undefined) {
			returnValue += checkmark;
		}

		return returnValue + '</span>';
	};
}]);
