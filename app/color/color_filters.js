/* ==================================================================
	AngularJS Datatype Editor - Color
	A filter to display a color

	Usage:
	{{ data | color:'#000' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('color', ['ADE', function(ADE) {
	return function(input, option) {
        return '<span class="ade-color" style="background-color:' + input + '">';
	};
}]);
