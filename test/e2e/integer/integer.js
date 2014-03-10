'use strict';

describe('integer', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/integer/index.html');
    });

    it('should render 1 control', function() {
        expect(element('.ade-editme').count()).toEqual(1);
    });

    it('should go into edit mode', function() {
        element('.ade-editme').click();
        expect(element('.ade-editme + input').count()).toEqual(1);
    });

    //todo, why cant I get this to work. It works manually
    xit('should respond to keypress', function() {
        element('.ade-editme:eq(0)').click();

        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 50 });
        });

        expect(element('.ade-editme').text()).toBe('2');
    });


    it('should not allow invalid input', function() {
        element('.ade-editme:eq(0)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('abc');
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        expect(element('.ade-editme:eq(0)').text()).toBe('');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should detect ENTER key', function() {
        element('.ade-editme:eq(0)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should edit/save entry with ENTER', function() {
        element('.ade-editme:eq(0)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('345.3456645');
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        expect(element('.ade-editme').text()).toBe('345');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should detect TAB key', function() {
        element('.ade-editme:eq(0)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should edit/save entry with TAB', function() {
        element('.ade-editme:eq(0)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('345.3456645');
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editme').text()).toBe('345');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should detect ESC key', function() {
        element('.ade-editme:eq(0)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should abort editing entry', function() {
        element('.ade-editme:eq(0)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('345.3456645');
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editme').text()).toBe('1,234');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });
});