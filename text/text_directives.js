/* ==================================================================
	AngularJS Datatype Editor - Text
	
	A directive to edit text in place
------------------------------------------------------------------*/

angular.module('ade', []).directive('adeText', ['$compile',function($compile) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-text=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var inputClass = "";
			var model = "";
			var editing=false;
			var input = null;
			
			//callback once the edit is done			
			var saveEdit = function(ev) {
				element.show();
				input.remove();
				editing=false;
			};
			
			//handles clicks on the read version of the data
			element.bind('click', function() {
				if(editing) return;
				editing=true;
				
				element.hide();				
				$compile('<input ng-model="'+model+'" type="text" class="'+inputClass+'" />')($scope).insertAfter(element);
				input = element.next('input');
				input.focus();
				
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
				
				//make sure we aren't already digesting/applying before we apply the changes
				if(!$scope.$$phase) {
					 //This is necessary to get the model to match the value of the input
					return $scope.$apply();
				} 
			});

			// Watches for changes to the element
			return attrs.$observe('adeText', function(value) { //value is the contents of the ade-text="" string
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