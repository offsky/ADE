/* ==================================================================
	AngularJS Datatype Editor - Percent
	A filter to display a number as a percent

	Usage:
	{{ data | percent }}

------------------------------------------------------------------*/

angular.module('ADE').filter('percent', function() {
    return function(input) {
        if(angular.isArray(input)) input = input[0];
        var clean = parseFloat(input);
        var output = '';

        if (!isNaN(clean)) { output = clean + '\u0025' }

        return output;
    };
});

