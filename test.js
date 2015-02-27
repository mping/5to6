/*document.addEventListener('load', function () { if(false) this.getElementById("a") })
document.addEventListener('load', function () {
	var b = function(){
		if(false) this.getElementById("a")
	}
})
*/
a.directive('breadcrumbs', ['a', function(a){
    return {
      link: function(b) {}
    }
}]);


