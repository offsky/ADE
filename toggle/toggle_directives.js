/* ==================================================================
 AngularJS Datatype Editor - Toggle
 A directive to toggle a star, checkbox or other icon

 Usage:
 <a ade-toggle='{"id":"1234"}' ng-model="data" style="{{data}}"></a>

 Config:
 "id" will be used in messages broadcast to the app on state changes.

 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value}

 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeToggle', ['ADE','$compile','$filter', function(ADE,$compile,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-toggle=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var value = "";
			var oldValue = "";
			var newValue = "";
			var id = "";

			if (controller !== null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if(value === undefined || value === null) value = '';
					return controller.$viewValue;
				};
			}

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
				e.preventDefault();
				e.stopPropagation();

				ADE.begin(options);

				oldValue = value;
				value = (value) ? false : true;
				newValue = value;

				controller.$setViewValue(value);

				ADE.done(options,oldValue,value,0);

				scope.$digest(); //This is necessary to get the model to match the value of the input
			});

			// Watches for changes to the element
			return attrs.$observe('adeToggle', function(settings) { //settings is the contents of the ade-toggle="" string
				options = ADE.parseSettings(settings, {});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);