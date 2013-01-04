'use strict';

describe('email', function() {

    beforeEach(module('ADE'));
    beforeEach(module('ngSanitize'));

    var linky;

    beforeEach(inject(function($filter) {
        linky =  $filter('linky');
    }));

    it('should convert email address string into a clickable link', function() {
        expect(linky("admin@toodledo.com")).toEqual('<a href="mailto:admin@toodledo.com">admin@toodledo.com</a>');
    });

    it('should echo non-email results', function() {
        expect(linky("")).toEqual('');
        expect(linky("foo")).toEqual('foo');
    });
});
