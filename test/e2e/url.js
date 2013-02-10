'use strict';

describe('url', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/email/index.html');
    });


    it('should render 2 controls', function() {
        var elm = element('.ade-editable');
        expect(elm.count()).toEqual(2);
    });

    it('should go into edit mode', function() {
        var elm = element('.ade-editable');
        elm.click();
        expect(element('.ade-editable + input').count()).toEqual(1);
    });

    it('should show a popup on click', function() {
        element('.ade-editable:contains(admin)').click();
        expect(element('.ade-editable + div').count()).toEqual(1);
    });
});