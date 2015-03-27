/* ==================================================================
  	AngularJS Datatype Editor - Date
  	A filter to display a date. It is a wrapper for Angular's date filter
  	that provides better display for invalid values and handles timezones differently.

	The input can be a unix timestamp(integer), a human readable time string(string) or 
	an array [timestamp,absolutetimestamp,timezone]. If it is an array:

	timestamp 			 = the true unix timestamp that represents this date.
								For example if someone in California chooses "July 15, 2013 6:00:00 PM"
								it will store 1373936400 (16 Jul 2013 01:00:00 GMT)

	absolutetimestamp  = a timestamp that represents the user's selected date as if they were in the GMT timezone
								For example, if someone in California chooses "July 15, 2013 6:00:00 PM"
								it will store 1373911200 (15 Jul 2013 18:00:00 GMT)

	timezone 			 = the number of minutes that the setter is off from GMT. Typically this will be equal
								to (timestamp-absolutetimestamp)/60, but may not if daylight savings time is in 
								affect. It should be the value returned from getTimezoneOffset() for the user.

	The filter parameter can be a dateFormat string, or an array [format, absolute, showTimezone]

	dateFormat 			 = a string format for the date "medium" or "mediumData" or "yyyy" or ...

	absolute 	 = a boolean if we should display the time as absolute(true) or relative(false)

	showTimezone	 = a boolean if we should display the user's timezone if different from the set timezone

	There are two scenarios for picking and displaying dates.

	Scenario #1
	The user picks July 15 6:00pm and you want to display July 15 6:00pm regardless of there the user is.
	If the user travels from California to New York, it will still display 6:00pm. This is what we are
	calling "absolute time" and you tell this filter to display dates in this way by passing true
	to the second option. The third boolean controls if the timezone offset is appended to the end of the 
	string if different from the display user's timezone.  For example (+1 h)

	Scenario #2
	The user picks July 15 6:00pm and you want to display July 15 6:00pm as long as they stay put. If the
	user travels to a different timezone, we will convert it to the new timezone and display the new
	time.  This is what we are calling "floating time" and you tell this filter to display dates in
	this way by passing false to the second option. The third boolean is ignored in this scenario.

  	Usage:
  	{{ "2013-01-01" | validDate:'yyyy' }}
  	{{ 1373936400 | validDate:'yyyy' }}
  	{{ [1373936400,1373911200,420] | validDate:['yyyy',true,true] }}

------------------------------------------------------------------*/

angular.module('ADE').filter('validDate', ['$filter', function($filter) {
	return function(input, options) {
		if (angular.isUndefined(input)) return '';

		//if input is string, make it an array
		if(angular.isString(input)) {
			var split = input.split(',');
		 	if(split.length==3) input = split; //only use the split if it has 3 pieces, otherwise it may be a preformated data (Jan 1, 2013)
		}

		//pick apart the data array
		var timestamp = input;
		var absolutetimestamp = input; //difference between these two is the setter's timezone offset
		var timezone = '';
		if (angular.isArray(input)) { //if input is an array, pull out the pieces
			timestamp = parseInt(input[0]);
			absolutetimestamp = parseInt(input[1]);
			timezone = parseInt(input[2]);
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
				var date = Date.parse(timestamp); //use date.js library to interpret string
				if (date !== null) {
					timestamp = date.toUnixTimestamp();
				} else {
					timestamp = null;
				}
				absolutetimestamp = timestamp;
			}
		}

		var output = '';
	
		if (absolute && absolutetimestamp!==null) { //we want to display fixed GMT time regardless of user's timezone
			//need to get timezoneoffset of absolute time to account for daylight savings time
			var currentOffset = new Date(absolutetimestamp*1000).getTimezoneOffset(); //minutes

			//to do this, we need to artifically offset the time by the user's timezone offset
			absolutetimestamp += currentOffset * 60;
			output = $filter('date')(absolutetimestamp * 1000, dateFormat);

			//determine if we need to append the timezone information to the string
			if(showTimezone && currentOffset !== timezone) {
				var offset = (currentOffset-timezone)/60;
				if(offset>0) offset = "+"+offset;
				output += " ("+offset+" h)";
			}
		} else if(timestamp!==null){ //display in local time
			output = $filter('date')(timestamp * 1000, dateFormat);
		}

		// console.log(timestamp,absolutetimestamp,timezone,dateFormat,absolute,showTimezone,output);

		return output;
  	};
}]);
