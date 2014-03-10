/* ==================================================================
	AngularJS Datatype Editor - Date
	Two directives to edit a date. One directive is responsible for creating a popup 
	calendar on an input. The second direcrtive is responsible for creating that input
	when clicking on a date.

------------------------------------------------------------------*/


/* ==================================================================
	Directive to present a date picker popup on an input element

	Usage:
	<input ade-calpop='mm/dd/yyyy' ng-model="data"></div>

	Config:

	ade-calpop:
		Specify the format that you want the date displayed in.  Defaults to mm/dd/yyy.
		Can be 'yyyy' or 'MMM d, yyyy' or 'MMM d, yyyy h:mm:ss a' or something else.
	ade-yearonly:
		"1" to allow only the year to be selected (no month or day)

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
		link: function(scope, element, attrs) {
			var options = {format: 'mm/dd/yyyy'};
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
					if(angular.isNumber(e.date)) {
						dateStr = $filter('date')(e.date, options.format); //turn timestamp into string
						scope.ngModel = dateStr;
					} else {
						dateStr = e.date;
					}
					element.datepicker('setValue', scope.ngModel);
					element.datepicker('update');
				}

	//			element.context.value = dateStr; //sets the display value
			};

			//initialization of the datapicker
			element.datepicker(options).on('changeDate',function(e) {
				//sometimes this is called inside Angular scope, sometimes not.
				//scope.$$phase is always null for some reason so can't check it
				//instead I am putting it in a timer to take it out of angular scope
				setTimeout(function() { 
					scope.$apply(function() { //we then put it back into angular scope
						updateModel(e);
					});
				});
			});
			
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

	Usage:
	<div ade-date='mm/dd/yyyy' ade-id='1234' ade-class="myClass" ng-model="data"></div>

	Config:

	ade-date:
		Specify the format that you want the date displayed in.  Defaults to mm/dd/yyy.
		Can be 'yyyy' or 'MMM d, yyyy' or 'MMM d, yyyy h:mm:ss a' or something else.
	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the date to be editable
	ade-absolute:
		"1" if you want the date to be displayed in absolute time instead of relative time.
		See the documentation for the date filter for more info about this.
	ade-timezome:
		"1" if you want the timezone to be displayed if different from current timezone

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}


------------------------------------------------------------------*/
angular.module('ADE').directive('adeDate', ['ADE', '$compile', '$filter', function(ADE, $compile, $filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-date=""></div>

		scope: {
			adeDate: "@",
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			adeAbsolute: "@",
			adeTimezone: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var editing = false;
			var input = null;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return. controls if you exited the field so you can focus the next field if appropriate
			var readonly = false;
			var inputClass = "";
			var format = 'mm/dd/yyyy';
			var absolute = false;
			var timezone = false;
			var stringDate = ""; //The string displayed to the user after conversion from timestamp

			if(scope.adeDate!==undefined) format = scope.adeDate;
			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeAbsolute!==undefined && scope.adeAbsolute=="1") absolute = true;
			if(scope.adeTimezone!==undefined && scope.adeTimezone=="1") timezone = true;

			var makeHTML = function() {				
				stringDate = $filter('validDate')(scope.ngModel,[format,absolute,timezone]);
				element.html(stringDate);
			};

			//callback once the edit is done
			var saveEdit = function(exited) {

				var oldValue = scope.ngModel;
				exit = exited;
				
				if (exited != 3) { //don't save value on esc
					value = parseDateString(input.val());
					if (value == null || value==0) {
						value = [0,0,0];
					} else {
						var offset = new Date(value*1000).getTimezoneOffset();
						value = [value, value-offset*60, offset];
					}
					scope.ngModel = value;
				}
				element.show();

				ADE.teardownBlur(input);
				ADE.teardownKeys(input);

				input.datepicker('remove'); //tell datepicker to remove self
				input.scope().$destroy(); //destroy the scope for the input to remove the watchers
				input.remove(); //remove the input
				editing = false;

				ADE.done(scope.adeId, oldValue, scope.ngModel, exit);
			};

			var clickHandler = function() {
				ADE.hidePopup();
				if (editing) return;
				editing = true;
				exit = 0;

				var preset = scope.ngModel;
				
				//model should be an array [localtime, absolutetime, timezone]
				//find the proper time and convert it to a string
				if(angular.isArray(scope.ngModel) && scope.ngModel.length>0) {
					preset = scope.ngModel[0];//start with local
					if(scope.adeAbsolute && scope.ngModel[1]!==undefined) { //pick absolute if requested
						preset = scope.ngModel[1]; //the GMT time we want to display, so need to offset this by user's offset
						if(preset) preset += new Date(preset*1000).getTimezoneOffset()*60;
					}
				}

				if(angular.isString(preset)) {
					var number = parseInt(preset.replace(/[$]/g, ''));
					if(preset===number+'') preset = number;
					else preset = parseDateString(preset);
				} else if(!angular.isNumber(preset)) {
					preset = 0;
				}
				preset = preset ? preset : 0; //preset should now be a unix timestamp for the displayed time

				ADE.begin(scope.adeId);

				element.hide();
				var extraDPoptions = '';
				if (format == 'yyyy') extraDPoptions = 'ade-yearonly="1"';
				var html = '<input ng-controller="adeDateDummyCtrl" ade-calpop="'+format+'" '+extraDPoptions+' ng-model="adePickDate" ng-init="adePickDate=\'' + stringDate + '\'" type="text" class="' + inputClass + '" />';
				$compile(html)(scope).insertAfter(element);
				input = element.next('input');

				input.focus(); //I do not know why both of these are necessary, but they are
				setTimeout(function() {
					input.focus();
				});

				//Handles blur of in-line text box
				ADE.setupBlur(input, saveEdit, scope);
				ADE.setupKeys(input, saveEdit, false, scope);
			};

			//When mousing over the div it will display a popup with the day of the week
			element.on('mouseover', function() {
				var value = element.text();
				if (value === "" || value.length <= 4) return;
				
				//strip off timezone if present
				var hastimezone = value.indexOf("(");
				if(hastimezone>0) value = value.substring(0,hastimezone);

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

			//Remove the day of the week popup
			element.on('mouseout', function() {
			  ADE.hidePopup();
			});

			if(!readonly) {
				element.on('click', clickHandler); //this doesn't need to be wrapped in $apply because calPop does it
			}

			//need to watch the model for changes
			scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				makeHTML();
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
