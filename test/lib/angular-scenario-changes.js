// Additions to angular-scenario.js

angular.scenario.dsl('myElement', function() {
  var KEY_VALUE_METHODS = ['attr', 'css', 'prop'];
  var VALUE_METHODS = [
    'val', 'text', 'html', 'height', 'innerHeight', 'outerHeight', 'width',
    'innerWidth', 'outerWidth', 'position', 'scrollLeft', 'scrollTop', 'offset'
  ];
  var chain = {};

  chain.richTextEnter = function(text) {
    return this.addFutureAction("element enter rich text", function($window, $document, done) {
      $('iframe').contents().find('iframe').contents().find('body p').text(text);
      done();
    });
  };  

  chain.richTextTab = function() {
    return this.addFutureAction("element tabs", function($window, $document, done) {
      var element = $('iframe').contents().find('iframe').contents().find('body')[0];
    // Use Event instead of KeyboardEvent due to a bug on Webkit assigning keyCode
    // http://stackoverflow.com/questions/1897333/firing-a-keyboard-event-on-chrome
    var pressEvent = document.createEvent('Event');
    pressEvent.keyCode = 9;
    pressEvent.initEvent('keydown');
    element.dispatchEvent(pressEvent);

      done();
    });
  };

  chain.richTextEsc = function() {
    return this.addFutureAction("element tabs", function($window, $document, done) {
      var element = $('iframe').contents().find('iframe').contents().find('body')[0];
    // Use Event instead of KeyboardEvent due to a bug on Webkita ssigning keyCode
    // http://stackoverflow.com/questions/1897333/firing-a-keyboard-event-on-chrome
    var pressEvent = document.createEvent('Event');
    pressEvent.keyCode = 27;
    pressEvent.initEvent('keydown');
    element.dispatchEvent(pressEvent);

      done();
    });
  };

  chain.simulateClick = function(index, event) {
    return this.addFutureAction("element '" + "' clicks", function($window, $document, done) {
    var elements = $document.elements();
      var element = elements[index];
      simulateMouse(element, event);

      done();
    });
  };

  angular.forEach(KEY_VALUE_METHODS, function(methodName) {
    chain[methodName] = function(name, value) {
      var args = arguments,
          futureName = (args.length == 1)
              ? "element '" + this.label + "' get " + methodName + " '" + name + "'"
              : "element '" + this.label + "' set " + methodName + " '" + name + "' to " + "'" + value + "'";

      return this.addFutureAction(futureName, function($window, $document, done) {
        var element = $document.elements();
        done(null, element[methodName].apply(element, args));
      });
    };
  });

  angular.forEach(VALUE_METHODS, function(methodName) {
    chain[methodName] = function(value) {
      var args = arguments,
          futureName = (args.length == 0)
              ? "element '" + this.label + "' " + methodName
              : futureName = "element '" + this.label + "' set " + methodName + " to '" + value + "'";

      return this.addFutureAction(futureName, function($window, $document, done) {
        var element = $document.elements();
        done(null, element[methodName].apply(element, args));
      });
    };
  });

  return function(selector, label) {
    this.dsl.using(selector, label);
    return chain;
  };
});
