/* ==================================================================
	AngularJS Datatype Editor - Text
	A directive to edit text in place

	Usage:
	<div ade-text='{"class":"input-large","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start  
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

adeModule.directive('adeLongtext', ['ADE','$compile','$rootScope',function(ADE,$compile,$rootScope) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-text=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var options = {},
                editing=false,
                txtArea=null,
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
			var saveEdit = function(exited) {
				oldValue = value;
				exit = exited;

                if(exit != 2) {
                    if(exited!=3) { //don't save value on esc
                        value = txtArea.val();
                        controller.$setViewValue(value);
                    }

                    element.show();
                    input.remove();
                    editing=false;

                    ADE.done(options,oldValue,value,exit);

                    if(!$scope.$$phase) {
                        return $scope.$apply(); //This is necessary to get the model to match the value of the input
                    }
                } else {
                    //Enter key should break on a new line
                    var cursorPosition = txtArea[0].selectionStart;
                    var txtAreaValue = txtArea.val();

                    if (txtAreaValue.length <= cursorPosition) {
                        txtArea.val(txtAreaValue+'\n');
                    } else {
                        var txtValBefore = txtAreaValue.substring(0, cursorPosition);
                        var txtValAfter = txtAreaValue.substring(cursorPosition);

                        txtArea.val(txtValBefore+'\n'+txtValAfter);
                        txtArea[0].setSelectionRange((cursorPosition+1),(cursorPosition+1));
                    }
                }
            };

            var editLongText = function(showText) {
                $scope.hidePopup();

                var $linkPopup = element.next('.'+ $scope.adePopupClass +''),
                    elOffset, posLeft, posTop, content;

                if (!showText) {
                    var valueLength = value.length;
                    var numLines = parseInt(valueLength/35, 10); // about 35 letters per line
                    var numNewLines = value.split(/\r?\n|\r/).length;
                    var textareaHeight;

                    // 16 is a line-height value
                    if (numNewLines > numLines) {
                        textareaHeight = numNewLines * 16;
                    } else {
                        textareaHeight = (numLines === 0) ? (numLines+1) * 16 : numLines * 16;
                    }
                }

                content = (showText) ? value : '<textarea class="'+options.className+'" style="height:'+textareaHeight+'px">'+value+'</textarea>';

                if (!$linkPopup.length) {
                    elOffset = element.offset();
                    posLeft = elOffset.left;
                    posTop = elOffset.top + element[0].offsetHeight;
                    $compile('<div class="'+ $scope.adePopupClass +' ade-longtext dropdown-menu open" style="left:'+posLeft+'px;top:'+posTop+'px">'+content+'</div>')($scope).insertAfter(element);
                }

                input = element.next('.ade-longtext');
                txtArea = input.find('textarea');

                if (txtArea.length) {
                    txtArea.focus();
                    ADE.setupBlur(txtArea,saveEdit);
                    ADE.setupKeys(txtArea,saveEdit);
                    txtArea.bind('keyup', function(e) {
                        this.style.height = '1px';
                        this.style.height = (this.scrollHeight)+'px';
                    });
                } else {
                    input.bind('click', function() {
                        editLongText(false);
                    });
                    ADE.setupBlur(input,saveEdit);
                    ADE.setupKeys(input,saveEdit);
                }


                //make sure we aren't already digesting/applying before we apply the changes
                if(!$scope.$$phase) {
                    return $scope.$apply(); //This is necessary to get the model to match the value of the input
                }
            };

            element.bind('mouseenter', function(e)  {
                var $linkPopup = element.next('.'+ $scope.adePopupClass +'');
                if (!$linkPopup.length) {
                    editLongText(true);
                }
            });

            element.bind('mouseleave', function(e) {
                var $linkPopup = element.next('.'+ $scope.adePopupClass +'');
                if ($linkPopup.length && !$linkPopup.find('textarea').length) {
                    $scope.hidePopup();
                }
            });

			//handles clicks on the read version of the data
			element.bind('click', function() {
				if(editing) return;
				editing=true;
				exit = 0;

				ADE.begin(options);

                editLongText(false);
			});
			
			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeLongtext', function(settings) { //settings is the contents of the ade-text="" string
				options = ADE.parseSettings(settings, {className:"input-xlarge"});
				return element;
			});
		}
	};
}]);