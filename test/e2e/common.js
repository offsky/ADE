angular.scenario.dsl('appElement', function() {
    return function(selector, fn) {
        return this.addFutureAction('element ' + selector, function($window, $document, done) {
            fn.call(this, $window.angular.element(selector));
            done();
        });
    };
});