
function SelectCtrl($scope, $rootScope) {
    //==================================================================
    // Handles the select2.js smart select lists data matching.
    // options.term has the typed in terms.  options.callback is called
    // with the matching data.  It is done this way instead of having select2
    // do it because it is the only way to get an "add new option" option

    $scope.listOptions = ['apple', 'pear', 'cherry', 'pineapple', 'watermelon'];

    $scope.query = function(options) {
        var results = [];

        //filter options based on typing
        var exactMatch = false; //tracks if we found an exact match or just a partial match
        $.each($scope.listOptions, function(i, v) {
            if (!angular.isString(v)) v = v.toString();
            if (v.indexOf(options.term) >= 0) results.push({id: i, text: v + ''});
            if (v == options.term) exactMatch = true;
        });

        //if we didn't get an exact match, add an "add new option" option if wanted.
        if (this.allowAddNewValues && options.term && !exactMatch) results.push({id: $scope.listOptions.length + 1, text: options.term});

        options.callback({more: false, context: '', results: results});
    };

    $scope.selection = function(element, callback) {
        var data = [], results;

        results = element.val().split(',');

        angular.forEach(results, function(value, key) {
            $scope.listOptions.map(function(v, i) {
                if (value === v) {
                    data.push({'id': i, 'text': v });
                }
            });
        });

        if (element.attr('multiple') === 'multiple') {
            callback(data);
        } else {
            callback(data[0]);
        }

    };

}

SelectCtrl.$inject = ['$scope', '$rootScope'];
