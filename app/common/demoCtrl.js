angular.module('ADE').controller('ctrl',['$rootScope','ADE',function($rootScope,ADE) {
	ADE.keyboardEdit = true; //set to false for touch devices/ true for mouse

	if(!$rootScope.initialized) {
		$rootScope.initialized = true;

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
	}

}]);


