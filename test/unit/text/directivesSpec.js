'use strict';

/* jasmine specs for directives go here */

describe('text directive', function() {
	beforeEach(module('ADE'));

	xit('should make an empty div', function() {
		module(function($provide) {
			$provide.value('data', 'TEST_VER');
		});
		inject(function($compile, $rootScope, $sanitize) {
			var element = $compile('<div ade-text ng-model="data"></div>')($rootScope);
			expect(element.text()).toEqual('');
		});
	});

});
