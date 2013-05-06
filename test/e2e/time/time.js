'use strict';

describe('time', function() {
    var expectedHour = 23; //this is the UTC hour of the time used in the demo page
    var expectedAmPM = 'am';

    beforeEach(function() {
        browser().navigateTo('../../app/time/index.html');

        //calculating what the expected local time is
        var today = new Date();
        var myTz = (today.getTimezoneOffset())/60;

        //adjust timezone based on daylight savings
        var jan = new Date(today.getFullYear(), 0, 1);
        var jul = new Date(today.getFullYear(), 6, 1);
        var std = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        var dst = today.getTimezoneOffset() < std;
        if(dst) myTz+=1;

        expectedHour = 23-myTz;

        expectedAmPM = 'am';
        if(expectedHour>12) {
            expectedAmPM = 'pm';
            expectedHour-=12;
        }
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
        expect(element('.ade-editable:eq(0)').text()).toBe(expectedHour+':59 '+expectedAmPM);
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should not allow invalid input', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('abcd');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should allow clearing of input', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('');
        expect(element('.ade-editable + input').count()).toEqual(0);
    });

    it('should allow entering value into input', function() {
        element('.ade-editable:eq(0)').click();
        appElement('.ade-editable + input', function(elm) {
            elm.val('6:00 am');
            elm.trigger({ type : 'keypress', keyCode: 13 });
        });
        expect(element('.ade-editable:eq(0)').text()).toBe('6:00 am');
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
        expect(element('.ade-editable:eq(0)').text()).toBe((expectedHour+1)+':00 '+expectedAmPM); //TODO: if you are in the right timezone, this will fail becaus we are not switching am to pm
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
        expect(element('.ade-editable:eq(0)').text()).toBe((expectedHour+1)+':59 '+expectedAmPM); //TODO: if you are in the right timezone, this will fail becaus we are not switching am to pm
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
     
        expect(element('.ade-editable:eq(0)').text()).toBe(expectedHour+':59 '+expectedAmPM);
        expect(element('.ade-editable + input').count()).toEqual(0);
    });
});