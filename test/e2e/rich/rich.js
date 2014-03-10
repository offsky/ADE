'use strict';

// https://groups.google.com/forum/?fromgroups=#!searchin/angular/e2e$20iframe/angular/eUEVKUsif8U/W4rnLAVF8P0J

function appWindow() {
  return document.getElementsByTagName('iframe')[0].contentWindow;
}
function appAngular() {
  return appWindow().angular;
}

describe('rich', function() {

	beforeEach(function() {
		browser().navigateTo('../../app/rich/index.html');
	});

	it('should render 2 controls', function() {
		expect(element('.ade-editme').count()).toEqual(2);
	});

	it('should show a popup on click', function() {
		element('.ade-editme:eq(0)').click();
		expect(element('.ade-editme + .ade-popup').count()).toEqual(1);
	});

	it('should detect click outside to save edit', function() {
		element('.ade-editme:eq(0)').click();
		myElement().richTextEnter('testing rich editor');
		myElement('h1').simulateClick(0, 'mousedown');
		expect(element('.ade-editme:eq(0)').text()).toContain('testing rich editor');
	});

	it('should edit/save entry with TAB', function() {
		element('.ade-editme:eq(0)').click();
		myElement().richTextEnter('testing rich editor');
		myElement().richTextTab();
		expect(element('.ade-editme:eq(0)').text()).toBe('testing rich editor');
	});

	it('should abort editing entry', function() {
		element('.ade-editme:eq(0)').click();
		myElement().richTextEnter('testing rich editor');
		myElement().richTextEsc();
		expect(element('.ade-editme:eq(0)').text()).toBe('click to edit this very v...');
	});

	it('should enforce maximum length', function() {
		element('.ade-editme:eq(1)').click();
		myElement().richTextEnter('testing');
		myElement('h1').simulateClick(0, 'mousedown');
		expect(element('.ade-editme:eq(1)').text()).toContain('testing');
	});

	it('should revert when enforcing maximum length', function() {
		element('.ade-editme:eq(1)').click();
		myElement().richTextEnter('testing rich editor testing rich editor testing rich editor testing rich editor testing rich editor testing rich editor testing rich editor testing rich editor testing rich editor testing rich editor');
		myElement().richTextEsc();
		expect(element('.ade-editme:eq(1)').text()).toContain('max length of 100 chars');
	});

});
