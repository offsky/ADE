'use strict';

describe('list', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/list/index.html');
    });

    xit('should render 2 controls', function() {
        expect(element('.ade-editable').count()).toEqual(2);
    });

    xit('should go into edit mode (show popup)', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);
        expect(element('.ade-editable:eq(0) + .select2-dropdown-open').count()).toEqual(1);
    });

    xit('should detect Enter key, save data and dismiss the popup', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);
        element('.select2-highlighted:eq(0) span').click();
        appElement('.select2-drop-active .select2-input', function(elm) {
            elm.val('apple');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        sleep(1);
        expect(element('.ade-editable:eq(0)').text()).toBe(1);
        expect(element('.ade-editable:eq(0) + .select2-dropdown-open').count()).toEqual(0);
    });

    it('should detect TAB key, save data and dismiss the popup', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);

        element('.select2-drop-active .select2-result-selectable:eq(3)').attr('class', 'select2-results-dept-0 select2-result select2-result-selectable');
        element('.select2-drop-active .select2-result-selectable:eq(0)').attr('class', 'select2-results-dept-0 select2-result select2-result-selectable select2-highlighted');

        element('.select2-container-active .select2-choice span').text('apple');
        appElement('.select2-drop-active .select2-search input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });;
        sleep(1);
        element('.select2-container-active .select2-choice span').text('apple');
        console.log(element('.select2-container-active .select2-choice span').text());
        console.log(element('.ade-editable:eq(0)').text());
        expect(element('.ade-editable:eq(0)').text()).toBe('apple');
    });

    xit('should detect ESC key and dismiss popup', function() {
        element('.ade-editable:eq(0)').click();
        sleep(1);
        appElement('.ade-editable:eq(0) + .select2-dropdown-open', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.select2-dropdown-open').count()).toEqual(0);
    });

    xit('should abort editing entry', function() {
        element('.ade-editable:eq(1)').click();
        sleep(1);
        element('.select2-highlighted span').click();
        appElement('.ade-editable:eq(1) + .select2-dropdown-open', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable:eq(1)').text()).toBe('dog, cat');
    });
});