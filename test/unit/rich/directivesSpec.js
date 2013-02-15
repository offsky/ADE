'use strict';

/* jasmine specs for directives go here */

describe('longtext directive', function() {
	beforeEach(module('ADE'));

	it('should make an empty div', function() {
		module(function($provide) {
			$provide.value('data', 'TEST_VER');
		});
		inject(function($compile, $rootScope) {
			var element = $compile('<div ade-longtext ng-model="data"></div>')($rootScope);
			expect(element.text()).toEqual('');
		});
	});

});
