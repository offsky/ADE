/* ==================================================================
	Directive to present a date picker on an input
------------------------------------------------------------------*/

adeModule.directive('adeCalpop', function($filter){
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div b-datepicker=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var format = "mm/dd/yyy";

			//Handles return key pressed on in-line text box
			element.bind('keyup', function(e) {
				if(e.keyCode==13) { //return key
					element.datepicker('hide');
					element.blur();
				} else if(e.keyCode==27) { //esc
					element.datepicker('hide');
				}
			});
			
			//creates a callback for when something is picked from the popup
			var updateModel = function(ev) {
				var dateStr = "";
				if(ev.date) dateStr = $filter('date')(ev.date,format);
				
				element.context.value = dateStr;

				if(!$scope.$$phase) { //make sure we aren't already digesting/applying
				 	//This is necessary to get the model to match the value of the input
					return $scope.$apply(function() {
						return controller.$setViewValue(dateStr);
					});
				}
			};

			// called at the begining if there is pre-filled data that needs to be preset in the popup
			if (controller != null) {
				controller.$render = function() {
					if(controller.$viewValue) {
						element.datepicker().data().datepicker.date = controller.$viewValue; //TODO: is this line necessary?
						element.datepicker('setValue',controller.$viewValue);
						element.datepicker('update');
					} else if(controller.$viewValue===null) {
						element.datepicker('setValue',null);
						element.datepicker('update');
					}
					return controller.$viewValue;
				};
			}

			// Initialization code run for each directive instance.  Enables the bootstrap datepicker object
			return attrs.$observe('adeCalpop', function(value) { //value is the contents of the b-datepicker="" string
				var options = {};
				if(angular.isObject(value)) options = value; 
				
				if (typeof(value) === "string" && value.length > 0) {
					options = angular.fromJson(value); //parses the json string into an object 
				}
				if(options.format) format = options.format;
				
				return element.datepicker(options).on('changeDate', updateModel);
			});

		}
	};
});

/* ==================================================================
	Directive to display a calendar for picking a year
------------------------------------------------------------------*/
adeModule.directive('adeDate', ['$compile','$timeout','$rootScope',function($compile,$timeout,$rootScope) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div b-datepicker=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var inputClass = "input-medium";
			var format = "MMM d, yyyy";
			var editing=false;
			var input = null;
			var value = null;
			var oldValue = null;
			var id = "";
			
			// called at the begining if there is pre-filled data that needs to be preset in the popup
			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					return controller.$viewValue;
				};
			}
			
			var finish = function() {
				element.show();
				input.datepicker('remove');
				input.remove();
				editing=false;

				$rootScope.$broadcast('ADE-finish',{'id':id, 'old':oldValue, 'new':value});
			}

			//callback once the edit is done			
			var saveEdit = function(ev) {
				oldValue = value;
				value = parseDateString(input.val());
				
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
				var extraDPoptions = "";
				if(format=='yyyy') extraDPoptions = ',"viewMode":2,"minViewMode":2';
				$compile('<input ade-calpop=\'{"format":"'+format+'"'+extraDPoptions+'}\' ng-model="adePickDate" ng-init="adePickDate='+value+'" type="text" class="'+inputClass+'" />')($scope).insertAfter(element);
				input = element.next('input');
				
				input.focus(); //I do not know why both of these are necessary, but they are
				$timeout(function() { input.focus(); },1);
			
				//Handles blur of in-line text box
				input.bind("blur",function() {
					saveEdit();
				});
				
				//Handles escape key reverting change
				input.bind('keyup', function(e) {
					if(e.keyCode==27) { //esc
						finish();
					}
				});

				if(!$scope.$$phase) { //make sure we aren't already digesting/applying
					return $scope.$apply(); //This is necessary to get the model to match the value of the input
				} 
			});

			// Initialization code run for each directive instance once
			return attrs.$observe('adeDate', function(settings) { //settings is the contents of the ade-year="" string
				var options = {};
				if(angular.isObject(settings)) options = settings; 
				
				if (typeof(settings) === "string" && settings.length > 0) {
					options = angular.fromJson(settings); //parses the json string into an object 
				}
				if(options.class) inputClass = options.class;
				if(options.format) format = options.format;
				if(options.id) id = options.id;
				
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