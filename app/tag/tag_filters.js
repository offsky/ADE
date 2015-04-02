/* ==================================================================
	AngularJS Datatype Editor - Tag
	A filter to display a tag as text
	
	Usage:
	{{ data | tag }}

------------------------------------------------------------------*/

angular.module('ADE').filter('tag', function() {
	return function(input) {
		if(!input) return "";
		if(angular.isString(input)) return input;
		if(angular.isArray(input)) return input.join(", ");
	
		return "";
	 };
});

