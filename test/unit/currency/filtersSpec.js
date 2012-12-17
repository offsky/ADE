'use strict';


describe('money', function() {
    beforeEach(module('ade'));

    var moneyFilter;

    beforeEach(inject(function($filter) {
        moneyFilter = $filter('money');
    }));

    it('should format dollar currency', function() {
        expect(moneyFilter(123.00)).toBe('$123.00');
    });

    it('should format dollar currency even if already formatted', function() {
        expect(moneyFilter("$123.00")).toBe('$123.00');
    });

    it('should be empty string for invalid', function() {
        expect(moneyFilter(undefined)).toEqual('');
        expect(moneyFilter({})).toBe('');
        expect(moneyFilter([])).toBe('');
        expect(moneyFilter(true)).toBe('');
        expect(moneyFilter(false)).toBe('');
        expect(moneyFilter('')).toEqual('');
        expect(moneyFilter("foo")).toBe('');
    });
});
