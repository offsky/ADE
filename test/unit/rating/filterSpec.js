'use strict';

/*
	The rating filter is no longer needed, should move these tests to e2e tests
*/

describe('rating', function() {
	beforeEach(module('ADE'));

	var ratingFilter;

	beforeEach(inject(function($filter) {
		ratingFilter = $filter('rating');
	}));

	// it('should return rating of 0', function() {
	// 	expect(ratingFilter(0)).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-off" data-position="1"></a><a class="ade-rate-one ade-off" data-position="2"></a><a class="ade-rate-one ade-off" data-position="3"></a><a class="ade-rate-one ade-off" data-position="4"></a><a class="ade-rate-one ade-off" data-position="5"></a></div></div>');
	// });

	// it('should return rating of 1', function() {
	// 	expect(ratingFilter(1)).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-on" data-position="1"></a><a class="ade-rate-one ade-off" data-position="2"></a><a class="ade-rate-one ade-off" data-position="3"></a><a class="ade-rate-one ade-off" data-position="4"></a><a class="ade-rate-one ade-off" data-position="5"></a></div></div>');
	// 	expect(ratingFilter('1')).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-on" data-position="1"></a><a class="ade-rate-one ade-off" data-position="2"></a><a class="ade-rate-one ade-off" data-position="3"></a><a class="ade-rate-one ade-off" data-position="4"></a><a class="ade-rate-one ade-off" data-position="5"></a></div></div>');
	// });

	// it('should return rating of 2', function() {
	// 	expect(ratingFilter(2)).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-on" data-position="1"></a><a class="ade-rate-one ade-on" data-position="2"></a><a class="ade-rate-one ade-off" data-position="3"></a><a class="ade-rate-one ade-off" data-position="4"></a><a class="ade-rate-one ade-off" data-position="5"></a></div></div>');
	// });

	// it('should return rating of 3', function() {
	// 	expect(ratingFilter(3)).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-on" data-position="1"></a><a class="ade-rate-one ade-on" data-position="2"></a><a class="ade-rate-one ade-on" data-position="3"></a><a class="ade-rate-one ade-off" data-position="4"></a><a class="ade-rate-one ade-off" data-position="5"></a></div></div>');
	// });

	// it('should return rating of 4', function() {
	// 	expect(ratingFilter(4)).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-on" data-position="1"></a><a class="ade-rate-one ade-on" data-position="2"></a><a class="ade-rate-one ade-on" data-position="3"></a><a class="ade-rate-one ade-on" data-position="4"></a><a class="ade-rate-one ade-off" data-position="5"></a></div></div>');
	// });

	// it('should return rating of 5', function() {
	// 	expect(ratingFilter(5)).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-on" data-position="1"></a><a class="ade-rate-one ade-on" data-position="2"></a><a class="ade-rate-one ade-on" data-position="3"></a><a class="ade-rate-one ade-on" data-position="4"></a><a class="ade-rate-one ade-on" data-position="5"></a></div></div>');
	// });
	
	// it('should return invalid', function() {
	// 	expect(ratingFilter('x')).toEqual('<div class="ade-rating" style="width:125px;"><div class="ade-rate-container"><a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one ade-off" data-position="1"></a><a class="ade-rate-one ade-off" data-position="2"></a><a class="ade-rate-one ade-off" data-position="3"></a><a class="ade-rate-one ade-off" data-position="4"></a><a class="ade-rate-one ade-off" data-position="5"></a></div></div>');
	// });
});
