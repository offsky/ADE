/* ==================================================================
	AngularJS Datatype Editor - Email
	A directive to edit an email field in place

	Usage:
	<div ade-email='{"class":"input-medium","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start  
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value}

------------------------------------------------------------------*/
var URL_REGEXP = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

adeModule.directive('adeEmail', ['$compile','$rootScope', '$filter', function($compile,$rootScope,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-email=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var inputClass = "input-medium";
			var editing=false;
			var input = null;
			var value = "";
			var oldValue = "";
			var id = "";

			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					return controller.$viewValue;
				};
			}

			var finish = function() {
                element.show();
                input.remove();
				editing=false;

				$rootScope.$broadcast('ADE-finish',{'id':id, 'old':oldValue, 'new':value});
			}

			//callback once the edit is done			
			var saveEdit = function() {
				oldValue = value;
				value = input.val();

				finish();

				$scope.$apply(function() {
					return controller.$setViewValue(value);
				});
			};
			
			//handles clicks on the read version of the data
			element.bind('click', function() {
				if(editing) return;
                editing=true;

				$rootScope.$broadcast('ADE-start',id);

				element.hide();

                value = $scope.emailstring;

				$compile('<input type="text" class="'+inputClass+'" value="'+value+'" />')($scope).insertAfter(element);
				input = element.next('input');
				input.focus();
				
				//Handles blur of in-line text box
				input.bind("blur",function() {
					saveEdit();
				});
				
				//Handles return key pressed on in-line text box
				input.bind('keyup', function(e) {
					if(e.keyCode==13) { //return key
						saveEdit(); 
					} else if(e.keyCode==27) { //esc
						finish();
					}
				});
				
				//make sure we aren't already digesting/applying before we apply the changes
				if(!$scope.$$phase) {
					return $scope.$apply(); //This is necessary to get the model to match the value of the input
				} 
			});

			// Watches for changes to the element
			return attrs.$observe('adeEmail', function(settings) { //settings is the contents of the ade-currency="" string
				var options = {};
				if(angular.isObject(settings)) options = settings; 
				
				if (typeof(settings) === "string" && settings.length > 0) {
					options = angular.fromJson(settings); //parses the json string into an object 
				}
				if(options.class) inputClass = options.class;
				if(options.id) id = options.id;

				return element; //TODO: not sure what to return here
			});

		}
	};
}]);