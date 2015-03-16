angular.module('ADE').controller('TagCtrl',['$rootScope','ADE','$q','$scope',function($rootScope,ADE,$q,scope) {



	scope.listOptions = {
		list1: ['apple', 'pear', 'cherry', 'pineapple', 'watermelon'],
		list2: ['dog', 'cat', 'elephant', 'dolphin', 'chicken']
	};

	scope.query = function(val, listId) {
		var deferred = $q.defer();

		//get the list to filter on
		var listOptions = [];
		if(listId && scope.listOptions && scope.listOptions[listId]) {
			listOptions = scope.listOptions[listId];
		}

		//filter options based on typing
		var results = [];
		var exactMatch = false; //tracks if we found an exact match or just a partial match
		$.each(listOptions, function(i, v) {
			if(v !== undefined && v !== null && val !== undefined && val !== null) {
				if (!angular.isString(v)) v = v.toString();
				if (v.toLowerCase().indexOf(val.toLowerCase()) >= 0) results.push(v + '');
				if (v.toLowerCase() == val.toLowerCase()) exactMatch = true;
			}
		});

    	deferred.resolve(results);
    	return deferred.promise;
	};

	//==================================================================
	//handles finishing of the selection.  For this demo, we are adding new values to
	//the array for future selection
	scope.$on('ADE-finish', function(e, data) {
		var values = data.newVal;

		if(values==null || values==undefined) return;

		if(angular.isString(values)) values = [values];
		var list = "list1";
		if(data.id=="1002") list = "list2";

		$.each(values, function(j, val) {
			var found = false;
			$.each(scope.listOptions[list], function(i, v) {
				if (!angular.isString(v)) v = v.toString();
				if (v == val) found = true;
			});
			if(!found && val!='') scope.listOptions[list].push(val);
		});
	});

	$rootScope.$on('ADE-start', function(e,data) {
		$rootScope.lastMessage = 'started edit';
	});

	$rootScope.$on('ADE-finish', function(e,data) {
		var exit = 'Exited via clicking outside';
		switch (data.exit) {
			case 1: exit = 'Exited via tab'; break;
			case -1: exit = 'Exited via shift+tab'; break;
			case 2: exit = 'Exited via return'; break;
			case -2: exit = 'Exited via shift+return'; break;
			case 3: exit = 'Exited via esc key'; break;
		}
		var oldvalue = data.oldVal;
		var newvalue = data.newVal;
		//convert arrays to strings so I can compare them for changes.
		if (angular.isArray(data.oldVal)) oldvalue = data.oldVal.toString();
		if (angular.isArray(data.newVal)) newvalue = data.newVal.toString();

		$rootScope.lastMessage = 'Finished edit without changes. '+ exit;
		if (oldvalue != newvalue) {
			$rootScope.lastMessage = 'Finished edit with changes. Was: '+ data.oldVal + '. Now: '+ data.newVal + '. '+ exit;
		}
	});

}]);
