/**
 * these are not eligible for simple transf
 * - named functions (can be referenced)
 * - `this` calls
 * - `arguments` references
 * ...
 */


angular
.module('mainApp.cfg', [])
.config(['$anchorScrollProvider',function($anchorScrollProvider) {
  $anchorScrollProvider.disableAutoScrolling();
}])