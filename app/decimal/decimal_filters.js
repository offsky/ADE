'use strict';

/* Filters */
adeModule.filter('decimal', function($filter) {

    return function(input, fractionSize) {
        var output = '',
            fractionSize = fractionSize || 2;


        if (angular.isUndefined(input) || !angular.isNumber(input)) return output;

        output = $filter('number')(input,fractionSize);

        return output;
    };
});

