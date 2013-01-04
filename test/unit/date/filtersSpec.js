'use strict';


describe('date', function() {
	beforeEach(module('ADE'));

	var dateFilter;

	beforeEach(inject(function($filter) {
		dateFilter = $filter('validDate');
	})); 

	it('should print a date', function() {
		expect(dateFilter(1355517820)).toBe('Dec 14, 2012');
	});

	it('should print a empty string for non-dates', function() {
		expect(dateFilter(undefined)).toBe('');
		expect(dateFilter(null)).toBe('');
		expect(dateFilter(0)).toBe('');
		expect(dateFilter('')).toBe('');
	});
});
