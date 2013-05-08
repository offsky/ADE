
function SelectCtrl(scope) {
	//==================================================================
	// Handles the select2.js smart select lists data matching.
	// options.term has the typed in terms.  options.callback is called
	// with the matching data.  It is done this way instead of having select2
	// do it because it is the only way to get an "add new option" option

	scope.listOptions = {
		list1: ['apple', 'pear', 'cherry', 'pineapple', 'watermelon'],
		list2: ['dog', 'cat', 'elephant', 'dolphin', 'chicken']
	};

	scope.query = function(options) {
		var results = [];

		var listId = this.listId; //TODO: this doesn't feel like the right way to get information about what select I am editing. There should be a way to pass it in options

		//get the list to filter on
		var listOptions = [];
		if(listId && scope.listOptions && scope.listOptions[listId]) {
			listOptions = scope.listOptions[listId];
		}

		//filter options based on typing
		var exactMatch = false; //tracks if we found an exact match or just a partial match
		$.each(listOptions, function(i, v) {
			if(v !== undefined) {
				if (!angular.isString(v)) v = v.toString();
				if (v.toLowerCase().indexOf(options.term.toLowerCase()) >= 0) results.push({id: i, text: v + ''});
				if (v.toLowerCase() == options.term.toLowerCase()) exactMatch = true;
			}
		});

		//if we didn't get an exact match, add an "add new option" option if wanted.
      //console.log(listOptions.length);
		if (this.allowAddNewValues && options.term && !exactMatch) results.push({id: options.term, text: options.term});

		options.callback({more: false, context: '', results: results});
	};

	//==================================================================
	//This function is called to build the pre-selected list from the input element's pre-filled value
	scope.selection = function(element, callback, listId) {
		var data = [], results;
		results = element.val().split(',');
		if(listId === undefined) listId = element.attr('data-listId');

		var listOptions = [];
		if(listId && scope.listOptions && scope.listOptions[listId]) {
			listOptions = scope.listOptions[listId];
		}
 
		angular.forEach(results, function(value, key) {
			if(listOptions && listOptions.map) {
				listOptions.map(function(v, i) {
					if (value === v) {
						data.push({'id': i, 'text': v });
					}
				});
			}
		});

		if (element.attr('multiple') === 'multiple') {
			callback(data);
		} else {
			callback(data[0]);
		}
	};

	//==================================================================
	//handles finishing of the selection.  For this demo, we are adding new values to
	//the array for future selection
	scope.$on('ADE-finish', function(e, data) {
		if(data.id==123) { //the single input
			var found = false;
			$.each(scope.listOptions['list1'], function(i, v) {
				if (!angular.isString(v)) v = v.toString();
				if (v == data.newVal) found = true;
			});
			if(!found && data.newVal!='') scope.listOptions['list1'].push(data.newVal);

		} else if(data.id == 1234) { //the multi input

			values = data.newVal;

			$.each(values, function(j, val) {
				var found = false;
				$.each(scope.listOptions['list2'], function(i, v) {
					if (!angular.isString(v)) v = v.toString();
					if (v == val) found = true;
				});
				if(!found && val!='') scope.listOptions['list2'].push(val);
			});
		}
	});

}

SelectCtrl.$inject = ['$scope'];
