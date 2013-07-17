/* ==================================================================
  	AngularJS Datatype Editor - Date
  	A filter to display a date. It is a wrapper for Angular's date filter
  	that provides better display for invalid values and handles timezones differently.

	The input is an array [timestamp,absolutetimestamp,timezone]

	timestamp 			 = the true unix timestamp that represents this date.
								For example if someone in California chooses "July 15, 2013 6:00:00 PM"
								it will store 1373936400 (16 Jul 2013 01:00:00 GMT)

	absolutetimestamp  = a timestamp that represents the user's selected date converted to GMT timezone
								For example, if someone in California chooses "July 15, 2013 6:00:00 PM"
								it will store 1373911200 (15 Jul 2013 18:00:00 GMT)

	timezone 			 = the number of minutes that the setter is off from GMT. Typically this will be equal
								to (timestamp-absolutetimestamp)/60, but may not if daylight savings time is in 
								affect. It should be the value returned from getTimezoneOffset() for the user.


	There are two scenarios for picking and displaying dates.

	Scenario #1
	The user picks July 15 6:00pm and you want to display July 15 6:00pm regardless of there the user is.
	If the user travels from California to New York, it will still display 6:00pm. This is what we are
	calling "absolute time" and you tell this filter to display dates in this way by passing true
	to the second option. The third boolean controls if the timezone offset is appended to the end of the string if different 
	from the display user's timezone.  For example (+1 h)

	Scenario #2
	The user picks July 15 6:00pm and you want to display July 15 6:00pm as long as they stay put. If the
	user travels to a different timezone, we will convert it to the new timezone and display the new
	time.  This is what we are calling "floating time" and you tell this filter to display dates in
	this way by passing false to the second option. The third boolean is ignored in this scenario.

  	Usage:
  	{{ [1373936400,1373911200,420] | validDate:['yyyy',true,true] }}

------------------------------------------------------------------*/

angular.module('ADE').filter('validDate', ['$filter', function($filter) {
	return function(input, options) {
		if (angular.isUndefined(input)) return '';

		//console.log(input,options);

		//pick apart the data array
		var timestamp = input;
		var absolutetimestamp = input; //difference between these two is the setter's timezone offset
		var timezone = '';
		if (angular.isArray(input)) { //if input is an array, pull out the pieces
			timestamp = input[0];
			absolutetimestamp = input[1];
			timezone = input[2];
			if(!absolutetimestamp) absolutetimestamp = timestamp;
			if(!timestamp) timestamp = absolutetimestamp;
		}

		//pick apart the options array
		var dateFormat = options;
		var absolute = true;
		var showTimezone = false;
		if (angular.isArray(options)) { //if input is an array, pull out the pieces
			dateFormat = options[0];
			if(options[1]!==undefined) absolute = options[1];
			if(options[2]!==undefined) showTimezone = options[2];
		}

		if (!input || !timestamp) return '';

		if (angular.isString(timestamp)) {
			var number = parseInt(timestamp);
			if (timestamp === number + '') {
				timestamp = number;
			} else {
				timestamp = parseDateString(timestamp); //uses date.js library to parse non integer strings
				absolutetimestamp = timestamp;
			}
		}

		//console.log(timestamp,absolutetimestamp,timezone,dateFormat,absolute,showTimezone);

		var currentOffset = new Date().getTimezoneOffset(); //minutes
		var output = '';
		if (angular.isNumber(timestamp)) {
			if (absolute) {
				//we want to display fixed GMT time regardless of user's timezone
				absolutetimestamp += currentOffset * 60;
				output = $filter('date')(absolutetimestamp * 1000, dateFormat);
			} else {
				output = $filter('date')(timestamp * 1000, dateFormat);
			}
		}

		if(absolute && showTimezone && currentOffset !== timezone) {
			var offset = (currentOffset-timezone)/60;
			if(offset>0) offset = "+"+offset;
			output += " ("+offset+" h)";
		}

		return output;
  	};
}]);
