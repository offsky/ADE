/* ==================================================================
	AngularJS Datatype Editor - Email
	
	This is probably not necessary, but in case it becomes necessary
	here it is.

	Usage:
	{{ data | email }}

------------------------------------------------------------------*/

angular.module('ADE').filter('email', ['$filter',function($filter) {

	return function(input) {
		if(!input) return '';
		if(angular.isArray(input)) input = input[0];
		if(!angular.isString(input)) return input+"";

		return $filter('linky')(input);
	};
}]);

