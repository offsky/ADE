/* ==================================================================
	AngularJS Datatype Editor - Integer
	A filter to display a number as an integer.
	Wrapper for Angular's built in filter so that we can display
	invalid inputs correctly.

	Usage:
	{{ data | integer }}

------------------------------------------------------------------*/

angular.module('ADE').filter('integer', ['$filter',function($filter) {

	return function(input) {
		var output = '';

		if (angular.isArray(input)) input = input[0];
		if (angular.isString(input)) input = parseFloat(input);
		if (angular.isUndefined(input) || !angular.isNumber(input)) return output;

		output = $filter('number')(input,0);

		return output;
	 };
}]);

