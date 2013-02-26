/* ==================================================================
	AngularJS Datatype Editor - Icon
	A filter to display a bootstrap icon

	Usage:
	{{ data | icon:'star' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('icon', ['ADE', function(ADE) {
	return function(input, option) {
		if (!input) input = '_clear';
        var matchFound = false;
        var iconsLength = ADE.icons.length;

        for (var i = 0; i < iconsLength; i++) {
            if (input === ADE.icons[i]) {
                matchFound = true;
                break;
            }
        }
        if (!matchFound) input = '_clear';

        return '<span class="ade-icon icon-' + input + '">';
	};
}]);
