/* ==================================================================
	AngularJS Datatype Editor - Length
	A filter to display a number that represents minutes, and format it
	into a pretty version, such as "2hrs".

	Usage:
	{{ data | length }}

------------------------------------------------------------------*/

'use strict';

adeModule.filter('length', function() {

	//Minutes are passed in and a more readable (hrs mins) string is returned
	function parseHrsMins(value) {
		// value should be passed in minutes
		var output = '',
			hours = 0,
			mod = 0;

		//console.log("parseHrsMins: " + value);

		if(value < 60 && value > 0) {
			output = (value === 1) ? value + 'min' : value + 'mins';
		} else if (value >= 60){
			mod = value % 60;
			hours = Math.round((value-mod) / 60);
			output =  (hours === 1) ? hours + 'hr': hours + 'hrs';

			if (mod > 0 ) {
				output += (mod === 1) ? ' ' + mod + 'min': ' ' + mod + 'mins';
			}
		} else {
			//catching negative values
			output = '';
		}

		return output;
	}

	function adjustHrsMins(value, reformatValues) {
		var clean = parseInt(value, 10);

		//console.log("addHrsMins: " + value + "; reformatValues: " + reformatValues + "; clean: " + clean);

		if ((reformatValues[0].indexOf('h') !== -1) && ((clean > 1) || (clean === 1))) {
			clean = clean*60;
		}
		return parseHrsMins(clean);
	}

	function reformatHrsMins(value) {
		var values = value.split(' '),
			len = values.length,
			cleanValues = [],
			minutes;

		//console.log("reformatHrsMins: " + value + "; Split values: " + values);

		while (len--) {
			cleanValues.unshift(parseInt(values[len], 10));
		}

		minutes = cleanValues[0]*60+cleanValues[1];

		return parseHrsMins(minutes);
	}

	function padZero(number) {
		return ((parseFloat(number) < 10) ? "0" : "") + Math.round(number);
	}

	return function(input) {
		//console.log("+++++++ FILTER FOR " + input + " +++++");
		if(!input) return '';

		var values = ['h', 'hr', 'hour', 'hrs', 'hours', 'm', 'min', 'minute', 'mins', 'minutes'],
			valuesLength = values.length,
			decimalTime = input.toString().split("."),
			clean = parseInt(input, 10),
			output = '',
			reformatValues = [],
			matchCount = 0,
			re, reFound = false;


		if (angular.isObject(decimalTime) && decimalTime.length === 2) {
			var hours = parseInt(decimalTime[0], 10),
				mins = decimalTime[1].replace(/\D/g,''),
				minutes = parseInt(padZero((mins / Math.pow(10, mins.length))*60), 10);

			return parseHrsMins((hours*60) + minutes);
		}

		if (!isNaN(input)) return parseHrsMins(input);

		while (valuesLength--) {
			re = new RegExp('\\B' + values[valuesLength] + '\\b', 'g');
			reFound = re.test(input);

			//console.log("Input: " + input + "; Found: " + reFound + "; Search Value: " + values[valuesLength]);

			if (reFound) {
				matchCount++;
				reformatValues.push(values[valuesLength]);
			}
		}

		//console.log("reformat values length: " + reformatValues.length + "; reformat values: " + reformatValues );

		switch(matchCount) {
			case 0:
				output = parseHrsMins(clean);
				break;
			case 1:
				output = adjustHrsMins(input, reformatValues);
				break;
			case 2:
				output = reformatHrsMins(input);
				break;
			default:
				output = '';
		}

		return output;
	};
});