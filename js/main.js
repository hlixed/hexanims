"use strict";
var hexes;
document.body.onload = function(){
	var container_elem = document.getElementById("canvasContainer");
	hexes = new ResultHexes(container_elem);
	hexes.beginAppearAnimation(true, "red");
	update();
}
function update(){
	hexes.update();
	requestAnimationFrame(update);
}
document.body.onclick = function(){
	hexes.beginDisappearAnimation(true);
}
