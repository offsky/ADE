'use strict';


describe('phone', function() {
    beforeEach(module('ADE'));

    var phoneFilter;

    beforeEach(inject(function($filter) {
        phoneFilter = $filter('phone');
    }));


    it('should convert phone string in a clickable link', function() {
        expect(phoneFilter("760-555-1234")).toBe('<a href="tel:7605551234">760-555-1234</a>');
        expect(phoneFilter("1-760-555-1234")).toBe('<a href="tel:17605551234">1-760-555-1234</a>');
        expect(phoneFilter("760.555.1234")).toBe('<a href="tel:7605551234">760.555.1234</a>');
        expect(phoneFilter("1.760.555.1234")).toBe('<a href="tel:17605551234">1.760.555.1234</a>');
        expect(phoneFilter("760 555 1234")).toBe('<a href="tel:7605551234">760 555 1234</a>');
        expect(phoneFilter("1 760 555 1234")).toBe('<a href="tel:17605551234">1 760 555 1234</a>');
        expect(phoneFilter("555-1234")).toBe('<a href="tel:5551234">555-1234</a>');
        expect(phoneFilter("1 (760) 555-1234")).toBe('<a href="tel:17605551234">1 (760) 555-1234</a>');
    });

    it('should be empty string/or entered value for invalid', function() {
        expect(phoneFilter("")).toEqual("");
        expect(phoneFilter("foo")).toEqual("foo");
        expect(phoneFilter(1234)).toEqual("1234");
    });
});
