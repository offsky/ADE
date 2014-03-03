/* ==================================================================
	AngularJS Datatype Editor - URL
	A directive to edit a url field in place. You can also specify that
	the url is an email address or phone number and it will customize
	the link for those purposes.

	Usage:
	<div ade-url='url' ade-id='1234' ade-class="myClass" ng-model="data"></div>

	Config:

	ade-url:
		Defaults to "url" but you can set "phone" or "email" to make it a certain type of url
	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the stars to be editable	

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

		scope: {
			adeUrl: "@",
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var editing = false;
			var input = null;
			var invisibleInput = null;
			var oldValue = '';
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null;
			var readonly = false;
			var inputClass = "";

			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;

			var makeHTML = function() {
				var html = "";
				var value = scope.ngModel;
				
				if(value!==undefined) {
					if(angular.isArray(value)) value = value[0];
					if(!angular.isString(value)) value = value.toString();
					
					switch (scope.adeUrl) {
						case 'email':
							html = $filter('email')(value);
							break;
						case 'phone':
							html = $filter('phone')(value);
							break;
						default:
							html = $filter('url')(value);
					} 
				}

				element.html(html);
			};

			//called once the edit is done, so we can save the new data and remove edit mode
			var saveEdit = function(exited) {
				oldValue = scope.ngModel;
				exit = exited;

				if (exit !== 3) {
					//don't save value on esc
					if (input) {
						scope.ngModel = input.val();
					}
				}

				element.show();
				ADE.hidePopup();
				if (input) input.remove();
				editing = false;

				ADE.done(scope.adeId, oldValue, scope.ngModel, exit);
				ADE.teardownBlur(input);
				ADE.teardownKeys(input);
				if(invisibleInput) ADE.teardownKeys(invisibleInput);
			};

			//called to enter edit mode on a url. happens immediatly for non-urls or after a popup confirmation for urls
			var editLink = function() {
				if (timeout) window.clearTimeout(timeout); //cancels the delayed blur of the popup
				editing = true;
				exit = 0;

				ADE.begin(scope.adeId);

				if(!angular.isString(scope.ngModel)) scope.ngModel = scope.ngModel ? scope.ngModel.toString() : '';

				element.hide(); //hide the read only data
				ADE.hidePopup();
				$compile('<input type="text" class="' + inputClass + '" value="' + scope.ngModel.replace(/"/g,'&quot;') + '" />')(scope).insertAfter(element);
				input = element.next('input');
				input.focus();

				ADE.setupBlur(input, saveEdit, scope);
				ADE.setupKeys(input, saveEdit, false, scope);
			};

			//when a link is clicked
			//if editable and link, present popup with what action you want to take (follow, edit)
			//if editable and not link, enter edit mode
			//if not editable and link, follow link
			var clickHandler = function(e) {
				
				if (editing) {
					e.preventDefault(); //these two lines prevent the click on the link from actually taking you there
					e.stopPropagation();
					return; //already editing
				}

				//generate html for the popup
				var linkString = scope.ngModel ? scope.ngModel.toString() : '';
				var isurl = false;
				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight;
				var html = '';
				switch (scope.adeUrl) {
					case 'email':
						isurl = $filter('email')(scope.ngModel).match('mailto:');
						if (!linkString.match('mailto:')) linkString = 'mailto:' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass + ' ade-links dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" ng-click="ADE.hidePopup();">Send Email</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
						break;
						
					case 'phone':
						isurl = $filter('phone')(scope.ngModel).match('tel:');
						if (!linkString.match('tel:')) linkString = 'tel:' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass  + ' ade-links dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" ng-click="ADE.hidePopup();">Call Number</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
						break;

					case 'url':
					default:
						isurl = $filter('url')(scope.ngModel).match(/https?:/);
						if (!linkString.match(/https?:/)) linkString = 'http://' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass  + ' ade-links dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" target="_blank" ng-click="ADE.hidePopup();">Follow Link</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
				}

				//if it matches as a URL, then make the popup
				if (scope.ngModel !== '' && isurl && !readonly) {
					e.preventDefault(); 
					e.stopPropagation();
					if (!element.next('.' + ADE.popupClass ).length) { //don't make a duplicate popup

						$compile(html)(scope).insertAfter(element);

						var editLinkNode = element.next('.ade-links').find('.ade-edit-link');
						editLinkNode.on('click', editLink);

						//There is an invisible input box that handles blur and keyboard events on the popup
						invisibleInput = element.next('.ade-links').find('.invisinput');
						invisibleInput.focus(); //focus the invisible input

						ADE.setupKeys(invisibleInput, saveEdit, false, scope);

						invisibleInput.on('blur', function(e) {
							ADE.teardownKeys(invisibleInput);
							invisibleInput = null;
							//We delay the closure of the popup to give the internal buttons a chance to fire
							timeout = window.setTimeout(function() {
								ADE.hidePopup(element);
							},300);
						});
					}
				} else if(!readonly) { //the editing field is not a clickable link, so directly edit it
					e.preventDefault(); 
					e.stopPropagation();
					editLink();
				}
			};

			//setup events
			if(!readonly) {
				element.on('click', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					})
				});
			}

			//need to watch the model for changes
			scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				makeHTML();
			});
		}
	};
}]);
