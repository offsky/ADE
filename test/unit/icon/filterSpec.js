'use strict';


describe('icon', function() {
    beforeEach(module('ADE'));

    var iconFilter;

    beforeEach(inject(function($filter) {
        iconFilter = $filter('icon');
    }));

    it('should return a glass icon', function() {
        expect(iconFilter('glass')).toEqual('<span class="ade-icon icon-glass">');
    });

    it('should return a clear (square with grey background) icon', function() {
        expect(iconFilter('_clear')).toEqual('<span class="ade-icon icon-_clear">');
    });
});
