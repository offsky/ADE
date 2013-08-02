/* ==================================================================
	AngularJS Datatype Editor - Number
	A directive to edit a number in place.

	Used for percent, money, decimal, integer

	Usage:
	<div ade-number='{"className":"input-large","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeNumber', ['ADE','$compile', function(ADE,$compile) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-number=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var editing=false; //are we in edit mode or not
			var input = null; //a reference to the input DOM object
			var value = "";
			var oldValue = "";
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate

			//whenever the model changes, we get called so we can update our value
			if (controller !== null && controller !== undefined) {
				controller.$render = function() {
					oldValue = value = controller.$modelValue;
					if(value === undefined || value === null) value = '';
					return controller.$viewValue;
				};
			}

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				oldValue = value;
				exit = exited;

				if(exited!=3) { //don't save value on esc
					value = input.val();
					value = value.replace(/[^0-9.-]/g, '');
					value = parseFloat(value);
					if(isNaN(value)) value = '';
					controller.$setViewValue(value);
				}

				ADE.teardownKeys(input);
				ADE.teardownBlur(input);

				element.show();
				input.remove();
				editing=false;

				ADE.done(options,oldValue,value,exit);

				scope.$digest();
			};
			
			//handles clicks on the read version of the data
			element.bind('click', function() {
				if(editing) return;
				editing=true;
				exit = 0;

				ADE.begin(options);

				if(angular.isArray(value) && value.length>0) value = value[0];
				if(angular.isString(value)) value = parseFloat(value.replace(/[$]/g, ''));
				else if(!angular.isNumber(value)) value = '';
				value = value ? value : '';

				element.hide();
				$compile('<input type="text" class="'+options.className+'" value="'+value+'" />')(scope).insertAfter(element);
				input = element.next('input');
				input.focus();
				
				ADE.setupBlur(input,saveEdit);
				ADE.setupKeys(input,saveEdit);

				input.bind('keypress.ADE', function(e) {
					if ((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode==36 || e.keyCode==37 || e.keyCode==44 || e.keyCode==45 || e.keyCode==46) { //0-9 and .,-%$
						;//allowed characters
					} else {
						e.preventDefault();
						e.stopPropagation();
					}
				});

			});

			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeNumber', function(settings) { //settings is the contents of the ade-number="" string
				options = ADE.parseSettings(settings, {className:"input-small"});
				return element;
			});

		}
	};
}]);