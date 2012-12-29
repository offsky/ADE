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
 data: {id from config, old value, new value}

 ------------------------------------------------------------------*/

adeModule.directive('adeRating', ['$compile','$rootScope', '$filter', function($compile,$rootScope,$filter) {
    return {
        require: '?ngModel', //optional dependency for ngModel
        restrict: 'A', //Attribute declaration eg: <div ade-rating=""></div>

        //The link step (after compile)
        link: function($scope, element, attrs, controller) {
            var rating = null,
                bgPosition = "",
                value = "",
                oldValue = "",
                newValue = "",
                id = "";

            if (controller != null) {
                controller.$render = function() { //whenever the view needs to be updated
                    oldValue = value = controller.$modelValue;
                    return controller.$viewValue;
                };
            }

            //handles clicks on the read version of the data
            element.bind('click', function(event) {

                $rootScope.$broadcast('ADE-start',id);
                oldValue = value;
                starWidth = 23;
                clickPosition = angular.element(event.target).data('position');
                value = clickPosition;
                newValue = value;

                bgPosition = $filter('rating')(value);

                $compile(bgPosition)($scope).insertAfter(element);
                rating = element.next('div');
                rating.remove();

                $rootScope.$broadcast('ADE-finish',{'id':id, 'old':oldValue, 'new': newValue});

                $scope.$apply(function() {
                    return controller.$setViewValue(value);
                });

                //make sure we aren't already digesting/applying before we apply the changes
                if(!$scope.$$phase) {
                    return $scope.$apply(); //This is necessary to get the model to match the value of the input
                }
            });

            // Watches for changes to the element
            return attrs.$observe('adeRating', function(settings) { //settings is the contents of the ade-rating="" string
                var options = {};
                if(angular.isObject(settings)) options = settings;

                if (typeof(settings) === "string" && settings.length > 0) {
                    options = angular.fromJson(settings); //parses the json string into an object
                }
                if(options.id) id = options.id;

                return element; //TODO: not sure what to return here
            });

        }
    };
}]);