/* ==================================================================
	AngularJS Datatype Editor - Email
	A directive to edit an email field in place

	Usage:
	<div ade-email='{"class":"input-medium","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start  
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

adeModule.directive('adeEmail', ['ADE','$compile','$rootScope', '$filter', function(ADE,$compile,$rootScope,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-email=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
            var options = {}, //The passed in options to the directive.
                editing=false,
                input = null,
                value = "",
                oldValue = "",
                exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate

			//whenever the model changes, we get called so we can update our value
			if (controller != null) {
				controller.$render = function() { 
					oldValue = value = controller.$modelValue;
					if(value==undefined || value==null) value="";
					return controller.$viewValue;
				};
			}

			//called once the edit is done, so we can save the new data	and remove edit mode
			$scope.saveEdit = function(exited) {
                oldValue = value;
                exit = exited;

                if (exit !== 3) {
                    //don't save value on esc
                    if (input) {
                        value = input.val();
                        controller.$setViewValue(value);
                    }
                }

                element.show();
                (input) ? input.remove(): $scope.hidePopup();
                editing=false;

                ADE.done(options,oldValue,value,exit);
                if(!$scope.$$phase) {
                    return $scope.$apply();
                }
            };

            $scope.editLink = function() {
                event.preventDefault();
                event.stopPropagation();
                editing=true;
                exit = 0;

                ADE.begin(options);

                element.hide();
                $scope.hidePopup();
                $compile('<input type="text" class="'+options.className+'" value="'+value+'" />')($scope).insertAfter(element);
                input = element.next('input');
                input.focus();

                ADE.setupBlur(input,$scope.saveEdit);
                ADE.setupKeys(input,$scope.saveEdit);

                if(!$scope.$$phase) {
                    return $scope.$apply();
                }
            };

            angular.element('body').bind("keyup", function(ev) {
                if(ev.keyCode === 27 && editing) {
                    $scope.saveEdit(3);
                } else {
                    angular.element(".dropdown-menu.open").removeClass("open").remove();
                }
            });

            angular.element('body').bind("click", function(e) {
                if (e.target != element[0] && editing) $scope.saveEdit(0);
                angular.element(".dropdown-menu.open").removeClass("open").remove();
            });

            //handles clicks on the read version of the data
            element.bind('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var $linkPopup = element.next('.'+ $scope.adePopupClass +''),
                    linkString, elOffset, posLeft, posTop;

                if(editing) return;

                if (value !== "" && $filter('email')(value).match('mailto')) {
                    if (!$linkPopup.length) {
                        linkString = (!value.match('mailto')) ?  "mailto:"+value : value;
                        elOffset = element.offset();
                        posLeft = elOffset.left;
                        posTop = elOffset.top + element[0].offsetHeight;
                        $compile('<div class="'+ $scope.adePopupClass +' ade-links dropdown-menu open" style="left:'+posLeft+'px;top:'+posTop+'px"><a ng-click="saveEdit()" class="icon icon-remove">close</a><a class="'+$scope.miniBtnClasses+'" href="'+linkString+'">Email Link</a> or <a class="'+$scope.miniBtnClasses+'" ng-click="editLink()">Edit Link</a></div>')($scope).insertAfter(element);
                    }
                } else {
                    $scope.editLink();
                }
			});

			// Watches for changes to the element
			return attrs.$observe('adeEmail', function(settings) { //settings is the contents of the ade-email="" string
				options = ADE.parseSettings(settings, {className:"input-medium"});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);