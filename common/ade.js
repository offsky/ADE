/* ==================================================================
	AngularJS Datatype Editor

	Common code. Sets up the module for use in your app

	Usage:
		var MyApp = angular.module('MyApp', ['ADE']);

------------------------------------------------------------------*/

'use strict'; //http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

angular.module('ADE', []).factory('ADE', ['$rootScope', function($rootScope) {

	// Common
	var miniBtnClasses = 'btn btn-mini btn-primary';
	var popupClass = 'ade-popup';
	var icons = ['heart', 'film', 'music', 'camera', 'shopping-cart', 'flag', 'picture', 'gift',
        'calendar', 'time', 'thumbs-up', 'thumbs-down', 'hand-right', 'hand-left', 'info-sign', 'question-sign',
        'exclamation-sign', 'trophy', 'pushpin', 'warning-sign', 'leaf', 'tint', 'coffee', 'magnet', 'envelope',
        'inbox', 'bookmark', 'file', 'bell', 'asterisk', 'globe', 'plane', 'road', 'lock', 'book', 'wrench', 'home',
        'briefcase', 'map-marker', 'eye-open', 'medkit', 'lightbulb', 'food', 'laptop', 'circle', 'money', 'bullhorn', 'legal', 'facebook','twitter'];

	//=========================================================================================
	// Removes a popup
	$rootScope.ADE_hidePopup = function(elm) {
		var elPopup = (elm) ? elm.next('.' + popupClass) : angular.element('.' + popupClass);
		if (elPopup.length && elPopup.hasClass('open')) {
			elPopup.removeClass('open').remove();
		}
	};

	//=========================================================================================
	//incorporates the default settings into the passed in settings and returns the combination
	function parseSettings(settings, defaults) {
		var options = {};

		//parse the passed in settings
		if (angular.isObject(settings)) {
			options = settings;
		} else if (angular.isString(settings) && settings.length > 0) {
			options = angular.fromJson(settings); //parses the json string into an object
		}

		//incorporate the defaults if not already set
		$.each(defaults, function(i, v) {
			if (!angular.isDefined(options[i])) {
				options[i] = v;
			}
		});

		return options;
	}

	//=========================================================================================
	//broadcasts the message that we are starting editing
	function begin(options) {
		if (options.id) {
			$rootScope.$broadcast('ADE-start', options.id);
		}
	}

	//=========================================================================================
	//broadcasts the message that we are done editing
	//exit: 1=tab, -1=shift+tab, 2=return, -2=shift+return, 3=esc
	function done(options, oldValue, value, exit) {
		if (options.id) {
			$rootScope.$broadcast('ADE-finish', {'id': options.id, 'oldVal': oldValue, 'newVal': value, 'exit': exit });
		}
	}

	//=========================================================================================
	//registers a blur event on the input so we can know when we clicked outside
	//sends 0 to the callback to indicate that the blur was not caused by a keyboard event
	function setupBlur(input, callback) {
		input.bind('blur.ADE', function() {
			callback(0);
		});
	}
	function teardownBlur(input) {
		input.unbind('blur.ADE');
	}

	//=========================================================================================
	//registers the keyboard events on the input so we know how we left edit mode
	//sends an integer to the callback to indicate how we exited edit mode
	// 1 = tab, -1 = shift+tab, 2=return, -2=shift+return, 3=esc
	var bound = false; //There may be a better way to prevent the current event from finishing when I have unbound the event handler, but I couldnt find it
	function setupKeys(input, callback, ignoreReturn) {

		bound = true;
		input.bind('keydown.ADE', function(e) {
			if (e.keyCode == 9) { //tab
				e.preventDefault();
				e.stopPropagation();
				var exit = e.shiftKey ? -1 : 1;
				callback(exit);
			} else if (e.keyCode == 27) { //esc
				e.preventDefault();
				e.stopPropagation();
				callback(3);
			}
		});

		if (ignoreReturn !== true) {
			//Handles return key pressed on in-line text box
			input.bind('keypress.ADE', function(e) {
				var keyCode = (e.keyCode ? e.keyCode : e.which); //firefox doesn't register keyCode on keypress only on keyup and down

				if (keyCode == 13 && bound) { //return
					e.preventDefault();
					e.stopPropagation();
					var exit = e.shiftKey ? -2 : 2;
					callback(exit);
				}
			});
		}
	}
	function teardownKeys(input) {
		input.unbind('keydown.ADE');
		input.unbind('keypress.ADE');
		bound = false; //tells the key event listener to stop processing the current event
							//this seems to be necessary since stopPropigation wasn't working.
	}

	//=========================================================================================
	//exports public functions
	return {
		parseSettings: parseSettings,
		begin: begin,
		done: done,
		setupBlur: setupBlur,
		teardownBlur: teardownBlur,
		setupKeys: setupKeys,
		teardownKeys: teardownKeys,
     	icons: icons,
     	popupClass: popupClass,
     	miniBtnClasses: miniBtnClasses
	};
}]);
