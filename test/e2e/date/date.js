'use strict';

describe('date', function() {
    beforeEach(function() {
        browser().navigateTo('../../app/date/index.html');
    });

    it('should render 3 controls', function() {
        expect(element('.ade-editable').count()).toEqual(3);
    });

    it('should go into edit mode', function() {
        element('.ade-editable:eq(0)').click();
        expect(element('.ade-editable:eq(0) + input').count()).toEqual(1);
    });

    it('should show a popup on click', function() {
        element('.ade-editable:eq(0)').click();
        expect(element('.ade-editable + input').count()).toEqual(1);
        expect(element('.datepicker.dropdown-menu:visible').count()).toEqual(1);
    });

    it('should dismiss a popup on ENTER', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should not allow invalid input', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('abc');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should allow entering value into input', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('2009');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('2009');
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
        element('span.year:contains(2019)').click();
        appElement('.ade-editable + input', function(elm) {
           elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('2019');
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
        element('span.year:contains(2019)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('2019');
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('2019');
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
        element('span.year:contains(2019)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('2019');
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });
});