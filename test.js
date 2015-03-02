/**
 * these are not eligible for simple transf
 * - named functions (can be referenced)
 * - `this` calls
 * - `arguments` references
 * ...
 */


 var a = function(arr) {
 	_.map(function(a){return a/2})
 	return 1+arr;
 }