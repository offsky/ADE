/* ==================================================================
AngularJS Datatype Editor - List
A directive to pick a new value from a list of values

Usage:
<div ade-list ade-id="123" ade-query="query(options,listId)" ade-selection="selection(element,callback,listId)" ade-multiple="0" ng-model="data"></div>

Config:

ade-list:
	The id number for the type of list. If you have multiple lists per page, this will
	distinguish between them
ade-id:
	If this id is set, it will be used in messages broadcast to the app on state changes.
ade-readonly:
	If you don't want the list to be editable	
ade-multiple:
	If you want multiple values to be selectable set to "1" otherwise one value will be allowed
ade-query:
	A function in your controller that will provide matches for search query.
	The argument names need to match
ade-selection:
	A function in your contorller that proivides all the selections
	The argument names need to match

 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value, exit value}

 ------------------------------------------------------------------*/
angular.module('ADE').directive('adeList', ['ADE', '$compile', function(ADE, $compile) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-list=""></div>

		scope: {
			adeList: "@",
			adeId: "@",
			adeMultiple: "@",
			adeReadonly: "@",
			adeQuery: "&",
			adeSelection: "&",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var editing = false; //are we in edit mode or not
			var input = null; //a reference to the input DOM object
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate

			var multiple = false;
			var readonly = false;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeMultiple!==undefined && scope.adeMultiple=="1") multiple = true;

			//these two methods are a way for the select2 directive to communicate back 
			//to the parent scope
			scope.query = function(arg) {
				scope.adeQuery({options:arg, listId: scope.adeList});
			};
			scope.selection = function(arg1,arg2,arg3) {
				scope.adeSelection({element:arg1,callback:arg2,listId:scope.adeList});
			};

			//makes the initial presentation by unwinding arrays with commas
			var makeHTML = function() {
				var html = "";

				if (!scope.ngModel) return;
			
				if (angular.isString(scope.ngModel)) {
					html = scope.ngModel;
				} else if (angular.isArray(scope.ngModel)) {
					if(!multiple) {
						html = scope.ngModel[0];
					} else {
						var html = '';
						$.each(scope.ngModel, function(i, v) {
							if (html) html += ', ';
							html += v;
						});
					}
				}
				element.html(html);
			};

			//called once the edit is done, so we can save the new data and remove edit mode
			var saveEdit = function(exited) {
				var oldValue = scope.ngModel;
				exit = exited;

				if (exited != 3) { //don't save value on esc
					value = input.data().select2.data();
					if (angular.isArray(value)) {
						if (value.length > 0) {
							//to have value stored as array
							var vals = [];
							angular.forEach(value, function(val, key) {
								vals.push(val.text);
							});
							value = vals;

							// to have value stored as string
							// var v = '';
							// angular.forEach(value, function(val, key) {
							// 	val = (key < value.length - 1) ? val.text + ',' : val.text;
							// 	v += val;
							// });
							// value = v;
						} else {
							value = '';
						}
					} else if (angular.isObject(value) && value.text) {
						value = value.text;
					} else {
						value = (value) ? value.text : '';
					}

					scope.ngModel = value;
				}

				element.show();
				input.select2('destroy');
				input.remove();

				editing = false;

				ADE.done(scope.adeId, oldValue, scope.ngModel, exit);
			};

			//when the edit is canceled by ESC
			var cancel = function() {
				input.select2('destroy');
				input.remove();

				element.show();
				ADE.done(scope.adeId, scope.ngModel, scope.ngModel, 3);
				editing = false;
			};

			//when the list is changed we get this event
			var change = function(e) {
				if (e[0] === 'singleRemove') {
					saveEdit(e.exit);
				} else if (e[0] === 'emptyTabReturn') { //Tab or return on multi with nothing typed
					saveEdit(e.exit);
				} else if (e[0] === 'bodyClick') {
					saveEdit(0);
				} else {
					if (!multiple) saveEdit(e.exit);
				}
			};

			var clickHandler = function() {
				if (editing) return;
				editing = true;
				exit = 0;

				ADE.begin(scope.adeId);
				element.hide();

				var multi = '';
				var placeholder = '';

				if (multiple) {
					multi = 'multiple="multiple"';
				} else {
					placeholder = ',placeholder:\'List...\'';
				}

				var query = '';
				if (scope.query) query = ',query:query'; //the user's query function for providing the list data
				var selection = '';
				if (scope.selection) selection = ',initSelection:selection'; //the user's selection function for providing the initial selection

				var listId = '';
				if (scope.adeList) listId = ",listId:'" + scope.adeList + "'"; //data that is passed through to the query function

				var html = '<input class="ade-list-input" type="hidden" ui-select2="{width:\'resolve\',allowClear:true,openOnEnter:false,searchClear:true,closeOnRemove:false,closeOnSelect:false,allowAddNewValues:true' + query + listId + selection + placeholder + '}" ' + multi + ' />';
				$compile(html)(scope).insertAfter(element);
				input = element.next('input');

				if (angular.isString(scope.ngModel)) scope.ngModel = scope.ngModel.split(',');
				input.val(scope.ngModel);

				//must initialize select2 in timeout to give the DOM a chance to exist
				setTimeout(function() {
					scope.selection(input, function(data) { //get preseleted data
						input.select2('data', data);
						input.select2('open');
					},scope.adeList);
				});

				input.on('cancel', function(e) {
					scope.$apply(function() {
						cancel(e);
					});
				}); //registers for esc key events

				input.on('change', function(e) {
					scope.$apply(function() {
						change(e);
					});
				}); //registers for any change event
			};

			if(!readonly) {
				element.bind('click', clickHandler);
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

// Taken from Angular-UI and modified for our uses
// https://github.com/angular-ui/angular-ui
angular.module('ADE').directive('uiSelect2', ['$http', function($http) {
	var options = {};

	return {
		require: '?ngModel',
		compile: function(tElm, tAttrs) {
			var watch;
			var repeatOption;
			var repeatAttr;
			var isSelect = tElm.is('select');
			var isMultiple = (tAttrs.multiple !== undefined);

			return function(scope, elm, attrs, controller) {
				// instance-specific options
				var opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));

				if (isMultiple) opts.multiple = true;

				if (controller) {
					// Watch the model for programmatic changes
					controller.$render = function() {
						if (isMultiple && !controller.$modelValue) {
							elm.select2('data', []);
						} else if (angular.isObject(controller.$modelValue)) {
							elm.select2('data', controller.$modelValue);
						} else {
							elm.select2('val', controller.$modelValue);
						}
					};

					// Watch the options dataset for changes
					if (watch) {
						scope.$watch(watch, function(newVal, oldVal, scope) {
							if (!newVal) return;
							// Delayed so that the options have time to be rendered
							setTimeout(function() {
								elm.select2('val', controller.$viewValue);
								// Refresh angular to remove the superfluous option
								elm.trigger('change');
							});
						});
					}

					if (!isSelect) {
						// Set the view and model value and update the angular template manually for the ajax/multiple select2.
						elm.bind('change', function() {
							controller.$setViewValue(elm.select2('data'));
							scope.$digest();
						});

						if (opts.initSelection) {
							var initSelection = opts.initSelection;
							opts.initSelection = function(element, callback) {
								initSelection(element, function(value) {
									controller.$setViewValue(value);
									callback(value);
								},opts.listId);
							};
						}
					}
				}

				attrs.$observe('disabled', function(value) {
					elm.select2(value && 'disable' || 'enable');
				});

				if (attrs.ngMultiple) {
					scope.$watch(attrs.ngMultiple, function(newVal) {
						elm.select2(opts);
					});
				}

				// Set initial value since Angular doesn't
				elm.val(scope.$eval(attrs.ngModel));

				// Initialize the plugin late so that the injected DOM does not disrupt the template compiler
				setTimeout(function() {
					elm.select2(opts);
				});
			};
		}
	};
}]);
