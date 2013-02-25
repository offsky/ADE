'use strict';

describe('percent', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/percent/index.html');
    });

    it('should render 1 control', function() {
        expect(element('.ade-editable').count()).toEqual(1);
    });

    it('should go into edit mode', function() {
        element('.ade-editable').click();
        expect(element('.ade-editable + input').count()).toEqual(1);
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

    it('should detect ENTER key', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should edit/save entry with ENTER', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('38');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable').text()).toBe('38%');
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
        appElement('.ade-editable + input', function(elm) {
            elm.val('38');
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editable').text()).toBe('38%');
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
        appElement('.ade-editable + input', function(elm) {
            elm.val('38');
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable').text()).toBe('34%');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });
});