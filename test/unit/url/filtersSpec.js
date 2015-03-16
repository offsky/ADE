'use strict';


describe('url', function() {
    beforeEach(module('ADE'));
    beforeEach(module('ngSanitize'));

    var linky, urlFilter;

    beforeEach(inject(function($filter) {
        linky = $filter('linky');
        urlFilter = $filter('url');
    }));

    it('should convert url string into a clickable link', function() {
        expect(urlFilter("http://www.apple1.com")).toEqual('<a href="http://www.apple1.com">http://www.apple1.com</a>');
        expect(urlFilter(" http://www.apple2.com ")).toEqual('<a href="http://www.apple2.com">http://www.apple2.com</a>');
        expect(urlFilter("https://www.apple3.com")).toEqual('<a href="https://www.apple3.com">https://www.apple3.com</a>');
        expect(urlFilter("www.apple4.com")).toEqual('<a href="http://www.apple4.com">www.apple4.com</a>');
        expect(urlFilter(" www.apple5.com ")).toEqual('<a href="http://www.apple5.com">www.apple5.com</a>');
        expect(urlFilter("http://www.apple6.com/~jake/index.html#tag")).toEqual('<a href="http://www.apple6.com/~jake/index.html#tag">http://www.apple6.com/~jake/index.html#tag</a>');

    });

    it('should echo non-link results', function() {
        expect(urlFilter('')).toBe('');
        expect(urlFilter('abcd')).toBe('abcd');
        expect(urlFilter(1234)).toBe('1234');
        expect(urlFilter('http')).toBe('http');
    });
});
