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
		input.bind('blur', function() {
			callback(0);
		});
	}

	//=========================================================================================
	//registers the keyboard events on the input so we know how we left edit mode
	//sends an integer to the callback to indicate how we exited edit mode
	// 1 = tab, -1 = shift+tab, 2=return, -2=shift+return, 3=esc
	function setupKeys(input, callback, ignoreReturn) {

		input.bind('keydown', function(e) {
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
			input.bind('keypress', function(e) {
				if (e.keyCode == 13) { //return
					e.preventDefault();
					e.stopPropagation();
					var exit = e.shiftKey ? -2 : 2;
					callback(exit);
				}
			});
		}
	}

	//=========================================================================================
	//exports public functions
	return {
		parseSettings: parseSettings,
		begin: begin,
		done: done,
		setupBlur: setupBlur,
		setupKeys: setupKeys,
     	icons: icons,
     	popupClass: popupClass,
     	miniBtnClasses: miniBtnClasses
	};
}]);
