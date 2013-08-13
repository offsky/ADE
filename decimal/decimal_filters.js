/* ==================================================================
	AngularJS Datatype Editor - Decimal
	A filter to display a number as a decimal
	Wrapper for Angular's built in filter so that we can display
	invalid inputs correctly.
	
	Usage:
	{{ data | decimal:2 }}

------------------------------------------------------------------*/

angular.module('ADE').filter('decimal', ['$filter',function($filter) {

	return function(input, fractionSize) {
		var output = '';
		var fractionSize = fractionSize || 2;

		if (angular.isArray(input)) input = input[0];
		if (angular.isString(input)) input = parseFloat(input);
		if (angular.isUndefined(input) || !angular.isNumber(input)) return output;

		output = $filter('number')(input,fractionSize);

  		return output;
	 };
}]);

