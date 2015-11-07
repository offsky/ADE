/* ==================================================================
	AngularJS Datatype Editor - Color
	A filter to display a color

	Usage:
	{{ data | color:'#000' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('color', ['ADE', function(ADE) {
	return function(input, option) {
        if (angular.isArray(input)) input = input[0];
        
		if (!input) input = 'ban-circle';
        var matchFound = false;
        var iconsLength = ADE.icons.length;

        for (var i = 0; i < iconsLength; i++) {
            if (input === ADE.icons[i]) {
                matchFound = true;
                break;
            }
        }
        if (!matchFound) input = 'ban-circle';

        return '<span class="ade-color">';
	};
}]);
