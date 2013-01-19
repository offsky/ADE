'use strict';


describe('date', function() {
	beforeEach(module('ADE'));

	var longtextFilter;

	beforeEach(inject(function($filter) {
		longtextFilter = $filter('longtext');
	})); 

	it('should print eclipses after a specified length', function() {
		expect(longtextFilter("Click here to edit me", 5)).toBe('Click...');
	});

	it('should print a full string if length is not specified', function() {
        expect(longtextFilter("Click here to edit me")).toBe("Click here to edit me");
	});
});
