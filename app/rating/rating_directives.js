/* ==================================================================
	AngularJS Datatype Editor - Rating
	A directive to toggle rating icon

	Usage:
	<div ade-rating ade-id='1234' ade-num="10" ade-arrows="1" ng-model="data"></div>

	Config:

	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-num:
	 	The number of stars or maximum value for this number
	ade-arrows:
	 	1 to support arrow keys for setting the value
	ade-class:
		A custom class to give to the div so that you can use your own images.
		For icons in the off state, the class will be have "-empty" appended to it.
	ade-width:
		If you use a custom class with different sized images, set the width here
	ade-readonly:
		If you don't want the stars to be editable
	
	 Messages:
	 name: ADE-start
	 data: id from config

	 name: ADE-finish
	 data: {id from config, old value, new value, exit value}

 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeRating', ['ADE', '$compile', '$filter', function(ADE, $compile,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-rating=""></div>

		scope: {
			adeId: "@",
			adeNum: "@",
			adeArrows: "@",
			adeClass: "@",
			adeWidth: "@",
			adeReadonly: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var numStars = 5;
			var starWidth = 23;
			var starClass = "icon-star";
			var readonly = false;

			if(scope.adeNum!==undefined) numStars = parseInt(scope.adeNum);
			if(scope.adeWidth!==undefined) starWidth = parseInt(scope.adeWidth);
			if(scope.adeClass!==undefined) starClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			
			var containerW = starWidth * numStars + 10; //10 is for the width of "0 stars" clicable region

			//generates the html for the stars
			var makeHTML = function() {
				var starStatusClass = "-empty";
				var editable = (readonly ? "" : " ade-editable");

				var hoverable = " ade-hover";
				var userAgent = window.navigator.userAgent;
				if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
   				hoverable = ""; //iOS web views do a weird thing with hover effects on touch
				}

				var html = '<div class="ade-rating'+editable+hoverable+'" style="width:'+containerW+'px;">';
				html += '<div class="ade-rate-container">';

				var curVal = parseInt(scope.ngModel);
				
				for (var i = 0; i <= numStars; i++) {
					starStatusClass = (i <= curVal) ? "" : "-empty";
					if (i === 0) {
						html += '<a class="ade-rate-one ade-zero" data-position="'+(i)+'">&nbsp;</a>';
					} else {
						html += '<a class="ade-rate-one '+starClass+starStatusClass+' ade-rate'+starStatusClass+'" data-position="'+(i)+'"></a>';
					}
				}

				html += '</div></div>';
				element.html(html);
			};

			//handles the click or keyboard events
			var change = function(val) {
				ADE.begin(scope.adeId);

				//cap val at max
				if (val > numStars) val = numStars;
				if (val < 0) val = 0;

				var oldValue = scope.ngModel;
				scope.ngModel = val;

				makeHTML();

				ADE.done(scope.adeId, oldValue, scope.ngModel, 0);
			};

			//handles clicks on the read version of the data
			var clickHandler = function(e) {
				var val = angular.element(e.target).data('position');
				if (val !== undefined) change(val);
			};

			//on focus, starts watching keyboard
			var focusHandler = function(e) {
				element.on('keydown.ADE', function(e) {
					//console.log(e.keyCode);
					if (e.keyCode >= 96 && e.keyCode <= 105) { //num pad
						e.preventDefault();
						e.stopPropagation();
						change(e.keyCode - 96);
					} else if (e.keyCode >= 48 && e.keyCode <= 57) { //numbers
						e.preventDefault();
						e.stopPropagation();
						change(e.keyCode - 48);
					} else if (e.keyCode == 37 && scope.adeArrows) { //left
						e.preventDefault();
						e.stopPropagation();
						change(scope.ngModel - 1);
					} else if (e.keyCode == 39 && scope.adeArrows) { //right
						e.preventDefault();
						e.stopPropagation();
						if(!angular.isNumber(scope.ngModel)) scope.ngModel = 0;
						change(scope.ngModel + 1);
					}
				});

				element.on('blur.ADE', function(e) {
					element.off('keydown.ADE'); //on blur, stop watching keyboard
				});
			};

			//setup events
			if(!readonly) {
				element.on('click.ADE', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					})
				});
				element.on('focus.ADE',function(e) {
					scope.$apply(function() {
						focusHandler(e);
					})
				});
			}

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				if(element) {
					element.off();
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
