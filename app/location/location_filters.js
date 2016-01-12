/* ==================================================================
	AngularJS Datatype Editor - Location
	A filter to display a location.

	Usage:
	{{ data | duration }}

------------------------------------------------------------------*/

angular.module('ADE').filter('location', function() {

	return function(input) {
		if (!input) return '';
		
		var output = '';
		var value = JSON.parse(input);

		if (!angular.isObject(value)) return;

		if (value.title) {
			output = value.title;
		} else if (value.address) {
			output = value.address;
		} else if (value.lat || value.lon) {
			output = (value.lat) ? 'Latitude: ' + value.lat + ' ' : '';
			output += (value.lon) ? 'Longitude: ' + value.lon : '';
		} else {
			output = 'No Location';
		}

		return output;
	};
});