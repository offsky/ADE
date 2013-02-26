'use strict';

describe('list', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/list/index.html');
    });

    it('should render 2 controls', function() {
        expect(element('.ade-editable').count()).toEqual(2);
    });

    it('should go into edit mode (show popup)', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);
        expect(element('.ade-editable:eq(0) + .select2-dropdown-open').count()).toEqual(1);
    });

    xit('should detect Enter key and dismiss the popup', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);
        appElement('.select2-drop-active .select2-input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        sleep(1);
        expect(element('.ade-editable:eq(0) + .select2-dropdown-open').count()).toEqual(0);
    });

    xit('should detect TAB key and dismiss the popup', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);
        appElement('.select2-drop-active .select2-input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });;
        sleep(1);
        expect(element('.ade-editable:eq(0) + .select2-dropdown-open').count()).toEqual(0);
    });

    it('should detect ESC key and dismiss popup', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);
        appElement('.ade-editable:eq(0) + .select2-dropdown-open', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.select2-dropdown-open').count()).toEqual(0);
    });

    it('should abort editing entry', function() {
        element('.ade-editable:eq(1)').click();
        sleep(1);
        element('.select2-highlighted span').click();
        appElement('.ade-editable:eq(1) + .select2-dropdown-open', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable:eq(1)').text()).toBe('dog, cat');
    });
});