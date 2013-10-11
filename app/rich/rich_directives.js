/* ==================================================================
	AngularJS Datatype Editor - Rich Text
	A directive to edit a large text blob in place.
	TODO: In the future it will allow rich text formatting

	Usage:
	<div ade-rich='{"class":"input-large","id":"1234"}' ng-model="data">{{data}}</div>

	Config:
	"class" will be added to the input box so you can style it.
	"id" will be used in messages broadcast to the app on state changes.

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeRich', ['ADE', '$compile', function(ADE, $compile) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-rich=""></div>

		//The link step (after compile)
		link: function(scope, element, attrs, controller) {
			// each tinyMCE editor get its own id
			// this is not needed but makes it clearer that were dealing with separate editors
			var id = Math.floor(Math.random() * 100000);
			var options = {};
			var editing = false;
			var txtArea = null;
			var input = null;
			var value = '';
			var oldValue = '';
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null; //the delay when mousing out of the ppopup
			var maxLength = null;
			var maxValue = null; //part of maxLength implementation

			//whenever the model changes, we get called so we can update our value
			if (controller !== null && controller !== undefined) {
				controller.$render = function() {
					oldValue = value = maxValue = controller.$modelValue;
					if (value === undefined || value === null) value = '';
					return controller.$viewValue;
				};
			}

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				oldValue = value;
				exit = exited;

				var editor = $('#tinyText' + id + '_ifr').contents().find('#tinymce')[0];
				var currentLength = $(editor).find('p')[0].innerHTML.length;

				// don't save value on esc (revert)
				// and if the current length is greater than the previous max length
				// 100 padding covers html tags
				if ((exited != 3) && (!maxLength || (currentLength <= maxLength + 100))) {
					// Special case: Length surpasses options.maxLength
					// Reduce maxLength to current length until it reaches options.maxLength
					if (maxLength > options.maxLength) {
						maxLength = currentLength;
					}

					if(editor!=undefined) { //if we can't find the editor, dont overwrite the old text with nothing. Just cancel
						value = editor.innerHTML;
						// check if contents are empty
						if (value === '<p><br data-mce-bogus="1"></p>' || value === '<p></p>' || value === '<p><br></p>') {
							value = '';
						}
						value = $.trim(value);
						controller.$setViewValue(value);
					} else {
						//editor wasn't found for some reason. Can we recover, or do we need to?
					}
				}

				input.remove();
				editing = false;

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

				// we're done, no need to listen to events
				$(document).off('click.ADE');
				$(document).off('keydown.ADE');

				scope.$digest();
			};

			//shows a popup with the full text in read mode
			//TODO: handle scrolling of very long text blobs
			var viewRichText = function() {
				scope.ADE_hidePopup();

				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight-2;
				var content = value.replace ? value.replace(/\n/g, '<br />') : value; //what is inside the popup

				if (!content) return; //dont show popup if there is nothing to show

				$compile('<div class="' + ADE.popupClass + ' ade-rich dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px"><div class="ade-richview">' + content + '</div></div>')(scope).insertAfter(element);

				// Convert relative urls to absolute urls
				// http://aknosis.com/2011/07/17/using-jquery-to-rewrite-relative-urls-to-absolute-urls-revisited/
				$('.ade-richview').find('a').not('[href^="http"],[href^="https"],[href^="mailto:"],[href^="#"]').each(function() {
					var href = this.getAttribute('href');
					var hrefType = href.indexOf('@') !== -1 ? 'mailto:' : 'http://';
					this.setAttribute('href', hrefType + href);
				});

				editing = false;

				input = element.next('.ade-rich');
				input.bind('mouseenter.ADE', mousein);
				input.bind('mouseleave.ADE', mouseout);
				input.bind('click.ADE', mouseclick);
			};

			//place the popup in the proper place on the screen
			var place = function() {
				var richText = $('#richText');
				var offset = richText.offset();

				//flip up top if off bottom of page
				var windowH = $(window).height();
				var scroll = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
				var textHeight = richText[0].offsetTop + richText[0].offsetHeight;

				if (textHeight - scroll > windowH) {
					richText.css({
						top: offset.top - richText[0].offsetHeight - element.height() - 13,
						left: offset.left
					}).addClass("flip");
				}
			};

			//sets the height of the textarea based on the actual height of the contents.
			//min and max are set in css
			var textareaHeight = function(elem) {
				elem.style.height = '1px';
				elem.style.height = (elem.scrollHeight) + 'px';
			};

			// detect clicks outside tinymce textarea
			var outerBlur = function(e) {
				// check where click occurred
				//   1: inside ade popup
				//   0: outside ade popup
				var outerClick = $('.ade-popup').has(e.target).length === 0;

				// check if modal for link is shown
				var modalShown = $('.mce-floatpanel').css('display') === 'block';
				
				if (!modalShown && outerClick) {
					// some elements are outside popup but belong to mce
					// these elements start with the text 'mce_' or have a parent/grandparent that starts with the text 'mce_'
					// the latter include texcolor color pickup background element, link ok and cancel buttons
					
					// check if id starts with 'mce_'
					//   0: true
					//  -1: false
					var parent = e.target;
					var startsMce = false;
					while (parent) {
						if (parent.id.search('mce_') === 0) {
							startsMce = true;
							break;
						}
						parent = parent.parentElement;
					}

					// blur and save changes
					if (!startsMce) {
						mouseout();
						saveEdit(0);
						$(document).off('mousedown.ADE');
					}
				}
			};

			// handle special keyboard events
			var handleKeyEvents = function(e) {
				// Enforce maximum length, if defined

				// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
				// Esc - 27; Tab - 9; Backspace - 8 
				var specialCodes = [27, 9, 8];

				// Do not enforce on special codes
				if (maxLength && specialCodes.indexOf(e.keyCode) == -1) {
					var editor = $('#tinyText' + id + '_ifr').contents().find('#tinymce')[0];
					var editorValue = $(editor).find('p')[0].innerHTML;
					var length = editorValue.length;
					
					// Don't allow more characters
					// 100 padding covers html tags
					if (length > maxLength + 100) {
						$(editor).find('p')[0].innerHTML = maxValue;
						e.stopPropagation();
						e.preventDefault();
					} else {
						maxValue = editorValue + String.fromCharCode(e.keyCode);
					}
				}

				// Listen for esc and tab events
				switch(e.keyCode) {
					case 27: // esc
						mouseout();
						saveEdit(3); // don't save results
						e.preventDefault();
						$(document).off('mousedown.ADE');
						break;
					case 9: // tab
						var exit = e.shiftKey ? -1 : 1;
						mouseout();
						saveEdit(exit); // blur and save
						e.preventDefault();
						$(document).off('mousedown.ADE');
						break;
					default:
						break;
				}
			};

			//enters edit mode for the text
			var editRichText = function() {
				window.clearTimeout(timeout);
				if(input) input.unbind('.ADE');

				scope.ADE_hidePopup();

				var content = '<textarea id="tinyText' + id + '" class="' + options.className + '" style="height:30px">' + value + '</textarea>';
				
				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight;
				var html = '<div id="richText" class="' + ADE.popupClass + ' ade-rich dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' + content + '</div>';
				$compile(html)(scope).insertAfter(element);

				// Initialize tinymce
				// Full example:
				//   http://www.tinymce.com/tryit/full.php

				maxLength = maxValue.length > options.maxLength ? maxValue.length : options.maxLength;
				
				tinymce.init({
					selector: "#tinyText" + id,
					theme: "modern",
					menubar: "false",
					plugins: ["textcolor", "link"],
					toolbar: "styleselect | bold italic | bullist numlist outdent indent | hr | link | forecolor backcolor",
					baseURL: "",
					handleKeyEvents: handleKeyEvents //This interacts with a 1 line modification that we made to TinyMCE
				});

				editing = true;

				input = element.next('.ade-rich');

				// Handle blur case
				// save when user blurs out of text editor
				// listen to clicks on all elements in page
				// this will determine when to blur
				$(document).bind('mousedown.ADE', outerBlur);

				//focus the text area. In a timer to allow tinymce to initialize.
				timeout = window.setTimeout(function() {
					tinymce.execCommand('mceFocus',false,"tinyText" + id);
				},100);
			};

			//When the mouse enters, show the popup view of the note
			var mousein = function()  {
				window.clearTimeout(timeout);
				
				//if any other popup is open in edit mode, don't do this view
				if (angular.element('.ade-rich').hasClass('open') && angular.element('.ade-rich').find('textarea').length) return;

				var linkPopup = element.next('.ade-rich');
				if (!linkPopup.length) {
					viewRichText();
				}
			};

			//if the mouse leaves, hide the popup note view if in read mode
			var mouseout = function() {
				var linkPopup = element.next('.' + ADE.popupClass + '');
				if (linkPopup.length && !editing) { //checks for read/edit mode
					timeout = window.setTimeout(function() {
						scope.ADE_hidePopup(element);
					},400);
				}
			};

			//handles clicks on the read version of the data
			var mouseclick = function() {
				window.clearTimeout(timeout);
				if (editing) return;
				editing = true;
				exit = 0;

				ADE.begin(options);

				editRichText();
				place();
			};

			//handles enter keydown on the read version of the data
			var enter = function(e) {
				if (e.keyCode === 13) { // enter
					mouseclick();
				}
			};

			element.bind('mouseenter.ADE', mousein);
			element.bind('mouseleave.ADE', mouseout);
			element.bind('click.ADE', mouseclick);
			element.bind('keydown.ADE', enter);

			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeRich', function(settings) { //settings is the contents of the ade-rich="" string
				options = ADE.parseSettings(settings, {className: 'input-xlarge'});
				return element;
			});
		}
	};
}]);
