/**
 * these are not eligible for simple transf
 * - named functions (can be referenced)
 * - `this` calls
 * - `arguments` references
 * ...
 */


angular
.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})
;