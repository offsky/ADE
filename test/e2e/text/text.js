'use strict';

describe('text', function() {

	beforeEach(function() {
		browser().navigateTo('../../app/text/index.html');
	});

	it('should render 2 controls', function() {
		expect(element('.ade-editme').count()).toEqual(2);
	});

	it('should go into edit mode', function() {
		element('.ade-editme:eq(0)').click();
		expect(element('.ade-editme + input').count()).toEqual(1);
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
			elm.val('testing ade text');
			elm.trigger({ type : 'keydown', keyCode: 13 });
		});
		expect(element('.ade-editme:eq(0)').text()).toBe('testing ade text');
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
			elm.val('testing ade text');
			elm.trigger({ type : 'keydown', keyCode: 9 });
		});
		expect(element('.ade-editme:eq(0)').text()).toBe('testing ade text');
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
			elm.val('testing ade text');
			elm.trigger({ type : 'keydown', keyCode: 27 });
		});
		expect(element('.ade-editme:eq(0)').text()).toBe('click to edit me');
		expect(element('.ade-editme + input').count()).toEqual(0);
	});

	xit('should escape characters properly', function() {
		element('.ade-editme:eq(0)').click();
		appElement('.ade-editme + input', function(elm) {
			elm.val('test!@#$%^&*()"<>end');
			elm.trigger({ type : 'keypress', keyCode: 13 });
		});
		expect(element('.ade-editme:eq(0)').text()).toBe('test!@#$%^&*()"<>end');
		expect(element('.ade-editme + input').count()).toEqual(0);

		element('.ade-editme:eq(0)').click();

		expect(element('.ade-editme + input').val()).toBe('test!@#$%^&*()"<>end');
		
	});

});