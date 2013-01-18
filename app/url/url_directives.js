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

adeModule.directive('adeUrl', ['ADE', '$compile', '$rootScope', '$filter', function(ADE, $compile, $rootScope, $filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-url=""></div>

		//The link step (after compile)
		link: function($scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var editing = false;
			var input = null;
			var value = '';
			var oldValue = '';
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null;
			var popup = null; //reference to the DOM popup object

			if (controller != null) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if (value == undefined || value == null) value = '';
					return controller.$viewValue;
				};
			}

			//called once the edit is done, so we can save the new data and remove edit mode
			$scope.saveUrl = function(exited) {
				console.log('saving', exited);
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
				$scope.hidePopup();
				if (input) input.remove();
				editing = false;

				ADE.done(options, oldValue, value, exit);
				if (!$scope.$$phase) {
					return $scope.$apply();
				}
			};

			//called to enter edit mode on a url. happens immediatly for non-urls or after a popup confirmation for urls
			$scope.editUrl = function() {
				if (timeout) window.clearTimeout(timeout); //cancels the delayed blur of the popup
				event.preventDefault();
				event.stopPropagation();
				editing = true;
				exit = 0;

				ADE.begin(options);

				element.hide(); //hide the read only data
				$scope.hidePopup();
				$compile('<input type="text" class="' + options.className + '" value="' + value + '" />')($scope).insertAfter(element);
				input = element.next('input');
				input.focus();

				ADE.setupBlur(input, $scope.saveUrl);
				ADE.setupKeys(input, $scope.saveUrl);

				if (!$scope.$$phase) {
					return $scope.$apply(); //This is necessary to get the model to match the value of the input
				}
			};

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
				e.preventDefault(); //these two lines prevent the click on the link from actually taking you there
				e.stopPropagation();
				var $linkPopup = element.next('.' + $scope.adePopupClass + '');
				var elOffset;
				var posLeft;
				var posTop;

				if (editing) return;

				if (value !== '' && $filter('url')(value).match('http')) { //if it matches as a URL, then make the popup
					if (!$linkPopup.length) { //don't make a duplicate popup
						if (!value.match('http')) value = 'http://' + value; //put an http if omitted so the link is clickable

						//get position of popup
						elOffset = element.offset();
						posLeft = elOffset.left;
						posTop = elOffset.top + element[0].offsetHeight;

						var html = '<div class="' + $scope.adePopupClass + ' ade-links dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' +
									  '<a class="' + $scope.miniBtnClasses + '" href="' + value + '" target="_blank" ng-click="hidePopup();">Follow Link</a>' +
									  ' or <a class="' + $scope.miniBtnClasses + ' ade-edit-link">Edit Link</a>' +
									  '<div class="ade-hidden"><input class="invisurl" type="text" /></div>' +
									  '</div>';
						$compile(html)($scope).insertAfter(element);

						var editLink = element.next('.ade-links').find('.ade-edit-link');
 						editLink.on('click', $scope.editUrl);

						//There is an invisible input box that handles blur and keyboard events on the popup
						var invisibleInput = element.next('.ade-links').find('.invisurl');
						invisibleInput.focus(); //focus the invisible input
						ADE.setupKeys(invisibleInput, $scope.saveUrl);
						invisibleInput.bind('blur', function(e) {
							//We delay the closure of the popup to give the internal buttons a chance to fire
							timeout = window.setTimeout(function() {
								$scope.hidePopup();
							},300);

						});
					}
				} else { //the editing field is not a clickable link, so directly edit it
				   $scope.editUrl();
				}
			});

			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeUrl', function(settings) { //settings is the contents of the ade-url="" string
				options = ADE.parseSettings(settings, {className: 'input-medium'});
				return element; //TODO: not sure what to return here
			});
		}
	};
}]);
