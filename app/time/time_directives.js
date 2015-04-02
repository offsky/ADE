/* ==================================================================
	AngularJS Datatype Editor - Time
	Two directives to edit a time. One directive is responsible for creating a popup 
	picker on an input. The second direcrtive is responsible for creating that input
	when clicking on a time.

------------------------------------------------------------------*/


/* ==================================================================
 Directive to present a time picker on an input

 Usage:
	<input ade-timepop='12' ng-model="data"></div>

	Config:

	ade-timepop:
		Specify "12" for am/pm time or "24" for 24 hour time.

 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeTimepop', ['$filter',function($filter){
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-timepop=""></div>

		scope: {
			adeTimepop: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var keydown = false;

			var format = '12';
			if(scope.adeTimepop!==undefined) format = scope.adeTimepop;

			//creates a callback for when the time is changed, we need to make
			//sure that it is formatted correctly
			var updateModel = function() {
				if(!keydown) { //don't want to reformat time if in middle of keypress
					scope.ngModel  = $filter('time')(scope.ngModel, format);
				}
			};

			var updateWidget = function() {
					var timeStr = element.context.value;
					var pickerData = element.timepicker().data().timepicker;
					if(angular.isString(timeStr)) {
						var arr = timeStr.split(' ');
						var hrsmin = arr[0].split(':');
						var hours = parseInt(hrsmin[0], 10);
						var mins = parseInt(hrsmin[1], 10);
						var ampm = arr[1];
						var validHrs = (hours <= 23) ? hours : 23;
						var validMins = (mins <= 59) ? mins : 59;
						pickerData.hour = validHrs;
						pickerData.minute = validMins;
						pickerData.meridian = ampm;
					}
					element.timepicker('updateWidget');

					//var timeFormat = element.timepicker().data().timepicker.options.showMeridian;
					//var filteredValue = (timeFormat) ? $filter('time')(scope.ngModel) : $filter('time')(scope.ngModel, "24");
					//element.timepicker('setValues', filteredValue);
					//element.timepicker('update');
			};

			//on a valid keypress, recaculates the time
			var updateFromKey = function(e) {
				var validKey = isValidKey(e);
				keydown = false;
				if (validKey && e.keyCode!=13 && e.keyCode!=27 && e.keyCode!=9 && e.keyCode!=8) {

					//need to set timeout because keyup hasn't yet entered the input
					setTimeout(function() {
						updateWidget();
					},100);
				}
				return true;
			};

			//prepares the keyup event to handle valid keypresses
			var isValidKey = function(e) {
				//valid keys: 1-0, p, a, m,backspace, space,return,esc,space
				var keys = [49,50,51,52,53,54,55,56,57,109,112,97,48,58,8,186,13,27,32];
				var validKey = false;

				for (var i=0;i<keys.length;i++) {
					if (!validKey) {
						if (e.keyCode === keys[i]) {
							// keydown=false;
							validKey = true;
							return (element.length < 8) ? validKey : false;
						} else {
							validKey = false;
						}
					}
				}

				return validKey;
			};

			//Handles return, esc, tab key pressed on in-line text box
			element.on('keydown.ADE', function(e) {
				keydown = true;
				if(e.keyCode==13) { //return key
					element.timepicker('updateWidget');
					element.timepicker('hideWidget');
					element.blur();
				} else if (e.keyCode==27) { //esc
					element.timepicker('hideWidget', false);
				} else if(e.keyCode==9) { //tab key detection
					element.timepicker('updateWidget');
					element.timepicker('hideWidget', true);
				} 
			});

			element.on('keyup.ADE', updateFromKey); //needs to be on keyup because some keys (delete) are not send on press

			//initialization of the datapicker
			element.timepicker({showMeridian:format=="24" ? false : true });
	
			var destroy = function() { //need to clean up the event watchers when the scope is destroyed
				if(element) {
					element.off('keydown.ADE');
					element.off('keyup.ADE');
					if(element.timepicker) element.timepicker('removeWidget');
				}
				if(unwatch) unwatch();
			};

			scope.$on('$destroy', destroy);

			//need to watch the model for changes
			var unwatch = scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				if(scope.ngModel===-2) destroy();
				else updateModel();
			});

		}
	};
}]);

/* ==================================================================
 Directive to display a popup to pick a time

 	Usage:
	<div ade-time='12' ade-id='1234' ade-class="myClass" ng-model="data"></div>

	Config:

	ade-time:
		Specify "12" for am/pm time or "24" for 24 hour time.
	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the date to be editable

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

 ------------------------------------------------------------------*/
angular.module('ADE').directive('adeTime', ['ADE', '$compile', '$filter', function(ADE, $compile, $filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-time=""></div>

		scope: {
			adeTime: "@",
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var editing=false;
			var input = null;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return. controls if you exited the field so you can focus the next field if appropriate

			var readonly = false;
			var inputClass = "";
			var format = '12';
			var stringTime = ""; //The string displayed to the user after conversion from timestamp

			if(scope.adeTime!==undefined) format = scope.adeTime;
			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;

			var makeHTML = function() {
				if(scope.ngModel==undefined) stringTime = "";
				else stringTime = $filter('time')(scope.ngModel,format);
				element.html(stringTime);
			};

			//callback once the edit is done
			var saveEdit = function(exited) {
				var editedValue = input.val();
				var oldValue = scope.ngModel;
				exit = exited;

				if(exited!=3) { //don't save value on esc or no changes
					var arr = editedValue.split(' ');
					var hrsmin = arr[0].split(':');
					var hours = parseInt(hrsmin[0], 10);
					var mins = parseInt(hrsmin[1], 10);
					var ampm = arr[1] || '';
					var validHrs = (hours <= 23) ? hours : 23;
					var validMins = (mins <= 59) ? mins : 59;
					if(validMins<10) validMins = "0"+validMins;
					var cleanedValue = validHrs+":"+validMins+" "+ampm;

					scope.ngModel = (hrsmin.length > 1) ? Date.parse(cleanedValue).getTime() / 1000 : '';
				}

				element.show();

				ADE.teardownBlur(input);
				ADE.teardownKeys(input);

				scope.adePickTime = -2;
				input.remove(); //remove the input
				editing=false;

				ADE.done(scope.adeId, oldValue, scope.ngModel, exit);
			};

			var clickHandler = function(e) {
				ADE.hidePopup();
				if(editing) return;
				editing=true;
				exit = 0;

				scope.adePickTime = scope.ngModel || 0;
				var timeLength = 8;
				if (format === "24") timeLength = 5;

				ADE.begin(scope.adeId);

				element.hide();
				var html = '<input ade-timepop="'+format+'" ng-model="adePickTime" maxlength="'+timeLength+'" type="text" class="'+inputClass+'" />';
				$compile(html)(scope).insertAfter(element);
				input = element.next('input');

				input.focus(); //I do not know why both of these are necessary, but they are
				setTimeout(function() {
					input.focus();
				});

				ADE.setupBlur(input,saveEdit, scope);
				ADE.setupKeys(input,saveEdit, false, scope);
			};

			//handles clicks on the read version of the data
			if(!readonly) {
				element.on('click.ADE', clickHandler);
			}

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				if(element) {
					element.off('click.ADE');
				}
				if(unwatch) unwatch();
			});

			//need to watch the model for changes
			var unwatch = scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				makeHTML();
			});
		}
	};
}]);


/*
 References

 https://groups.google.com/forum/?fromgroups=#!topic/angular/ERUVRR8vZW0
 http://www.eyecon.ro/bootstrap-timepicker/
 https://gist.github.com/3103533
 https://gist.github.com/3135128

 Alternative: https://github.com/angular-ui/angular-ui/tree/master/modules/directives/time

 http://docs.angularjs.org/guide/directive
 */