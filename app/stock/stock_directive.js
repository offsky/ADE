/* ==================================================================
	AngularJS Datatype Editor - Stock Price
	A directive to see and edit a price of a stock in place.

	Usage:
	<div ade-stock ade-id='1234' adeProvider="yahoo" ade-class="myClass" ng-model="data"></div>

	Config:

	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the stock ticker to be editable
	ade-provider:
		By default, stock prices provided by google API. This could be set to yahoo.

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeStock', ['ADE', '$compile', '$filter', '$http',
	function(ADE, $compile, $filter, $http) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-url=""></div>

		scope: {
			adeUrl: "@",
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			adeProvider: "@",
			adeMovement: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var editing = false;
			var input = null;
			var invisibleInput = null;
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var readonly = false;
			var inputClass = "";
			var stopObserving = null;
			var adeId = scope.adeId;

			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;

			var makeHTML = function() {
				var url, request, html = "";
				var value = scope.ngModel;
				var cssClasses = "ade-stock-price";

				if (value!==undefined) {
					if(angular.isArray(value)) value = value[0];
					if(value===null || value===undefined) value="";
					if(!angular.isString(value)) value = value.toString();
					if (scope.adeMovement === "0") {
						cssClasses += " ade-stock-price-only";
					}
					if (scope.adeMovement === "2") {
						cssClasses += " ade-stock-popup";
					}
					element.html("<p class='"+ cssClasses +"'><b>"+ encodeURIComponent(value).toUpperCase() + "</b></p>");

					if (scope.adeProvider === 'yahoo') {
						url = "https://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where " +
								"symbol in (\""+ value +"\")&format=json&env=http://datatables.org/alltables.env";

						request = $http.get(url);
					} else {
						url = "http://www.google.com/finance/info?q="+value+"&callback=JSON_CALLBACK";

						request = $http.jsonp(url);
					}
					return( request.then( handleSuccess, handleError ) );
				}

			};
;
			var handleError = function(data) {
				element.find('.ade-stock-price').append("<span class='ade-stock-no-data'>no price available</span></p>");
			};

			var handleSuccess = function(resp) {
				var arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="ade-stock-arrow" fill="#000000" ' +
					'height="24" viewBox="0 0 24 24" width="24"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17' +
					'l-5.58-5.59L4 12l8 8 8-8z" class="ade-arrow-down" /><path ' +
					'd="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12 l-8-8-8 8z" class="ade-arrow-up"/></svg>';
				var $stockEl = element.find(".ade-stock-price"); change = "", price = "";

				if (scope.adeProvider === 'yahoo') {
					if (resp.data.query.results === null) {
						handleError();
						return;
					}
					change = resp.data.query.results.quote.Change;
					price = resp.data.query.results.quote.LastTradePriceOnly;
					if (price === null) {
						handleError();
						return;
					}
					$stockEl.append(" " + resp.data.query.results.quote.LastTradePriceOnly +
							'<span class="ade-price-movement">' + arrowIcon + ' <span>$' + change.substring(1) +
							'</span></span></p>');
				} else {
					change = resp.data[0].c;
					$stockEl.append(" " + resp.data[0].l_cur +
							'<span class="ade-price-movement">' + arrowIcon +
							' <span>$' + change.substring(1) + '</span></span></p>');
				}

				if ($stockEl.hasClass("ade-stock-popup")) {
					var $movementEl = $stockEl.find(".ade-price-movement");
					$movementEl.addClass("ade-popup").addClass("dropdown-menu");
					$stockEl.on("mouseenter", function() {
						$movementEl.addClass("open");
					}).on("mouseleave", function() {
						$movementEl.removeClass("open");
					});
				}

				if (change.indexOf("+") !== -1) {
					// stock up
					element.addClass("ade-stock-up").removeClass("ade-stock-down");
				} else if (change.indexOf("-") !== -1) {
					element.addClass("ade-stock-down").removeClass("ade-stock-up");
				}
			};

			//called once the edit is done, so we can save the new data and remove edit mode
			var saveEdit = function(exited) {
				var oldValue = scope.ngModel;
				exit = exited;

				if (exit !== 3) {
					//don't save value on esc
					if (input) {
						scope.ngModel = input.val();
					}
				}

				element.show();
				destroy();
				editing = false;

				ADE.done(adeId, oldValue, scope.ngModel, exit);
				ADE.teardownBlur(input);
				ADE.teardownKeys(input);
				if(invisibleInput) {
					invisibleInput.off('blur.ADE');
					ADE.teardownKeys(invisibleInput);
				}
			};

			//place the popup in the proper place on the screen
			var place = function() {
				ADE.place('.'+ADE.popupClass,element,0,-5);
			};

			var clickHandler = function(e) {
				if (editing) {
					e.preventDefault(); //these two lines prevent the click on the link from actually taking you there
					e.stopPropagation();
					return; //already editing
				}
				editing = true;

				var value = scope.ngModel;

				element.hide();
				$compile('<input type="text" class="ade-input '+inputClass+'" value="'+value+'" />')(scope).insertAfter(element);
				input = element.next('input');
				input.focus();

				//put cursor at end
				input[0].selectionStart = input[0].selectionEnd = input.val().length;

				ADE.setupBlur(input,saveEdit,scope);
				ADE.setupKeys(input,saveEdit,false,scope);
			};

			//setup events
			if(!readonly) {
				element.on('click.ADE', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					});
				});
			}

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
				ADE.teardownScrollEvents(element);
				ADE.hidePopup(element);
				ADE.teardownBlur();

				if(input) {
					input.off();
					input.remove();
				}

				$(document).off('ADE_hidepops.ADE');
			};

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
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
