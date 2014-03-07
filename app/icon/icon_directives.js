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
			ngModel: "="
		},


		//The link step (after compile)
		link: function(scope, element, attrs) {
			
			var editing = false;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var input = null; //a reference to the invisible input DOM object
			var timeout = null; //the timeout for when clicks cause a blur of the popup's invisible input
			var readonly = false;

			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;

			var makeHTML = function() {
				var html = $filter('icon')(scope.ngModel);
				element.html(html);
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
				ADE.hidePopup();

				ADE.done(scope.adeId, oldValue, scope.ngModel, exit);

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
				var iconBox = $('#adeIconBox');

				var elOffset = element.offset();
				var posLeft = elOffset.left - 7;  // 7px = custom offset
				var posTop = elOffset.top + element[0].offsetHeight;

				iconBox.css({
					left: posLeft,
					top: posTop
				});
				
				//flip up top if off bottom of page
				var windowH = $(window).height();
				var scroll = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
				var pickerHeight = iconBox[0].offsetTop + iconBox[0].offsetHeight;

				if (pickerHeight - scroll > windowH) {
					iconBox.css({
						top: posTop - iconBox[0].offsetHeight - element.height() - 5,
						left: posLeft
					}).addClass("flip");
				}
			};

			var clickHandler = function(e) {
				
				element.off('keypress.ADE');

				e.preventDefault();
				e.stopPropagation();

				ADE.begin(scope.adeId);

				var iconPopup = angular.element('.' + ADE.popupClass);
				var clickTarget = angular.element(e.target);
				var attrClass = clickTarget.attr('class');

				var isMySpan = (angular.isDefined(attrClass) && attrClass.match('icon')!==null && attrClass.match('icon').length && clickTarget.parent()[0] == element[0]);
				var isMyDiv = (clickTarget[0]==element[0]);

				if ((isMySpan || isMyDiv)  && (!iconPopup || !iconPopup.length)) {   //don't popup a second one
					editing = true;
					$compile('<div id="adeIconBox" class="' + ADE.popupClass + ' ade-icons dropdown-menu open"><h4>Select an Icon</h4>' + iconsPopupTemplate + '<div class="ade-hidden"><input id="invisicon" type="text" /></div></div>')(scope).insertAfter(element);
					place();

					input = angular.element('#invisicon');
					
					var nextElement = element.next('.ade-popup');
					var clearNode = nextElement.find('.ade-clear');
					var iconNode = nextElement.find('span');

					clearNode.on('click', function() {
						scope.$apply(function() {
							saveEdit(0, 'ban');
						});
					});

					//handles click on an icon inside a popup
					angular.forEach(iconNode, function(el) {
						var node = angular.element(el);
						node.on('click', function() {
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

					input.focus();

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
					input.on('blur', function(e) {
						//We delay the closure of the popup to give the internal icons a chance to
						//fire their click handlers and change the value.
						timeout = window.setTimeout(function() {
							scope.$apply(function() {
								saveEdit(0);
							});
						},500);
					});
				}
			};

			var focusHandler = function(e) {
				//if this is an organic focus, then do a click to make the popup appear.
				//if this was a focus caused by myself then don't do the click
				if (!element.data('dontclick')) {
					element.click();
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
			element.on('blur', function(e) {
				element.off('keypress.ADE');
			});

			//setup events
			if(!readonly) {
				element.on('click', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					});
				});

				element.on('focus', function(e) {
					focusHandler(e);
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
