/* ==================================================================
	AngularJS Datatype Editor - Text
	A directive to edit text in place

	Usage:
	<div ade-text='{"class":"input-large","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start  
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value}

------------------------------------------------------------------*/

adeModule.directive('adeText', ['$compile','$rootScope',function($compile,$rootScope) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-text=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var editing=false;
			var input = null;
			var value = "";
			var oldValue = "";
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return. controls if you exited the field so you can focus the next field if appropriate

			var fillDefaults = function() {
				if(!options.class) options.class = "input-medium";
				if(!options.id) options.id = "";
			}

			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if(value==undefined || value==null) value="";
					return controller.$viewValue;
				};
			}

			var finish = function() {
				element.show();
				input.remove();
				editing=false;

				$rootScope.$broadcast('ADE-finish',{'id':options.id, 'old':oldValue, 'new':value, 'exit':exit });

				$scope.$apply();
			}

			//callback once the edit is done			
			var saveEdit = function(ev) {
				oldValue = value;
				value = input.val();

				$scope.$apply(function() {
					return controller.$setViewValue(value);
				});

				finish(); //finish needs to come after the apply so that the new value is applied already
			};
			
			//handles clicks on the read version of the data
			element.bind('click', function() {
				if(editing) return;
				editing=true;
				exit = 0;

				$rootScope.$broadcast('ADE-start',options.id);

				element.hide();				
				$compile('<input type="text" class="'+options.class+'" value="'+value+'" />')($scope).insertAfter(element);
				input = element.next('input');
				input.focus();
				
				//Handles blur of in-line text box
				input.bind("blur",function() {
					saveEdit();
				});
				
				//tracks how you tabbed out of the field, in case you want to focus another field
				input.bind('keydown', function(e) {
					if(e.keyCode==9) { //tab
						e.preventDefault();
						e.stopPropagation();
						exit = e.shiftKey ? -1 : 1;
						saveEdit(); 
					} else if(e.keyCode==27) { //esc
						e.preventDefault();
						e.stopPropagation();
						oldValue = value;
						finish();
					}
				});

				//Handles return/esc key pressed on in-line text box
				input.bind('keypress', function(e) {
					//console.log("ade keypress",e.keyCode);
					if(e.keyCode==13) { //return
						e.preventDefault();
						e.stopPropagation();
						exit = e.shiftKey ? -2 : 2;
						saveEdit(); 
					} 
				});

				//make sure we aren't already digesting/applying before we apply the changes
				if(!$scope.$$phase) {
					return $scope.$apply(); //This is necessary to get the model to match the value of the input
				} 
			});

			// Watches for changes to the element
			return attrs.$observe('adeText', function(settings) { //settings is the contents of the ade-text="" string
				if(angular.isObject(settings)) {
					options = settings; 
				} else if (angular.isString(settings) && settings.length > 0) {
					options = angular.fromJson(settings); //parses the json string into an object 
				}

				fillDefaults();

				return element; //TODO: not sure what to return here
			});

		}
	};
}]);