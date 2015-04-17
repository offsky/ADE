/* ==================================================================
	AngularJS Datatype Editor - Rich Text
	A directive to edit a large text blob in place.
	
	http://www.tinymce.com/wiki.php/api4:index

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
		the rest after a click or hover.  Set to -1 to show all characters and disable hover preview
	ade-save-cancel:
		If you want save/cancel buttons

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeRich', ['ADE', '$compile', '$sanitize', function(ADE, $compile, $sanitize) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-rich=""></div>

		scope: {
			adeId: "@",
			adeReadonly: "@",
			adeSaveCancel: "@",
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
			var cutLength = 100; 
			var maxLength = null; //the maxLength is enforced on edit, not from external changes
			var origMaxLength = null;
			var stopObserving = null;
			var adeId = scope.adeId;
			var supportsTouch = ('ontouchend' in window);
			var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
			var windowW = $(window).width();
			var fullScreenBreakpoint = 480;
			var isFullScreen = false;
			var saveCancel = true;

			if(scope.adeMax!==undefined) origMaxLength = maxLength = parseInt(scope.adeMax);
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeCut!==undefined) cutLength = parseInt(scope.adeCut);
			if(scope.adeSaveCancel!==undefined && scope.adeSaveCancel=="0") saveCancel = false;

			//Whenever the model changes we need to regenerate the HTML for displaying it
			var makeHTML = function() {
				var html = "";
				var value = scope.ngModel;
				var len = cutLength || 100;
				
				if (value!==undefined) {
					if (angular.isArray(value)) value = value[0];

					if(value==null || value==undefined) value = "";
					if (!value.split) value = value.toString(); //convert to string if not string (to prevent split==undefined)

					//set the max length higher or it would be truncated right away on editing
					if(maxLength && value.length>maxLength) maxLength = value.length;
		
					if(len==-1) { //wanting to display all text in read mode
						html = value;
					} else {
						//wanting to truncate display
						
						// strip html if we are truncating, to prevent unclosed tags
						//TODO: allow html, but close them properly 
						//similar to php http://stackoverflow.com/questions/3380407/puzzle-splitting-an-html-string-correctly
						//http://ejohn.org/apps/htmlparser/
						value = $sanitize(value).replace(/<[^>]+>/gm, '');

						var lines = value.split(/\r?\n|\r/);
						value = lines[0]; //get first line. We wont display other lines otherwise they would run together and look strange

						if (len < value.length) { // if the first line is longer than the max allowed trucate and print ...
							html = value.substring(0, len) + '...';
						} else if(lines.length>1) { //if there is more than 1 line, display entire line and ...
							html = value + "...";
						} else {
							html = value; //if there is only one line that is short enough. dont print ...
						}
					}
				}

				element.html(html);
			};

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				// console.log("save",adeId);
				var oldValue = scope.ngModel;
				exit = exited;
						
				var editor = $('#tinyText' + id);
				var currentLength = editor.text().length;

				// don't save value on esc (revert)
				// and if the current length is greater than the previous max length
				// 100 padding covers html tags
				if ((exited != 3) && (!maxLength || (currentLength <= maxLength))) {
					// Special case: Length surpasses maxLength and maxLength is artificially high
					// Reduce maxLength to current length until it reaches origMaxLength
					if (maxLength > origMaxLength && maxLength>currentLength) {
							maxLength = currentLength;
					}

					if(editor!==undefined && editor[0]!==undefined) { //if we can't find the editor, dont overwrite the old text with nothing. Just cancel
						var value = editor[0].innerHTML;
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

				input.off();

				input.remove();
				editing = false;
				isFullScreen = false;

				ADE.hidePopup(element);
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

				// we're done, no need to listen to events
				destroy();
			};

			//shows a popup with the full text in read mode
			var viewRichText = function() {
				ADE.hidePopup();

				var content = scope.ngModel; //what is inside the popup

				if(scope.ngModel && angular.isString(scope.ngModel)) content = scope.ngModel.replace(/\n/g, '<br />');

				if (!content) return; //dont show popup if there is nothing to show

				$compile('<div class="ade-popup ade-rich dropdown-menu open"><div class="ade-richview">' + content + '</div></div>')(scope).insertAfter(element);
				place();

				// Convert relative urls to absolute urls
				// http://aknosis.com/2011/07/17/using-jquery-to-rewrite-relative-urls-to-absolute-urls-revisited/
				$('.ade-richview').find('a').not('[href^="http"],[href^="https"],[href^="mailto:"],[href^="#"]').each(function() {
					var href = this.getAttribute('href');
					var hrefType = href.indexOf('@') !== -1 ? 'mailto:' : 'http://';
					this.setAttribute('href', hrefType + href);
				});

				editing = false;

				input = element.next('.ade-rich');
				input.on('mouseenter.ADE', mousein); //these two are to debounce the mouse leaving/entering
				input.on('mouseleave.ADE', mouseout);
				if(!readonly) input.on('click.ADE', mouseclick);

				$(document).on('touchend.ADE', function(e) {
					var outerClick = $('.ade-popup').has(e.target).length === 0;
					if(outerClick) mouseout();
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
			};

			//place the popup in the proper place on the screen by flipping it if necessary
			var place = function() {
				if(isFullScreen && editing) return;
				ADE.place('.ade-rich',element,25,-5);

				//https://remysharp.com/2012/05/24/issues-with-position-fixed-scrolling-on-ios
				
				//If the toolbar exists, we need to place it at the proper place
				if($('.ade-toolbar').length) {
					var top = $('.ade-rich')[0].offsetTop;
					var scrollTop = $(window).scrollTop();
					var height = $('.ade-toolbar').height();
					if(height==0) height=30; //take a guess
					var pos = 5-height; //toolbar is fixed, so we need to place it right above the text area
					if(scrollTop-top>pos) pos = scrollTop-top; //unless that is off the screen, then place it at thet op of the screen, obscuring the top of the text area
					var width = $('.ade-rich').width()+10;

					$('.ade-toolbar').css('top',pos+"px");
					$('.ade-toolbar').css('width',width+'px');

					var marginFix = scrollTop;
					$('.mce-floatpanel').css('margin-top',marginFix+"px");

					console.log("place",top,scrollTop,height,pos,scrollTop-top);
					// console.log("rich",$('.ade-rich').offset(),$('.ade-rich').position());
					// console.log("tool",$('.ade-toolbar').offset(),$('.ade-toolbar').position());
				}
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
					
					// check if id starts with 'mce'
					//   0: true
					//  -1: false
					var parent = e.target;
					var startsMce = false;
					while (parent) {
						if (parent.id.search('mce') === 0) {
							startsMce = true;
							break;
						}
						parent = parent.parentElement;
					}

					// blur and save changes
					if (!startsMce) {
						saveEdit(0);
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
					var editor = $('#tinyText' + id);
					var editorValue = editor[0].innerHTML;
					var length = editor.text().length;

					// Don't allow more characters
					if (length >= maxLength) {
						e.stopPropagation();
						e.preventDefault();
					}
				}

				// Listen for esc and tab events
				switch(e.keyCode) {
					case 27: // esc
						scope.$apply(function() {
							saveEdit(3); // don't save results
						});
						e.preventDefault();
						$(document).off('click.ADE');
						break;
					case 9: // tab
						var exit = e.shiftKey ? -1 : 1;
						scope.$apply(function() {
							saveEdit(exit); // blur and save
						});
						e.preventDefault();
						$(document).off('click.ADE');
						break;
					default:
						break;
				}
			};

			//enters edit mode for the text
			var editRichText = function() {
				id = Math.floor(Math.random() * 100000);
				
				window.clearTimeout(timeout);
				if(input) input.off('.ADE');
				//element.off('.ADE');
				destroy();

				ADE.hidePopup(element);

				var modelValue = "";
				if(scope.ngModel) modelValue = scope.ngModel;

				var touchClass="";
				if(iOS) touchClass = " ade-hasTouch"; //because touch devices (iOS) put copy/paste controls that would cover the rich text toolbar

				var content = '';
				content += '<div id="tinyToolbar' + id + '" class="ade-toolbar mce-panel"></div>';
				content += '<div id="tinyText' + id + '" class="ade-content">' + modelValue + '</div>';
				
				var html = '<div class="ade-popup ade-rich dropdown-menu open '+ touchClass + '">' + content + '</div>';
				$compile(html)(scope).insertAfter(element);
				place();

				var toolbarOptions = "saveButton cancelButton | styleselect | forecolor backcolor | bullist numlist | outdent indent | link";
				if(!saveCancel) toolbarOptions = "styleselect | forecolor backcolor | bullist numlist | outdent indent | link";

				// Initialize tinymce
				// Full example:
				// http://www.tinymce.com/tryit/full.php
				tinymce.init({
					selector: "#tinyText" + id,
					theme: "modern",
					menubar: false,
					statusbar: true,
					plugins: ["textcolor", "link", 'fullscreen'],
					toolbar: toolbarOptions,
					baseURL: "",
					inline:true,
					resize: "both",
					fixed_toolbar_container: "#tinyToolbar"+id,
					style_formats: [
						 {title: "Headers", items: [
							  {title: "Header 1", format: "h1"},
							  {title: "Header 2", format: "h2"},
							  {title: "Header 3", format: "h3"},
							  {title: "Header 4", format: "h4"},
							  {title: "Header 5", format: "h5"},
							  {title: "Header 6", format: "h6"}
						 ]},
						 {title: "Sizes", items: [
							  {title: "Small", inline: 'span', styles: {fontSize: '0.8em'}},
							  {title: "Normal", inline: 'span', styles: {fontSize: '1em'}},
							  {title: "Large", inline: 'span', styles: {fontSize: '1.3em'}},
							  {title: "Huge", inline: 'span', styles: {fontSize: '1.7em'}}
						 ]},
						 {title: "Styles", items: [
							  {title: "Bold", icon: "bold", format: "bold"},
							  {title: "Italic", icon: "italic", format: "italic"},
							  {title: "Underline", icon: "underline", format: "underline"},
							  {title: "Strikethrough", icon: "strikethrough", format: "strikethrough"},
							  {title: "Superscript", icon: "superscript", format: "superscript"},
							  {title: "Subscript", icon: "subscript", format: "subscript"},
							  {title: "Code", icon: "code", format: "code"}
						 ]},
						 {title: "Alignment", items: [
							  {title: "Left", icon: "alignleft", format: "alignleft"},
							  {title: "Center", icon: "aligncenter", format: "aligncenter"},
							  {title: "Right", icon: "alignright", format: "alignright"},
							  {title: "Justify", icon: "alignjustify", format: "alignjustify"},
							  {title: "Blockquote", icon: "blockquote",format: "blockquote"},
						 ]}
					],

					setup: function(ed) {
						ed.on('init', function(args) {
							
							//goFullScreen(ed);
							
							//focus the text area. In a timer to allow tinymce to initialize.
							tinymce.execCommand('mceFocus',false,"tinyText" + id);
						});
						ed.on('keydown', handleKeyEvents);
						ed.addButton('saveButton', {
							title: "Save",
							text: "",
							icon:"save",
							onclick: function() {
								scope.$apply(function() {
									saveEdit(0); // blur and save
								});
							}
						});
						ed.addButton('cancelButton', {
							title: "Cancel",
							text: "",
							icon:"cancel",
							onclick: function() {
								scope.$apply(function() {
									saveEdit(3); // blur and cancel
								});
							}
						});
					}
				});

				editing = true;

				input = element.next('.ade-rich');

				$('.ade-toolbar').on('click.ADE', function() {
					place();
				});

				// save when user blurs out of text editor
				// listen to clicks on all elements on page
				// in a timer to prevent clicks on read popup from bleeding through
				setTimeout(function() {
					/* Note: Adding any touch event listener (touchend, touchstart) cause iOS to 
						delay the placement of the cursor on tap and instead requires
						a tap+hold to place cursor. We need the touch event to save on an
						external tap (document.click isn't called on ios). 
						Can't find a way around this.
					*/
					$(document).on('click.ADE touchend.ADE', function(e) {
						scope.$apply(function() {
							outerBlur(e);
						});
					});					
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
			};

			//go full screen if necessary or take out
			var goFullScreen = function(ed) {
				if(ed===undefined) ed = tinymce.activeEditor;
				windowW = $(window).width();

				if(windowW<=fullScreenBreakpoint) { //small window
					if(isFullScreen) return; //already full screen
					isFullScreen = true;

					//full screen doesnt work in startup. Must do after short delay
					window.setTimeout(function() {
						tinymce.execCommand('mceFullScreen');
						
						//this fixes an apparent bug with tinymce calculating the height of the inner iframe
						var top = $('.ade-popup iframe')[0].offsetTop;
						var height = $('.ade-popup .mce-tinymce')[0].clientHeight;
						var newHeight = 100;//height-top
						$('.ade-popup iframe').css('height',newHeight+"px");

					//	window.scrollTo(0,0);
					},100); 

					//TODO: Force save/cancel buttons onto their own row to prevent odd wrapping

				} else { //large window
					isFullScreen = false;
				}
			};

			//When the mouse enters, show the popup view of the note
			var mousein = function()  {
				// console.log("mouse in",adeId,editing);
				if(editing || cutLength==-1) return; //dont display read version if editing, or if showing all already
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
				// console.log("mouse out",adeId,editing);		
				if(editing) return;
				var linkPopup = element.next('.ade-popup');
				if (linkPopup.length && !editing) { //checks for read/edit mode
					timeout = window.setTimeout(function() {
						if(input) input.off('.ADE');
						ADE.hidePopup(element);
						destroy();
					},400);
				}
			};

			//handles clicks on the read version of the data
			var mouseclick = function() {
				// console.log("mouse click",adeId,editing);	
				if(editing) return;
				window.clearTimeout(timeout);
				if (editing) return;
				editing = true;
				exit = 0;

				adeId = scope.adeId;
				ADE.begin(adeId);

				editRichText();
				setTimeout(place); //needs to be in a timeout for the popup's height to be calculated correctly
			};

			//sets up click, mouse enter and mouse leave events on the original element for preview and edit
			var setupElementEvents = function() {
				// console.log("setup",adeId,editing);
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
			};

			setupElementEvents();

			//A callback to observe for changes to the id and save edit
			//The model will still be connected, so it is safe, but don't want to cause problems
			var observeID = function(value) {
				 //this gets called even when the value hasn't changed, 
				 //so we need to check for changes ourselves
				 if(editing && adeId!==value) saveEdit(3);
				 else if(adeId!==value) ADE.hidePopup(element);
			};

			//If ID changes during edit, something bad happened. No longer editing the right thing. Cancel
			stopObserving = attrs.$observe('adeId', observeID);

			var destroy = function() {
				// console.log("destroy",adeId);
				$(document).off('click.ADE');
				$(document).off('touchend.ADE');
				$(document).off('scroll.ADE');
				$(window).off('resize.ADE');
			};
			
			scope.$on('ADE-hideall', function() {
				// console.log("hide",adeId,editing);
				if(editing) saveEdit(0);
			});

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				destroy();

				if(element) element.off();
				if(input) input.off();

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
