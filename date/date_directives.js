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
		restrict: 'A', //Attribute declaration eg: <div ade-date=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var editing=false;
			var input = null;
			var value = null;
			var oldValue = null;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return. controls if you exited the field so you can focus the next field if appropriate

			var fillDefaults = function() {
				if(!options.class) options.class = "input-medium";
				if(!options.format) options.format = "MMM d, yyyy";
				if(!options.id) options.id = "";
			}

			// called at the begining if there is pre-filled data that needs to be preset in the popup
			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if(value==undefined || value==null) value="";
					return controller.$viewValue;
				};
			}
			
			var finish = function() {
				element.show();
				input.datepicker('remove');
				input.remove();
				editing=false;

				$rootScope.$broadcast('ADE-finish',{'id':options.id, 'old':oldValue, 'new':value, 'exit':exit });

				$scope.$apply();
			}

			//callback once the edit is done			
			var saveEdit = function(ev) {
				oldValue = value;
				value = parseDateString(input.val());
			
				$scope.$apply(function() {
					return controller.$setViewValue(value);
				});
			
				finish();
			};
						
			//handles clicks on the read version of the data
			element.bind('click', function() {
				if(editing) return;
				editing=true;
				exit = 0;
				
				$rootScope.$broadcast('ADE-start',options.id);

				element.hide();
				var extraDPoptions = "";
				if(options.format=='yyyy') extraDPoptions = ',"viewMode":2,"minViewMode":2';
				$compile('<input ade-calpop=\'{"format":"'+options.format+'"'+extraDPoptions+'}\' ng-model="adePickDate" ng-init="adePickDate='+value+'" type="text" class="'+options.class+'" />')($scope).insertAfter(element);
				input = element.next('input');
				
				input.focus(); //I do not know why both of these are necessary, but they are
				$timeout(function() { input.focus(); },1);
			
				//Handles blur of in-line text box
				input.bind("blur",function() {
					saveEdit();
				});
				
				//tracks how you tabbed out of the field, in case you want to focus another field
				input.bind('keydown', function(e) {
					//console.log("ade keydown",e.keyCode);
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

				if(!$scope.$$phase) { //make sure we aren't already digesting/applying
					return $scope.$apply(); //This is necessary to get the model to match the value of the input
				} 
			});

			// Initialization code run for each directive instance once
			return attrs.$observe('adeDate', function(settings) { //settings is the contents of the ade-text="" string
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



/*
References

https://groups.google.com/forum/?fromgroups=#!topic/angular/ERUVRR8vZW0
http://www.eyecon.ro/bootstrap-datepicker/
https://gist.github.com/3103533
https://gist.github.com/3135128

Alternative: https://github.com/angular-ui/angular-ui/tree/master/modules/directives/date

http://docs.angularjs.org/guide/directive	
*/