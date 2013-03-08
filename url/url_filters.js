/* ==================================================================
	AngularJS Datatype Editor - URL
	A filter to display a string as a clickable URL.
	Wraps Angular's native linky filter so that we can handle more
	inputs
	
	Usage:
	{{ data | url }}

------------------------------------------------------------------*/

angular.module('ADE').filter('url', ['$filter',function($filter) {
	return function(input) {
		var URL_REGEXP = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		var output = '';
		var html = '';

		if(!input) return '';
		if(!angular.isString(input)) input = input.toString();
		
		if (URL_REGEXP.test(input)) {
			html = $filter('linky')(input);
		} else {
			if (input.indexOf(".") >= 0) {
				output = 'http://' + input;
				html = '<a href="' + output + '">' + output + '</a>';
			} else {
				html = input;
			}
		}

		return html;
	};
}]);

