/* ==================================================================
	AngularJS Datatype Editor

	Common code. Sets up the module for use in your app

	Usage:
		var MyApp = angular.module('MyApp', ['ADE']);

------------------------------------------------------------------*/

'use strict'; //http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

angular.module('ADE', ['ngSanitize']).factory('ADE', ['$rootScope', function($rootScope) {

	// Common
	var miniBtnClasses = 'btn btn-mini btn-primary';
	var popupClass = 'ade-popup';
	var icons = ['heart', 'film', 'music', 'camera', 'shopping-cart', 'flag', 'picture', 'gift',
		  'calendar', 'time', 'thumbs-up', 'thumbs-down', 'hand-right', 'hand-left', 'info-sign', 'question-sign',
		  'exclamation-sign', 'trophy', 'pushpin', 'warning-sign', 'leaf', 'tint', 'coffee', 'magnet', 'envelope',
		  'inbox', 'bookmark', 'file', 'bell', 'asterisk', 'globe', 'plane', 'road', 'lock', 'book', 'wrench', 'home',
		  'briefcase', 'map-marker', 'eye-open', 'medkit', 'lightbulb', 'food', 'laptop', 'circle', 'money', 'bullhorn', 'legal', 'facebook','twitter'];

	//A flag that controls if certain ADE directives can accept keyboard input.
	//Causes display problems on iOS where there is no keyboard
	//Override in your contoller if you want
	var keyboardEdit = true; 
	var blurTimeout = false; //a timeout that allows external factors to cancel a blur event

	function hidePopup(elm) {
		var elPopup = (elm) ? elm.next('.' + popupClass) : angular.element('.' + popupClass);
		if (elPopup.length && elPopup.hasClass('open')) {
			elPopup.removeClass('open').remove();
		}
	}

	//=========================================================================================
	//broadcasts the message that we are starting editing
	function begin(id) {
		if(angular.isObject(id)) id = id.id;
		if (id) {
			$rootScope.$broadcast('ADE-start', id);
		}
	}

	//=========================================================================================
	//broadcasts the message that we are done editing
	//exit: 1=tab, -1=shift+tab, 2=return, -2=shift+return, 3=esc, 0=other
	function done(id, oldValue, value, exit) {
		if(angular.isObject(id)) id = id.id;
		if (id) {
			setTimeout(function() { //This is to give the model a chance to update before the notificaiton goes out
				$rootScope.$apply(function() { 
					$rootScope.$broadcast('ADE-finish', {'id': id, 'oldVal': oldValue, 'newVal': value, 'exit': exit });
				});
			});
		}
	}

	//=========================================================================================
	//registers a blur event on the input so we can know when we clicked outside
	//sends 0 to the callback to indicate that the blur was not caused by a keyboard event
	function setupBlur(input, callback, scope, skipTouch) {
		input.on('blur.ADE', function() {
			if(blurTimeout) clearTimeout(blurTimeout);
			blurTimeout = window.setTimeout(function() {
				blurTimeout = false;
				scope.$apply(function() { callback(0); });
			},100);
		});

		if(!skipTouch) setupTouchBlur(input);
	}

	//=========================================================================================
	// enables blur to work on touch devices by listing for any touch and bluring
	function setupTouchBlur(input) {
		if('ontouchend' in window) {
			$(document).on('touchend.ADE', function(e) {
				var target = $(e.target);
			
				var didTouchInPopup = target.parents('.'+popupClass).length>0 || target.hasClass(popupClass);
				var didTouchInTag = target.parents('.ade-tag-input').length>0;	
				var didTouchInList = target.parents('.ade-list-input').length>0;
				var didTouchIcon = target.hasClass(miniBtnClasses);
				var didTouchInput = target.hasClass('ade-input');
				var didTouchInDate = target.parents('.ade-date-popup').length>0;

				//ignore taps on ADE elements
				if(!didTouchIcon && !didTouchInPopup && !didTouchInTag && !didTouchInList && !didTouchInput && !didTouchInDate) {
					if(input) input.blur(); //it has to be in a timeout to allow other events to fire first
				}
			});
		}
	}

	function teardownBlur(input) {
		if(input) input.off('blur.ADE');
		$(document).off('touchend.ADE');
	}

	function cancelBlur() {
		if(blurTimeout) {
			clearTimeout(blurTimeout);
			blurTimeout = false;
		}
	}

	//=========================================================================================
	//registers the keyboard events on the input so we know how we left edit mode
	//sends an integer to the callback to indicate how we exited edit mode
	// 1 = tab, -1 = shift+tab, 2=return, -2=shift+return, 3=esc
	var bound = false; //There may be a better way to prevent the current event from finishing when I have unbound the event handler, but I couldnt find it
	function setupKeys(input, callback, ignoreReturn, scope) {
		bound = true;
		input.on('keydown.ADE', function(e) {
			if (e.keyCode == 9) { //tab
				e.preventDefault();
				e.stopPropagation();
				var exit = e.shiftKey ? -1 : 1;
				scope.$apply(function() { callback(exit); });
			} else if (e.keyCode == 27) { //esc
				e.preventDefault();
				e.stopPropagation();
				scope.$apply(function() { callback(3); });
			} else if (e.keyCode == 13 && ignoreReturn !== true) { //return // && bound
				e.preventDefault();
				e.stopPropagation();
				var exit = e.shiftKey ? -2 : 2;
				scope.$apply(function() { callback(exit); });
			}

		});
	}

	function teardownKeys(input) {
		if(input) {
			input.off('keydown.ADE');
			input.off('keypress.ADE');
		}
		//bound = false; //tells the key event listener to stop processing the current event
							//this seems to be necessary since stopPropigation wasn't working.
	}


	//=========================================================================================
	// Watch for scrolling and resizing to reposition our popups
	function setupScrollEvents(element,callback) {
		var sp = scrollParent(element);

		//when we scroll, should try to reposition because it may
		//go off the bottom/top and we may want to flip it
		//TODO; If it goes off the screen, should we dismiss it?
		$(sp).on('scroll.ADE',callback);

		//when the window resizes, we may need to reposition the popup
		$(window).on('resize.ADE',callback); 
	}

	function teardownScrollEvents(element) {
		var sp = scrollParent(element);
		$(sp).off('scroll.ADE');
		$(window).off('resize.ADE');
	}

	//place the popup in the proper place on the screen
	function place(id,element, extraV, extraH) {
		var popup = $(id);
		if(popup.length==0) return; //doesn't exist. oops
		
		var sp = scrollParent(element);

		if(!extraV) extraV = 2;
		if(!extraH) extraH = 7;

		var windowH = $(window).height();
		var windowW = $(window).width();
		var scrollV = $(sp).scrollTop();
		var scrollH = $(sp).scrollLeft();
		var elPosition = element.position(); //offset relative to document
		var elOffset = element.offset(); //offset relative to positioned parent
		var posLeft = Math.round(elPosition.left) - extraH;  // extraH = custom offset
		var posTop = Math.round(elPosition.top) + element.height() + extraV;
		var popupH = popup.height();
		var popupW = popup.width();
		var pickerBottom =  elOffset.top+element.height() + 2 + popupH;
		var pickerRight = elOffset.left-7 + popupW;

		popup.removeClass("flip");
		popup.removeClass("rarrow");

		//flip it up top if it would be off the bottom of page			
		var posTopFlip = Math.round(elPosition.top) - popupH - 13;
		if (pickerBottom-scrollV > windowH && posTopFlip>0) {
			posTop = posTopFlip;
			popup.addClass("flip");
		}

		if(windowW<=480) {
			posLeft = scrollH+5;
			popup.css({ left: posLeft, top: posTop, width: windowW-30});
			// console.log(posLeft, windowW, scrollH);

		} else {
			//Move to the left if it would be off the right of page
			if (pickerRight-scrollH > windowW) {
				posLeft = posLeft - popupW + 30;
				if(posLeft<0) posLeft = 0;
				popup.addClass("rarrow");
			}

			// console.log("place",posLeft,posTop);
			popup.css({ left: posLeft, top: posTop});
		}
	}

	function scrollParent(elem) {
		//taken and modified from jquery UI project
		var includeHidden = false;
		var position = elem.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = elem.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
			}).eq( 0 );

		return position === "fixed" || !scrollParent.length ? $( elem[ 0 ].ownerDocument || document ) : scrollParent;
	 }

	//=========================================================================================
	//exports public functions to ADE directives
	return {
		hidePopup: hidePopup,
		begin: begin,
		done: done,
		setupBlur: setupBlur,
		setupTouchBlur: setupTouchBlur,
		teardownBlur: teardownBlur,
		cancelBlur: cancelBlur,
		setupKeys: setupKeys,
		teardownKeys: teardownKeys,
		icons: icons,
		popupClass: popupClass,
		miniBtnClasses: miniBtnClasses,
		keyboardEdit: keyboardEdit,
		place: place,
		setupScrollEvents: setupScrollEvents,
		teardownScrollEvents: teardownScrollEvents
	};
}]);
