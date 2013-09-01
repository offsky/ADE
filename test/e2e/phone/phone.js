'use strict';

describe('phone', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/phone/index.html');
    });

     it('should echo invalid input', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('abc');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('abc');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });


    it('should render 2 controls', function() {
        expect(element('.ade-editable').count()).toEqual(2);
    });

    it('should go into edit mode', function() {
        element('.ade-editable').click();
        expect(element('.ade-editable + input').count()).toEqual(1);
    });

    it('should show a popup on click', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        expect(element('.ade-editable + div').count()).toEqual(1);
    });

    it('should go into edit mode after clicking edit button', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        expect(element('.ade-editable + input').count()).toEqual(1);
    });

   
    it('should detect ENTER key', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should edit/save entry with ENTER', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('700-555-1234');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        
        expect(element('.ade-editable').html()).toBe('<a href="tel:7005551234">700-555-1234</a>');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should detect TAB key', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should edit/save entry with TAB', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('700-555-1234');
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editable').html()).
            toBe('<a href="tel:7005551234">700-555-1234</a>');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should detect ESC key', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should abort editing entry', function() {
        element('.ade-editable:contains(760-555-1234)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('700-555-1234');
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editable').html()).
            toBe('<a href="tel:7605551234">760-555-1234</a>');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });
});