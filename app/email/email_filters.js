/* ==================================================================
	AngularJS Datatype Editor - Email
	
	This is probably not necessary, but in case it becomes necessary
	here it is.

	Usage:
	{{ data | email }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('email', ['$filter',function($filter) {

	return function(input) {
		if(!input) return '';
		if(!angular.isString(input)) return input+"";

		return $filter('linky')(input);
	 };
}]);

