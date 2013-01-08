/* ==================================================================
	AngularJS Datatype Editor - Rating
	A filter to make a number editable via a rating star bar.

	You can pass in the width of each star and the number of stars

	Usage:
	{{ data | rating:{width:23,num:6} }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('rating', function() {
	return function(input,options) {
		var starW = 23,
            starCount = 5,
            starClass = "rating",
            starStatusClass = "off";

	 	if(options && options.width) starW = options.width;
		if(options && options.num) starCount = options.num;
		if(options && options.className) starClass = options.className;

		var containerW = starW * starCount;

		var html = '<div class="ade-'+starClass+'" style="width:'+containerW+'px;">';
		
		html += '<div class="ade-rate-container">';

		for (var i = 0; i < starCount; i++) {
            starStatusClass = (i<input) ? "on" : "off";
			html += '<a class="ade-rate-one ade-'+starStatusClass+'" data-position="'+(i+1)+'"></a>';
		}

		html += '</div></div>';

		return html;
	};
});