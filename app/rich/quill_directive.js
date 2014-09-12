/* ==================================================================


------------------------------------------------------------------*/

angular.module('ADE').directive('adeQuill', ['ADE', '$compile', '$sanitize', function(ADE, $compile, $sanitize) {
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
			var stopObserving = null;
			var adeId = scope.adeId;
			var quill;

			if(scope.adeMax!==undefined) origMaxLength = maxLength = parseInt(scope.adeMax);
			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeCut!==undefined) cutLength = parseInt(scope.adeCut);


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
		
					// strip html
					value = $sanitize(value).replace(/<[^>]+>/gm, '');

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

				var currentLength = quill.getLength();

				// don't save value on esc (revert)
				// and if the current length is greater than the previous max length
				// 100 padding covers html tags
				if ((exited != 3) && (!maxLength || (currentLength <= maxLength))) {
					// Special case: Length surpasses maxLength and maxLength is artificially high
					// Reduce maxLength to current length until it reaches origMaxLength
					if (maxLength > origMaxLength && maxLength>currentLength) {
							maxLength = currentLength;
					}

					if (quill) { //if we can't find the editor, dont overwrite the old text with nothing. Just cancel
						// Clean Quill content styling (id='line-1', class='line')
						$(quill.root).children().removeAttr('id');
						$(quill.root).children().removeAttr('class');

						var value = quill.getHTML();

						value = $.trim(value);
						scope.ngModel = value;
					} else {
						//editor wasn't found for some reason. Can we recover, or do we need to?
					}
				}

				input.off();

				input.remove();
				editing = false;

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
				$(document).off('mousedown.ADE');
				$(document).off('scroll.ADE');

				// Get rid of Quill Text Editor
				var e = element.next();
				$(e).remove();
			};

	// Rich Text Editor

			//shows a popup with the full text in read mode
			//TODO: handle scrolling of very long text blobs
			var viewRichText = function() {
				ADE.hidePopup(element);

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
				input.on('mouseenter.ADE', mousein);
				input.on('mouseleave.ADE', mouseout);
				if(!readonly) input.on('click.ADE', mouseclick);

				//because the popup is fixed positioned, if we scroll it would
				//get disconnected. So, we just hide it. In the future it might
				//be better to dynamially update it's position
				// $(document).on('scroll.ADE',function() {
				// 	scope.$apply(function() {
				// 		//TODO: Save instead of hide, or position as you scroll
				// 		ADE.hidePopup(element);
				// 	}); 
				// });
			};

			//enters edit mode for the text
			var editRichText = function() {
				window.clearTimeout(timeout);
				if(input) input.off('.ADE');

				ADE.hidePopup(element);

				var modelValue = "";
				if(scope.ngModel) modelValue = scope.ngModel;
				
				var content = '';

				var size = '<span title="Size" class="ql-size ql-picker ql-expanded"><span class="ql-picker-label" data-value="13px">Normal</span><span class="ql-picker-options"><span data-value="10px" class="ql-picker-item">Small</span><span data-value="13px" class="ql-picker-item ql-selected">Normal</span><span data-value="18px" class="ql-picker-item">Large</span><span data-value="32px" class="ql-picker-item">Huge</span></span></span>';
				// var size = '<select title="Size" class="ql-size"> \
				// 	<option value="10px">Small</option> \
				// 	<option value="13px" selected="">Normal</option> \
				// 	<option value="18px">Large</option> \
				// 	<option value="32px">Huge</option> \
				// 	</select>';
				var format = '<span class="ql-format-group"><span title="Text Color" class="ql-color ql-picker ql-color-picker ql-expanded"><span class="ql-picker-label" data-value="rgb(0, 0, 0)"></span><span class="ql-picker-options"><span data-value="rgb(0, 0, 0)" class="ql-picker-item ql-selected ql-primary-color" style="background-color: rgb(0, 0, 0);"></span><span data-value="rgb(230, 0, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(230, 0, 0);"></span><span data-value="rgb(255, 153, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(255, 153, 0);"></span><span data-value="rgb(255, 255, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(255, 255, 0);"></span><span data-value="rgb(0, 138, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(0, 138, 0);"></span><span data-value="rgb(0, 102, 204)" class="ql-picker-item ql-primary-color" style="background-color: rgb(0, 102, 204);"></span><span data-value="rgb(153, 51, 255)" class="ql-picker-item ql-primary-color" style="background-color: rgb(153, 51, 255);"></span><span data-value="rgb(255, 255, 255)" class="ql-picker-item" style="background-color: rgb(255, 255, 255);"></span><span data-value="rgb(250, 204, 204)" class="ql-picker-item" style="background-color: rgb(250, 204, 204);"></span><span data-value="rgb(255, 235, 204)" class="ql-picker-item" style="background-color: rgb(255, 235, 204);"></span><span data-value="rgb(255, 255, 204)" class="ql-picker-item" style="background-color: rgb(255, 255, 204);"></span><span data-value="rgb(204, 232, 204)" class="ql-picker-item" style="background-color: rgb(204, 232, 204);"></span><span data-value="rgb(204, 224, 245)" class="ql-picker-item" style="background-color: rgb(204, 224, 245);"></span><span data-value="rgb(235, 214, 255)" class="ql-picker-item" style="background-color: rgb(235, 214, 255);"></span><span data-value="rgb(187, 187, 187)" class="ql-picker-item" style="background-color: rgb(187, 187, 187);"></span><span data-value="rgb(240, 102, 102)" class="ql-picker-item" style="background-color: rgb(240, 102, 102);"></span><span data-value="rgb(255, 194, 102)" class="ql-picker-item" style="background-color: rgb(255, 194, 102);"></span><span data-value="rgb(255, 255, 102)" class="ql-picker-item" style="background-color: rgb(255, 255, 102);"></span><span data-value="rgb(102, 185, 102)" class="ql-picker-item" style="background-color: rgb(102, 185, 102);"></span><span data-value="rgb(102, 163, 224)" class="ql-picker-item" style="background-color: rgb(102, 163, 224);"></span><span data-value="rgb(194, 133, 255)" class="ql-picker-item" style="background-color: rgb(194, 133, 255);"></span><span data-value="rgb(136, 136, 136)" class="ql-picker-item" style="background-color: rgb(136, 136, 136);"></span><span data-value="rgb(161, 0, 0)" class="ql-picker-item" style="background-color: rgb(161, 0, 0);"></span><span data-value="rgb(178, 107, 0)" class="ql-picker-item" style="background-color: rgb(178, 107, 0);"></span><span data-value="rgb(178, 178, 0)" class="ql-picker-item" style="background-color: rgb(178, 178, 0);"></span><span data-value="rgb(0, 97, 0)" class="ql-picker-item" style="background-color: rgb(0, 97, 0);"></span><span data-value="rgb(0, 71, 178)" class="ql-picker-item" style="background-color: rgb(0, 71, 178);"></span><span data-value="rgb(107, 36, 178)" class="ql-picker-item" style="background-color: rgb(107, 36, 178);"></span><span data-value="rgb(68, 68, 68)" class="ql-picker-item" style="background-color: rgb(68, 68, 68);"></span><span data-value="rgb(92, 0, 0)" class="ql-picker-item" style="background-color: rgb(92, 0, 0);"></span><span data-value="rgb(102, 61, 0)" class="ql-picker-item" style="background-color: rgb(102, 61, 0);"></span><span data-value="rgb(102, 102, 0)" class="ql-picker-item" style="background-color: rgb(102, 102, 0);"></span><span data-value="rgb(0, 55, 0)" class="ql-picker-item" style="background-color: rgb(0, 55, 0);"></span><span data-value="rgb(0, 41, 102)" class="ql-picker-item" style="background-color: rgb(0, 41, 102);"></span><span data-value="rgb(61, 20, 102)" class="ql-picker-item" style="background-color: rgb(61, 20, 102);"></span></span></span><select title="Text Color" class="ql-color" style="display: none;"><option value="rgb(0, 0, 0)" label="rgb(0, 0, 0)" selected=""></option><option value="rgb(230, 0, 0)" label="rgb(230, 0, 0)"></option><option value="rgb(255, 153, 0)" label="rgb(255, 153, 0)"></option><option value="rgb(255, 255, 0)" label="rgb(255, 255, 0)"></option><option value="rgb(0, 138, 0)" label="rgb(0, 138, 0)"></option><option value="rgb(0, 102, 204)" label="rgb(0, 102, 204)"></option><option value="rgb(153, 51, 255)" label="rgb(153, 51, 255)"></option><option value="rgb(255, 255, 255)" label="rgb(255, 255, 255)"></option><option value="rgb(250, 204, 204)" label="rgb(250, 204, 204)"></option><option value="rgb(255, 235, 204)" label="rgb(255, 235, 204)"></option><option value="rgb(255, 255, 204)" label="rgb(255, 255, 204)"></option><option value="rgb(204, 232, 204)" label="rgb(204, 232, 204)"></option><option value="rgb(204, 224, 245)" label="rgb(204, 224, 245)"></option><option value="rgb(235, 214, 255)" label="rgb(235, 214, 255)"></option><option value="rgb(187, 187, 187)" label="rgb(187, 187, 187)"></option><option value="rgb(240, 102, 102)" label="rgb(240, 102, 102)"></option><option value="rgb(255, 194, 102)" label="rgb(255, 194, 102)"></option><option value="rgb(255, 255, 102)" label="rgb(255, 255, 102)"></option><option value="rgb(102, 185, 102)" label="rgb(102, 185, 102)"></option><option value="rgb(102, 163, 224)" label="rgb(102, 163, 224)"></option><option value="rgb(194, 133, 255)" label="rgb(194, 133, 255)"></option><option value="rgb(136, 136, 136)" label="rgb(136, 136, 136)"></option><option value="rgb(161, 0, 0)" label="rgb(161, 0, 0)"></option><option value="rgb(178, 107, 0)" label="rgb(178, 107, 0)"></option><option value="rgb(178, 178, 0)" label="rgb(178, 178, 0)"></option><option value="rgb(0, 97, 0)" label="rgb(0, 97, 0)"></option><option value="rgb(0, 71, 178)" label="rgb(0, 71, 178)"></option><option value="rgb(107, 36, 178)" label="rgb(107, 36, 178)"></option><option value="rgb(68, 68, 68)" label="rgb(68, 68, 68)"></option><option value="rgb(92, 0, 0)" label="rgb(92, 0, 0)"></option><option value="rgb(102, 61, 0)" label="rgb(102, 61, 0)"></option><option value="rgb(102, 102, 0)" label="rgb(102, 102, 0)"></option><option value="rgb(0, 55, 0)" label="rgb(0, 55, 0)"></option><option value="rgb(0, 41, 102)" label="rgb(0, 41, 102)"></option><option value="rgb(61, 20, 102)" label="rgb(61, 20, 102)"></option></select><span class="ql-format-separator"></span><span title="Background Color" class="ql-background ql-picker ql-color-picker"><span class="ql-picker-label" data-value="rgb(255, 255, 255)"></span><span class="ql-picker-options"><span data-value="rgb(0, 0, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(0, 0, 0);"></span><span data-value="rgb(230, 0, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(230, 0, 0);"></span><span data-value="rgb(255, 153, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(255, 153, 0);"></span><span data-value="rgb(255, 255, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(255, 255, 0);"></span><span data-value="rgb(0, 138, 0)" class="ql-picker-item ql-primary-color" style="background-color: rgb(0, 138, 0);"></span><span data-value="rgb(0, 102, 204)" class="ql-picker-item ql-primary-color" style="background-color: rgb(0, 102, 204);"></span><span data-value="rgb(153, 51, 255)" class="ql-picker-item ql-primary-color" style="background-color: rgb(153, 51, 255);"></span><span data-value="rgb(255, 255, 255)" class="ql-picker-item ql-selected" style="background-color: rgb(255, 255, 255);"></span><span data-value="rgb(250, 204, 204)" class="ql-picker-item" style="background-color: rgb(250, 204, 204);"></span><span data-value="rgb(255, 235, 204)" class="ql-picker-item" style="background-color: rgb(255, 235, 204);"></span><span data-value="rgb(255, 255, 204)" class="ql-picker-item" style="background-color: rgb(255, 255, 204);"></span><span data-value="rgb(204, 232, 204)" class="ql-picker-item" style="background-color: rgb(204, 232, 204);"></span><span data-value="rgb(204, 224, 245)" class="ql-picker-item" style="background-color: rgb(204, 224, 245);"></span><span data-value="rgb(235, 214, 255)" class="ql-picker-item" style="background-color: rgb(235, 214, 255);"></span><span data-value="rgb(187, 187, 187)" class="ql-picker-item" style="background-color: rgb(187, 187, 187);"></span><span data-value="rgb(240, 102, 102)" class="ql-picker-item" style="background-color: rgb(240, 102, 102);"></span><span data-value="rgb(255, 194, 102)" class="ql-picker-item" style="background-color: rgb(255, 194, 102);"></span><span data-value="rgb(255, 255, 102)" class="ql-picker-item" style="background-color: rgb(255, 255, 102);"></span><span data-value="rgb(102, 185, 102)" class="ql-picker-item" style="background-color: rgb(102, 185, 102);"></span><span data-value="rgb(102, 163, 224)" class="ql-picker-item" style="background-color: rgb(102, 163, 224);"></span><span data-value="rgb(194, 133, 255)" class="ql-picker-item" style="background-color: rgb(194, 133, 255);"></span><span data-value="rgb(136, 136, 136)" class="ql-picker-item" style="background-color: rgb(136, 136, 136);"></span><span data-value="rgb(161, 0, 0)" class="ql-picker-item" style="background-color: rgb(161, 0, 0);"></span><span data-value="rgb(178, 107, 0)" class="ql-picker-item" style="background-color: rgb(178, 107, 0);"></span><span data-value="rgb(178, 178, 0)" class="ql-picker-item" style="background-color: rgb(178, 178, 0);"></span><span data-value="rgb(0, 97, 0)" class="ql-picker-item" style="background-color: rgb(0, 97, 0);"></span><span data-value="rgb(0, 71, 178)" class="ql-picker-item" style="background-color: rgb(0, 71, 178);"></span><span data-value="rgb(107, 36, 178)" class="ql-picker-item" style="background-color: rgb(107, 36, 178);"></span><span data-value="rgb(68, 68, 68)" class="ql-picker-item" style="background-color: rgb(68, 68, 68);"></span><span data-value="rgb(92, 0, 0)" class="ql-picker-item" style="background-color: rgb(92, 0, 0);"></span><span data-value="rgb(102, 61, 0)" class="ql-picker-item" style="background-color: rgb(102, 61, 0);"></span><span data-value="rgb(102, 102, 0)" class="ql-picker-item" style="background-color: rgb(102, 102, 0);"></span><span data-value="rgb(0, 55, 0)" class="ql-picker-item" style="background-color: rgb(0, 55, 0);"></span><span data-value="rgb(0, 41, 102)" class="ql-picker-item" style="background-color: rgb(0, 41, 102);"></span><span data-value="rgb(61, 20, 102)" class="ql-picker-item" style="background-color: rgb(61, 20, 102);"></span></span></span><select title="Background Color" class="ql-background" style="display: none;"><option value="rgb(0, 0, 0)" label="rgb(0, 0, 0)"></option><option value="rgb(230, 0, 0)" label="rgb(230, 0, 0)"></option><option value="rgb(255, 153, 0)" label="rgb(255, 153, 0)"></option><option value="rgb(255, 255, 0)" label="rgb(255, 255, 0)"></option><option value="rgb(0, 138, 0)" label="rgb(0, 138, 0)"></option><option value="rgb(0, 102, 204)" label="rgb(0, 102, 204)"></option><option value="rgb(153, 51, 255)" label="rgb(153, 51, 255)"></option><option value="rgb(255, 255, 255)" label="rgb(255, 255, 255)" selected=""></option><option value="rgb(250, 204, 204)" label="rgb(250, 204, 204)"></option><option value="rgb(255, 235, 204)" label="rgb(255, 235, 204)"></option><option value="rgb(255, 255, 204)" label="rgb(255, 255, 204)"></option><option value="rgb(204, 232, 204)" label="rgb(204, 232, 204)"></option><option value="rgb(204, 224, 245)" label="rgb(204, 224, 245)"></option><option value="rgb(235, 214, 255)" label="rgb(235, 214, 255)"></option><option value="rgb(187, 187, 187)" label="rgb(187, 187, 187)"></option><option value="rgb(240, 102, 102)" label="rgb(240, 102, 102)"></option><option value="rgb(255, 194, 102)" label="rgb(255, 194, 102)"></option><option value="rgb(255, 255, 102)" label="rgb(255, 255, 102)"></option><option value="rgb(102, 185, 102)" label="rgb(102, 185, 102)"></option><option value="rgb(102, 163, 224)" label="rgb(102, 163, 224)"></option><option value="rgb(194, 133, 255)" label="rgb(194, 133, 255)"></option><option value="rgb(136, 136, 136)" label="rgb(136, 136, 136)"></option><option value="rgb(161, 0, 0)" label="rgb(161, 0, 0)"></option><option value="rgb(178, 107, 0)" label="rgb(178, 107, 0)"></option><option value="rgb(178, 178, 0)" label="rgb(178, 178, 0)"></option><option value="rgb(0, 97, 0)" label="rgb(0, 97, 0)"></option><option value="rgb(0, 71, 178)" label="rgb(0, 71, 178)"></option><option value="rgb(107, 36, 178)" label="rgb(107, 36, 178)"></option><option value="rgb(68, 68, 68)" label="rgb(68, 68, 68)"></option><option value="rgb(92, 0, 0)" label="rgb(92, 0, 0)"></option><option value="rgb(102, 61, 0)" label="rgb(102, 61, 0)"></option><option value="rgb(102, 102, 0)" label="rgb(102, 102, 0)"></option><option value="rgb(0, 55, 0)" label="rgb(0, 55, 0)"></option><option value="rgb(0, 41, 102)" label="rgb(0, 41, 102)"></option><option value="rgb(61, 20, 102)" label="rgb(61, 20, 102)"></option></select></span>';

				content += '<div id="qw-' + id + '" class="quill-wrapper">';
				// content += size;
				content += ' <div id="toolbar">';
				content += '  <span class="ql-format-group">';
				// content += '<button class="ql-bold">Bold</button>';
				content += '   <span title="Bold" class="ql-format-button ql-bold"></span>';
				// content += '<button class="ql-italic">Italic</button>';
				content += '   <span title="Italic" class="ql-format-button ql-italic"></span>';
				content += '  </span>';
				// content += format;
				content += '  <span class="ql-format-group">';
				content += '   <span title="Bullet" class="ql-format-button ql-bullet"></span>';
				// content += '<span class="ql-format-separator"></span>';
				content += '   <span title="List" class="ql-format-button ql-list"></span>';
				content += '  </span>';
				content += '  <span title="Link" class="ql-format-button ql-link"></span>';
				content += ' </div>';
				content += ' <div id="editor">' + modelValue  + '</div>';
				content += '</div>';

				var html = '<div class="ade-popup ade-rich dropdown-menu open">' + content + '</div>';

				$compile(html)(scope).insertAfter(element);
				place();

				// Initialize QuillJS
				quill = new Quill('#editor');
				quill.addModule('toolbar', { container: '#toolbar' });

				editing = true;

				// Handle blur case
				// save when user blurs out of text editor
				// listen to clicks on all elements in page
				// this will determine when to blur
				$(document).on('mousedown.ADE', function(e) {
					scope.$apply(function() {
						outerBlur(e);
					})
				});

				$(quill.root).on('keydown.ADE', function(e) {
					handleKeyEvents(e);
				});


				//because the popup is fixed positioned, if we scroll it would
				//get disconnected. So, we just hide it. In the future it might
				//be better to dynamially update it's position
				// $(document).on('scroll.ADE',function() {
				// 	scope.$apply(function() {
				// 		saveEdit(3);
				// 	}); 
				// });

				//focus the text area
				quill.focus();
			};

			//place the popup in the proper place on the screen by flipping it if necessary
			var place = function() {
				ADE.place('.ade-rich',element,15,-5);
			};

			// detect clicks outside tinymce textarea
			var outerBlur = function(e) {
				// check where click occurred
				//   1: inside ade popup
				//   0: outside ade popup

				var outerClick = $('#qw-' + id).has(e.target).length === 0;

				if (outerClick) {
					mouseout();
					saveEdit(0);
					$(document).off('mousedown.ADE');
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
					var length = quill.getLength();

					// Don't allow more characters
					if (length >= maxLength) {
						//console.log("block",length,maxLength,editorValue);
						// debugger;
						//editor.innerHTML = editorValue;
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
						// restore value
						quill.setHTML(scope.ngModel);

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

	// Popup

			//When the mouse enters, show the popup view of the note
			var mousein = function()  {
				window.clearTimeout(timeout);
				
				//if any other popup is open in edit mode, don't do this view
				if (angular.element('.ade-rich').hasClass('open') && angular.element('.ade-rich').find('.quill-wrapper').length) return;

				// if another popup is open, hide immediately
				var another = angular.element('.ade-rich.open');
				if (another.length) {
					// console.log('mousein', element.attr('ade-id'), $(another).prev().attr('ade-id'));
					if (element.attr('ade-id') != $(another).prev().attr('ade-id')) {
						another.hide();
					}
				}

				var linkPopup = element.next('.ade-rich');
				if (!linkPopup.length) {
					viewRichText();
				}
			};

			element.on('mouseenter.ADE', mousein);

			//if the mouse leaves, hide the popup note view if in read mode
			var mouseout = function() {
				var linkPopup = element.next('.ade-popup');
				if (linkPopup.length && !editing) { //checks for read/edit mode
					timeout = window.setTimeout(function() {
						ADE.hidePopup(element);
					},400);
				}
			};

			element.on('mouseleave.ADE', mouseout);

			//handles clicks on the read version of the data
			var mouseclick = function() {
				window.clearTimeout(timeout);
				if (editing) return;
				editing = true;
				exit = 0;

				adeId = scope.adeId;
				ADE.begin(adeId);

				input = element.next('.ade-rich');
				editRichText();
				setTimeout(place); //needs to be in a timeout for the popup's height to be calculated correctly
			};
			
			if(!readonly) {
				element.on('click.ADE', mouseclick);

				//handles enter keydown on the read version of the data
				element.on('keydown.ADE', function(e) {
					if (e.keyCode === 13) { // enter
						mouseclick();
					}
				});
			}

	// Observe

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

	// Destroy

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				if(element) element.off();
				if(input) input.off();
				$(document).off('mousedown.ADE');
				$(document).off('scroll.ADE');

				if(stopObserving && stopObserving!=observeID) { //Angualar <=1.2 returns callback, not deregister fn
					stopObserving();
					stopObserving = null;
				} else {
					delete attrs.$$observers['adeId'];
				}
			});

	// Watch

			//need to watch the model for changes
			scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				makeHTML();
			});

		}
	};
}]);
