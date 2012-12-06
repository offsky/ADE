'use strict';

/* Filters */

adeModule.filter('validDate', function($filter) {
    return function(input, dateFormat) {
        var output = '';

        if(!input) return output;
        if(angular.isUndefined(input)) return output;
        if(input==0) return output;

        if(angular.isNumber(input)) output = $filter('date')(input*1000,dateFormat);

        return output;
    };
});
