'use strict';


describe('time', function() {
	beforeEach(module('ADE'));

	var timeFilter;

	beforeEach(inject(function($filter) {
		timeFilter = $filter('time');
	})); 

	it('should print a time', function() {
		expect(timeFilter(1355517820)).toBe('12:43 pm');
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
