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
		If you don't want the url to be editable	

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
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null;
			var readonly = false;
			var inputClass = "";
			var stopObserving = null;
			var adeId = scope.adeId;

			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;

			var makeHTML = function() {
				var html = "";
				var value = scope.ngModel;
				
				if(value!==undefined) {
					if(angular.isArray(value)) value = value[0];
					if(value===null || value===undefined) value="";
					if(!angular.isString(value)) value = value.toString();
					
					switch (scope.adeUrl) {
						case 'email':
							html = $filter('email')(value);
							break;

						case 'phone':
							html = $filter('phone')(value);

							//this is because iOS (and others?) will detect a tel: link and take over
							//blocking our clicks from working
							if(('ontouchstart' in window) && html.indexOf('<a href="tel:')==0) {
								html = '<a href="call:'+html.substr(13);
							}
							break;

						case 'url':
						default:
							html = $filter('url')(value);
					} 
				}

				element.html(html);
			};

			//called once the edit is done, so we can save the new data and remove edit mode
			var saveEdit = function(exited) {
				var oldValue = scope.ngModel;
				exit = exited;

				if (exit !== 3) {
					//don't save value on esc
					if (input) {
						scope.ngModel = input.val();
					}
				}

				element.show();
				destroy();
				editing = false;

				ADE.done(adeId, oldValue, scope.ngModel, exit);
				ADE.teardownBlur(input);
				ADE.teardownKeys(input);
				if(invisibleInput) {
					invisibleInput.off('blur.ADE');
					ADE.teardownKeys(invisibleInput);
				}
			};

			//called to enter edit mode on a url. happens immediatly for non-urls or after a popup confirmation for urls
			var editLink = function() {
				if (timeout) window.clearTimeout(timeout); //cancels the delayed blur of the popup
				editing = true;
				exit = 0;

				adeId = scope.adeId;
				ADE.begin(adeId);

				if(!angular.isString(scope.ngModel)) scope.ngModel = scope.ngModel ? scope.ngModel.toString() : '';

				element.hide(); //hide the read only data
				ADE.hidePopup(element);
				$compile('<input type="text" class="ade-input ' + inputClass + '" value="' + scope.ngModel.replace(/"/g,'&quot;') + '" />')(scope).insertAfter(element);
				input = element.next('input');
				input.focus();

				//put cursor at end
				input[0].selectionStart = input[0].selectionEnd = input.val().length; 

				ADE.setupBlur(input, saveEdit, scope);
				ADE.setupKeys(input, saveEdit, false, scope);
			};

			//place the popup in the proper place on the screen
			var place = function() {
				ADE.place('.'+ADE.popupClass,element,15,-5);
			};

			//when a link is clicked
			//if editable and link, present popup with what action you want to take (follow, edit)
			//if editable and not link, enter edit mode
			//if not editable and link, follow link
			var clickHandler = function(e) {

				// if user is holding shift, control, or command, let the link work
   			if (e.ctrlKey || e.shiftKey || e.metaKey) return;

				if (editing) {
					e.preventDefault(); //these two lines prevent the click on the link from actually taking you there
					e.stopPropagation();
					return; //already editing
				}

				var popup = $('.'+ADE.popupClass);
				if(popup.length) {
					$(document).trigger('ADE_hidepops.ADE');
				}

				//generate html for the popup
				var linkString = scope.ngModel ? scope.ngModel.toString() : '';
				var isurl = false;

				var html = '';
				switch (scope.adeUrl) {
					case 'email':
						isurl = $filter('email')(scope.ngModel).match('mailto:');
						if (!linkString.match('mailto:')) linkString = 'mailto:' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass + ' ade-links dropdown-menu open">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" ng-click="ADE.hidePopup();">Send Email</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
						break;
						
					case 'phone':
						isurl = $filter('phone')(scope.ngModel).match('tel:');
						if (!linkString.match('tel:')) linkString = 'tel:' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass  + ' ade-links dropdown-menu open">' +
								'<a class="' + ADE.miniBtnClasses + '" href="' + linkString + '" ng-click="ADE.hidePopup();">Call Number</a>' +
								' or <a class="' + ADE.miniBtnClasses + ' ade-edit-link">Edit</a>' +
								'<div class="ade-hidden"><input class="invisinput" type="text" /></div>' +
								'</div>';
						break;

					case 'url':
					default:
						isurl = $filter('url')(scope.ngModel).match(/https?:/);
						if (!linkString.match(/https?:/)) linkString = 'http://' + linkString; //put an http if omitted so the link is clickable
						html = '<div class="' + ADE.popupClass  + ' ade-links dropdown-menu open">' +
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
						place();

						var editLinkNode = element.next('.ade-links').find('.ade-edit-link');
						editLinkNode.on('click.ADE', editLink);

						//There is an invisible input box that handles blur and keyboard events on the popup
						invisibleInput = element.next('.ade-links').find('.invisinput');
						if(ADE.keyboardEdit) invisibleInput.focus(); //focus the invisible input

						ADE.setupKeys(invisibleInput, saveEdit, false, scope);

						invisibleInput.on('blur.ADE', function(e) {
							ADE.teardownKeys(invisibleInput);
							invisibleInput.off('blur.ADE');
							ADE.teardownBlur();
							invisibleInput = null;
							//We delay the closure of the popup to give the internal buttons a chance to fire
							timeout = window.setTimeout(function() {
								if(editLinkNode) editLinkNode.off('click.ADE');
								ADE.hidePopup(element);
							},300);
						});

						ADE.setupTouchBlur(invisibleInput);
					}
				} else if(!readonly) { //the editing field is not a clickable link, so directly edit it
					e.preventDefault(); 
					e.stopPropagation();
					editLink();
				}

				ADE.setupScrollEvents(element,function() {
					scope.$apply(function() {
						place();
					});
				});

				$(document).on('ADE_hidepops.ADE',function() {
					saveEdit(3);
				});
			};

			//setup events
			if(!readonly) {
				element.on('click.ADE', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					});
				});
			}

			//A callback to observe for changes to the id and save edit
			//The model will still be connected, so it is safe, but don't want to cause problems
			var observeID = function(value) {
				 //this gets called even when the value hasn't changed, 
				 //so we need to check for changes ourselves
				 if(editing && adeId!==value) saveEdit(3);
				 else if(adeId!==value) ADE.hidePopup(element);
			};

			//If ID changes during edit, something bad happened. No longer editing the right thing. Cancel
			stopObserving = attrs.$observe('adeId', observeID);

			var destroy = function() {
				ADE.teardownScrollEvents(element);
				ADE.hidePopup(element);
				ADE.teardownBlur();
				if(input) {
					input.off();
					input.remove();
				}
				if(element) {
					var editLinkNode = element.next('.ade-links').find('.ade-edit-link');
					if(editLinkNode) editLinkNode.off('click.ADE');
					if(invisibleInput) invisibleInput.off('blur.ADE');
				}
				$(document).off('ADE_hidepops.ADE');
			};

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				destroy();

				if(element) element.off('.ADE');

				if(stopObserving && stopObserving!=observeID) { //Angualar <=1.2 returns callback, not deregister fn
					stopObserving();
					stopObserving = null;
				} else {
					delete attrs.$$observers['adeId'];
				}
			});

			//need to watch the model for changes
			scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				makeHTML();
			});
		}
	};
}]);
