'use strict';




//"July 15, 2013 6:00:00 PM" PT
//1373936400 (16 Jul 2013 01:00:00 GMT)
//1373911200 (15 Jul 2013 18:00:00 GMT)

//"July 15, 2013 7:00:00 PM" MT
//1373936400 (16 Jul 2013 01:00:00 GMT)
//1373914800 (15 Jul 2013 19:00:00 GMT)

describe('date', function() {		
	beforeEach(module('ADE'));

	var dateFilter;
	var inProperTimezone;

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

	it('should print a empty string for non-dates', function() {
		expect(dateFilter(undefined)).toBe('');
		expect(dateFilter(null)).toBe('');
		expect(dateFilter(0)).toBe('');
		expect(dateFilter('')).toBe('');
	});
});
