/* ==================================================================
	AngularJS Datatype Editor - Phone number
	A filter to display a phone number
	
	Usage:
	{{ data | phone }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('phone', function() {
	return function(input) {
		if(!input) return "";
		
		var clean = input.replace(/[\-\.() ]/g, "");
		var html;

		html = (!isNaN(parseInt(clean)) && (clean.length >= 7)) ? '<a href="tel:'+clean+'">'+input+'</a>' : input;

		return html;
	 };
});

