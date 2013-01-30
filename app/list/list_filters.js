/* ==================================================================
 AngularJS Datatype Editor - List
 A filter to display an array of strings as a comma separated string

 Usage:
 {{ data | list }}

 ------------------------------------------------------------------*/

'use strict';

adeModule.filter('list', ['$filter', function($filter) {
	return function(input, isSingle) {
		if (!input) return '';
		if (angular.isString(input)) return input;
		if (!angular.isArray(input)) return '';

		if (isSingle) return input[0];

		var ret = '';
		$.each(input, function(i,v) {
			if (ret) ret += ', ';
			ret += v;
		});

		return ret;
	};
}]);

