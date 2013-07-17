'use strict';

describe('duration', function() {
	beforeEach(module('ADE'));

	var durationFilter;

	beforeEach(inject(function($filter) {
		durationFilter = $filter('duration');
	}));

	it('should convert minutes to hours + minutes', function() {
		expect(durationFilter(660)).toBe("11hrs");
		expect(durationFilter(65)).toBe("1hr 5mins");
		expect(durationFilter(100)).toBe("1hr 40mins");
		expect(durationFilter(1)).toBe("1min");
		expect(durationFilter([1,'2'])).toBe("1min");
	});

	it('should convert user entered strings to hours + minutes', function() {
		expect(durationFilter("23h")).toBe("23hrs");
		expect(durationFilter("90min")).toBe("1hr 30mins");
		expect(durationFilter("1hrs 90mins")).toBe("2hrs 30mins");
		expect(durationFilter("1hours")).toBe("1hr");
		expect(durationFilter("1hour")).toBe("1hr");
		expect(durationFilter("1hrs")).toBe("1hr");
		expect(durationFilter("1hr")).toBe("1hr");
		expect(durationFilter("1h")).toBe("1hr");
		expect(durationFilter("1m")).toBe("1min");
		expect(durationFilter("1.2m")).toBe("1min");
		expect(durationFilter("1minute")).toBe("1min");
		expect(durationFilter("11hr")).toBe("11hrs");
		expect(durationFilter("1.5h")).toBe("1hr 30mins");
		expect(durationFilter("5.30h")).toBe("5hrs 18mins");
		expect(durationFilter("5.015h")).toBe("5hrs 1min");
		expect(durationFilter("1.5h 5mins")).toBe("1hr 35mins");
	});

	it('should pass through already formatted values', function() {
		expect(durationFilter("11hrs")).toBe('11hrs');
		expect(durationFilter("1hr 5mins")).toBe('1hr 5mins');
		expect(durationFilter("1min")).toBe('1min');
	});

	xit('should allow spaces', function() {
		expect(durationFilter("11 hrs")).toBe('11hrs');
		expect(durationFilter("1 hr 5 mins")).toBe('1hr 5mins');
		expect(durationFilter("1 min")).toBe('1min');
	});

	xit('should ignore unrecognized parts', function() {
		expect(durationFilter("11hrs and cheese")).toBe('11hrs');
		expect(durationFilter("5 mins 20 seconds")).toBe('5mins');
	});

	xit('should work when units are out of order', function() {
        expect(durationFilter("5mins 1hr")).toBe('1hr 5mins');
   });

	xit('should work with days', function() {
        expect(durationFilter("1d")).toBe('24hrs');
        expect(durationFilter("1day")).toBe('24hrs');
        expect(durationFilter("1days")).toBe('24hrs');
        expect(durationFilter("1 day 1hr 1mins")).toBe('25hrs 1min');
   });

	it('should return empty string', function() {
		expect(durationFilter(0)).toBe("");
		expect(durationFilter(-1)).toBe("");
		expect(durationFilter("")).toBe("");
		expect(durationFilter("abcd")).toBe("");
		expect(durationFilter(null)).toBe("");
		expect(durationFilter(undefined)).toBe("");
		expect(durationFilter({foo:1})).toBe("");
	});
});