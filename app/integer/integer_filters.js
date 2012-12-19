'use strict';

/* Filters */
adeModule.filter('num', function($filter) {

    return function(input, fractionSize) {
        var output = '';

        if (angular.isUndefined(input) || !angular.isNumber(input)) return output;

        output = $filter('number')(input,fractionSize);

        return output;
    };
});

