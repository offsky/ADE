'use strict';


describe('icon', function() {
    beforeEach(module('ADE'));

    var iconFilter, $rootScope;

    beforeEach(inject(function($filter) {
        iconFilter = $filter('icon');
    }));

    beforeEach(angular.mock.inject(function ($injector) {
        $rootScope  = $injector.get('$rootScope');
    }));

    it('should return a music icon', function() {
        expect(iconFilter('music')).toEqual('<span class="ade-icon icon-music">');
    });

    it('should return a clear (square with grey background) icon', function() {
        expect(iconFilter('_clear')).toEqual('<span class="ade-icon icon-_clear">');
    });

    it('should return a clear icon because we gave it a bad icon', function() {
        expect(iconFilter('doesntexist')).toEqual('<span class="ade-icon icon-_clear">');
        expect(iconFilter(123)).toEqual('<span class="ade-icon icon-_clear">');
    });
});
