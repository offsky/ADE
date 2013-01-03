'use strict';

/* Filters */
adeModule.filter('star', function() {
    return function(input, option) {
        var output = '';

        if (option === 'checkbox') {
            output = (input) ? 'background-position: -22px -60px' : 'background-position: -22px 0';
        } else {
            output = (input) ? 'background-position: 0 -20px': 'background-position: 0 0';
        }

        return output;
    };
});