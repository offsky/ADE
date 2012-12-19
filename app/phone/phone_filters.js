'use strict';

/* Filters */

adeModule.filter('phone', function() {
    return function(input) {

        var clean = input.replace(/[\-\.() ]/g, ""),
            html;

        html = (!isNaN(parseInt(clean)) && (clean.length >= 7)) ? '<a href="tel:'+clean+'">'+input+'</a>' : input;

        return html;
    };
});

