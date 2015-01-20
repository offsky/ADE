/* ==================================================================
 AngularJS Datatype Editor - Multi-state 
 A directive to toggle an icon between N states

 Usage:
 <a ade-multi ade-id="1234" ade-classes="['ade-unstar','ade-star''ade-superstar']" ng-model="data"></a>

Config:

ade-id:
	If this id is set, it will be used in messages broadcast to the app on state changes.
ade-classes:
	An array of custom classes to give to the div so that you can use your own images
ade-readonly:
	If you don't want the stars to be editable


 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value}

 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeMulti', ['ADE','$compile','$filter', function(ADE,$compile,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-multi=""></div>

		scope: {
			adeId: "@",
			adeClasses: "@",
			adeReadonly: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var iconClasses = ["icon-star-empty","icon-star","icon-heart"];
			var readonly = false;

			if(scope.adeClasses!==undefined) iconClasses = angular.fromJson(scope.adeClasses);
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;

			//generates HTML for the star
			var makeHTML = function() {
				var input = scope.ngModel;
				if(angular.isArray(input)) input = input[0];
				if(angular.isString(input)) {
					input = input.toLowerCase();
					if(input=='false' || input=='no') input = 0;
					if(input=='true' || input=='yes') input = 1;
				}
				input = parseInt(input);
				if(isNaN(input)) input = 0;

				scope.ngModel = input;
				
				var editable = (readonly ? "" : " ade-editable");
				var state = '';
				if(iconClasses.length>input) state = iconClasses[input];

				var hoverable = " ade-hover";
				var userAgent = window.navigator.userAgent;
				if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
   				hoverable = ""; //iOS web views do a weird thing with hover effects on touch
				}

				element.html('<span class="ade-multi '+editable+hoverable+' '+state+'">');
			}

			var clickHandler = function(e) {
				e.preventDefault();
				e.stopPropagation();

				ADE.begin(scope.adeId);

				var oldValue = scope.ngModel;

				scope.ngModel = parseInt(scope.ngModel);
				if(isNaN(scope.ngModel)) scope.ngModel = 0;
				else scope.ngModel++;

				if(scope.ngModel>=iconClasses.length) scope.ngModel = 0;

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