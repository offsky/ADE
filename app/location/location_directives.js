/* ==================================================================
	AngularJS Datatype Editor - Location
	A directive to edit location

	Usage:
	<div ade-location ade-id="1235" ade-class="input-large" ng-model="data"></div>

	Config:

	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the stars to be editable

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeLocation', ['ADE','$compile','$filter',function(ADE,$compile,$filter) {

	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-text=""></div>

		scope: {
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var editing=false; //are we in edit mode or not
			var input = null; //a reference to the input DOM object
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var readonly = false;
			var inputClass = "";
			var stopObserving = null;
			var adeId = scope.adeId;
			var map;
			var marker;
			var timeout = null;
			var zoom = 13;
			var infoWindow;
			var geocoder = new google.maps.Geocoder();
			var savedMode = {};

			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;

			var makeHTML = function() {
				var html = "";
				var value = scope.ngModel;
				if (value !== undefined) {
					value = $filter('location')(value);
					html = value;
				}
				element.html(html);
			};

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				debugger;
				var oldValue = savedModel;
				exit = exited;

				if (exited === 3) { //don't save value on esc
					scope.ngModel.title = savedModel.title;
					scope.ngModel.address = savedModel.address;
					scope.ngModel.lat = savedModel.lat;
					scope.ngModel.lon = savedModel.lon;
				}

				element.show();
				editing=false;
				destroy();

				ADE.done(adeId, oldValue, scope.ngModel, exit);
				ADE.teardownBlur(input);
				ADE.teardownKeys(input);
			};

			//place the popup in the proper place on the screen
			var place = function() {
				ADE.place('.'+ADE.popupClass,element);
			};

			var clickHandler = function() {
				ADE.hidePopup(element);
				destroy();
				if (editing) return;
				editing = true;
				exit = 0;

				adeId = scope.adeId;
				ADE.begin(adeId);
				savedModel = $.extend({}, scope.ngModel);
				var location_data = scope.ngModel;

				var lat = parseFloat(location_data.lat);
				var lon = parseFloat(location_data.lon);

				var latLng = {lat: lat, lng: lon}
				var html;
				var title = location_data.title || "";
				var address = location_data.address || "";

				html = '<div class="'+ADE.popupClass+' ade-location-popup dropdown-menu open" id="ade-location-' + adeId + '">' +
					'<input type="hidden" class="ade-invisible-input" /><div id="map_canvas" class="ade-location-map"></div>' +
					'<div class="ade-location-overlay"><input class="ade-input" placeholder="Enter title" id="locationTitle" ' +
					'value="' + title  + '" /><input class="ade-input ade-search-input" placeholder="Enter address" type="text" ' +
					'id="locationAddress" value="' + address + '" /><button class="icon-search ade-search-button" type="button" />' +
					'<div><button class="ade-clear-location-button" type="button">' +
					'<i class="icon-trash"></i> Clear location</button></div></div></div>';

				$compile(html)(scope)
						.insertAfter(element);

				place();
				setTimeout(function() { //need to give it time to render before moving it
					place();
				});

				input = $('.ade-invisible-input');
				input.focus();

				//set the map options
				var myOptions = {
					zoom: zoom,
					center: latLng,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					streetViewControl: true
				};
				if (map) {
					map.panTo(latLng);
					map.setZoom(zoom);
				} else {
					map = new google.maps.Map($("#map_canvas")[0], myOptions);
				}

				marker = new google.maps.Marker({
					position: latLng,
					map: map,
					draggable: true,
					title: location_data.title
				});

				infoWindow = new google.maps.InfoWindow({
					content: location_data.title
				});

				google.maps.event.addListener(marker, 'click', function() {
					infoWindow.open(map,marker);
				});

				google.maps.event.addListener(marker, 'dragend', function() {
					var pos = marker.getPosition();
					lookupByCoords(pos);
				});

				setupEvents();

				ADE.setupBlur(input,saveEdit,scope);
				ADE.setupKeys(input,saveEdit,false,scope);

				ADE.setupScrollEvents(element,function() {
					scope.$apply(function() {
						place();
					});
				});

				if (!address) {
					lookupByCoords(latLng);
				}

				$(document).on('click.ADE', function(e) {
					var $target = $(e.target);
					scope.$apply(function() {
						if (!$("#ade-location-"+adeId).has($target).length && $target.attr("ade-id") !== element.attr("ade-id")) {
							saveEdit(0);
						}
					});
				});
			};

			var setupEvents = function() {
				var searchBtn = element.next().find(".ade-search-button");
				var locationTitle = element.next().find("#locationTitle");
				var clearLocationButton = element.next().find(".ade-clear-location-button");

				searchBtn.on('click', lookupByAddress);

				locationTitle.on('blur', saveLocationTitle);

				clearLocationButton.on('click', clearLocation);

				$(document).on('ADE_hidepops.ADE',function() {
					saveEdit(3);
				});

				input.on('focus',function() {
					console.log("input focus");
					if (timeout) {
						clearTimeout(timeout);
						timeout = false;
					}
				});

				//handles blurs of the invisible input.  This is done to respond to clicks outside the popup
				input.on('blur.ADE', function(e) {

					console.log("input blur");
					//We delay the closure of the popup to give the internal icons a chance to
					//fire their click handlers and change the value.
					timeout = window.setTimeout(function() {
						scope.$apply(function () {
							saveEdit(0);
						});
					},500);
				});
			};

			var saveLocationTitle = function() {
				var title = this.value;
				scope.$apply(function() {
					scope.ngModel.title = title;
					makeHTML();
				});
			};

			var clearLocation = function() {
				document.getElementById("locationTitle").value = "";
				document.getElementById("locationAddress").value = "";
				scope.$apply(function() {
					scope.ngModel = {};
					makeHTML();
				});
				marker.setMap(null);
				marker = null;
			};

			var destroy = function() {
				ADE.teardownBlur(input);
				if(input) input.off();
				$(document).off('ADE_hidepops.ADE');
				ADE.hidePopup();
				editing = false;
			};

			var lookupByAddress = function() {
				var address = document.getElementById("locationAddress").value;

				geocoder.geocode( { 'address': address }, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						map.setCenter(results[0].geometry.location);

						if (marker) {
							marker.setPosition(results[0].geometry.location);
							marker.setMap(map);
						} else {
							marker = new google.maps.Marker({
								map: map,
								position: results[0].geometry.location
							});
						}

						element.next().find("#locationAddress").val(results[0].formatted_address).end()
								.find("#locationTitle").val("");
						scope.$apply(function() {
							scope.ngModel.address = results[0].formatted_address;
							scope.ngModel.title = "";
							scope.ngModel.lat = results[0].geometry.location.lat();
							scope.ngModel.lon = results[0].geometry.location.lng();
							makeHTML();
						});
					} else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				});
			};

			var lookupByCoords = function(latLon) {
				geocoder.geocode( { 'location': latLon }, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						map.setCenter(results[0].geometry.location);

						if (marker) {
							marker.setPosition(results[0].geometry.location);
							marker.setMap(map);
						} else {
							marker = new google.maps.Marker({
								map: map,
								position: results[0].geometry.location
							});
						}

						element.next().find("#locationAddress").val(results[0].formatted_address).end()
						 	.find("#locationTitle").val("");
					 	scope.$apply(function() {
						 	scope.ngModel.address = results[0].formatted_address;
							scope.ngModel.title = "";
							scope.ngModel.lat = results[0].geometry.location.lat();
							scope.ngModel.lon = results[0].geometry.location.lng();
							makeHTML();
					 	});
					} else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				});
			};

			//setup events
			if(!readonly) {
				element.on('click.ADE', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					})
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

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed

				if(element) element.off('click.ADE');

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