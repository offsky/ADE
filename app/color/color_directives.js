/* ==================================================================
AngularJS Datatype Editor - Color
A directive to choose a color from popup color picker

Usage:
<a ade-color ng-model="data"></a>

Config:

ade-id:
	If this id is set, it will be used in messages broadcast to the app on state changes.
ade-readonly:
	If you don't want the color to be editable

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

angular.module('ADE').directive('adeColor', ['ADE', '$compile', '$filter', 'colorUtils',
	function(ADE, $compile, $filter, utils) {
	'use strict';

	var colorsPopupTemplate = '<div class="ade-color-gradient"><div class="ade-color-gradient-sat"><div class="ade-color-spot"></div></div></div><div class="ade-color-hue"><div class="ade-color-hue-picker"></div></div>';

	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-color=""></div>

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
			var stopObserving = null;
			var adeId = scope.adeId;
			var draggingPicker = null;

			function keepWithin(value, min, max) {
				if (value < min) value = min;
				if (value > max) value = max;
				return value;
			}

			function move(target, event) {
				var picker = target.find('.ade-color-spot, .ade-color-hue-picker');
				var hueAreaHeight = picker.parent().height();
				var offsetX = target.offset().left;
				var offsetY = target.offset().top;
				var x = Math.round(event.pageX - offsetX);
				var y = Math.round(event.pageY - offsetY);
				var halfPicker, targetW, targetH, wx, wy, r, phi, coords;

				if (picker.parent().is('.ade-color-spot')) {
					halfPicker = picker.height() / 2;
				} else {
					halfPicker = 4;
				}
				targetH = target.height();
				targetW = target.width();

				if (x < 0) x = 0;
				if (y < 0) y = 0;
				if (x > targetW) y = targetW;
				if (y > targetH) y = targetH;

				if (picker.hasClass('ade-color-hue-picker')) {
					y = (y > hueAreaHeight) ? hueAreaHeight : y;
					coords = {
						top: y + 'px'
					};
				} else {
					coords = {
						top: y - halfPicker + 'px',
						left: x - halfPicker + 'px'
					};
				}

				picker.stop(true).animate(coords, 10, 'linear', function() {
					getColor(target);
				});

			}

			var makeHTML = function() {
				var html = $filter('color')(scope.ngModel);
				element.html(html);
			};

			var saveEdit = function(exited) {
				//we are saving, so cancel any delayed blur saves that we might get
				window.clearTimeout(timeout);

				var oldValue = $('#invisipicker').data("original-color");
				exit = exited;

				ADE.teardownBlur(input);
				ADE.teardownKeys(input);

				if (exit !== 3) { //don't save value on esc
					$('#invisipicker').data("original-color", scope.ngModel);
				} else {
					scope.ngModel = oldValue;
				}
				editing = false;

				destroy();

				ADE.done(adeId, oldValue, scope.ngModel, exit);
			};

			//place the popup in the proper place on the screen
			var place = function() {
				ADE.place('.'+ADE.popupClass,element);
			};

			//turns off all event listeners on the icons
			var stopListening = function() {	
				var nextElement = element.next('.ade-popup');
				var iconNode = nextElement.find('span');

				if(iconNode) iconNode.off();
			};

			var clickHandler = function(e) {
				ADE.hidePopup(element);
				destroy();
				if (editing) return;
				exit = 0;
				//Hide any that are already up
				var colorBox = $('.'+ADE.popupClass);
				if(colorBox.length) {
					$(document).trigger('ADE_hidepops.ADE');
				}

				element.off('keypress.ADE');

				e.preventDefault();
				e.stopPropagation();

				adeId = scope.adeId;
				ADE.begin(adeId);

				var colorPopup = angular.element('.' + ADE.popupClass);
				var clickTarget = angular.element(e.target);
				var attrClass = clickTarget.attr('class');

				var isMySpan = (angular.isDefined(attrClass) && attrClass.match('color')!==null && attrClass.match('color').length && clickTarget.parent()[0] == element[0]);
				var isMyDiv = (clickTarget[0]==element[0]);

				if ((isMySpan || isMyDiv)  && (!colorPopup || !colorPopup.length)) {   //don't popup a second one
					editing = true;
					$compile('<div class="' + ADE.popupClass + ' ade-color-picker dropdown-menu open"><div class="ade-hidden"><input id="invisipicker" type="text" /></div><h4>Pick a color</h4>' + colorsPopupTemplate + '</div>')(scope).insertAfter(element);
					
					place();
					setTimeout(function() { //need to give it time to render before moving it
						place();
					});
				    setColor(scope.ngModel);
					setupEvents();
					$(input).data("original-color", scope.ngModel);
				}
			};

		    var setColor = function(color) {
				var hex = color, hsb, x, y,
					box = angular.element('.ade-color-gradient'),
					boxPicker = box.find('.ade-color-spot'),
					slider = angular.element('.ade-color-hue'),
					sliderPicker = slider.find('.ade-color-hue-picker');

				hsb = utils.hex2hsb(utils.parseHex(hex, true));

				x = keepWithin(Math.ceil(hsb.s / (100 / box.width())), 0, box.width());
				y = keepWithin(box.height() - Math.ceil(hsb.b / (100 / box.height())), 0, box.height());
				boxPicker.css({
					top: y - (boxPicker.outerHeight()/2) + 'px',
					left: x - (boxPicker.outerWidth()/2) + 'px'
				});
				y = keepWithin(slider.height() - (hsb.h / (360 / slider.height())), 0, slider.height());
				sliderPicker.css('top', y + 'px');
				box.css('backgroundColor', utils.hsb2hex({
					h: hsb.h,
				  	s: 100,
					b: 100
				}));
			};

			var getColor = function(target) {
				function getCoords(picker, container) {
					var left, top;
					if (!picker.length || !container) return null;
					left = picker.offset().left + 4;
					top = picker.offset().top + 4;
					return {
						x: left - container.offset().left,
						y: top - container.offset().top
					};
				}

				var hue, saturation, brightness, x, y, r, phi, hex,
					box = (target.hasClass("ade-color-gradient")) ? target : target.parents('.ade-popup').find(".ade-color-gradient"),
					boxPicker = box.find('.ade-color-spot'),
					slider = (target.hasClass(".ade-color-hue")) ? target : target.parents('.ade-popup').find(".ade-color-hue"),
					sliderPicker = slider.find('.ade-color-hue-picker'),
					boxPos = getCoords(boxPicker, box),
					sliderPos = getCoords(sliderPicker, slider);

				hue = keepWithin(360 - parseInt(sliderPos.y * (360 / slider.height()), 10), 0, 360);
				saturation = keepWithin(Math.floor(boxPos.x * (100 / box.width())), 0, 100);
				brightness = keepWithin(100 - Math.floor(boxPos.y * (100 / box.height())), 0, 100);
				hex = utils.hsb2hex({
					h: hue,
					s: saturation,
					b: brightness
				});

				box.css('backgroundColor', utils.hsb2hex({
					h: hue,
					s: 100,
					b: 100
				}));

				scope.ngModel = hex;
				scope.$apply();
				input.focus();
			};

			var setupEvents = function() {
				input = angular.element('#invisipicker');
				var box = angular.element('.ade-color-gradient');
				var slider = angular.element('.ade-color-hue');

				box.on('mousedown.ADE', function(event) {
					ADE.cancelBlur();
					var _target = angular.element(this);
					_target.data('adePickerTarget', _target);
					draggingPicker = _target.find(".ade-color-spot");
					move(angular.element(this), event);
				}).on('mousemove.ADE', function(event) {
					if (angular.element(this).data('adePickerTarget')) {
						move(angular.element(this), event);
					}
				}).on('mouseup.ADE', function() {
					draggingPicker = null;
					angular.element(this).removeData('adePickerTarget');
				});

				$(document).on('mousemove.ADE', function(event) {
					var target = angular.element(event.target);

					if (draggingPicker && draggingPicker.is(":visible") && !(target.hasClass('ade-color-gradient-sat') ||
							target.hasClass('ade-color-spot'))) {
						var cb = draggingPicker.parent();
						var cbOffset = cb.offset();
						var halfPicker = 4;
						var boxRightEdge = (cb.width());
						var boxBottomEdge = (cb.height());
						var leftPos = ((event.pageX - cbOffset.left) < 0) ? 0 : (event.pageX - cbOffset.left);
						var topPos = ((event.pageY - cbOffset.top) <= -halfPicker) ? -halfPicker : (event.pageY - cbOffset.top);

						/*console.log("boxBottomEdge: ", boxBottomEdge, " boxRightEdge: ", boxRightEdge, " topPos: ", topPos, " leftPos: ", leftPos);
						console.log("top: ", boxPickerPos.top);*/

						if (topPos < 0) {
							/*console.log("over the top");*/
							draggingPicker.css({
								"top": -halfPicker,
								"left": (leftPos > boxRightEdge) ? boxRightEdge-halfPicker : leftPos-halfPicker
 						 	});
						} else if (leftPos <= 0) {
							/*console.log("over the left");*/
							draggingPicker.css({
								"top": (topPos > boxBottomEdge) ? boxBottomEdge - halfPicker : topPos,
								"left": -halfPicker
							});
						} else if (leftPos > boxRightEdge) {
							/*console.log("over the right");*/
							draggingPicker.css({
								"top": (topPos > boxBottomEdge) ? boxBottomEdge - halfPicker : topPos,
								"left": boxRightEdge - halfPicker
							});
						} else if (topPos > boxBottomEdge) {
							/*console.log("over the bottom");*/
							draggingPicker.css({
								"top": boxBottomEdge - halfPicker,
								"left": (leftPos > boxRightEdge) ? boxRightEdge : leftPos
							});
						}
						getColor(cb);
					}
				}).on('mouseup.ADE', function() {;
					if (draggingPicker) draggingPicker.parent().trigger("mouseup.ADE");
				});

				slider.on('mousedown.ADE', function() {
					if (!draggingPicker) {
						var _target = angular.element(this);
						_target.data('adePickerTarget', _target);
						move(_target, event);
					}
				}).on('mousemove.ADE', function(event) {
					var _target = angular.element(this);
					if (_target.data('adePickerTarget')) {
						window.clearTimeout(timeout);
						move(_target, event);
					}
				}).on('mouseup.ADE', function(event) {
					angular.element(this).removeData('adePickerTarget');
				});

				if(ADE.keyboardEdit) input.focus();

				ADE.setupKeys(input, saveEdit, false, scope);

				ADE.setupScrollEvents(element,function() {
					scope.$apply(function() {
						place();
					});
				});

				$(document).on('ADE_hidepops.ADE',function() {
					saveEdit(3);
				});

				input.on('focus',function() {
					if (timeout) {
						clearTimeout(timeout);
						timeout = false;
					}
				});

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
			};

			//setup editing events
			element.on('click.ADE', function(e) {
				scope.$apply(function() {
					clickHandler(e);
				});
			});

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
				ADE.hidePopup();
				ADE.teardownBlur(input);
				if(input) input.off();
				stopListening();
				$(document).off('ADE_hidepops.ADE');

			};

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				destroy();

				if(element) {
					element.off('mouseover.ADE');
					element.off('mouseout.ADE');
					element.off('click.ADE');
				}

				if(stopObserving && stopObserving!=observeID) { //Angualar <=1.2 returns callback, not deregister fn
					stopObserving();
					stopObserving = null;
				} else {
					delete attrs.$$observers['adeId'];
				}
				if(unwatch) unwatch();
			});

			//need to watch the model for changes
			var unwatch = scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				makeHTML();
			});
		}
	};
}]);