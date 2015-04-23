/* ==================================================================
	AngularJS Datatype Editor - Rich Text
	A filter to display a snippet of the rich text
	
	Usage:
	{{ data | rich }}

------------------------------------------------------------------*/

angular.module('ADE').filter('rich', ['$sanitize', function($sanitize) {
	return function(value,max) {
		var html = "";
		var len = max || 100;
		if (angular.isArray(value)) value = value[0];

		if(value==null || value==undefined) value = "";
		if (!value.split) value = value.toString(); //convert to string if not string (to prevent split==undefined)

		//get the first line
		value = value.replace('</p>', '</p>\n');
		var lines = value.split(/\r?\n|\r/);
		value = lines[0]; //get first line

		// strip html
		value = $sanitize(value).replace(/<[^>]+>/gm, '').replace(/&#[0-9]*;/gm,'');

		if (len < value.length) {
			html = value.substring(0, len) + '...';
		} else if(lines.length>1) {
			html = value + "...";
		} else {
			html = value;
		}
		return html;

	 };
}]);

