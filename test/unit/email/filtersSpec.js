'use strict';

describe('email', function() {

	beforeEach(module('ADE'));
	beforeEach(module('ngSanitize'));

	var filter;

	beforeEach(inject(function($filter) {
		filter =  $filter('email');
	}));

	it('should convert email address string into a clickable link', function() {
		expect(filter("admin@toodledo.com")).toEqual('<a href="mailto:admin@toodledo.com">admin@toodledo.com</a>');
	});

	it('should echo non-email results', function() {
		expect(filter("")).toEqual('');
		expect(filter("foo")).toEqual('foo');
		expect(filter(1234)).toEqual('1234');
		expect(filter(null)).toEqual('');
		expect(filter(undefined)).toEqual('');
	});
});
