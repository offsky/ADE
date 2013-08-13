/* ==================================================================
	AngularJS Datatype Editor - Icon
	A filter to display a bootstrap icon (or any icon with a css name)
    Specify the allowed icons in ade.js

	Usage:
	{{ data | icon:'star' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('icon', ['ADE', function(ADE) {
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

        return '<span class="ade-icon icon-' + input + '">';
	};
}]);
