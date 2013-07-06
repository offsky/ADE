/* ==================================================================
  AngularJS Datatype Editor - Date
  A filter to display a date. It is a wrapper for Angular's date filter
  that provides better display for invalid values.

  Usage:
  {{ data | validDate:'yyyy' }}

------------------------------------------------------------------*/

angular.module('ADE').filter('validDate', ['$filter',function($filter) {
  return function(input, dateFormat) {
    var output = "";

    if(angular.isUndefined(input)) return output;
    var inputDate = input[0];

    if(!input || !inputDate) return output;

    if(angular.isString(inputDate)) {
      var number = parseInt(inputDate);
      if(inputDate===number+'') inputDate = number;
      else inputDate = parseDateString(inputDate);
    }

    if(angular.isNumber(inputDate)) {
      output = $filter('date')(inputDate*1000,dateFormat);
    }
    return output;
  };
}]);
