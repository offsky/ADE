'use strict';

/* Filters */

adeModule.filter('money', function($filter) {
    return function(input) {
        var output = '', clean;

        if (angular.isUndefined(input)) return output;

        if (angular.isString(input)) {
            input = parseFloat(input.replace(/[$]/g, ''));
        }

        if (angular.isNumber(input)) {
            clean = parseFloat(input);
            output = (clean !== 0) ? $filter('currency')(clean) : output;
        }

        return output;
    };
});

