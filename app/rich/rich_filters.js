/* ==================================================================
 AngularJS Datatype Editor - Long Text
 A filter to display a long string at a specified length

 Usage:
 {{ data | rich:20 }}

 ------------------------------------------------------------------*/

angular.module('ADE').filter('rich', ['$filter', function($filter) {
	return function(input, options) {
		if (!input) return '';

		var len = options || 100;
		var output;

		if (!input.split) input = input.toString(); //convert to string if not string (to prevent split==undefined)

		var lines = input.split(/\r?\n|\r/);
		input = lines[0]; //get first line

		if (len < input.length) {
			output = input.substring(0, len) + '...';
		} else if(lines.length>1) {
			output = input + "...";
		} else {
			output = input;
		}

		return output;
	};
}]);

