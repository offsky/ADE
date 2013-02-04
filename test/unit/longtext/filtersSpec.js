'use strict';


describe('date', function() {
	beforeEach(module('ADE'));

	var longtextFilter;

	beforeEach(inject(function($filter) {
		longtextFilter = $filter('longtext');
	}));

	it('should print eclipses after a specified length', function() {
		expect(longtextFilter('Click here to edit me', 5)).toBe('Click...');
	});

	it('should print 100 chars if length is not specified', function() {
        expect(longtextFilter('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab')).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa...');
	});

	it('should print the first line if there are new lines', function() {
        expect(longtextFilter('first\nsecond')).toBe('first');
        expect(longtextFilter('first\rsecond')).toBe('first');
        expect(longtextFilter('first\r\nsecond', 4)).toBe('firs...');
	});
});
