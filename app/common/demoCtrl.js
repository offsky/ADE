function ctrl($rootScope) {

	$rootScope.$on('ADE-start', function(e,data) {
		$rootScope.lastMessage = "started edit";
	});

	$rootScope.$on('ADE-finish', function(e,data) {
		var exit = "Exited via clicking outside";
		switch(data.exit) {
			case 1: exit = "Exited via tab"; break;
			case -1: exit = "Exited via shift+tab"; break;
			case 2: exit = "Exited via return"; break;
			case -1: exit = "Exited via shift+return"; break;
			case 3: exit = "Exited via esc key"; break;
		}

		$rootScope.lastMessage = "Finished edit without changes. "+exit;
		if(data.old!=data.new) {
			$rootScope.lastMessage = "Finished edit with changes. Was: "+data.old+". Now: "+data.new+". "+exit;
		}
	});
}