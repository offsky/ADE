'use strict';


describe('decimal', function() {
    beforeEach(module('ade'));

    var numberFilter;

    beforeEach(inject(function($filter) {
        numberFilter =  $filter('decimal');
    }));

    it('should format decimal', function() {
        expect(numberFilter(1234.237, 2)).toEqual('1,234.24');
    });

    it('should properly format empty or invalid as empty string', function() {
        expect(numberFilter(undefined)).toEqual('');
        expect(numberFilter({})).toBe('');
        expect(numberFilter([])).toBe('');
        expect(numberFilter(true)).toBe('');
        expect(numberFilter(false)).toBe('');
        expect(numberFilter('')).toEqual('');
        expect(numberFilter('foo')).toEqual('');
    });
});
