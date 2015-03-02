var a = function(a){ return 1;}

var b = function(a){ return a+1;}

var b2 = function(a){ return {k:a+1}}

_(list).map(function(i){ a.push({b:2})})