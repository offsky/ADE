'use strict';


describe('time', function() {
	beforeEach(module('ADE'));

	var timeFilter;

	beforeEach(inject(function($filter) {
		timeFilter = $filter('time');
	})); 

	it('should print a time', function() {
		var today = new Date();
		var myTz = (today.getTimezoneOffset())/60;

		//adjust timezone based on daylight savings
    	var jan = new Date(today.getFullYear(), 0, 1);
    	var jul = new Date(today.getFullYear(), 6, 1);
    	var std = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
		var dst = today.getTimezoneOffset() < std;
		if(dst) myTz+=1;


		var expectedHour = 20-myTz;

		expect(timeFilter(1355517820)).toContain(expectedHour+':43 pm');

	});

	it('should print a empty string for non-dates', function() {
		expect(timeFilter(undefined)).toBe('');
		expect(timeFilter(null)).toBe('');
		expect(timeFilter(0)).toBe('');
		expect(timeFilter('')).toBe('');
	});

	xit('should print a time when it was specifed already as a string', function() {
		expect(timeFilter('12:43 pm')).toBe('12:43 pm');
	});
});
