/* ==================================================================
	AngularJS Datatype Editor - Rich Text
	A directive to edit a large text blob in place.
	TODO: In the future it will allow rich text formatting

	Usage:
	<div ade-rich ade-class="input-large" ade-id="1234" ade-max="2000" ade-cut="25" ng-model="data"></div>

	Config:

	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the stars to be editable	
	ade-max:
		The optional maximum length to enforce
	ade-cut:
		The number of characters to show as a preview before cutting off and showing
		the rest after a click or hover	

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

		scope: {
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			adeMax: "@",
			adeCut: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			// each tinyMCE editor get its own id
			// this is not needed but makes it clearer that were dealing with separate editors
			var id = Math.floor(Math.random() * 100000);
			var editing = false;
			var txtArea = null;
			var input = null;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null; //the delay when mousing out of the ppopup
			var readonly = false;
			var inputClass = "";
			var cutLength = 100; 
			var maxLength = null; //the maxLength is enforced on edit, not from external changes
			var origMaxLength = null;

			if(scope.adeMax!==undefined) origMaxLength = maxLength = parseInt(scope.adeMax);
			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeCut!==undefined) cutLength = parseInt(scope.adeCut);


			//Whenever the model changes we need to regenerate the HTML for displaying it
			var makeHTML = function() {
				var html = "";
				var value = scope.ngModel;
				var len = cutLength || 100;
				
				if (value) {
					if (angular.isArray(value)) value = value[0];

					if (!value.split) value = value.toString(); //convert to string if not string (to prevent split==undefined)

					//set the max length higher or it would be truncated right away on editing
					if(maxLength && value.length>maxLength) maxLength = value.length;
		
					// strip html
					var text = $(value).text();
					if (text) value = text;

					var lines = value.split(/\r?\n|\r/);
					value = lines[0]; //get first line

					if (len < value.length) {
						html = value.substring(0, len) + '...';
					} else if(lines.length>1) {
						html = value + "...";
					} else {
						html = value;
					}
				}

				element.html(html);
			};

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				var oldValue = scope.ngModel;
				exit = exited;

				var editor = $('#tinyText' + id + '_ifr').contents().find('#tinymce')[0];
				var currentLength = $(editor).text().length;

				// don't save value on esc (revert)
				// and if the current length is greater than the previous max length
				// 100 padding covers html tags
				if ((exited != 3) && (!maxLength || (currentLength <= maxLength))) {
					// Special case: Length surpasses maxLength and maxLength is artificially high
					// Reduce maxLength to current length until it reaches origMaxLength
					if (maxLength > origMaxLength && maxLength>currentLength) {
						maxLength = currentLength;
					}

					if(editor!=undefined) { //if we can't find the editor, dont overwrite the old text with nothing. Just cancel
						var value = editor.innerHTML;
						// check if contents are empty
						if (value === '<p><br data-mce-bogus="1"></p>' || value === '<p></p>' || value === '<p><br></p>') {
							value = '';
						}
						value = $.trim(value);
						scope.ngModel = value;
					} else {
						//editor wasn't found for some reason. Can we recover, or do we need to?
					}
				}

				input.remove();
				editing = false;

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

				// we're done, no need to listen to events
				$(document).off('click.ADE');
				$(document).off('keydown.ADE');
			};

			//shows a popup with the full text in read mode
			//TODO: handle scrolling of very long text blobs
			var viewRichText = function() {
				ADE.hidePopup();

				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight-2;
				var content = scope.ngModel.replace ? scope.ngModel.replace(/\n/g, '<br />') : scope.ngModel; //what is inside the popup

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
				input.on('mouseenter.ADE', mousein);
				input.on('mouseleave.ADE', mouseout);
				if(!readonly) input.on('click.ADE', mouseclick);
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
				// Esc - 27; Tab - 9; Backspace - 8 ; Delete - 46; Arrow keys = 37-40
				var specialCodes = [27, 9, 8, 46, 37, 38, 39, 40];

				// Do not enforce on special codes
				if (maxLength && specialCodes.indexOf(e.keyCode) == -1) {
					var editor = $('#tinyText' + id + '_ifr').contents().find('#tinymce')[0];
					var editorValue = $(editor).find('p')[0].innerHTML;
					var length = $(editor).text().length;

					// Don't allow more characters
					if (length >= maxLength) {
						// debugger;
						$(editor).find('p')[0].innerHTML = editorValue;
						e.stopPropagation();
						e.preventDefault();
					}
				}

				// Listen for esc and tab events
				switch(e.keyCode) {
					case 27: // esc
						scope.$apply(function() {
							mouseout();
							saveEdit(3); // don't save results
						});
						e.preventDefault();
						$(document).off('mousedown.ADE');
						break;
					case 9: // tab
						var exit = e.shiftKey ? -1 : 1;
						scope.$apply(function() {
							mouseout();
							saveEdit(exit); // blur and save
						});
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
				if(input) input.off('.ADE');

				ADE.hidePopup();

				var content = '<textarea id="tinyText' + id + '" class="' + inputClass + '" style="height:30px">' + scope.ngModel + '</textarea>';
				
				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight;
				var html = '<div id="richText" class="' + ADE.popupClass + ' ade-rich dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' + content + '</div>';
				$compile(html)(scope).insertAfter(element);

				// Initialize tinymce
				// Full example:
				//   http://www.tinymce.com/tryit/full.php

				
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
				$(document).on('mousedown.ADE', function(e) {
					scope.$apply(function() {
						outerBlur(e);
					})
				});

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
						ADE.hidePopup(element);
					},400);
				}
			};

			//handles clicks on the read version of the data
			var mouseclick = function() {
				window.clearTimeout(timeout);
				if (editing) return;
				editing = true;
				exit = 0;

				ADE.begin(scope.adeId);

				editRichText();
				place();
			};

			element.on('mouseenter.ADE', mousein);
			element.on('mouseleave.ADE', mouseout);
			
			if(!readonly) {
				element.on('click.ADE', mouseclick);

				//handles enter keydown on the read version of the data
				element.on('keydown.ADE', function(e) {
					if (e.keyCode === 13) { // enter
						mouseclick();
					}
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
