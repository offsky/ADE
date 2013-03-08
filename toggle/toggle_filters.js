/* ==================================================================
	AngularJS Datatype Editor - Toggle
	A filter to make a clickable icon that toggles between two states

	Usage:
	{{ data | toggle:'star' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('toggle', function() {
	return function(input, option) {
		if(angular.isString(input)) {
			if(input=='false' || input=='no' || input=='0') input = false;
		}
		if(input) return '<span class="ade-'+option+' ade-on">';

		return '<span class="ade-'+option+' ade-off">';
	};
});