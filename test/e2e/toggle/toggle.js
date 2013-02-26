'use strict';

describe('toggle', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/toggle/index.html');
    });

    it('should render 3 controls', function() {
        expect(element('div[ade-toggle]').count()).toEqual(3);
    });

    it('should toggle on click', function() {
        element('.ade-star.ade-on:eq(0)').click();
        expect(element('.ade-star.ade-off').count()).toEqual(1);
    });
});