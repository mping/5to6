/*document.addEventListener('load', function () { if(false) this.getElementById("a") })
document.addEventListener('load', function () {
	var b = function(){
		if(false) this.getElementById("a")
	}
})
*/
angular
.module('mainApp.cfg', [])
.config(['$compileProvider', function($compileProvider) {
  // speed bump https://docs.angularjs.org/guide/production#disabling-debug-data
  // can always call angular.reloadWithDebugInfo(); later
  $compileProvider.debugInfoEnabled(!env.production);
}])


