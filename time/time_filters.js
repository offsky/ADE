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
		var output = '';
		var format = format || "12";
		var date;
		var ampm;
		var hours;
		var minutes;
		
		if (angular.isUndefined(input)) return output;
		if (angular.isArray(input)) input = input[0];
		if (input==0) return output;
		if (angular.isNumber(input)) date = new Date(input*1000);
	
		if (angular.isString(input)) { //is it already formatted?
			var arr = input.split(' '); //[time,meridian?]
			if(arr[0].indexOf(":")==-1) return output; //not a time string
			var hrsmin = arr[0].split(':');//[hour,minute]
			var hours = parseInt(hrsmin[0], 10);
			var mins = parseInt(hrsmin[1], 10);
			var ampm = arr[1] || '';
			var validHrs = (hours <= 23) ? hours : 23;
			var validMins = (mins <= 59) ? mins : 59;
			if(validMins<10) validMins = "0"+validMins;
			var cleanedValue = validHrs+":"+validMins+" "+ampm;
			return cleanedValue;
		}

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
