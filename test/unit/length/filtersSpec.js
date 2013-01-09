'use strict';

describe('length', function() {
	beforeEach(module('ADE'));

	var lengthFilter;

	beforeEach(inject(function($filter) {
		lengthFilter = $filter('length');
	}));

	it('should convert minutes to hours + minutes', function() {
		expect(lengthFilter(660)).toBe("11hrs");
		expect(lengthFilter(65)).toBe("1hr 5mins");
		expect(lengthFilter(100)).toBe("1hr 40mins");
		expect(lengthFilter(1)).toBe("1min");
	});

	it('should convert user entered strings to hours + minutes', function() {
		expect(lengthFilter("23h")).toBe("23hrs");
		expect(lengthFilter("90min")).toBe("1hr 30mins");
		expect(lengthFilter("1hrs 90mins")).toBe("2hrs 30mins");
		expect(lengthFilter("1hours")).toBe("1hr");
		expect(lengthFilter("1hour")).toBe("1hr");
		expect(lengthFilter("1hrs")).toBe("1hr");
		expect(lengthFilter("1hr")).toBe("1hr");
		expect(lengthFilter("1h")).toBe("1hr");
		expect(lengthFilter("1m")).toBe("1min");
		expect(lengthFilter("1.2m")).toBe("1min");
		expect(lengthFilter("1minute")).toBe("1min");
		expect(lengthFilter("11hr")).toBe("11hrs");
		expect(lengthFilter("1.5h")).toBe("1hr 30mins");
		expect(lengthFilter("5.30h")).toBe("5hrs 18mins");
		expect(lengthFilter("5.015h")).toBe("5hrs 1min");
		expect(lengthFilter("1.5h 5mins")).toBe("1hr 35mins");
	});

	it('should pass through already formatted values', function() {
		expect(lengthFilter("11hrs")).toBe('11hrs');
		expect(lengthFilter("1hr 5mins")).toBe('1hr 5mins');
		expect(lengthFilter("1min")).toBe('1min');
	});

	xit('should work when units are out of order', function() {
        expect(lengthFilter("5mins 1hr")).toBe('1hr 5mins');
   });

	xit('should work with days', function() {
        expect(lengthFilter("1d")).toBe('24hrs');
        expect(lengthFilter("1day")).toBe('24hrs');
        expect(lengthFilter("1days")).toBe('24hrs');
        expect(lengthFilter("1 day 1hr 1mins")).toBe('25hrs 1min');
   });

	it('should return empty string', function() {
		expect(lengthFilter(0)).toBe("");
		expect(lengthFilter(-1)).toBe("");
		expect(lengthFilter("")).toBe("");
		expect(lengthFilter("abcd")).toBe("");
	});
});