/* ==================================================================
 AngularJS Datatype Editor - Long Text
 A filter to display a long string at a specified length

 Usage:
 {{ data | longtext:20 }}

 ------------------------------------------------------------------*/

angular.module('ADE').filter('longtext', ['$filter', function($filter) {
	return function(input, options) {
		if (!input) return '';

		var len = options || 100;
		var output;

		input = input.split(/\r?\n|\r/)[0]; //get first line

		if (len < input.length) {
			output = input.substring(0, len) + '...';
		} else {
			output = input;
		}

		return output;
	};
}]);

