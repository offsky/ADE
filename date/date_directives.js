/* ==================================================================

------------------------------------------------------------------*/

angular.module('bDatepicker', []).directive('bDatepicker', function($filter){
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div b-datepicker=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var format = "mm/dd/yyy";

			element.bind('blur', function() {
				var unix = parseDateString(this.value);
				//I thought I needed a blur handler, but it looks like it might not be necessary
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
						element.datepicker().data().datepicker.date = controller.$viewValue; //TODO: is this line necessary
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
			return attrs.$observe('bDatepicker', function(value) { //value is the contents of the b-datepicker="" string
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
})

/* ==================================================================
	
------------------------------------------------------------------*/
.directive('adeDate', function() {
	var editing=false;
	
	return function($scope, elem, attrs ) {
		elem.bind('click', function() {
			if(editing) return;
			editing=true;
			
			var options = {};
			if(angular.isObject(attrs.adeDate)) options = attrs.adeDate; 
			
			if (typeof(attrs.adeDate) === "string" && attrs.adeDate.length > 0) {
				options = angular.fromJson(attrs.adeDate); //parses the json string into an object 
			}
			console.log(options);
			
			elem.children('.adehide').hide();
			elem.append('<input b-datepicker=\'{"format":"MMM d, yyyy"}\' ng-model="date" type="text" class="'+options.class+'" />');
			//elem.children('input').focus();
			
			if(!$scope.$$phase) { //make sure we aren't already digesting/applying
				 //This is necessary to get the model to match the value of the input
				return $scope.$apply(function() {
					//return controller.$setViewValue(dateStr);
				});
			} 
			
		});
	};
})

/* ==================================================================
	
------------------------------------------------------------------*/
.directive('adeDateTime', function() {
	return function( scope, elem, attrs ) {
		elem.bind('click', function() {
			console.log("click()");
			
		});
	};
})

/* ==================================================================
	
------------------------------------------------------------------*/
.directive('adeYear', ['$compile',function($compile) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div b-datepicker=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var inputClass = "";
			var model = "";
			var editing=false;
			var input = null;
			
			//callback once the edit is done			
			var saveEdit = function(ev) {
				var unix = parseDateString(this.value);
				element.show();
				input.remove();
				editing=false;
			};
			
			//handles clicks on the read version of the data
			element.bind('click', function() {
				if(editing) return;
				editing=true;
				
				element.hide();				
				$compile('<input b-datepicker=\'{"format":"yyyy","viewMode":2,"minViewMode":2}\' ng-model="'+model+'" type="text" class="'+inputClass+'" />')($scope).insertAfter(element);
				input = element.next('input');
				//input.focus();
				
				//Handles blur of in-line text box
				input.bind("blur",function() {
					saveEdit();
				});
				
				//Handles return key pressed on in-line text box
				input.bind('keyup', function(e) {
					if(e.keyCode==13) {
						saveEdit(); //return key
					}
				});
				
				
				
				if(!$scope.$$phase) { //make sure we aren't already digesting/applying
					 //This is necessary to get the model to match the value of the input
					return $scope.$apply();
				} 
			});

			// Initialization code run for each directive instance once
			return attrs.$observe('adeYear', function(value) { //value is the contents of the ade-year="" string
				var options = {};
				if(angular.isObject(value)) options = value; 
				
				if (typeof(value) === "string" && value.length > 0) {
					options = angular.fromJson(value); //parses the json string into an object 
				}
				if(options.class) inputClass = options.class;
				if(options.model) model = options.model;
				
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