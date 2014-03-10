'use strict';

describe('decimal', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/decimal/index.html');
    });

    it('should render 1 control', function() {
        expect(element('.ade-editme').count()).toEqual(1);
    });

    it('should go into edit mode', function() {
        element('.ade-editme').click();
        expect(element('.ade-editme + input').count()).toEqual(1);
    });

    it('should not allow invalid input', function() {
        element('.ade-editme:eq(0)').click();
        sleep(1);
        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keypress', keyCode: 97 }); //letter a
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        expect(element('.ade-editme:eq(0)').text()).toBe('1,234.32');
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
        expect(element('.ade-editme').text()).toBe('345.35');
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
        expect(element('.ade-editme').text()).toBe('345.35');
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
        expect(element('.ade-editme').text()).toBe('1,234.32');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });
});