/* ==================================================================
	Directive to present a date picker popup on an input element
------------------------------------------------------------------*/

angular.module('ADE').directive('adeCalpop', ['$filter', function($filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div b-datepicker=""></div>

		scope: {
			adeCalpop: "@",
			adeYearonly: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {format: 'mm/dd/yyy'};
			if(scope.adeCalpop!==undefined) options.format = scope.adeCalpop;

			if(scope.adeYearonly!==undefined && scope.adeYearonly=="1") {
				options.viewMode = 2; //tells the datepicker to start on year picker
				options.minViewMode = 2;//tells the datepicker to limit to year only
			}

			//creates a callback for when something is picked from the popup or typed
			var updateModel = function(e) {
				var dateStr = "";

				if(e && e.date && e.external==undefined) { //change came from click on calendar
					dateStr = $filter('date')(e.date, options.format); //turn timestamp into string
					scope.ngModel = dateStr;
				} else if(e.external && e.date) { //change came from typing or external change
					dateStr = e.date;
				}

				element.context.value = dateStr; //sets the display value
			};

			//initialization of the datapicker
			element.datepicker(options).on('changeDate',function(e) {
				scope.$apply(function() {
					updateModel(e);
				});
			});
			// element.datepicker().data().datepicker.date = scope.ngModel; //TODO: is this line necessary?
			element.datepicker('setValue', scope.ngModel);
			element.datepicker('update');

			//Handles return key pressed on in-line text box
			element.on('keypress', function(e) {
				var keyCode = (e.keyCode ? e.keyCode : e.which); //firefox doesn't register keyCode on keypress only on keyup and down

				if (keyCode == 13) { //return key
					e.preventDefault();
					e.stopPropagation();
					element.datepicker('hide');
					element.blur();
				} else if (keyCode == 27) { //esc
					element.datepicker('hide');
				}
			});

			//need to watch the model for changes
			scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				//updateModel is expecting a certain object from the popup calendar
				//so we have to simulate it, but add external flag so we can handle it differently
				updateModel({date:scope.ngModel,external:true});
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
			if (controller !== null && controller !== undefined) {
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
					if (value == null || value==0) {
						value = [0,0,0];
					} else {
						var offset = new Date(value*1000).getTimezoneOffset();
						value = [value, value-offset*60, offset];
					}
					if (controller !== undefined && controller !== null) controller.$setViewValue(value);
				}
				element.show();

				ADE.teardownBlur(input);
				ADE.teardownKeys(input);

				input.datepicker('remove'); //tell datepicker to remove self
				input.scope().$destroy(); //destroy the scope for the input to remove the watchers
				var test = input.remove(); //remove the input
				editing = false;

				ADE.done(options, oldValue, value, exit);
			};

			element.bind('mouseover', function() {
				var value = element.text();
				if (value === "" || value.length <= 4) return;
				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight;
				var today = Date.today();
				var inputDate = Date.parse(value);
				var dayOfWeek = inputDate.toString("dddd");
				var future = (today.isAfter(inputDate)) ? false : true;
				var diff = Math.abs(new TimeSpan(inputDate - today).days);
				var dayOrDays = (diff === 1) ? " day" : " days";
				var content = (future) ? "In " + diff + dayOrDays + ". " : diff + dayOrDays + " ago. ";
				if (diff === 0) content = "Today is ";
				var html = '<div class="' + ADE.popupClass + ' ade-date-popup dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px"><p>' + content + dayOfWeek + '.</p></div>';
				$compile(html)(scope).insertAfter(element);
			});

			element.bind('mouseout', function() {
			  scope.ADE_hidePopup();
			});

			//handles clicks on the read version of the data
			element.bind('click', function() {
				scope.ADE_hidePopup();
				if (editing) return;
				editing = true;
				exit = 0;

				var preset = value;

				if(angular.isArray(value) && value.length>0) {
					preset = value[0];
					if(options.absolute && value[1]!==undefined) {
						preset = value[1]; //the GMT time we want to display, so need to offset this by user's offset
						if(preset) preset += new Date(preset*1000).getTimezoneOffset()*60;
					}
				}
				if(angular.isString(preset)) {
					var number = parseInt(preset.replace(/[$]/g, ''));
					if(preset===number+'') preset = number;
					else preset = parseDateString(preset);
				} else if(!angular.isNumber(preset)) preset = 0;

				preset = preset ? preset : 0;

				ADE.begin(options);

				element.hide();
				var extraDPoptions = '';
				if (options.format == 'yyyy') extraDPoptions = ',"viewMode":2,"minViewMode":2';
				var html = '<input ng-controller="adeDateDummyCtrl" ade-calpop=\'{"format":"' + options.format + '"' + extraDPoptions + '}\' ng-model="adePickDate" ng-init="adePickDate=' + preset + '" type="text" class="' + options.className + '" />';
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
				if (scope.$parent && scope.$parent.$localApply) scope.$parent.$localApply();
				else scope.$apply();
			});

			// Initialization code run for each directive instance once
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeDate', function(settings) { //settings is the contents of the ade-text="" string

				options = ADE.parseSettings(settings, {className: 'input-medium', format: 'MMM d, yyyy', absolute: true});
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
function adeDateDummyCtrl() { }

/*
References

https://groups.google.com/forum/?fromgroups=#!topic/angular/ERUVRR8vZW0
http://www.eyecon.ro/bootstrap-datepicker/
https://gist.github.com/3103533
https://gist.github.com/3135128

Alternative: https://github.com/angular-ui/angular-ui/tree/master/modules/directives/date

http://docs.angularjs.org/guide/directive
*/
