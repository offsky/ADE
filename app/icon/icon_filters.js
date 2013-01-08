/* ==================================================================
	AngularJS Datatype Editor - Icon
	A filter to display a bootstrap icon

	Usage:
	{{ data | icon:'star' }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('icon', function() {
	return function(input, option) {
		return '<span class="ade-icon icon-'+input+'">';
	};
});