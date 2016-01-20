'use strict';


describe('location', function() {
    beforeEach(module('ADE'));

    var locationFilter, $rootScope;

    beforeEach(inject(function($filter) {
        locationFilter = $filter('location');
    }));

    beforeEach(angular.mock.inject(function ($injector) {
        $rootScope  = $injector.get('$rootScope');
    }));

    it('should return a title', function() {
        expect(locationFilter({'title': 'White House', 'address': '1600 Pennsylvania Ave NW, Washington, DC 20500', 'lat': '38.8977', 'lon': '-77.0366' })).toEqual('White House');
    });

    it('should return an address', function() {
        expect(locationFilter({'title': '', 'address': '1600 Pennsylvania Ave NW, Washington, DC 20500', 'lat': '38.8977', 'lon': '-77.0366' })).toEqual('1600 Pennsylvania Ave NW, Washington, DC 20500');
    });

    it('should return latitude and longitude', function() {
        expect(locationFilter({'title': '', 'address': '', 'lat': '38.8977', 'lon': '-77.0366' })).toEqual('Latitude: 38.8977 Longitude: -77.0366');
    });

    it('should return No Location', function() {
        expect(locationFilter({'title': '', 'address': '', 'lat': '', 'lon': '' })).toEqual('No Location');
        expect(locationFilter({})).toEqual('No Location');
        expect(locationFilter("")).toEqual('No Location');
        expect(locationFilter(1)).toEqual('No Location');
    });
});