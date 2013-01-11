/* ==================================================================
	AngularJS Datatype Editor - Phone
	A directive to edit a phone field in place

	Usage:
	<div ade-phone='{"class":"input-medium","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start  
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

adeModule.directive('adePhone', ['ADE','$compile','$rootScope','$filter',function(ADE,$compile,$rootScope,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-phone=""></div>

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
                $scope.$apply();
            };

            $scope.editLink = function() {
                editing=true;
                exit = 0;

                ADE.begin(options);

                element.hide();
                $scope.hidePopup();
                $compile('<input type="text" class="'+options.className+'" value="'+value+'" />')($scope).insertAfter(element);
                input = element.next('input');
                input.focus();

                ADE.setupBlur(input,saveEdit);
                ADE.setupKeys(input,saveEdit);

                if(!$scope.$$phase) {
                    return $scope.$apply();
                }
            };

            $("body").on("keyup", function(ev) {
                if(ev.keyCode === 27 && editing) {
                    saveEdit(3);
                    $scope.hidePopup();
                }
            });

            //handles clicks on the read version of the data
            element.bind('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var $linkPopup = element.next('.'+ $scope.adePopupClass +''),
                    linkString, elOffset, posLeft, posTop;

                if(editing) return;

                if (value !== "" && $filter('phone')(value).match('tel')) {
                    if (!$linkPopup.length) {
                        linkString = (!value.match('tel')) ? "tel:"+value : value;
                        elOffset = element.offset();
                        posLeft = elOffset.left;
                        posTop = elOffset.top + element[0].offsetHeight;
                        $compile('<div class="'+ $scope.adePopupClass +' ade-links dropdown-menu open" style="left:'+posLeft+'px;top:'+posTop+'px"><a ng-click="saveEdit()" class="icon icon-remove">close</a><a class="'+$scope.miniBtnClasses+'" href="'+linkString+'">Call</a> or <a class="'+$scope.miniBtnClasses+'" ng-click="editLink()">Edit Link</a></div>')($scope).appendTo('body');
                    }
                } else {
                    $scope.editLink();
                }
			});
			
			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adePhone', function(settings) { //settings is the contents of the ade-phone="" string
				options = ADE.parseSettings(settings, {className:"input-medium"});
				return element;
			});
		}
	};
}]);