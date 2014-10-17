'use strict';

describe('rating', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/rating/index.html');
    });
    it('should render 2 controls', function() {
        expect(element('div[ade-rating]').count()).toEqual(4);
    });

    it('should select 3rd star', function() {
        element('div[ade-rating] a[data-position=3]').click();
        expect(element('.ade-rate-container').html()).
            toBe('<a class="ade-rate-one ade-zero" data-position="0">&nbsp;</a><a class="ade-rate-one icon-star ade-rate" data-position="1"></a><a class="ade-rate-one icon-star ade-rate" data-position="2"></a><a class="ade-rate-one icon-star ade-rate" data-position="3"></a><a class="ade-rate-one icon-star-empty ade-rate-empty" data-position="4"></a><a class="ade-rate-one icon-star-empty ade-rate-empty" data-position="5"></a>');
    });
});
