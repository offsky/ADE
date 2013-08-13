/* ==================================================================
	AngularJS Datatype Editor - URL
	A directive to edit a url field in place. You can also specify that
	the url is an email address or phone number and it will customize
	the link for those purposes.

	Usage:
	<div ade-url='{"class":"input-medium","id":"1234","type":"email"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeUrl', ['ADE', '$compile', '$filter', function(ADE, $compile, $filter) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-url=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {}; //The passed in options to the directive.
			var editing = false;
			var input = null;
			var value = '';
			var oldValue = '';
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null;

			if (controller !== null && controller !== undefined) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if (value === undefined || value === null) value = '';
					return controller.$viewValue;
				};
			}

			//called once the edit is done, so we can save the new data and remove edit mode
			var saveEdit = function(exited) {
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
				scope.ADE_hidePopup();
				if (input) input.remove();
				editing = false;

				ADE.done(options, oldValue, value, exit);
			
				scope.$digest();
			};

			//called to enter edit mode on a url. happens immediatly for non-urls or after a popup confirmation for urls
			var editLink = function() {
				if (timeout) window.clearTimeout(timeout); //cancels the delayed blur of the popup
				editing = true;
				exit = 0;

				ADE.begin(options);

				if(!angular.isString(value)) value = value.toString();

				element.hide(); //hide the read only data
				scope.ADE_hidePopup();
				$compile('<input type="text" class="' + options.className + '" value="' + value.replace(/"/g,'&quot;') + '" />')(scope).insertAfter(element);
				input = element.next('input');
				input.focus();

				ADE.setupBlur(input, saveEdit);
				ADE.setupKeys(input, saveEdit);
			};

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
				e.preventDefault(); //these two lines prevent the click on the link from actually taking you there
				e.stopPropagation();

				if (editing) return;

				//generate html for the popup
				var linkString = value.toString();
				var isurl = false;
				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight;
				var html = '';
				switch (options.type) {
					case 'email':
						isurl = $filter('email')(value).match('mailto:');
						if (!linkString.match('mailto:')) linkString = 'mailto:' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass + ' ade-links dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" ng-click="ADE_hidePopup();">Send Email</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
						break;
					case 'phone':
						isurl = $filter('phone')(value).match('tel:');
						if (!linkString.match('tel:')) linkString = 'tel:' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass  + ' ade-links dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" ng-click="ADE_hidePopup();">Call Number</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
						break;
					default:
						isurl = $filter('url')(value).match(/https?:/);
						if (!linkString.match(/https?:/)) linkString = 'http://' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass  + ' ade-links dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" target="_blank" ng-click="ADE_hidePopup();">Follow Link</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
				}

				//if it matches as a URL, then make the popup
				if (value !== '' && isurl) {
					if (!element.next('.' + ADE.popupClass ).length) { //don't make a duplicate popup

						$compile(html)(scope).insertAfter(element);

						var editLinkNode = element.next('.ade-links').find('.ade-edit-link');
						editLinkNode.bind('click', editLink);

						//There is an invisible input box that handles blur and keyboard events on the popup
						var invisibleInput = element.next('.ade-links').find('.invisinput');
						invisibleInput.focus(); //focus the invisible input

						ADE.setupKeys(invisibleInput, saveEdit);

						invisibleInput.bind('blur', function(e) {
							//We delay the closure of the popup to give the internal buttons a chance to fire
							timeout = window.setTimeout(function() {
								scope.ADE_hidePopup(element);
							},300);
						});
					}
				} else { //the editing field is not a clickable link, so directly edit it
					editLink();
				}
			});

			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeUrl', function(settings) { //settings is the contents of the ade-url="" string
				options = ADE.parseSettings(settings, {className: 'input-medium', type: 'http'});
				return element; //TODO: not sure what to return here
			});
		}
	};
}]);
