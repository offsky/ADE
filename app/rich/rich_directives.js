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

			//whenever the model changes, we get called so we can update our value
			if (controller !== null) {
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

				element.show();
				input.remove();
				editing = false;

				ADE.done(options, oldValue, value, exit);
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
			};

			//sets the height of the textarea based on the actual height of the contents.
			//min and max are set in css
			var textareaHeight = function(elem) {
				elem.style.height = '1px';
				elem.style.height = (elem.scrollHeight) + 'px';
			};

			//enters edit mode for the text
			var editRichText = function() {
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
				txtArea.bind('keyup', function(e) { textareaHeight(this); });
			};

			//When the mouse enters, show the popup view of the note
			//TODO: put this in a timeout delay
			element.bind('mouseenter', function(e)  {
				if (angular.element('.ade-rich').hasClass('open')) return;
				var linkPopup = element.next('.' + ADE.popupClass + '');
				if (!linkPopup.length) {
					viewRichText();
				}
			});

			//if the mouse leaves, hide the popup note view if in read mode
			//TODO put this in a timeout delay and allow mouseover of the popup so you can scroll it
			element.bind('mouseleave', function(e) {
				var linkPopup = element.next('.' + ADE.popupClass + '');
				if (linkPopup.length && !linkPopup.find('textarea').length) {
					scope.ADE_hidePopup();
				}
			});

			//handles clicks on the read version of the data
			element.bind('click', function() {
				if (editing) return;
				editing = true;
				exit = 0;

				ADE.begin(options);

				editRichText();
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
