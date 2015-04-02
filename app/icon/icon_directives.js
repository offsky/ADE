/* ==================================================================
AngularJS Datatype Editor - Icon
A directive to choose an icon from a list of many bootstrap icons
Specify the allowed icons in ade.js

Usage:
<a ade-icon ng-model="data"></a>

Config:

ade-id:
	If this id is set, it will be used in messages broadcast to the app on state changes.
ade-readonly:
	If you don't want the icon to be editable	
ade-nopop:
	If you don't want the icon to edit in a popup

To use different icons, adjust the array in ade.js

Messages:
	name: ADE-start
	data: id from config

	name: ADE-finish
	data: {id from config, old value, new value, exit value}

 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value}

 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeIcon', ['ADE', '$compile', '$filter', function(ADE, $compile, $filter) {
	//TODO: Shouldnt this be in a compile block? It seems to work
	var len = ADE.icons.length;
	var iconsPopupTemplate = '';
	var s = 0;

	if (len > 0) iconsPopupTemplate = '<a class="ade-clear">clear</a>';
	for (var i = 0; i < len; i++) {
		iconsPopupTemplate += '<span class="ade-icon icon-' + ADE.icons[i] + '"></span>';
	}

	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-icon=""></div>

		scope: {
			adeId: "@",
			adeReadonly: "@",
			adeNopop: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			
			var editing = false;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var input = null; //a reference to the invisible input DOM object
			var timeout = null; //the timeout for when clicks cause a blur of the popup's invisible input
			var readonly = false;
			var nopop = false;
			var stopObserving = null;
			var adeId = scope.adeId;

			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeNopop!==undefined && scope.adeNopop=="1") nopop = true;

			var makeHTML = function() {
				var html = "";

				if(nopop) {
					html = '<div class="ade-icons ade-nopop"><h4>Select an Icon</h4>' + iconsPopupTemplate + '</div>';
					element.html(html);
					setupEvents();
				} else {
					html = $filter('icon')(scope.ngModel);
					element.html(html);
				}
			};

			var saveEdit = function(exited, newValue) {				
				//we are saving, so cancel any delayed blur saves that we might get
				window.clearTimeout(timeout);

				var oldValue = scope.ngModel;
				var value = newValue || oldValue;
				exit = exited;

				if (exit !== 3) { //don't save value on esc
					scope.ngModel = value;
				}
				editing = false;

				destroy();

				ADE.done(adeId, oldValue, scope.ngModel, exit);

				if (exit == 1) {
					element.data('dontclick', true); //tells the focus handler not to click
					element.focus();
					//TODO: would prefer to advance the focus to the next logical element on the page
				} else if (exit == -1) {
					element.data('dontclick', true); //tells the focus handler not to click
					element.focus();
					//TODO: would prefer to advance the focus to the previous logical element on the page
				}
			};

			//place the popup in the proper place on the screen
			var place = function() {
				ADE.place('.'+ADE.popupClass,element);
			};

			//turns off all event listeners on the icons
			var stopListening = function() {	
				var nextElement = element.next('.ade-popup');
				var clearNode = nextElement.find('.ade-clear');
				var iconNode = nextElement.find('span');

				if(clearNode) clearNode.off();
				if(iconNode) iconNode.off();
			};

			var clickHandler = function(e) {
				//Hide any that are already up
				var iconBox = $('.'+ADE.popupClass);
				if(iconBox.length) {
					$(document).trigger('ADE_hidepops.ADE');
				}

				element.off('keypress.ADE');

				e.preventDefault();
				e.stopPropagation();

				adeId = scope.adeId;
				ADE.begin(adeId);

				var iconPopup = angular.element('.' + ADE.popupClass);
				var clickTarget = angular.element(e.target);
				var attrClass = clickTarget.attr('class');

				var isMySpan = (angular.isDefined(attrClass) && attrClass.match('icon')!==null && attrClass.match('icon').length && clickTarget.parent()[0] == element[0]);
				var isMyDiv = (clickTarget[0]==element[0]);

				if ((isMySpan || isMyDiv)  && (!iconPopup || !iconPopup.length)) {   //don't popup a second one
					editing = true;
					$compile('<div class="' + ADE.popupClass + ' ade-icons dropdown-menu open"><h4>Select an Icon</h4>' + iconsPopupTemplate + '<div class="ade-hidden"><input id="invisicon" type="text" /></div></div>')(scope).insertAfter(element);
					place();

					setupEvents();
				}
			};

			var setupEvents = function() {
				input = angular.element('#invisicon');
					
				var nextElement = element;
				if(!nopop) nextElement = element.next('.ade-popup');
				var clearNode = nextElement.find('.ade-clear');
				var iconNode = nextElement.find('span');

				//highlight current selection
				var current = nextElement.find(".icon-"+scope.ngModel);
				current.addClass('selected');

				//handles click on clear link
				clearNode.on('click.ADE', function() {
					scope.$apply(function() {
						saveEdit(0, 'ban');
					});
				});

				//handles click on an icon inside a popup
				angular.forEach(iconNode, function(el) {
					var node = angular.element(el);
					node.on('click.ADE', function() {
						window.clearTimeout(timeout); 
						var iconClass =  node.attr('class'); //gets what you clicked on by class name

						if (iconClass.match('ade-icon')) { //makes sure we clicked
							var classes = iconClass.split(" ");// grab the last class which is what we are about
							var iconType = classes.pop().substring(5);
							scope.$apply(function() {
								saveEdit(0, iconType);
							});
						}
					});

				});

				if(ADE.keyboardEdit) input.focus();

				ADE.setupKeys(input, saveEdit, false, scope);

				// TODO: handle keyboard inputs to change icons
				// input.bind('keydown.ADE', function(e) {
				// 	if(e.keyCode==37) { //left
				// 		e.preventDefault();
				// 		e.stopPropagation();
				// 	} else if(e.keyCode==39) { //right
				// 		e.preventDefault();
				// 		e.stopPropagation();
				// 	}
				// });

				//handles blurs of the invisible input.  This is done to respond to clicks outside the popup
				input.on('blur.ADE', function(e) {
					//We delay the closure of the popup to give the internal icons a chance to
					//fire their click handlers and change the value.
					timeout = window.setTimeout(function() {
						scope.$apply(function() {
							saveEdit(0);
						});
					},500);
				});

				ADE.setupScrollEvents(element,function() {
					scope.$apply(function() {
						place();
					});
				});

				$(document).on('ADE_hidepops.ADE',function() {
					saveEdit(3);
				});

				ADE.setupTouchBlur(input);
			}

			var focusHandler = function(e) {
				//if this is an organic focus, then do a click to make the popup appear.
				//if this was a focus caused by myself then don't do the click
				if (!element.data('dontclick')) {
					clickHandler(e);
					return;
				}
				window.setTimeout(function() { //IE needs this delay because it fires 2 focus events in quick succession.
					element.data('dontclick',false);
				},100);

				//listen for keys pressed while the element is focused but not clicked
				element.on('keypress.ADE', function(e) {
					var keyCode = (e.keyCode ? e.keyCode : e.which); //firefox doesn't register keyCode on keypress only on keyup and down

					if (keyCode == 13) { //return
						e.preventDefault();
						e.stopPropagation(); //to prevent return key from going into text box
						element.click();
					}
				});
			};

			//handles blur events
			element.on('blur.ADE', function(e) {
				element.off('keypress.ADE');
			});

			//setup editing events
			if(!readonly && !nopop) {
				element.on('click.ADE', function(e) { 
					//scope.$apply(function() { 
						clickHandler(e); //not necessary?
					//});
				});

				element.on('focus.ADE', function(e) {
					focusHandler(e);
				});
			}

			 //A callback to observe for changes to the id and save edit
			//The model will still be connected, so it is safe, but don't want to cause problems
			var observeID = function(value) {
				 //this gets called even when the value hasn't changed, 
				 //so we need to check for changes ourselves
				 if(editing && adeId!==value) saveEdit(3);
			};

			//If ID changes during edit, something bad happened. No longer editing the right thing. Cancel
			stopObserving = attrs.$observe('adeId', observeID);

			var destroy = function() { 
				ADE.teardownScrollEvents(element);
				ADE.hidePopup();
				ADE.teardownBlur(input);
				if(input) input.off();
				stopListening();
				$(document).off('ADE_hidepops.ADE');
			};

			//need to clean up the event watchers when the scope is destroyed
			scope.$on('$destroy', function() {
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
