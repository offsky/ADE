/* ==================================================================
	Directive to present a date picker popup on an input element
------------------------------------------------------------------*/

angular.module('ADE').directive('adeCalpop', ['$filter', function($filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div b-datepicker=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var format = 'mm/dd/yyy';

			//Handles return key pressed on in-line text box
			element.bind('keyup', function(e) {
				if (e.keyCode == 13) { //return key
					element.datepicker('hide');
					element.blur();
				} else if (e.keyCode == 27) { //esc
					element.datepicker('hide');
				}
			});

			//creates a callback for when something is picked from the popup
			var updateModel = function(ev) {
				var dateStr = '';
				if (ev.date) dateStr = $filter('date')(ev.date, format);

				element.context.value = dateStr;

				if (controller !== undefined && controller !== null) controller.$setViewValue(dateStr);
				if (!scope.$$phase) scope.$digest();
			};

			// called at the begining if there is pre-filled data that needs to be preset in the popup
			if (controller !== undefined && controller !== null) {
				controller.$render = function() {
					if (controller.$viewValue) {
						element.datepicker().data().datepicker.date = controller.$viewValue; //TODO: is this line necessary?
						element.datepicker('setValue', controller.$viewValue);
						element.datepicker('update');
					} else if (controller.$viewValue === null) {
						element.datepicker('setValue', null);
						element.datepicker('update');
					}
					return controller.$viewValue;
				};
			}

			// Initialization code run for each directive instance.  Enables the bootstrap datepicker object
			return attrs.$observe('adeCalpop', function(value) { //value is the contents of the b-datepicker="" string
				var options = {};
				if (angular.isObject(value)) options = value;

				if (typeof(value) === 'string' && value.length > 0) {
					options = angular.fromJson(value); //parses the json string into an object
				}
				if (options.format) format = options.format;

				return element.datepicker(options).on('changeDate', updateModel);
			});

		}
	};
}]);

/* ==================================================================
	Directive to display an input box and a popup date picker on a div that is clicked on
------------------------------------------------------------------*/
angular.module('ADE').directive('adeDate', ['ADE', '$compile', function(ADE, $compile) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-date=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var editing = false;
			var input = null;
			var value = null;
			var oldValue = null;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return. controls if you exited the field so you can focus the next field if appropriate

			// called at the begining if there is pre-filled data that needs to be preset in the popup
			if (controller !== null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if (value === undefined || value === null) value = 0;
					return controller.$viewValue;
				};
			}

			//callback once the edit is done
			var saveEdit = function(exited) {
				oldValue = value;
				exit = exited;

				if (exited != 3) { //don't save value on esc
					value = parseDateString(input.val());
					controller.$setViewValue(value);
				}

				element.show();
				input.datepicker('remove');
				input.remove(); //TODO: angular still has a reference to the ngModel bound to the input. We need to fix that leak
				editing = false;

				ADE.done(options, oldValue, value, exit);
				scope.$digest();
			};

			//handles clicks on the read version of the data
			element.bind('click', function() {
				if (editing) return;
				editing = true;
				exit = 0;
				value = value || 0;
				if(!angular.isNumber(value)) value = parseDateString(value);

				ADE.begin(options);

				element.hide();
				var extraDPoptions = '';
				if (options.format == 'yyyy') extraDPoptions = ',"viewMode":2,"minViewMode":2';
				var html = '<input ade-calpop=\'{"format":"' + options.format + '"' + extraDPoptions + '}\' ng-model="adePickDate" ng-init="adePickDate=' + value + '" type="text" class="' + options.className + '" />';
				$compile(html)(scope).insertAfter(element);
				input = element.next('input');

				input.focus(); //I do not know why both of these are necessary, but they are
				setTimeout(function() {
					input.focus();
				});

				//Handles blur of in-line text box
				ADE.setupBlur(input, saveEdit);
				ADE.setupKeys(input, saveEdit);

				//because we have a nested directive, we need to digest the entire parent scope
				if(scope.$parent && scope.$parent.$localApply) scope.$parent.$localApply();
				else scope.$apply();

			});

			// Initialization code run for each directive instance once
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeDate', function(settings) { //settings is the contents of the ade-text="" string
				options = ADE.parseSettings(settings, {className: 'input-medium', format: 'MMM d, yyyy'});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);



/*
References

https://groups.google.com/forum/?fromgroups=#!topic/angular/ERUVRR8vZW0
http://www.eyecon.ro/bootstrap-datepicker/
https://gist.github.com/3103533
https://gist.github.com/3135128

Alternative: https://github.com/angular-ui/angular-ui/tree/master/modules/directives/date

http://docs.angularjs.org/guide/directive
*/
