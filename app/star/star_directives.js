/* ==================================================================
 AngularJS Datatype Editor - Star / Checkbox
 A directive to toggle star / checkbox icon

 Usage:
 <a ade-star='{"id":"1234"}' ng-model="data" style="{{data}}"></a>

 Config:
 "id" will be used in messages broadcast to the app on state changes.

 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value}

 ------------------------------------------------------------------*/

adeModule.directive('adeStar', ['$compile','$rootScope', '$filter', function($compile,$rootScope,$filter) {
    return {
        require: '?ngModel', //optional dependency for ngModel
        restrict: 'A', //Attribute declaration eg: <div ade-star=""></div>

        //The link step (after compile)
        link: function($scope, element, attrs, controller) {
            var value = "",
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
            element.bind('click', function() {

                $rootScope.$broadcast('ADE-start',id);
                oldValue = value;
                value = (value) ? false : true;
                newValue = value;

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
            return attrs.$observe('adeStar', function(settings) { //settings is the contents of the ade-star="" string
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