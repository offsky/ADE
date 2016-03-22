/* ==================================================================
	AngularJS Datatype Editor - Color
	A filter to display a color

	Usage:
	{{ data | color:'#000' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('color', ['ADE', 'colorUtils', function(ADE, utils) {
	'use strict';
	return function(hexColor, selectedHexColor) {
		var checkmark = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="312px" height="312px" viewBox="0 0 312 312" enable-background="new 0 0 312 312" xml:space="preserve">' +
			'<path fill="#1D1D1B" d="M287,29.8c-12.5-7.5-30-6.2-38.7,6.2l-141,171l-44.9-52.4c-8.7-10-27.5-12.5-38.7-5 ' +
				'c-12.5,8.7-13.7,23.7-5,34.9L111,286.9L293.2,64.7C303.2,53.5,299.5,37.3,287,29.8z"/></svg>';

		var returnValue = '<span class="ade-color">';

		if (utils.parseHex(hexColor) !== "") {
			var border = "";

			if(utils.colorDistance(hexColor,"#FAFAFA")<80) border = " border"; //determine if the color would blend into background

			returnValue =  '<span class="ade-color'+border+'" data-color="'+hexColor+'" title="'+hexColor+'" style="background-color:' + hexColor + '">';
		}

		if (hexColor === selectedHexColor && selectedHexColor!==-1) {
			returnValue += checkmark;
		}

		return returnValue + '</span>';
	};
}]);
