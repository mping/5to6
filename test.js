/*var a = function(a){ return 1;}

var b = function(a){ return a+1;}

var b2 = function(a){ return {k:a+1}}

_(list).map(function(i){ a.push({b:2})})

_(list).each(function(i){ b(i) })
*/

a.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    return filtered;
  };
})
;
