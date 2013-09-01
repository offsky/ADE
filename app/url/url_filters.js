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
		var output = '';
		var html = '';

		if(!input) return '';
		if(angular.isArray(input)) input = input[0];
		if(!angular.isString(input)) input = input.toString();
		
		input = $.trim(input);

		html = $filter('linky')(input);
		if (html==input) {
			if (input.indexOf(".") >= 0 && input.indexOf("http")!=0) {
				output = 'http://' + input;
				html = '<a href="' + output + '">' + output + '</a>';
			} else {
				html = input;
			}
		}

		return html;
	};
}]);

