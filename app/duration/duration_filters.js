/* ==================================================================
	AngularJS Datatype Editor - Duration
	A filter to display a number that represents minutes, and format it
	into a pretty version, such as "2hrs".

	Usage:
	{{ data | duration }}

------------------------------------------------------------------*/

angular.module('ADE').filter('duration', function() {

	//Minutes are passed in and a more readable (hrs mins) string is returned
	function mins2Pretty(value) {
		// value should be passed in minutes
		var output = '';
		var hours = 0;
		var mod = 0;

		if(value < 60 && value > 0) {
			value = Math.round(value*100)/100; //only show minutes to 2 decimal places
			output = (value === 1) ? value + 'min' : value + 'mins';
		} else if (value >= 60){
			mod = value % 60;
			mod = Math.round(mod*100)/100; //only show minutes to 2 decimal places
			hours = Math.round((value-mod) / 60);
			output =  (hours === 1) ? hours + 'hr': hours + 'hrs';

			if (mod > 0 ) {
				output += (mod === 1) ? ' ' + mod + 'min': ' ' + mod + 'mins';
			}
		} else { //catching negative values
			output = '';
		}

		return output;
	}

	//Duration was specified as a single unit (1hr or 60min). Return minutes
	function single2Mins(value) {
		var clean = parseFloat(value, 10);
		if((value.indexOf('h') !== -1)) clean = clean*60;
		return Math.round(clean*100)/100;
	}

	//Duration was specified as two units (1hrs 90mins). Return minutes
	function double2Mins(value) {
		var values = value.split(' ');
		return parseFloat(values[0],10)*60+parseFloat(values[1],10);
	}

	return function(input) {
		if(!input) return '';
		if (angular.isArray(input)) input = input[0];
		
		var output = '';

		//if it is already a number, just prettify it
		if (!isNaN(input)) return mins2Pretty(input);
		if(!angular.isString(input)) return '';
		
		input = input.replace(" h","h").replace(" m","m");

		var values = input.split(' ');
		switch(values.length) {
			case 1: //only one number specified (1hr or 60min)
				output = single2Mins(input);
				output = mins2Pretty(output);
				break;
			case 2: //two units (1hrs 90mins)
				output = double2Mins(input);
				output = mins2Pretty(output);
				break;
			default:
				output = '';
		}

		return output;
	};
});