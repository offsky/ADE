/* ==================================================================
 AngularJS Datatype Editor - Long Text
 A filter to display a long string.
 Wraps Angular's native linky filter so that we can handle more
 inputs

 Usage:
 {{ data | url }}

 ------------------------------------------------------------------*/

'use strict';

adeModule.filter('longtext', ['$filter',function($filter) {
    return function(input, options) {
        var len = options || 100,
            output;

        if(!input) return '';

        if (len < input.length) {
            output = input.substring(0, len) + '...';
        } else {
            output = input;
        }

        return output;
    };
}]);

