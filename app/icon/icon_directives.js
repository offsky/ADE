/* ==================================================================
 AngularJS Datatype Editor - Icon
 A directive to choose an icon from a list of many bootstrap icons

 Usage:
 <a ade-icon='{"id":"1234"}' ng-model="data" style="{{data}}"></a>

 Config:
 "id" will be used in messages broadcast to the app on state changes.

 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value}

 ------------------------------------------------------------------*/

adeModule.directive('adeIcon', ['ADE','$compile','$rootScope','$filter', function(ADE,$compile,$rootScope,$filter) {

    var icons = ['envelope', 'heart', 'star', 'user', 'film', 'music', 'search', 'ok', 'signal', 'trash', 'home', 'file', 'time', 'road', 'inbox', 'refresh', 'lock', 'flag', 'headphones', 'barcode', 'tag', 'book', 'print', 'camera', 'off', 'list', 'picture', 'pencil', 'share', 'move'],
        len = icons.length,
        iconsPopupTemplate = '';

    for (var i = 0; i < len; i++) {
        iconsPopupTemplate += '<span class="icon-' + icons[i] +'"></span>';
    }

	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-icon=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var options = {},
                value = "",
                oldValue = "",
                newValue = "";

			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if(value==undefined || value==null) value="";
					return controller.$viewValue;
				};
			}

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
				e.preventDefault();
				e.stopPropagation();

				ADE.begin(options);

				oldValue = value;

                if (!$(element).find('.icons-popup').length){
                    $compile('<div class="icons-popup"><h4>Select an Icon</h4>'+iconsPopupTemplate+'</div>')($scope).insertAfter($(element).find('span'));
                    return;
                }

                value = angular.element(e.target).attr('class').substr(5);
                controller.$setViewValue(value);
                newValue = value;


                // added this to hide the popup when user selects the same icon, this can be removed if hiding popup is not desirable
                if (newValue === oldValue) {
                    $(element).find('.icons-popup').remove();
                }

                ADE.done(options,oldValue,value,0);

				//make sure we aren't already digesting/applying before we apply the changes
				if(!$scope.$$phase) {
					return $scope.$apply(); //This is necessary to get the model to match the value of the input
				}
			});

			// Watches for changes to the element
			return attrs.$observe('adeIcon', function(settings) { //settings is the contents of the ade-icon="" string
				//options = ADE.parseSettings(settings, {class:"input-medium"});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);