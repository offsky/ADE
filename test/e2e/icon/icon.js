'use strict';

describe('icon', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/icon/index.html');
    });

    it('should render 2 controls', function() {
        expect(element('a[ade-icon]').count()).toEqual(2);
    });

    it('should show a popup on click', function() {
        element('a[ade-icon]:eq(0) span').click();
        expect(element('.ade-popup').count()).toEqual(1);
    });

    it('should clear when clicked on clear', function() {
        element('a[ade-icon]:eq(0) span').click();
        expect(element('.ade-popup').count()).toEqual(1);
        element('.ade-popup .icon-_clear').click();
        expect(element('a[ade-icon]:eq(0)').html()).toBe('<span class="ade-icon icon-_clear"></span>');
        expect(element('.ade-popup').count()).toEqual(0);
    });

    it('should detect ENTER key', function() {
        element('a[ade-icon]:eq(0)').click();
        appElement('.ade-popup', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-popup').count()).toEqual(0);
    });

    it('should detect TAB key', function() {
        element('a[ade-icon]:eq(0)').click();
        appElement('.ade-popup', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-popup').count()).toEqual(0);
    });

    it('should detect ESC key', function() {
        element('a[ade-icon]:eq(0)').click();
        appElement('.ade-popup', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-popup').count()).toEqual(0);
    });

    it('should choose a camera icon', function() {
        element('a[ade-icon]:eq(0) span').click();
        expect(element('.ade-popup').count()).toEqual(1);
        element('.ade-popup .icon-camera').click();
        expect(element('a[ade-icon]:eq(0)').html()).toBe('<span class="ade-icon icon-camera"></span>');
        expect(element('.ade-popup').count()).toEqual(0);
    });
});