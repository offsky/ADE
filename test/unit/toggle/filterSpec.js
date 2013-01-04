'use strict';


describe('star', function() {
    beforeEach(module('ADE'));

    var starFilter;

    beforeEach(inject(function($filter) {
        starFilter = $filter('toggle');
    }));

    it('should return background position of a hollow star', function() {
        expect(starFilter(true,'star')).toEqual('<span class="star on">');
    });

    it('should return background position of a filled star', function() {
        expect(starFilter(false,'star')).toEqual('<span class="star off">');
    });
});
