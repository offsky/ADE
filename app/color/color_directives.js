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

angular.module('ADE').directive('adeColor', ['ADE', '$compile', '$filter', function(ADE, $compile, $filter) {
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

			function parseHex(string, expand) {
				string = string.replace(/^#/g, '');
				if (!string.match(/^[A-F0-9]{3,6}/ig)) return '';
				if (string.length !== 3 && string.length !== 6) return '';
				if (string.length === 3 && expand) {
					string = string[0] + string[0] + string[1] + string[1] + string[2] + string[2];
				}
				return '#' + string;
			}
			function hsb2rgb(hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s * 255 / 100);
				var v = Math.round(hsb.b * 255 / 100);
				if (s === 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255 - s) * v / 255;
					var t3 = (t1 - t2) * (h % 60) / 60;
					if (h === 360) h = 0;
					if (h < 60) {
						rgb.r = t1;
						rgb.b = t2;
						rgb.g = t2 + t3;
					} else if (h < 120) {
						rgb.g = t1;
						rgb.b = t2;
						rgb.r = t1 - t3;
					} else if (h < 180) {
						rgb.g = t1;
						rgb.r = t2;
						rgb.b = t2 + t3;
					} else if (h < 240) {
						rgb.b = t1;
						rgb.r = t2;
						rgb.g = t1 - t3;
					} else if (h < 300) {
						rgb.b = t1;
						rgb.g = t2;
						rgb.r = t2 + t3;
					} else if (h < 360) {
						rgb.r = t1;
						rgb.g = t2;
						rgb.b = t1 - t3;
					} else {
						rgb.r = 0;
						rgb.g = 0;
						rgb.b = 0;
					}
				}
				return {
					r: Math.round(rgb.r),
					g: Math.round(rgb.g),
					b: Math.round(rgb.b)
				};
			}
			function hex2hsb(hex) {
				var hsb = rgb2hsb(hex2rgb(hex));
				if (hsb.s === 0) hsb.h = 360;
				return hsb;
			}
			function rgb2hex(rgb) {
				var hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
				$.each(hex, function(nr, val) {
					if (val.length === 1) hex[nr] = '0' + val;
				});
				return '#' + hex.join('');
			}
			function hsb2hex(hsb) {
				return rgb2hex(hsb2rgb(hsb));
			}

			function keepWithin(value, min, max) {
				if (value < min) value = min;
				if (value > max) value = max;
				return value;
			}
			function hex2rgb(hex) {
				hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
				return {
					r: hex >> 16,
					g: (hex & 0x00FF00) >> 8,
					b: (hex & 0x0000FF)
				};
			}
			function rgb2hsb(rgb) {
				var hsb = {
					h: 0,
					s: 0,
					b: 0
				};
				var min = Math.min(rgb.r, rgb.g, rgb.b);
				var max = Math.max(rgb.r, rgb.g, rgb.b);
				var delta = max - min;
				hsb.b = max;
				hsb.s = max !== 0 ? 255 * delta / max : 0;
				if (hsb.s !== 0) {
					if (rgb.r === max) {
						hsb.h = (rgb.g - rgb.b) / delta;
					} else if (rgb.g === max) {
						hsb.h = 2 + (rgb.b - rgb.r) / delta;
					} else {
						hsb.h = 4 + (rgb.r - rgb.g) / delta;
					}
				} else {
					hsb.h = -1;
				}
				hsb.h *= 60;
				if (hsb.h < 0) {
					hsb.h += 360;
				}
				hsb.s *= 100 / 255;
				hsb.b *= 100 / 255;
				return hsb;
			}

			function move(target, event) {
				var picker = target.find('.ade-color-spot, .ade-color-hue-picker'),
					offsetX = target.offset().left,
					offsetY = target.offset().top,
					x = Math.round(event.pageX - offsetX),
					y = Math.round(event.pageY - offsetY),
					wx, wy, r, phi, coords;

				if (event.originalEvent.changedTouches) {
					x = event.originalEvent.changedTouches[0].pageX - offsetX;
					y = event.originalEvent.changedTouches[0].pageY - offsetY;
				}
				if (x < 0) x = 0;
				if (y < 0) y = 0;
				if (x > target.width()) x = target.width();
				if (y > target.height()) y = target.height();

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
				var html = "";

				html = $filter('color')(scope.ngModel);
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
				ADE.place('.'+ADE.popupClass,element,6,15);
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

				hsb = hex2hsb(parseHex(hex, true));

				x = keepWithin(Math.ceil(hsb.s / (100 / box.width())), 0, box.width());
				y = keepWithin(box.height() - Math.ceil(hsb.b / (100 / box.height())), 0, box.height());
				boxPicker.css({
					top: y - (boxPicker.outerHeight()/2) + 'px',
					left: x - (boxPicker.outerWidth()/2) + 'px'
				});
				y = keepWithin(slider.height() - (hsb.h / (360 / slider.height())), 0, slider.height());
				sliderPicker.css('top', y + 'px');
				box.css('backgroundColor', hsb2hex({
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
				hex = hsb2hex({
					h: hue,
					s: saturation,
					b: brightness
				});

				if (target.hasClass('ade-color-hue')) {
					box.css('backgroundColor', hsb2hex({
						h: hue,
						s: 100,
						b: 100
					}));
				} else {
					saveEdit(0, hex);
				}
			};

			var setupEvents = function() {
				var box = angular.element('.ade-color-gradient');
				var slider = angular.element('.ade-color-hue')

				box.on('click.ADE', function(event) {
					window.clearTimeout(timeout);
					move(angular.element(this), event, true);
				});

				slider.on('click.ADE', function(event) {
					window.clearTimeout(timeout);
					move(angular.element(this), event, true);
				});

				//if(ADE.keyboardEdit) input.focus();

				//ADE.setupKeys(input, saveEdit, false, scope);

				//handles blurs of the invisible input.  This is done to respond to clicks outside the popup
				/*input.on('blur.ADE', function(e) {
					//We delay the closure of the popup to give the internal icons a chance to
					//fire their click handlers and change the value.
					timeout = window.setTimeout(function() {
						scope.$apply(function() {
							saveEdit(0);
						});
					},500);
				});   */

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