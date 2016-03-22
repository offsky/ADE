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
        expect(locationFilter({'title': 'White House', 'address': '1600 Pennsylvania Ave NW, Washington, DC 20500', 'lat': '38.8977', 'lon': '-77.0366' })).toEqual("<span title='White House'>White House</span>");
    });

    it('should return an address', function() {
        expect(locationFilter({'title': '', 'address': '1600 Pennsylvania Ave NW, Washington, DC 20500', 'lat': '38.8977', 'lon': '-77.0366' })).toEqual("<span title='1600 Pennsylvania Ave NW, Washington, DC 20500'>1600 Pennsylvania Ave NW, Washington, DC 20500</span>");
    });

    it('should return latitude and longitude', function() {
        expect(locationFilter({'title': '', 'address': '', 'lat': '38.8977', 'lon': '-77.0366' })).toEqual("<span title='Latitude: 38.8977 Longitude: -77.0366'>Latitude: 38.8977 Longitude: -77.0366</span>");
    });

    it('should return No Location', function() {
        expect(locationFilter({'title': '', 'address': '', 'lat': '', 'lon': '' })).toEqual("<span title='No Location'>No Location</span>");
        expect(locationFilter({})).toEqual("<span title='No Location'>No Location</span>");
        expect(locationFilter("")).toEqual("<span title='No Location'>No Location</span>");
        expect(locationFilter(1)).toEqual("<span title='No Location'>No Location</span>");
    });
});