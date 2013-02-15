/* ==================================================================
	AngularJS Datatype Editor - Date
	A filter to display a date. It is a wrapper for Angular's date filter
	that provides better display for invalid values.
	
	Usage:
	{{ data | validDate:'yyyy' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('validDate', ['$filter',function($filter) {
    return function(input, dateFormat) {
        var output = '';

        if(!input) return output;
        if(angular.isUndefined(input)) return output;
        if(input==0) return output;

        if(angular.isNumber(input)) output = $filter('date')(input*1000,dateFormat);

        return output;
    };
}]);
