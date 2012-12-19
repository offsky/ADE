'use strict';


describe('phone', function() {
    beforeEach(module('ade'));

    var phoneFilter;

    beforeEach(inject(function($filter) {
        phoneFilter = $filter('phone');
    }));


    it('should convert phone string in a clickable link', function() {
        expect(phoneFilter("760-230-1683")).toBe('<a href="tel:7602301683">760-230-1683</a>');
        expect(phoneFilter("760.230.1683")).toBe('<a href="tel:7602301683">760.230.1683</a>');
        expect(phoneFilter("760 230 1683")).toBe('<a href="tel:7602301683">760 230 1683</a>');
        expect(phoneFilter("1 (760) 230-1683")).toBe('<a href="tel:17602301683">1 (760) 230-1683</a>');
    });

    it('should be empty string/or entered value for invalid', function() {
        expect(phoneFilter("")).toEqual("");
        expect(phoneFilter("foo")).toEqual("foo");
    });
});
