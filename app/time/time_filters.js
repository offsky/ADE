/* ==================================================================
	AngularJS Datatype Editor - Time
	A filter to display local time from a unix timestamp.
	
	Usage:
    {{ data | time }}
    {{ data | time:'12' }}
    {{ data | time:'24' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('time', function() {
    return function(input, format) {
        var output = '',
            format = format || "12",
            date, ampm, hours, minutes;

        if (angular.isUndefined(input)) return output;
        if (angular.isArray(input)) input = input[0];
        if (input==0) return output;
        if (angular.isNumber(input)) date = new Date(input*1000);
        if (!angular.isDate(date)) return output;
  
        hours = date.getHours();
        minutes = date.getMinutes();
        
        if (format === "12") {
            ampm = (hours >= 12) ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+minutes : minutes;
            output = hours + ":" + minutes + " " + ampm;
        } else {
            minutes = minutes < 10 ? '0'+minutes : minutes;
            output = hours + ":" + minutes;
        }


        return output;
    };
});
