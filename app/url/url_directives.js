/* ==================================================================
	AngularJS Datatype Editor - URL
	A directive to edit a url field in place

	Usage:
	<div ade-url='{"class":"input-medium","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start  
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

adeModule.directive('adeUrl', ['ADE','$compile','$rootScope', '$filter', function(ADE, $compile,$rootScope,$filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-url=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var options = {}, //The passed in options to the directive.
			    editing=false,
                input = null,
                value = "",
                oldValue = "",
                linkPopupClass = 'ade-link-popup',
                exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate

			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if(value==undefined || value==null) value="";
					return controller.$viewValue;
				};
			}

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {

				oldValue = value;
				exitCode = exited;

				if (exitCode !== 3) {
				    //don't save value on esc
                    if (input) {
					    value = input.val();
					    controller.$setViewValue(value);
                    }
				}

				element.show();
				(input) ? input.remove(): $scope.hidePopup();
				editing=false;

				ADE.done(options,oldValue,value,exitCode);

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
                    return $scope.$apply(); //This is necessary to get the model to match the value of the input
                }
            };

            $scope.hidePopup = function() {
                element.next('.'+ linkPopupClass +'').remove();
            };

            $("body").on("keyup", function(ev) {
                if(ev.keyCode === 27) {
                    saveEdit(3);
                    $scope.hidePopup();
                }
            });

            $("body").on("click", function(ev) {
                if (ev.target !== element) $scope.hidePopup();
            });

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
                var $linkPopup = element.next('.'+ linkPopupClass +'');

                //if (e.target == $(element).find('a')[0]) {
                    e.preventDefault();
                    e.stopPropagation();
                //}

				if(editing) return;

                if (value !== "" && value.match('http')) {
				    if (!$linkPopup.length) {
                        $compile('<div class="'+ linkPopupClass +' dropdown-menu"><a href="'+value+'">Follow Link</a> or <a ng-click="editLink()">Edit Link</a></div>')($scope).insertAfter(element);
                    }
                } else {
                   $scope.editLink();
                }
			});

			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeUrl', function(settings) { //settings is the contents of the ade-url="" string
				options = ADE.parseSettings(settings, {className:"input-medium"});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);