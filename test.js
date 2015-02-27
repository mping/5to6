/**
 * these are not eligible for simple transf
 * - named functions (can be referenced)
 * - `this` calls
 * - `arguments` references
 * ...
 */


 var a = function() {
 	console.log(
 		arguments
 		);
 }