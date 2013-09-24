/* ==================================================================
 AngularJS Datatype Editor - Icon
 A directive to choose an icon from a list of many bootstrap icons
 Specify the allowed icons in ade.js

 Usage:
 <a ade-icon='{"id":"1234"}' ng-model="data" style="{{data}}"></a>

 Config:
 "id" will be used in messages broadcast to the app on state changes.

 Messages:
 name: ADE-start
 data: id from config

 name: ADE-finish
 data: {id from config, old value, new value}

 ------------------------------------------------------------------*/

angular.module('ADE').directive('adeIcon', ['ADE', '$compile', function(ADE, $compile) {


	var len = ADE.icons.length;
	var iconsPopupTemplate = '';

	if (len > 0) iconsPopupTemplate = '<a class="ade-clear">clear</a>';
	for (var i = 0; i < len; i++) {
		iconsPopupTemplate += '<span class="icon-' + ADE.icons[i] + '"></span>';
	}

	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-icon=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			var options = {};
			var value = '';
			var oldValue = '';
			var editing = false;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var input = null; //a reference to the invisible input DOM object
			var timeout = null; //the timeout for when clicks cause a blur of the popup's invisible input

			if (controller !== null && controller !== undefined) {
				controller.$render = function() { //whenever the view needs to be updated
					oldValue = value = controller.$modelValue;
					if (value === undefined || value === null) value = '';
					return controller.$viewValue;
				};
			}

			var saveEdit = function(exited, newValue) {
				//we are saving, so cancel any delayed blur saves that we might get
				window.clearTimeout(timeout);

				oldValue = value;
				value = newValue || oldValue;
				exit = exited;

				if (exit !== 3) { //don't save value on esc
					controller.$setViewValue(value);
				}
				editing = false;
				scope.ADE_hidePopup();

				ADE.done(options, oldValue, value, exit);

				if (exit == 1) {
					element.data('dontclick', true); //tells the focus handler not to click
					element.focus();
					//TODO: would prefer to advance the focus to the next logical element on the page
				} else if (exit == -1) {
					element.data('dontclick', true); //tells the focus handler not to click
					element.focus();
					//TODO: would prefer to advance the focus to the previous logical element on the page
				}

				scope.$digest();
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

			//handles clicks on the read version of the data
			element.bind('click', function(e) {
				element.unbind('keypress.ADE');

				e.preventDefault();
				e.stopPropagation();

				ADE.begin(options);

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

					clearNode.bind('click', function() {
						saveEdit(0, 'ban-circle');
					});

					//handles click on an icon
					angular.forEach(iconNode, function(el) {
						var node = angular.element(el);
						node.bind('click', function() {
							window.clearTimeout(timeout);
							var iconClass =  node.attr('class');

							if (iconClass.match('icon')) {
								var iconType = iconClass.substr(5);
								saveEdit(0, iconType);
							}
						});

					});

					input.focus();

					ADE.setupKeys(input, saveEdit);

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
					input.bind('blur', function(e) {
						//We delay the closure of the popup to give the internal icons a chance to
						//fire their click handlers and change the value.
						timeout = window.setTimeout(function() {
							saveEdit(0);
						},500);
					});
				}
			});

			//handles focus events
			element.bind('focus', function(e) {
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
				element.bind('keypress.ADE', function(e) {
					var keyCode = (e.keyCode ? e.keyCode : e.which); //firefox doesn't register keyCode on keypress only on keyup and down

					if (keyCode == 13) { //return
						e.preventDefault();
						e.stopPropagation(); //to prevent return key from going into text box
						element.click();
					}
				});
			});

			//handles blur events
			element.bind('blur', function(e) {
				element.unbind('keypress.ADE');
			});

			// Watches for changes to the element
			return attrs.$observe('adeIcon', function(settings) { //settings is the contents of the ade-icon="" string
				options = ADE.parseSettings(settings, {});
				return element; //TODO: not sure what to return here
			});

		}
	};
}]);
