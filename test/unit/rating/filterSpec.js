'use strict';


describe('rating', function() {
    beforeEach(module('ade'));

    var ratingFilter;

    beforeEach(inject(function($filter) {
        ratingFilter = $filter('rating');
    }));

    it('should return rating of 1', function() {
        expect(ratingFilter(0)).toEqual('<div class="rating" style="width:115px;"><div class="bg" style="width:0px;"></div><div class="stars"><a class="star" data-position="1"></a><a class="star" data-position="2"></a><a class="star" data-position="3"></a><a class="star" data-position="4"></a><a class="star" data-position="5"></a></div></div>');
    });

    it('should return rating of 2', function() {
        expect(ratingFilter(1)).toEqual('<div class="rating" style="width:115px;"><div class="bg" style="width:23px;"></div><div class="stars"><a class="star" data-position="1"></a><a class="star" data-position="2"></a><a class="star" data-position="3"></a><a class="star" data-position="4"></a><a class="star" data-position="5"></a></div></div>');
    });

    it('should return rating of 3', function() {
        expect(ratingFilter(2)).toEqual('<div class="rating" style="width:115px;"><div class="bg" style="width:46px;"></div><div class="stars"><a class="star" data-position="1"></a><a class="star" data-position="2"></a><a class="star" data-position="3"></a><a class="star" data-position="4"></a><a class="star" data-position="5"></a></div></div>');
    });

    it('should return rating of 4', function() {
        expect(ratingFilter(3)).toEqual('<div class="rating" style="width:115px;"><div class="bg" style="width:69px;"></div><div class="stars"><a class="star" data-position="1"></a><a class="star" data-position="2"></a><a class="star" data-position="3"></a><a class="star" data-position="4"></a><a class="star" data-position="5"></a></div></div>');
    });

    it('should return rating of 5', function() {
        expect(ratingFilter(4)).toEqual('<div class="rating" style="width:115px;"><div class="bg" style="width:92px;"></div><div class="stars"><a class="star" data-position="1"></a><a class="star" data-position="2"></a><a class="star" data-position="3"></a><a class="star" data-position="4"></a><a class="star" data-position="5"></a></div></div>');
    });

    it('should return invalid', function() {
        expect(ratingFilter(0)).toEqual('<div class="rating" style="width:115px;"><div class="bg" style="width:0px;"></div><div class="stars"><a class="star" data-position="1"></a><a class="star" data-position="2"></a><a class="star" data-position="3"></a><a class="star" data-position="4"></a><a class="star" data-position="5"></a></div></div>');
    });
});
