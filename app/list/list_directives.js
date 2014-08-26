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
angular.module('ADE').directive('adeList', ['ADE', '$compile', '$sanitize', function(ADE, $compile, $sanitize) {
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
		link: function(scope, element, attrs) {
			var editing = false; //are we in edit mode or not
			var input = null; //a reference to the input DOM object
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var stopObserving = null;
			var adeId = scope.adeId;

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

				if (scope.ngModel!==undefined) {
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
				}
				html = $sanitize(html).replace(/<[^>]+>/gm, '');
				element.html(html);
			};

			//called once the edit is done, so we can save the new data and remove edit mode
			var saveEdit = function(exited) {
				console.log("saveEdit",input.data().select2.data());
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

				destroy();

				ADE.done(adeId, oldValue, scope.ngModel, exit);
			};

			//when the edit is canceled by ESC
			var cancel = function() {
				destroy();

				ADE.done(adeId, scope.ngModel, scope.ngModel, 3);
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

				adeId = scope.adeId;
				ADE.begin(adeId);
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

				input.on('cancel.ADE', function(e) {
					scope.$apply(function() {
						cancel(e);
					});
				}); //registers for esc key events

				input.on('change.ADE', function(e) {
					scope.$apply(function() {
						change(e);
					});
				}); //registers for any change event

				
			};

			if(!readonly) {
				element.on('click.ADE', clickHandler);
			}

			//A callback to observe for changes to the id and save edit
			//The model will still be connected, so it is safe, but don't want to cause problems
			var observeID = function(value) {
				 //this gets called even when the value hasn't changed, 
				 //so we need to check for changes ourselves
				 if(editing && adeId!==value) saveEdit(3);
			};

			//If ID changes during edit, something bad happened. No longer editing the right thing. Cancel
			stopObserving = attrs.$observe('adeId', observeID);

			var destroy = function() {
				element.show();
				if(input) {
					input.select2('destroy');
					input.off('cancel.ADE');
					input.off('change.ADE');
					input.remove();
				}

				editing = false;
			};

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				if(element) element.off('click.ADE');
				
				destroy();

				if(stopObserving && stopObserving!=observeID) { //Angualar <=1.2 returns callback, not deregister fn
					stopObserving();
					stopObserving = null;
				} else {
					delete attrs.$$observers['adeId'];
				}
			});

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
						elm.on('change.ADE', function() {
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

				scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
					if(elm) elm.off('change.ADE');
				});

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
