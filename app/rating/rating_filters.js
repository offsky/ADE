'use strict';

/* Filters */
adeModule.filter('rating', function() {
    return function(input) {
        var starW = 23,
            starCount = 5,
            clean = parseInt(input),
            containerW = starW * starCount,
            bgW = clean / starCount * containerW,
            starsHtml ='', html;

        html = '<div class="rating" style="width:'+containerW+'px;"><div class="bg" style="width:'+bgW+'px;"></div>' +
            '<div class="stars">';

        for (var i = 0; i < starCount; i++) {
            starsHtml += '<a class="star" data-position="'+(i+1)+'"></a>';
        }

        html += starsHtml + '</div></div>';

        return html;
    };
});