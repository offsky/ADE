/* ==================================================================
 AngularJS Datatype Editor - Toggle
 A directive to toggle a star, checkbox or other icon

 Usage:
 <a ade-toggle ade-id="1234" ade-class="ade-star" ng-model="data"></a>

Config:

ade-id:
	If this id is set, it will be used in messages broadcast to the app on state changes.
ade-class:
	A custom class to give to the div so that you can use your own images
ade-readonly:
	If you don't want the stars to be editable
ade-truthy:
	The value you want the model to have when the checkbox is checked. Defaults to true.

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

		scope: {
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			adeTruthy: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var starClass = "icon-star";
			var readonly = false;
			var truthy = true;

			if(scope.adeClass!==undefined) starClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeTruthy!==undefined) truthy = scope.adeTruthy;
			
			//generates HTML for the star
			var makeHTML = function() {
				var input = scope.ngModel;
				if(angular.isArray(input)) input = input[0];
				if(angular.isString(input)) {
					input = input.toLowerCase();
					if(input=='false' || input=='no' || input=='0' || input=='o') input = false;
				}
				var editable = (readonly ? "" : " ade-editable");
				var state = (input==truthy ? '' : '-empty');

				var hoverable = " ade-hover";
				var userAgent = window.navigator.userAgent;
				if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
   				hoverable = ""; //iOS web views do a weird thing with hover effects on touch
				}

				element.html('<span class="ade-toggle '+editable+hoverable+' '+starClass+state+'">');
			}

			var clickHandler = function(e) {
				e.preventDefault();
				e.stopPropagation();

				ADE.begin(scope.adeId);

				var oldValue = scope.ngModel;

				if(scope.ngModel!=truthy) scope.ngModel = truthy;
				else scope.ngModel = false;

				ADE.done(scope.adeId, oldValue, scope.ngModel, 0);

				if($(element).is(':hover')) {
					//It would be nice to remove the hover effect until you leave and rehover
					//would need to register mouseout and touchmove events. yuck
				}
			};

			var focusHandler = function(e) {
				element.on('keypress.ADE', function(e) {
					if (e.keyCode == 13) { //return
						e.preventDefault();
						e.stopPropagation();
						element.click();
					}
				});
			};
			
			//setup events
			if(!readonly) {
				element.on('click.ADE', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					})
				});
				element.on('focus.ADE',  function(e) {
					scope.$apply(function() {
						focusHandler(e);
					})
				});
				element.on('blur.ADE', function(e) {
					element.off('keypress.ADE');
				});
			}

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				if(element) {
					element.off('click.ADE');
					element.off('focus.ADE');
					element.off('blur.ADE');
					element.off('keypress.ADE');
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