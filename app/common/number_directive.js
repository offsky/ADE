/* ==================================================================
	AngularJS Datatype Editor - Number
	A directive to edit a number in place.

	Used for percent, money, decimal, integer

	Usage:
	<div ade-number="money" ade-id="1234" ng-model="data"></div>

	Config:
	ade-url:
		Defaults to "integer" but you can set "money" or "percemt" or "decimal" to make it a certain type of number
	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the stars to be editable	
	ade-precision:
		for the "decimal" field type, this specifies the number of numbers after the decimal. default=2

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeNumber', ['ADE', '$compile', '$filter', function(ADE, $compile, $filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-number=""></div>

		scope: {
			adeNumber: "@",
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			adePrecision: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var editing=false; //are we in edit mode or not
			var input = null; //a reference to the input DOM object
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var readonly = false;
			var inputClass = "";
			var precision = 2;

			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adePrecision!==undefined) precision = parseInt(scope.adePrecision);

			var makeHTML = function() {
				var html = "";
				var value = scope.ngModel;
				
				if(value!==undefined) {					
					switch (scope.adeNumber) {
						case 'money':
							html = $filter('money')(value);
							break;
						
						case 'percent':
							html = $filter('percent')(value);
							break;

						case 'decimal':
							html = $filter('decimal')(value,precision);
							break;

						case 'integer':
						default:
							html = $filter('integer')(value);
					} 
				}

				element.html(html);
			};

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				var oldValue = scope.ngModel;
				exit = exited;

				if(exited!=3) { //don't save value on esc
					var value = input.val();
					value = value.replace(/[^0-9.-]/g, '');
					value = parseFloat(value);
					if(isNaN(value)) value = '';
					scope.ngModel = value;
				}

				ADE.teardownKeys(input);
				ADE.teardownBlur(input);

				element.show();
				if(input) input.remove();
				editing=false;

				ADE.done(scope.adeId,oldValue,scope.ngModel,exit);
			};
			
			var clickHandler = function() {
				if(editing) return;
				editing=true;
				exit = 0;

				ADE.begin(scope.adeId);

				value = scope.ngModel;
				if(angular.isArray(value) && value.length>0) value = value[0];
				if(angular.isString(value)) value = parseFloat(value.replace(/[$]/g, ''));
				else if(!angular.isNumber(value)) value = '';
				value = value ? value : '';

				element.hide();
				$compile('<input type="text" class="'+inputClass+'" value="'+value+'" />')(scope).insertAfter(element);
				input = element.next('input');
				input.focus();
				
				ADE.setupBlur(input,saveEdit,scope);
				ADE.setupKeys(input,saveEdit,false,scope);

				input.on('keypress.ADE', function(e) {
					var keyCode = (e.keyCode ? e.keyCode : e.which); //firefox doesn't register keyCode on keypress only on keyup and down
					
					if ((keyCode >= 48 && keyCode <= 57) || keyCode==36 || keyCode==37 || keyCode==44 || keyCode==45 || keyCode==46 || keyCode==9 || keyCode==27 || keyCode==13) { //0-9 and .,-%$
						;//allowed characters
					} else {
						e.preventDefault();
						e.stopPropagation();
					}
				});
			};

			//setup events
			if(!readonly) {
				element.on('click', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					})
				});
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