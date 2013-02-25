'use strict';

describe('time', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/time/index.html');
    });

    it('should render 2 controls', function() {
        expect(element('.ade-editable').count()).toEqual(2);
    });

    it('should go into edit mode', function() {
        element('.ade-editable').click();
        expect(element('.ade-editable + input').count()).toEqual(1);
    });

    it('should show a popup on click', function() {
        element('.ade-editable:eq(0)').click();
        expect(element('.ade-editable + input').count()).toEqual(1);
        expect(element('.bootstrap-timepicker.dropdown-menu:visible').count()).toEqual(1);
    });

    it('should dismiss a popup on ENTER', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('5:59 pm');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should not allow invalid input', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('abcd');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('11:59 pm');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should detect ENTER key', function() {
        element('.ade-editable').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should edit/save entry with ENTER', function() {
        element('.ade-editable:eq(0)').click();
        element('a[data-action=incrementMinute]').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('6:00 pm');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should detect TAB key', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should edit/save entry with TAB', function() {
        element('.ade-editable:eq(0)').click();
        element('a[data-action=incrementHour]').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('6:59 pm');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should detect ESC key', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should abort editing entry', function() {
        element('.ade-editable:eq(0)').click();
        element('a[data-action=incrementHour]').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('5:59 pm');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });
});