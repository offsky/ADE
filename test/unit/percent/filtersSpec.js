'use strict';


describe('filter', function() {
  beforeEach(module('ade'));


  describe('percent', function() {
        var percentFilter;

        beforeEach(inject(function($filter) {
            percentFilter = $filter('percent');
        }));

        it('should convert integer value to percentage', function() {
            expect(percentFilter(34)).toBe('34\u0025');
        });

        it('should pass through already converted value', function() {
            expect(percentFilter("34%")).toBe('34\u0025');
        });

        it('should return empty string', function() {
            expect(percentFilter({})).toBe('');
            expect(percentFilter([])).toBe('');
            expect(percentFilter(true)).toBe('');
            expect(percentFilter(false)).toBe('');
            expect(percentFilter('')).toBe('');
            expect(percentFilter('abcd')).toBe('');
        });
    });
});
