'use strict';




//"July 15, 2013 6:00:00 PM" PT
//1373936400 (16 Jul 2013 01:00:00 GMT)
//1373911200 (15 Jul 2013 18:00:00 GMT)

//"July 15, 2013 7:00:00 PM" MT
//1373936400 (16 Jul 2013 01:00:00 GMT)
//1373914800 (15 Jul 2013 19:00:00 GMT)

//Jan 1, 2013 0:00:00 PT
//1357027200 (Tue, 01 Jan 2013 08:00:00 GMT)
//1356998400 (Tue, 01 Jan 2013 00:00:00 GMT)

describe('date', function() {		
	beforeEach(module('ADE'));

	var dateFilter;
	var inProperTimezone;

	var df = function(str,gmt) {
		var date = new Date(dateFilter(str));
		var time = date.toUnixTimestamp();
		if(gmt) {
			time -= date.getTimezoneOffset()*60;
		}
		return time;
	}
	beforeEach(inject(function($filter) {
		dateFilter = $filter('validDate');
		
		/*
		NOTE
		Some of these tests will fail if you are not in the GMT-7 timezone since it is not
		possible (as far as I know) to override JS built in timezone.  So, if you are not
		in California, we will just skip these tests.
		*/
		inProperTimezone = false;
		var offset = new Date().getTimezoneOffset();
		if(offset==420) inProperTimezone = true;
	}));

	it('should print a date using angular date filter format', function() {
		//if(inProperTimezone) {
			expect(dateFilter(1373936400)).toBe('Jul 16, 2013');
			expect(dateFilter(1373936400,'medium')).toBe('Jul 16, 2013 1:00:00 AM');
		//}
	});

	it('should print Jul 15 6pm in absolute time', function() {
		expect(dateFilter([1,1373911200,420],['medium',true,false])).toContain('Jul 15, 2013 6:00:00 PM'); 
		expect(dateFilter([1,1373911200,420],['medium',true,true])).toContain('Jul 15, 2013 6:00:00 PM'); 
		expect(dateFilter([1373936400,1373911200,420],['medium',true,false])).toContain('Jul 15, 2013 6:00:00 PM'); 
		expect(dateFilter([1373936400,1373911200,420],['medium',true,true])).toContain('Jul 15, 2013 6:00:00 PM'); 
	});

	it('should print Jul 15 6pm in absolute time with string input instead of array', function() {
		expect(dateFilter("1,1373911200,420",['medium',true,false])).toContain('Jul 15, 2013 6:00:00 PM'); 
		expect(dateFilter("1,1373911200,420",['medium',true,true])).toContain('Jul 15, 2013 6:00:00 PM'); 
		expect(dateFilter("1373936400,1373911200,420",['medium',true,false])).toContain('Jul 15, 2013 6:00:00 PM'); 
		expect(dateFilter("1373936400,1373911200,420",['medium',true,true])).toContain('Jul 15, 2013 6:00:00 PM'); 
	});

	it('should print Jul 15 6pm in floating time', function() {
		if(inProperTimezone) {
			expect(dateFilter([1373936400,1,420],['medium',false,false])).toBe('Jul 15, 2013 6:00:00 PM'); 
			expect(dateFilter([1373936400,1,420],['medium',false,true])).toBe('Jul 15, 2013 6:00:00 PM'); 
			expect(dateFilter([1373936400,1373911200,420],['medium',false,false])).toBe('Jul 15, 2013 6:00:00 PM'); 
			expect(dateFilter([1373936400,1373911200,420],['medium',false,true])).toBe('Jul 15, 2013 6:00:00 PM'); 
		}
	});

	it('should print Jul 15 7pm in absolute with timezone', function() {
		expect(dateFilter([1373936400,1373914800,360],['medium',true,false])).toContain('Jul 15, 2013 7:00:00 PM'); 
		expect(dateFilter([1373936400,1373914800,360],['medium',true,true])).toContain('Jul 15, 2013 7:00:00 PM ('); //to work in all timezones, this test cant inspect the actual offset
	});

	it('should handle dates prior to 1970', function() {
		expect(dateFilter([-1373936400,-1373914800,360],['medium',true,false])).toContain('Jun 19, 1926 5:00:00 AM'); 
		expect(dateFilter([-1373936400,-1373914800,360],['medium',true,true])).toContain('Jun 19, 1926 5:00:00 AM ('); //to work in all timezones, this test cant inspect the actual offset
	});

	it('should work for daylight savings time', function() {
		//test jan 1  12:00am
		expect(dateFilter([1357027200,1356998400,420],['medium',true,false])).toContain('Jan 1, 2013 12:00:00 AM'); 
		expect(dateFilter([1357027200,1356998400,420],['medium',true,true])).toContain('Jan 1, 2013 12:00:00 AM');
		if(inProperTimezone) expect(dateFilter([1357027200,1356998400,420],['medium',false,false])).toContain('Jan 1, 2013 12:00:00 AM'); 

		//test july 1 6:00pm
		expect(dateFilter([1373936400,1373911200,420],['medium',true,false])).toContain('Jul 15, 2013 6:00:00 PM'); 
		expect(dateFilter([1373936400,1373911200,420],['medium',true,true])).toContain('Jul 15, 2013 6:00:00 PM');
		if(inProperTimezone) expect(dateFilter([1373936400,1373911200,420],['medium',false,true])).toContain('Jul 15, 2013 6:00:00 PM');
	});

	it('should print Jul 15 6pm in floating time even though setter set it to 7pm in their timezone', function() {
		if(inProperTimezone) {
			expect(dateFilter([1373936400,1373914800,360],['medium',false,false])).toBe('Jul 15, 2013 6:00:00 PM'); 
			expect(dateFilter([1373936400,1373914800,360],['medium',false,true])).toBe('Jul 15, 2013 6:00:00 PM'); 
		}
	});

	it('should do the right thing when parts of input are missing or invalid', function() {
		
		expect(dateFilter([1373936400,0,420],['medium'])).toBe('Jul 16, 2013 1:00:00 AM');
		expect(dateFilter([0,1373936400,420],['medium'])).toBe('Jul 16, 2013 1:00:00 AM');
	
		expect(dateFilter([1373936400,0,360],['medium',true,true])).toContain('Jul 16, 2013 1:00:00 AM ('); //to work in all timezones, this test cant inspect the actual offset
		expect(dateFilter([0,1373936400,360],['medium',true,true])).toContain('Jul 16, 2013 1:00:00 AM ('); //to work in all timezones, this test cant inspect the actual offset
	
		if(inProperTimezone) {
			expect(dateFilter([1373936400,0,420],['medium',false])).toBe('Jul 15, 2013 6:00:00 PM');
			expect(dateFilter([0,1373936400,420],['medium',false])).toBe('Jul 15, 2013 6:00:00 PM');
		}
	});

	it('should pass through pre-formated results', function() {
		expect(dateFilter('2014-10-03')).toBe('Oct 3, 2014'); 
		expect(dateFilter('Jan 1, 2013')).toBe('Jan 1, 2013');
	});

	it('should format relative dates', function() {
		var t = Date.today();
		var today = t.clone().toUnixTimestamp();
		var yesterday = t.clone().addDays(-1).toUnixTimestamp();
		var tomorrow = t.clone().addDays(1).toUnixTimestamp();
		
		expect(df('yest')).toBe(yesterday); 
		expect(df('yesterday')).toBe(yesterday);
		expect(df('tod')).toBe(today);
		expect(df('today')).toBe(today);
		expect(df('tom')).toBe(tomorrow);
		expect(df('tomorrow')).toBe(tomorrow);
		expect(df('now')).toBeGreaterThan(yesterday);
	});

	it('should format +/-/in/ago day/week/month/year', function() {
		var today = Date.today();
		var t1 = today.clone().addDays(1).toUnixTimestamp();
		var t2 = today.clone().addWeeks(2).toUnixTimestamp();
		var t3 = today.clone().addMonths(3).toUnixTimestamp();
		var t4 = today.clone().addYears(4).toUnixTimestamp();
		var t5 = today.clone().addDays(-5).toUnixTimestamp();
		var t6 = today.clone().addWeeks(-2).toUnixTimestamp();
		var t7 = today.clone().addMonths(-3).toUnixTimestamp();
		var t8 = today.clone().addYears(-4).toUnixTimestamp();

		expect(df('+1d')).toBe(t1); 
		expect(df('+1 d')).toBe(t1); 
		expect(df('+1 day')).toBe(t1); 
		expect(df('+1 days')).toBe(t1); 

		expect(df('+2 w')).toBe(t2); 
		expect(df('+2 week')).toBe(t2); 
		expect(df('+2 weeks')).toBe(t2); 

		expect(df('+3 m')).toBe(t3); 
		expect(df('+3 month')).toBe(t3); 
		expect(df('+3 months')).toBe(t3);

		expect(df('+4 y')).toBe(t4); 
		expect(df('+4 yr')).toBe(t4); 
		expect(df('+4 yrs')).toBe(t4); 
		expect(df('+4 year')).toBe(t4); 
		expect(df('+4 years')).toBe(t4); 
 
		expect(df('in 1 d')).toBe(t1); 
		expect(df('in 1 day')).toBe(t1); 
		expect(df('1 d')).toBe(t1); 
		expect(df('1 day')).toBe(t1); 

		expect(df('in 2 weeks')).toBe(t2); 
		expect(df('in 2 week')).toBe(t2); 
		expect(df('in 2 w')).toBe(t2); 
		expect(df('2 weeks')).toBe(t2); 
		expect(df('2 week')).toBe(t2); 
		expect(df('2 w')).toBe(t2); 

		expect(df('in 3 m')).toBe(t3); 
		expect(df('in 3 month')).toBe(t3); 
		expect(df('in 3 months')).toBe(t3); 
		expect(df('3 m')).toBe(t3); 
		expect(df('3 month')).toBe(t3); 
		expect(df('3 months')).toBe(t3); 

		expect(df('in 4 y')).toBe(t4); 
		expect(df('in 4 yr')).toBe(t4); 
		expect(df('in 4 yrs')).toBe(t4); 
		expect(df('in 4 year')).toBe(t4); 
		expect(df('in 4 years')).toBe(t4); 
		expect(df('4 y')).toBe(t4); 
		expect(df('4 yr')).toBe(t4); 
		expect(df('4 yrs')).toBe(t4); 
		expect(df('4 year')).toBe(t4); 
		expect(df('4 years')).toBe(t4); 

		expect(df('-5 day')).toBe(t5); 
		expect(df('-2 weeks')).toBe(t6); 
		expect(df('-3 months')).toBe(t7); 
		expect(df('-4 years')).toBe(t8); 

		expect(df('5 days ago')).toBe(t5); 
		expect(df('2 weeks ago')).toBe(t6); 
		expect(df('3 months ago')).toBe(t7); 
		expect(df('4 years ago')).toBe(t8); 

	});

	it('should format next [day], next week/month/year', function() {
		var today = Date.today();

		var t1 = today.clone().next().monday().toUnixTimestamp();
		var t2 = today.clone().next().week().toUnixTimestamp();
		var t3 = today.clone().next().month().toUnixTimestamp();
		var t4 = today.clone().next().year().toUnixTimestamp();

		var tue = today.clone().next().tuesday().toUnixTimestamp();
		var fri = today.clone().next().friday().toUnixTimestamp();
		var sat = today.clone().next().saturday().toUnixTimestamp();

		expect(df("next mon")).toBe(t1);
		expect(df("next monday")).toBe(t1);

		expect(df("next tue")).toBe(tue);
		expect(df("next fri")).toBe(fri);
		expect(df("next sat")).toBe(sat);

		expect(df("next week")).toBe(t2);
		expect(df("next month")).toBe(t3);
		expect(df("next year")).toBe(t4);
	});

	it('should format Last day of [month] / First day of [month]', function() {
		var today = Date.today();

		var t1 = new Date(2030, 0, 31).toUnixTimestamp();
		var t2 = new Date(2030, 0, 1).toUnixTimestamp();

		expect(df("last day of jan 2030")).toBe(t1);
		expect(df("first day of jan 2030")).toBe(t2);
		expect(df("1st day of jan 2030")).toBe(t2);
		expect(df("1st of jan 2030")).toBe(t2);
	});

	it('should formate date strings', function() {
		var t1 = new Date(2013, 0, 1).toUnixTimestamp();

		expect(df("Jan 1, 2013")).toBe(t1);
		expect(df("Jan first 2013")).toBe(t1);
		expect(df("Jan 1, '13")).toBe(t1);
		expect(df("January 1, 2013")).toBe(t1);
		expect(df("January first 2013")).toBe(t1);
		expect(df("January 1, '13")).toBe(t1);
	});

	it('should format US locale', function() {
		DateJSLoadCultureInfo('en');

		var t1 = new Date(2013, 0, 5).toUnixTimestamp();

		expect(df("1/5/2013")).toBe(t1);
		expect(df("1.5.2013")).toBe(t1);
		expect(df("1-5-2013")).toBe(t1);

		expect(df("1/5/13")).toBe(t1);
		expect(df("1.5.13")).toBe(t1);
		expect(df("1-5-13")).toBe(t1);

		expect(df("2013-01-05")).toBe(t1);
		expect(df("2013-1-5")).toBe(t1);
	});

	it('should format GB locale', function() {
		DateJSLoadCultureInfo('en-GB');

		var t1 = new Date(2013, 4, 1).toUnixTimestamp();

		expect(df("1/5/2013")).toBe(t1);
		expect(df("1.5.2013")).toBe(t1);
		expect(df("1-5-2013")).toBe(t1);

		expect(df("1/5/13")).toBe(t1);
		expect(df("1.5.13")).toBe(t1);
		expect(df("1-5-13")).toBe(t1);
	});

	xit('should format with time', function() {
		DateJSLoadCultureInfo('en');

		var thedate = new Date(Date.UTC(2013, 0, 1, 12));
		var t1 = thedate.toUnixTimestamp(); //1357041600

		expect(df("January 1, 2013 12:00:00 AM",true)).toBe(t1);

	});

	it('should format without specifying year', function() {
		/*
			NOTE:  As written, these tests will fail when a new year rolls around
			so they will need to be updated each year, or the tests will need to be
			rewritten in such a way that the current year is taken into account
			*/
			
			// Construct past date string dynamically to 6 months ago
			var today = Date.today();
			var pastDate = today.addMonths(-6);
			var futrDate = pastDate.clone().addYears(1).toUnixTimestamp();

			var monthName = Date.prototype.getMonthName(pastDate.getMonth());
			var dateString = monthName + " " + pastDate.getDate();  // [month name] [day] (6 months ago)

			var year = new Date().getFullYear()+1;
			var jan1 = new Date(year, 0, 1).toUnixTimestamp();

			expect(df(dateString)).toBe(futrDate);
			expect(df("Jan 1")).toBe(jan1);
			expect(df("Jan 1st")).toBe(jan1);
			expect(df("Jan first")).toBe(jan1);
			expect(df("January 1")).toBe(jan1);
			expect(df("January 1st")).toBe(jan1);
			expect(df("January first")).toBe(jan1);
			expect(df("1/1")).toBe(jan1);
			expect(df("1-1")).toBe(jan1);
			expect(df("1.1")).toBe(jan1);

	});
	
	it('should format un parsable date strings', function() {
		expect(dateFilter('foobar')).toBe('');
		expect(dateFilter('next fish')).toBe('');
		expect(dateFilter('+2 nothing')).toBe('');
		expect(dateFilter('fakuary 2, 2013')).toBe('');
		expect(dateFilter('15/15/15')).toBe('');

	});

	it('should print a empty string for non-dates', function() {
		expect(dateFilter(undefined)).toBe('');
		expect(dateFilter(null)).toBe('');
		expect(dateFilter(0)).toBe('');
		expect(dateFilter('')).toBe('');
	});
});
