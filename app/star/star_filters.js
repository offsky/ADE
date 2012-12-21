'use strict';

/* Filters */
adeModule.filter('star', function() {
    return function(input) {
        return (input) ? 'background-position: 0 -20px': 'background-position: 0 0';
    };
});