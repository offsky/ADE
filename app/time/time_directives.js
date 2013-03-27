/* ==================================================================
 Directive to present a time picker on an input
 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeTimepop', ['$filter',function($filter){
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div b-timepicker=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var validKey = false;

			//Handles return key pressed on in-line text box
			element.bind('keydown', function(e) {
				if(e.keyCode==13) { //return key
					element.timepicker('updateWidget');
					element.timepicker('hideWidget');
					element.blur();
				} else if (e.keyCode==27) {
					element.timepicker('hideWidget', false);
				}  else {
					if (validKey) {
						var timeStr = controller.$viewValue,
							pickerData = element.timepicker().data().timepicker,
							arr = timeStr.split(' '),
							hrsmin = arr[0].split(':'),
							hours = parseInt(hrsmin[0], 10),
							mins = parseInt(hrsmin[1], 10),
							ampm = arr[1],
							validHrs = (hours <= 23) ? hours : 23,
							validMins = (mins <= 59) ? mins : 59;


						pickerData.hour = validHrs;
						pickerData.minute = validMins;
						pickerData.meridian = ampm;
						element.timepicker('updateWidget');
					}
				}
			});

			element.bind('keydown', function(e) {
				if(e.keyCode==9) { //tab key detection
					element.timepicker('updateWidget');
					element.timepicker('hideWidget', true);
				}
			});

			element.bind('keypress', function(e) {
				//valid keys: 1-0, p, a, m,backspace, space,return,esc,space
				var keys = [49,50,51,52,53,54,55,56,57,109,112,97,48,58,8,186,13,27,32];
				validKey = false;

				for (var i=0;i<keys.length;i++) {
					if (!validKey ) {
						if (e.keyCode === keys[i]) {
							validKey = true;
							return (element.length < 8) ? validKey : false;
						} else {
							validKey = false;
						}
					}
				}

				return false;
			});

			//creates a callback for when something is picked from the popup
			var updateModel = function(ev) {
				var timeStr = '';
				var format = format || "12";

				if (!ev.shouldSave) {
					element.context.value = $filter('time')(controller.$viewValue, format);
					return;
				}

				if (ev.time) timeStr = $filter('time')(ev.time, format);

				element.context.value = timeStr;

				if (controller !== undefined && controller !== null) controller.$setViewValue(ev.time);
				if (!scope.$$phase) scope.$digest();
			};

			// called at the beginning if there is pre-filled data that needs to be preset in the popup
			if (controller !== undefined && controller !== null) {
				controller.$render = function() {
					if(controller.$viewValue) {
						var timeFormat = element.timepicker().data().timepicker.options.showMeridian;
						var filteredValue = (timeFormat) ? $filter('time')(controller.$viewValue) : $filter('time')(controller.$viewValue, "24");
						element.timepicker('setValues', filteredValue);
						element.timepicker('update');
					} else if(controller.$viewValue===null) {
						element.timepicker('setValues',null);
						element.timepicker('update');
					}
					return controller.$viewValue;
				};
			}

			// Initialization code run for each directive instance.  Enables the bootstrap timepicker object
			return attrs.$observe('adeTimepop', function(value) { //value is the contents of the b-timepicker="" string
				var options = {};
				if(angular.isObject(value)) options = value;

				if (typeof(value) === "string" && value.length > 0) {
					options = angular.fromJson(value); //parses the json string into an object
				}

				if(options.format) format = options.format;

				return element.timepicker(options).on('hide.timepicker', updateModel);
			});
		}
	};
}]);

/* ==================================================================
 Directive to display a calendar for picking a year
 ------------------------------------------------------------------*/
angular.module('ADE').directive('adeTime', ['ADE', '$compile', '$filter', function(ADE, $compile, $filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-time=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var editing=false;
			var input = null;
			var value = null;
			var oldValue = null;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return. controls if you exited the field so you can focus the next field if appropriate

			// called at the beginning if there is pre-filled data that needs to be preset in the popup
			if (controller !== null && controller !== undefined) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if(value === undefined || value === null) value = '';
					return controller.$viewValue;
				};
			}

			//callback once the edit is done
			var saveEdit = function(exited) {
				var editedValue = input.val();
				var oldValue = value;
				exit = exited;

				if(exited!=3) { //don't save value on esc or no changes
					var arr = editedValue.split(' '),
						hrsmin = arr[0].split(':'),
						hours = parseInt(hrsmin[0], 10),
						mins = parseInt(hrsmin[1], 10),
						ampm = arr[1] || '',
						validHrs = (hours <= 23) ? hours : 23,
						validMins = (mins <= 59) ? mins : 59,
						cleanedValue = validHrs+":"+validMins+" "+ampm;

                  value = (hrsmin.length > 1) ? Date.parse(cleanedValue).getTime() / 1000 : '';

					controller.$setViewValue(value);
				}

				element.show();

				input.timepicker('removeWidget');
				input.scope().$destroy(); //destroy the scope for the input to remove the watchers
				input.remove(); //remove the input
				editing=false;

				ADE.done(options,oldValue,value,exit);

				scope.$digest();
			};

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
				var extraTPoptions, timeLength;

				if(editing) return;
				editing=true;
				exit = 0;
				value = value || 0;

				ADE.begin(options);

				element.hide();

				if (options.format === "24") {
					extraTPoptions = '"showMeridian":false';
					timeLength = 5;
				} else {
					extraTPoptions = '"showMeridian":true';
					timeLength = 5;
				}

				var html = '<input ng-controller="adeTimeDummyCtrl" ade-timepop=\'{'+extraTPoptions+'}\' ng-model="adePickTime1" ng-init="adePickTime1='+value+'" maxlength="'+timeLength+'" type="text" class="'+options.className+'" />';
				$compile(html)(scope).insertAfter(element);
				input = element.next('input');

				input.focus(); //I do not know why both of these are necessary, but they are
				setTimeout(function() {
					input.focus();
				});

				ADE.setupBlur(input,saveEdit);
				ADE.setupKeys(input,saveEdit);

				//because we have a nested directive, we need to digest the entire parent scope
				if(scope.$parent && scope.$parent.$localApply) scope.$parent.$localApply();
				else scope.$apply();
			});

			// Initialization code run for each directive instance once
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeTime', function(settings) { //settings is the contents of the ade-text="" string
				options = ADE.parseSettings(settings, {className:"input-medium"});
				return element; //TODO: not sure what to return here
			});
		}
	};
}]);

/* ==================================================================
	Angular needs to have a controller in order to make a fresh scope (to my knowledge)
	and we need a fresh scope for the input that we are going to create because we need
	to be able to destroy that scope without bothering its siblings/parent. We need to
	destroy the scope to prevent leaking memory with ngModelWatchers
------------------------------------------------------------------*/
function adeTimeDummyCtrl() { }

/*
 References

 https://groups.google.com/forum/?fromgroups=#!topic/angular/ERUVRR8vZW0
 http://www.eyecon.ro/bootstrap-timepicker/
 https://gist.github.com/3103533
 https://gist.github.com/3135128

 Alternative: https://github.com/angular-ui/angular-ui/tree/master/modules/directives/time

 http://docs.angularjs.org/guide/directive
 */