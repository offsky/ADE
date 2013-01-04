/* ==================================================================
	AngularJS Datatype Editor - Percent
	A filter to display a number as a percent

	Usage:
	{{ data | percent }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('percent', function() {
    return function(input) {
        var clean = parseFloat(input),
            output = '';

        if (!isNaN(clean)) { output = clean + '\u0025' }

        return output;
    };
});

