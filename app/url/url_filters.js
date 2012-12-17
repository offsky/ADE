'use strict';

/* Filters */
var URL_REGEXP = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

adeModule.filter('url', function($filter) {
    return function(input) {
        var output = '',
            html = '';

        if (URL_REGEXP.test(input)) {
            html = $filter('linky')(input);
        } else {
            if (input.indexOf(".") >= 0) {
                output = 'http://' + input;
                html = '<a href="' + output + '">' + output + '</a>';
            } else {
                html = input;
            }
        }

        return html;
    };
});

