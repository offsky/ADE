'use strict';


describe('star', function() {
    beforeEach(module('ade'));

    var starFilter;

    beforeEach(inject(function($filter) {
        starFilter = $filter('star');
    }));

    it('should return background position of a hollow star', function() {
        expect(starFilter(false)).toEqual('background-position: 0 -20px');
    });

    it('should return background position of a filled star', function() {
        expect(starFilter(false)).toEqual('background-position: 0 0');
    });
});
