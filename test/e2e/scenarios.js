'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/index.html');
    });

    describe('email', function() {
        beforeEach(function() {
            browser().navigateTo('email/');
            var adeUrlElement = angular.element('div').attr('ade-url');
        });

        it('should render 2 controls', function() {
            expect(adeUrlElement.count().tobe(2));
        });

        it('should go into edit mode', function() {
            adeUrlElement.click();
            expect(adeUrlElement.next('input').count().tobe(1));
        });

        it('should show a popup on click', function() {
            adeUrlElement.click();
            expect(adeUrlElement.next('div').hasClass('ade-popup').count().tobe(1));
        });
    });
});