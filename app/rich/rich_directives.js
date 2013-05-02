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
			var options = {};
			var editing = false;
			var txtArea = null;
			var input = null;
			var value = '';
			var oldValue = '';
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var timeout = null; //the delay when mousing out of the ppopup

			//whenever the model changes, we get called so we can update our value
			if (controller !== null && controller !== undefined) {
				controller.$render = function() {
					oldValue = value = controller.$modelValue;
					if (value === undefined || value === null) value = '';
					return controller.$viewValue;
				};
			}

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				oldValue = value;
				exit = exited;

				if (exited != 3) { //don't save value on esc
					value = txtArea.val();
					controller.$setViewValue(value);
				}

				input.remove();
				editing = false;

				ADE.done(options, oldValue, value, exit);

				if (exit == 1) {
					element.dontclick = true; //tells the focus handler not to click
					element.focus();
					//TODO: would prefer to advance the focus to the next logical element on the page
				} else if (exit == -1) {
					element.dontclick = true; //tells the focus handler not to click
					element.focus();
					//TODO: would prefer to advance the focus to the previous logical element on the page
				}

				scope.$digest();
			};

			//shows a popup with the full text in read mode
			//TODO: handle scrolling of very long text blobs
			var viewRichText = function() {
				scope.ADE_hidePopup();

				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight;
				var content = value.replace ? value.replace(/\n/g, '<br />') : value; //what is inside the popup

				if (!content) return; //dont show popup if there is nothing to show

				$compile('<div class="' + ADE.popupClass + ' ade-rich dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px"><div class="ade-richview">' + content + '</div></div>')(scope).insertAfter(element);

				input = element.next('.ade-rich');
				input.bind('mouseenter.ADE', mousein);
				input.bind('mouseleave.ADE', mouseout);
				input.bind('click.ADE', mouseclick);
			};

			//sets the height of the textarea based on the actual height of the contents.
			//min and max are set in css
			var textareaHeight = function(elem) {
				elem.style.height = '1px';
				elem.style.height = (elem.scrollHeight) + 'px';
			};

			//enters edit mode for the text
			var editRichText = function() {
				window.clearTimeout(timeout);
				if(input) input.unbind('.ADE');

				scope.ADE_hidePopup();

				var content = '<textarea class="' + options.className + '" style="height:30px">' + value + '</textarea>';
				var elOffset = element.offset();
				var posLeft = elOffset.left;
				var posTop = elOffset.top + element[0].offsetHeight;
				$compile('<div class="' + ADE.popupClass + ' ade-rich dropdown-menu open" style="left:' + posLeft + 'px;top:' + posTop + 'px">' + content + '</div>')(scope).insertAfter(element);

				editing = true;

				input = element.next('.ade-rich');
				txtArea = input.find('textarea');

				var pos = txtArea.val().length;
				txtArea.focus();
				txtArea[0].setSelectionRange(pos, pos); //put cursor at end

				ADE.setupBlur(txtArea, saveEdit);
				ADE.setupKeys(txtArea, saveEdit, true);

				//sets height of textarea
				textareaHeight(txtArea[0]);
				txtArea.bind('keyup.ADE', function(e) { textareaHeight(this); });
			};

			//When the mouse enters, show the popup view of the note
			var mousein = function()  {
				window.clearTimeout(timeout);
				//if (angular.element('.ade-rich').hasClass('open')) return;
				var linkPopup = element.next('.ade-rich');
				if (!linkPopup.length) {
					viewRichText();
				}
			};

			//if the mouse leaves, hide the popup note view if in read mode
			var mouseout = function() {
				var linkPopup = element.next('.' + ADE.popupClass + '');
				if (linkPopup.length && !linkPopup.find('textarea').length) {
					timeout = window.setTimeout(function() {
						scope.ADE_hidePopup(element);
					},400);
				}
			};

			//handles clicks on the read version of the data
			var mouseclick = function() {
				if(element) element.unbind('keypress.ADE');
				window.clearTimeout(timeout);
				if (editing) return;
				editing = true;
				exit = 0;

				ADE.begin(options);

				editRichText();
			};

			element.bind('mouseenter.ADE', mousein);
			element.bind('mouseleave.ADE', mouseout);
			element.bind('click.ADE', mouseclick);

			//handles focus events
			element.bind('focus.ADE', function(e) {

				//if this is an organic focus, then do a click to make the popup appear.
				//if this was a focus caused my myself then don't do the click
				if (!element.dontclick) {
					element.click();
					return;
				}
				element.dontclick = false;

				//listen for keys pressed while the element is focused but not clicked
				element.bind('keypress.ADE', function(e) {
					if (e.keyCode == 13) { //return
						e.preventDefault();
						e.stopPropagation(); //to prevent return key from going into text box
						element.click();
					} else if (e.keyCode != 9) { //not tab
						//for a key other than tab we want it to go into the text box
						element.click();
					}
				});

			});

			//handles blur events
			element.bind('blur.ADE', function(e) {
				if(element) element.unbind('keypress.ADE');
			});

			// Watches for changes to the element
			// TODO: understand why I have to return the observer and why the observer returns element
			return attrs.$observe('adeRich', function(settings) { //settings is the contents of the ade-rich="" string
				options = ADE.parseSettings(settings, {className: 'input-xlarge'});
				return element;
			});
		}
	};
}]);
