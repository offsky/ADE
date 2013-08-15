'use strict';

describe('rich', function() {
// https://groups.google.com/forum/?fromgroups=#!searchin/angular/e2e$20iframe/angular/eUEVKUsif8U/W4rnLAVF8P0J

function appWindow() {
  return document.getElementsByTagName('iframe')[0].contentWindow;
}
function appAngular() {
  return appWindow().angular;
}


	beforeEach(function() {
		browser().navigateTo('../../app/rich/index.html');
	});

	it('should render 2 controls', function() {
		expect(element('.ade-editable').count()).toEqual(2);
	});

	it('should show a popup on click', function() {
		element('.ade-editable:eq(0)').click();
		expect(element('.ade-editable + .ade-popup').count()).toEqual(1);
	});

	it('should detect click outside to save edit', function() {
		element('.ade-editable:eq(0)').click();
		element().richTextEnter('testing rich editor');
		element('h1').simulateClick(0, 'mousedown');
		expect(element('.ade-editable:eq(0)').text()).toContain('testing rich editor');
	});

	//TODO: fix
	xit('should edit/save entry with TAB', function() {
		element('.ade-editable:eq(0)').click();
		appElement('.ade-editable:eq(0) + .ade-popup textarea', function(elm) {
			elm.text('testing rich editor');
			elm.trigger({ type : 'keydown', keyCode: 9 });
		});
		expect(element('.ade-editable:eq(0) + .ade-popup').count()).toEqual(0);
		expect(element('.ade-editable:eq(0)').text()).toBe('testing rich editor');
	});

	//TODO: fix
	xit('should abort editing entry', function() {
		element('.ade-editable:eq(0)').click();
		appElement('.ade-editable:eq(0) + .ade-popup textarea', function(elm) {
			elm.text('testing rich editor');
			elm.trigger({ type : 'keydown', keyCode: 27 });
		});
		expect(element('.ade-editable:eq(0) + .ade-popup').count()).toEqual(0);
		expect(element('.ade-editable:eq(0)').text()).toBe('click to edit this very v...');
	});
});
