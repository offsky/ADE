/* ==================================================================
	AngularJS Datatype Editor - Location
	A filter to display a location.

------------------------------------------------------------------*/

angular.module('ADE').filter('location', function() {

	return function(input) {
		var output = '';

		if (!input || !angular.isObject(input)) {
			output = 'No Location';
		} else {
			if (input.title) {
				output = input.title;
			} else if (input.address) {
				output = input.address;
			} else if (input.lat || input.lon) {
				output = (input.lat) ? 'Latitude: ' + input.lat + ' ' : '';
				output += (input.lon) ? 'Longitude: ' + input.lon : '';
			} else {
				output = 'No Location';
			}
		}

		return "<span title='"+output+"'>"+output+"</span>";
	};
});