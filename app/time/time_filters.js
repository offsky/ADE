/* ==================================================================
	AngularJS Datatype Editor - Time
	A filter to display time.
	
	Usage:
	{{ data | time }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('time', function() {
    return function(input) {
        var output = '',
            date, ampm, hours, minutes;

        if (angular.isUndefined(input)) return output;
        if (angular.isNumber(input)) date = new Date(input*1000);
        if (!angular.isDate(date)) return output;

        hours = date.getHours();
        minutes = date.getMinutes();

        ampm = (hours >= 12) ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        output = hours + ":" + minutes + " " + ampm;

        return output;
    };
});
