'use strict';


describe('color', function() {
    beforeEach(module('ADE'));

    var colorFilter, $rootScope;

    beforeEach(inject(function($filter) {
        colorFilter = $filter('color');
    }));

    beforeEach(angular.mock.inject(function ($injector) {
        $rootScope  = $injector.get('$rootScope');
    }));

    it('should return a square with black background', function() {
        expect(colorFilter('#000')).toEqual('<span class="ade-color" data-color="#000" title="#000" style="background-color:#000"></span>');
    });

    it('should return a clear icon because we gave it a bad icon', function() {
        expect(colorFilter('doesntexist')).toEqual('<span class="ade-color"></span>');
        expect(colorFilter(123)).toEqual('<span class="ade-color"></span>');
    });
});