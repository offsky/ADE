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
		var starW = 23;
		var starCount = 5;
		var starClass = "rating";

	 	if(options && options.width) starW = options.width;
		if(options && options.num) starCount = options.num;
		if(options && options.class) starClass = options.class;

		var clean = parseInt(input);
		var containerW = starW * starCount;
		var bgW = clean / starCount * containerW;

		var html = '<div class="'+starClass+'" style="width:'+containerW+'px;"><div class="bg" style="width:'+bgW+'px;"></div>';

		//aborted attempt to make hover effects
		//html+='<div class="bg2" style="width:'+(containerW - bgW)+'px;"></div>';
		
		html += '<div class="stars">';

		for (var i = 0; i < starCount; i++) {
			html += '<a class="star" data-position="'+(i+1)+'"></a>';
		}

		html += '</div></div>';

		return html;
	};
});