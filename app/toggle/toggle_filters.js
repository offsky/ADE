/* ==================================================================
	AngularJS Datatype Editor - Toggle
	A filter to make a clickable icon that toggles between two states

	Usage:
	{{ data | toggle:'star' }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('toggle', function() {
	return function(input, option) {
		if(input) return '<span class="'+option+' on">';

		return '<span class="'+option+' off">';
	};
});