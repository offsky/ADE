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
	ade-save-cancel:
		If you want save/cancel buttons
	ade-preview:
		If you want mouse over to cause an expanded preview (default 1)

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
			adePreview: "@",
			adeMax: "@",
			adeSkin: "=",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			// each tinyMCE editor get its own id
			// this is not needed but makes it clearer that were dealing with separate editors
			var id = Math.floor(Math.random() * 100000);
			var editing = false;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null; //the delay when mousing out of the popup
			var timeout_open = null; //the short delay when mousing over the popup
			var readonly = false;
			var maxLength = null; //the maxLength is enforced on edit, not from external changes
			var origMaxLength = null;
			var stopObserving = null;
			var adeId = scope.adeId;
			var supportsTouch = ('ontouchend' in window);
			var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
			var windowW = $(window).width();
			var saveCancel = true;
			var adePreview = true;
			var ignoreClick = false; //gets set to true if on touch device, so click to immediate edit is ignored

			if(scope.adeMax!==undefined) origMaxLength = maxLength = parseInt(scope.adeMax);
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeSaveCancel!==undefined && scope.adeSaveCancel=="0") saveCancel = false;
			if(scope.adePreview!==undefined && scope.adePreview=="0") adePreview = false;

			//Whenever the model changes we need to regenerate the HTML for displaying it
			var makeHTML = function() {
				var value = scope.ngModel;
				
				if (value!==undefined) {
					if (angular.isArray(value)) value = value[0];

					if(value==null || value==undefined) value = "";
					if (!value.split) value = value.toString(); //convert to string if not string (to prevent split==undefined)
				} else {
					value="";
				}

				element.html(value);

				//set the max length higher or it would be truncated right away on editing
				if(maxLength && element.text().length>maxLength) maxLength = element.text().length;
			};

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				// console.log("save",adeId);
				var oldValue = scope.ngModel;
				exit = exited;
				
				var tinyText = $("#tinyText"+id);
				var currentLength = tinyText.text().length;

				// don't save value on esc (revert)
				// and if the current length is greater than max length
				if ((exited != 3) && (!maxLength || (currentLength <= maxLength))) {
					if(element!==undefined && element[0]!==undefined && tinyText.length) { //if we can't find the editor, dont overwrite the old text with nothing. Just cancel
						
						// Convert relative urls to absolute urls
						// http://aknosis.com/2011/07/17/using-jquery-to-rewrite-relative-urls-to-absolute-urls-revisited/
						tinyText.find('a').not('[href^="http"],[href^="https"],[href^="mailto:"],[href^="#"]').each(function() {
							var href = this.getAttribute('href');
							var hrefType = href.indexOf('@') !== -1 ? 'mailto:' : 'http://';
							this.setAttribute('href', hrefType + href);
						});

						var value = tinyText[0].innerHTML;
												
						//auto-convert urls
						//https://regex101.com/#javascript
						urlPattern1 = /(https?:\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|])([ \n])/gim; //matches urls followed by space or newline only
						urlPattern2 = /(https?:\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|])(<\/(?!a>)|<br>)/gim; //matches urls followed by a closing tag or br tag, only if not an "a" tag
						value = value.replace(urlPattern1, '<a href="$1">$1</a>$2');
						value = value.replace(urlPattern2, '<a href="$1">$1</a>$2');
				    	// var urlPattern = /\b(?:https?):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim; //this one causes a double encoding of already converted links
			        	// value = value.replace(urlPattern, '<a href="$&">$&</a>');				

						//readjust maxLength if it was artifically extended
						var text = tinyText.text();
						if (maxLength > origMaxLength && maxLength>text.length) {
							maxLength = text.length;
						}

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

				editing = false;
				hideDiv();

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
			var viewRichText = function(e,goEdit) {
				// console.log("show",id);

				//already showing
				if($('#ade-rich'+id).length) {
					if(goEdit!==undefined && goEdit) editRichText();				
					return;
				}

				//ADE.hidePopup(); //hide any ADE popups already presented

				var modelValue = scope.ngModel ? scope.ngModel : "";
				var editor = '<div id="ade-rich' + id + '" class="ade-rich"><div id="tinyText' + id + '" class="ade-content">' + modelValue + '</div></div>';
				$compile(editor)(scope).insertAfter(element);
				place();
				window.setTimeout(place,300);

				window.setTimeout(function() { //in a timeout for css transition to work
					$('#tinyText'+id).addClass("ade-hover");
					if(goEdit!==undefined && goEdit) editRichText();				
				});

				$('#tinyText'+id).on('mouseleave.rADE', mouseout);
				$('#tinyText'+id).on('click.rADE', mouseclick);
				$('#tinyText'+id).on('mouseenter.rADE', function() {
					window.clearTimeout(timeout);
				});

				$(document).on('scroll.rADE'+id, place);

				$(document).on('touchend.rADE', function(e) {
					var outerClick = $('#ade-rich'+id).has(e.target).length === 0;
					if(outerClick) mouseout();
				});

				element.addClass("ade-rich-hide");
			};

			//place the popup in the proper place on the screen by flipping it if necessary
			var place = function() {
				//ADE.place('#ade-rich'+id,element,-20,-5);

				//https://remysharp.com/2012/05/24/issues-with-position-fixed-scrolling-on-ios

				//var sp = ADE.scrollParent(element);
				var scrollV = $(window).scrollTop();
				var scrollH = $(window).scrollLeft();
				var offset = element.offset();
				var height = element.height();
				var width = element.width();
				var windowW = $(window).width();

				// console.log("POSITION TOP/HEIGHT/SCROLL: ",offset.top,height,scrollV,"calc:",(offset.top-scrollV));
				// console.trace();

				//position the editable content
				if($('#tinyText'+id).length) {
					$('#tinyText'+id).css('top',(offset.top-scrollV)+"px").css('left',(offset.left-scrollH)+"px").css('width',width+"px").css('height',height+"px");
				}

				//If the toolbar exists, we need to place it at the proper place
				if($('.ade-toolbar').length) {
					var height = $('.ade-toolbar').height();
					if(height==0) height=30; //take a guess
					var pos = offset.top-scrollV-height; //toolbar is fixed, so we need to place it right above the text area
					var txtwidth = $("#tinyText"+id).width()+6;

					$('.ade-toolbar').css('top',pos+"px").css('left',(offset.left-scrollH)+"px");
					$('.ade-toolbar').css('width',txtwidth+'px');
				}

				if($('#tinyText'+id).length) {
					var popW = $('#tinyText'+id).width();
					var popL = $('#tinyText'+id).offset().left;
					if(windowW+scrollH<popL+popW) { //if it would be off the right side, move it over
						var off = popL+popW - windowW + 15;
						var space = windowW-popW;
						var newLeft = popL-off; //(space/2)

						if(space>0) {
							$('#tinyText'+id).css('left',newLeft+"px");
							$('.ade-toolbar').css('left',newLeft+"px");
						} else {
							$('#tinyText'+id).css('left',"0px");
							$('.ade-toolbar').css('left',"0px");
						} 
					}
				}
			};

			// detect clicks outside tinymce while editing
			var outerBlur = function(e) {
				var outerClick = $('#ade-rich'+id).has(e.target).length === 0;

				// check if modal for link is shown
				var modalShown = $('.mce-floatpanel').css('display') === 'block';
				
				if (!modalShown && outerClick) {
					// some elements are outside popup but belong to mce
					// these elements start with the text 'mce_' or have a parent/grandparent that starts with the text 'mce_'
					// the latter include texcolor color pickup background element, link ok and cancel buttons
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
					var editorValue = $('#tinyText'+id)[0].innerHTML;
					var length = $('#tinyText'+id).text().length;

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
						break;
					case 9: // tab
						var exit = e.shiftKey ? -1 : 1;
						scope.$apply(function() {
							saveEdit(exit); // blur and save
						});
						e.preventDefault();
						break;
					default:
						break;
				}
			};

			//enters edit mode for the text
			var editRichText = function() {
				
				window.clearTimeout(timeout);
				destroy();

				var touchClass="";
				if(iOS) touchClass = " ade-hasTouch"; //because touch devices (iOS) put copy/paste controls that would cover the rich text toolbar

				var toolbar = '<div id="tinyToolbar' + id + '" class="ade-toolbar mce-panel"></div>';
				
				$compile(toolbar)(scope).insertAfter($('#tinyText'+id));
				place();
				//setTimeout(place,300); //needs to be in a timeout for the popup's height to be calculated correctly

				var toolbarOptions = "saveButton cancelButton | styleselect | forecolor backcolor | bullist numlist | outdent indent | link";
				if(!saveCancel) toolbarOptions = "styleselect | forecolor backcolor | bullist numlist | outdent indent | link";

				var style_menu = [
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
				];

				var tinymce_setup = function(ed) {
					ed.on('init', function(args) {
						//focus the text area. In a timer to allow tinymce to initialize.
						tinymce.execCommand('mceFocus',false,"tinyText"+id);
					});
					ed.on('keydown', handleKeyEvents);
					ed.addButton('saveButton', {
						title: "Save", text: "", icon:"save",
						onclick: function() {
							scope.$apply(function() {
								saveEdit(0); // blur and save
							});
						}
					});
					ed.addButton('cancelButton', {
						title: "Cancel", text: "", icon:"cancel",
						onclick: function() {
							scope.$apply(function() {
								saveEdit(3); // blur and cancel
							});
						}
					});
				};

				var params = {
					selector: "#tinyText"+id,
					theme: "modern",
					menubar: false,
					statusbar: true,
					plugins: ["textcolor", "link", 'fullscreen'],
					toolbar: toolbarOptions,
					baseURL: "",
					inline:true,
					resize: "both",
					fixed_toolbar_container: "#tinyToolbar"+id,
					style_formats: style_menu,
					setup: tinymce_setup
				};

				if(scope.adeSkin!==undefined) params.skin_url = scope.adeSkin;

				tinymce.init(params);  // Initialize tinymce http://www.tinymce.com/tryit/full.php

				editing = true;
				$('#tinyText'+id).addClass("ade-editing").removeClass('ade-hover');

				element.addClass("ade-rich-hide");

				// $('.ade-toolbar').on('click.rADE', function() {
				// 	place();
				// });

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
					$(document).on('click.rADE touchend.rADE', function(e) {
						scope.$apply(function() {
							outerBlur(e);
						});
					});
					$(document).on('scroll.rADE'+id, function() {
						//yeah, I know this is terrible. Find a better way for me, please
						if(!iOS) place(); //breaks ios because auto-keyboard triggers a scroll when it comes up causing box to be positioned crazy
					});				
				});

			};

			//When the mouse enters, show the expanded text
			var mousein = function(e,force)  {
				// console.log("mouse in",adeId,editing);
				if(editing) return; //dont display read version if editing
				if(scope.ngModel===undefined || scope.ngModel===null || scope.ngModel==="") return; //don't show if empty

				window.clearTimeout(timeout_open);
				
				//if any other popup is open in edit mode, don't do this view
				if (angular.element('.ade-toolbar').length) return;

				//immediatly hide any other expanded text fields
				$('.ade-rich-hide').removeClass("ade-rich-hide");
				$('.ade-toolbar').remove();
				$('.ade-content').remove();
				$('.ade-rich').remove();
				
				if(force!==undefined && force) viewRichText();
				else timeout_open = window.setTimeout(viewRichText,300);
			};

			//if the mouse leaves, hide the expanded note view if in read mode
			var mouseout = function() {		
				// console.log("mouse out",adeId,editing);		
				if(editing) return;
				window.clearTimeout(timeout);
				timeout = window.setTimeout(hideDiv,500);
			};

			var hideDiv = function() {
				// console.log("hide",id);
				destroy();
				window.clearTimeout(timeout);
				$('#tinyText'+id).off('.rADE')
				$("#tinyToolbar"+id).remove();
				$('#tinyText'+id).removeClass('ade-editing').removeClass('ade-hover');
				window.setTimeout(function() { //after the animation has finished, remove
					$("#tinyText"+id).remove();
					$('#ade-rich'+id).remove();
					element.removeClass('ade-rich-hide');
				},210);
			};
			
			//handles clicks on the read version of the data
			var mouseclick = function() {
				console.log("mouse click",adeId,editing);	
				if(editing) return;
				window.clearTimeout(timeout);
				editing = true;
				exit = 0;

				adeId = scope.adeId;

				scope.$apply(function() {
					ADE.begin(adeId);
				});

				editRichText();
			};

			//sets up click, mouse enter and mouse leave events on the original element for preview and edit
			var setupElementEvents = function() {
				// console.log("setup",adeId,editing);
				if(adePreview) {
					element.on('mouseenter.rADE', mousein);
					element.on('mouseleave.rADE', function() {
						window.clearTimeout(timeout_open);
					})
					element.on('focus.rADE',function(e) {
						console.log("focus");
						mousein(e);
					});
					element.on('touchstart.rADE',function(e) {
						console.log("touchstart");
						//ignoreClick = true; //TODO: make this a preference. If uncommented, it will go into read mode first. Causes a problem if the read mode is empty. Can't edit an empty value
					});
				}
				if(!readonly) {
					element.on('click.rADE', function(e) {
						console.log("click");
						if(!ignoreClick) viewRichText(null,true);
						else mousein(e);
						ignoreClick = false;
					});

					//handles enter keydown on the read version of the data
					element.on('keydown.rADE', function(e) {
						if (e.keyCode === 13) { // enter
							e.preventDefault();
							viewRichText(null,true);
						} else if (e.keyCode === 9 || e.keyCode === 27) { // tab, esc
							hideDiv();
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
				 else if(adeId!==value) hideDiv();
			};

			//If ID changes during edit, something bad happened. No longer editing the right thing. Cancel
			stopObserving = attrs.$observe('adeId', observeID);

			var destroy = function() {
				// console.log("destroy",id);
				// console.trace();
				$(document).off('.rADE');
				$(document).off('.rADE'+id);
			};
			
			scope.$on('ADE-hideall', function() {
				// console.log("hide",adeId,editing);
				if(editing) saveEdit(0);
			});

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				destroy();

				if(element) element.off();

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
