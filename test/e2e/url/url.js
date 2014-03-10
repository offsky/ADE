'use strict';

describe('url', function() {

    beforeEach(function() {
        browser().navigateTo('../../app/url/index.html');
    });

    it('should render 2 controls', function() {
        expect(element('.ade-editme').count()).toEqual(2);
    });

    it('should go into edit mode', function() {
        element('.ade-editme').click();
        expect(element('.ade-editme + input').count()).toEqual(1);
    });

    it('should show a popup on click', function() {
        element('.ade-editme:contains(apple)').click();
        expect(element('.ade-editme + div').count()).toEqual(1);
    });

    it('should go into edit mode after clicking edit button', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        expect(element('.ade-editme + input').count()).toEqual(1);
    });

    it('should echo invalid input', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('abc');
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        expect(element('.ade-editme:eq(0)').text()).toBe('abc');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should detect ENTER key', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should edit/save entry with ENTER', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('http://angularjs.org');
            elm.trigger({ type : 'keydown', keyCode: 13 });
        });
        expect(element('.ade-editme').html()).
            toBe('<a href="http://angularjs.org">http://angularjs.org</a>');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should detect TAB key', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should edit/save entry with TAB', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('http://angularjs.org');
            elm.trigger({ type : 'keydown', keyCode: 9 });
        });
        expect(element('.ade-editme').html()).
            toBe('<a href="http://angularjs.org">http://angularjs.org</a>');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should detect ESC key', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editme + input').count()).toEqual(0);
    });

    it('should abort editing entry', function() {
        element('.ade-editme:contains(apple)').click();
        element('a:contains(Edit)').click();
        appElement('.ade-editme + input', function(elm) {
            elm.val('http://angularjs.org');
            elm.trigger({ type : 'keydown', keyCode: 27 });
        });
        expect(element('.ade-editme').html()).
            toBe('<a href="http://www.apple.com">http://www.apple.com</a>');
        expect(element('.ade-editme + input').count()).toEqual(0);
    });
});