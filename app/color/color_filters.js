/* ==================================================================
	AngularJS Datatype Editor - Color
	A filter to display a color

	Usage:
	{{ data | color:'#000' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('color', ['ADE', function(ADE) {
	function parseHex(string, expand) {
		if (typeof string !== 'string') return '';
		string = string.replace(/^#/g, '');
		if (!string.match(/^[A-F0-9]{3,6}/ig)) return '';
		if (string.length !== 3 && string.length !== 6) return '';
		if (string.length === 3 && expand) {
			string = string[0] + string[0] + string[1] + string[1] + string[2] + string[2];
		}
		return '#' + string;
	}

	return function(input) {
		var returnValue = '<span class="ade-color">';
		if (parseHex(input) !== "") {
			returnValue =  '<span class="ade-color" style="background-color:' + input + '">';
		}

		return returnValue;
	};
}]);
