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

angular.module('ADE').directive('adeColor', ['ADE', '$compile', '$filter', 'colorUtils', function(ADE, $compile, $filter, utils) {
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
			var readonly = false;
			var nopop = false;
			var stopObserving = null;
			var adeId = scope.adeId;

			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeNopop!==undefined && scope.adeNopop=="1") nopop = true;


			function keepWithin(value, min, max) {
				if (value < min) value = min;
				if (value > max) value = max;
				return value;
			}

			function move(target, event) {
				var picker = target.find('.ade-color-spot, .ade-color-hue-picker'),
					offsetX = target.offset().left + 5,
					offsetY = target.offset().top + 5,
					x = Math.round(event.pageX - offsetX),
					y = Math.round(event.pageY - offsetY),
					wx, wy, r, phi, coords;

				if (x < 0) x = 0;
				if (y < 0) y = 0;
				if (x > target.width()) x = target.width();
				if (y > target.height()) y = target.height();

				if (target.parent().is('.ade-color-gradient-sat') && picker.parent().is('.ade-color-spot')) {
					wx = 75 - x;
					wy = 75 - y;
					r = Math.sqrt(wx * wx + wy * wy);
					phi = Math.atan2(wy, wx);
					if (phi < 0) phi += Math.PI * 2;
					if (r > 75) {
						r = 75;
						x = 75 - (75 * Math.cos(phi));
						y = 75 - (75 * Math.sin(phi));
					}
					x = Math.round(x);
					y = Math.round(y);
				}

				if (picker.hasClass('ade-color-hue-picker')) {
					coords = {
						top: y + 'px'
					};
				} else {
					coords = {
						top: y + 'px',
						left: x + 'px'
					};
				}

				picker.stop(true).animate(coords, 30, 'swing', function() {
					getColor(target);
				});

			}

			var makeHTML = function() {
				var html = $filter('color')(scope.ngModel);
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

				ADE.done(adeId, oldValue, scope.ngModel, exit);
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
					$compile('<div class="' + ADE.popupClass + ' ade-color-picker dropdown-menu open"><div class="ade-hidden"><input id="invisicon" type="text" /></div><h4>Pick a color</h4>' + colorsPopupTemplate + '</div>')(scope).insertAfter(element);
					
					place();
					setTimeout(function() { //need to give it time to render before moving it
						place();
					});
				    setColor(scope.ngModel);
					setupEvents();
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
					left = picker.offset().left;
					top = picker.offset().top;
					return {
						x: left - container.offset().left + (picker.outerWidth() / 2),
						y: top - container.offset().top + (picker.outerHeight() / 2)
					};
				}
				var hue, saturation, brightness, x, y, r, phi, hex,
					box = angular.element('.ade-color-gradient'),
					boxPicker = box.find('.ade-color-spot'),
					slider = angular.element('.ade-color-hue'),
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
				input = angular.element('#invisicon');

				var box = angular.element('.ade-color-gradient');
				var slider = angular.element('.ade-color-hue');

				box.on('mousedown.ADE', function(event) {
					ADE.cancelBlur();
					var _target = angular.element(this);
					_target.data('adePickerTarget', _target);
					move(angular.element(this), event);
				}).on('mousemove.ADE', function(event) {
					if (angular.element(this).data('adePickerTarget')) {
						move(angular.element(this), event);
					}
				}).on('mouseup.ADE', function(event) {
					angular.element(this).removeData('adePickerTarget');
				});

				slider.on('mousedown.ADE', function() {
					var _target = angular.element(this);
					_target.data('adePickerTarget', _target);
					move(_target, event);
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
				clickHandler(e);
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