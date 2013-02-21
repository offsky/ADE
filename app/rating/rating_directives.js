/* ==================================================================
 AngularJS Datatype Editor - Rating
 A directive to toggle rating icon

 Usage:
 <a ade-rating='{"id":"1234"}' ng-model="data" style="{{data}}"></a>

 Config:
 "id" will be used in messages broadcast to the app on state changes.

 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value, exit value}

 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeRating', ['ADE','$compile', '$filter', function(ADE, $compile,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-rating=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {},
				value = "",
				oldValue = "",
				newValue = "";

			if (controller !== null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					return controller.$viewValue;
				};
			}

			//handles clicks on the read version of the data
			element.bind('click', function(event) {

				ADE.begin(options);

				oldValue = value;
				value = angular.element(event.target).data('position');
				newValue = value;

				ADE.done(options,oldValue,value,0);

				controller.$setViewValue(value);
				scope.$digest(); //This is necessary to get the model to match the value of the input
			});

			// Watches for changes to the element
			return attrs.$observe('adeRating', function(settings) { //settings is the contents of the ade-rating="" string
				options = ADE.parseSettings(settings, {});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);