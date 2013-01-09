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

    if (len > 0) iconsPopupTemplate = '<a class="icon-_clear" ng-click="saveEdit(0, \'_clear\')">clear</a>';
    for (var i = 0; i < len; i++) {
        var iconName = icons[i];
        iconsPopupTemplate += '<span class="icon-' + icons[i] +'" ng-click="saveEdit(0, \''+iconName+'\')"></span>';
    }

	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-icon=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var options = {},
                value = "",
                oldValue = "",
                iconPopupClass = 'ade-icons-popup',
                exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate

			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if(value==undefined || value==null) value="";
					return controller.$viewValue;
				};
			}

            $scope.hidePopup = function() {
                element.next('.'+ iconPopupClass +'').remove();
            };

            $("body").on("keyup", function(ev) {
                if(ev.keyCode === 27) {
                    $scope.saveEdit(3);
                    $scope.hidePopup();
                }
            });

            $("body").on("click", function(ev) {
                var clickTarget = angular.element(ev.target),
                    attrClass = clickTarget.attr('class') || "";
                if (!attrClass.match('icon')) {
                    $scope.saveEdit();
                    $scope.hidePopup();
                }
            });

            $scope.saveEdit = function(exited, newValue) {
                oldValue = value;
                value = newValue || oldValue;
                exit = exited;

                if (exit !== 3) {
                    //don't save value on esc
                    controller.$setViewValue(value);
                }

                $scope.hidePopup();

                ADE.done(options,oldValue,value,exit);

                if(!$scope.$$phase) {
                    return $scope.$apply(); //This is necessary to get the model to match the value of the input
                }

            };

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
				e.preventDefault();
				e.stopPropagation();

                ADE.begin(options);

                var $iconPopup = $(element).find('.ade-icons-popup'),
                    clickTarget = angular.element(e.target),
                    attrClass = clickTarget.attr('class');

				oldValue = value;

                if (angular.isDefined(attrClass) && attrClass.match('icon').length && clickTarget.parent()[0] == element[0]) {
                    if (!$iconPopup.length){   //don't popup a second one
                        $compile('<div class="ade-icons-popup dropdown-menu"><h4>Select an Icon</h4>'+iconsPopupTemplate+'</div>')($scope).insertAfter(element);
                    }
                }

                if(!$scope.$$phase) {
                    return $scope.$apply(); //This is necessary to get the model to match the value of the input
                }
			});

			// Watches for changes to the element
			return attrs.$observe('adeIcon', function(settings) { //settings is the contents of the ade-icon="" string
				options = ADE.parseSettings(settings, {});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);