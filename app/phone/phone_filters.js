/* ==================================================================
	AngularJS Datatype Editor - Phone number
	A filter to display a phone number
	
	Usage:
	{{ data | phone }}

------------------------------------------------------------------*/

angular.module('ADE').filter('phone', function() {
	return function(input) {
		if(!input) return "";
		if(!angular.isString(input)) input = input.toString();
		
		var clean = input.replace(/[\-\.() ]/g, "");
		var html;

		html = (!isNaN(parseInt(clean)) && (clean.length >= 7)) ? '<a href="tel:'+clean+'">'+input+'</a>' : input;

		return html;
	 };
});

