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
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			
			var editing = false;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var input = null; //a reference to the invisible input DOM object
			var timeout = null; //the timeout for when clicks cause a blur of the popup's invisible input
			var readonly = false;
			var stopObserving = null;
            var oldId = null;

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

				destroy();

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
				if(iconBox.length==0) return; //doesn't exist. oops
				
				var scrollV = $(window).scrollTop();
				var scrollH = $(window).scrollLeft();
				var elOffset = element.position(); //offset relative to positioned parent
				var posLeft = Math.round(elOffset.left) - 7;  // 7px = custom offset
				var posTop = Math.round(elOffset.top) + element[0].offsetHeight;

				//console.log("place",scrollV,elOffset.top,element[0].offsetHeight,posTop);
				iconBox.css({
					left: posLeft,
					top: posTop
				});
			
			
				// console.log("icon V",elOffset,element[0].offsetHeight,element[0].offsetTop);
				// console.log("icon H",elOffset,element[0].offsetWidth,element[0].offsetLeft);

				//flip up top if off bottom of page
				var windowH = $(window).height();
				var windowW = $(window).width();
				var scroll = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
				var scrollH = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
				var boxOffset = iconBox.offset(); //offset releative to document
				var pickerBottom =  boxOffset.top + iconBox[0].offsetHeight;
				var pickerRight = boxOffset.left + iconBox[0].offsetWidth;


				if (pickerBottom-scroll > windowH) {
					iconBox.css({
						top: posTop - iconBox[0].offsetHeight - element.height() - 5,
					}).addClass("flip");
				} else {
					iconBox.removeClass("flip");
				}

				//flip it left if off the right side
				if (pickerRight-scrollH > windowW) {
					iconBox.css({
						left: posLeft - 170
					}).addClass("rarrow");
				} else {
					iconBox.removeClass("rarrow");
				}

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
				var iconBox = $('#adeIconBox');
				if(iconBox.length) {
					$(document).trigger('ADE_hidepops.ADE');
				}

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

					//when we scroll, should try to reposition because it may
					//go off the bottom/top and we may want to flip it
					//TODO; If it goes off the screen, should we dismiss it?
					$(document).on('scroll.ADE',function() {
						scope.$apply(function() {
							place();
						}); 
					});

					//when the window resizes, we may need to reposition the popup
					$(window).on('resize.ADE',function() {
						scope.$apply(function() {
							place();
						}); 
					});

					$(document).on('ADE_hidepops.ADE',function() {
						scope.$apply(function() {
							saveEdit(3);
						}); 
					});

					//If ID changes during edit, something bad happened. No longer editing the right thing. Cancel
					//TODO: when angular 1.3 returns a deregister function, set stopObserving=
                    oldId = scope.adeId;
					attrs.$observe('adeId', function(value) {
						if(oldId!==value) saveEdit(3);
					});
				}
			};

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
			if(!readonly) {
				element.on('click.ADE', function(e) { 
					//scope.$apply(function() { 
						clickHandler(e); //not necessary?
					//});
				});

				element.on('focus.ADE', function(e) {
					focusHandler(e);
				});
			}

			var destroy = function() { //need to clean up the event watchers when the scope is destroyed
				if(stopObserving) {
					stopObserving();
					stopObserving = null;
				}
				ADE.hidePopup();
				if(input) input.off();
				stopListening();
				$(document).off('scroll.ADE');
				$(window).off('resize.ADE');
				$(document).off('ADE_hidepops.ADE');
			};

			scope.$on('$destroy', function() {
				if(element) element.off('.ADE');
				destroy();
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
