/* ==================================================================
	AngularJS Datatype Editor - Money
	A filter to display a number as a currency.  This wraps Angular's
	native currency filter so that we can properly handly invalid
	inputs.

	Usage:
	{{ data | money }}

------------------------------------------------------------------*/

angular.module('ADE').filter('money', ['$filter',function($filter) {
	return function(input) {
		var output = '';
		var clean;

		if (angular.isUndefined(input)) return output;
		if (angular.isArray(input)) input = input[0];

		if (angular.isString(input)) {
			input= input.replace('(','-').replace(')',''); //parens turn into negative number
			input = parseFloat(input.replace(/[$]/g, ''));
		}

		if (angular.isNumber(input)) {
			clean = parseFloat(input);
			output = (clean !== 0) ? $filter('currency')(clean) : output;
		}

		return output;
	};
}]);

