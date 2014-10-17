'use strict';

describe('toggle', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/toggle/index.html');
    });

    it('should render 3 controls', function() {
        expect(element('div[ade-toggle]').count()).toEqual(2);
    });

    it('should toggle on click', function() {
        expect(element('div .icon-star').count()).toEqual(1);
        element('div .icon-star').click();
        expect(element('div .icon-star').count()).toEqual(0);
    });
});