"use strict";
var hexes;
document.body.onload = function(){
	var canvas_elem = document.getElementById("hexCanvas");
	hexes = new ResultHexes(canvas_elem);
	hexes.beginAppearAnim(true, "blue");
	update();
}
function update(){
	hexes.update();
	requestAnimationFrame(update);
}
document.body.onclick = function(){
	hexes.beginFlyoutAnim(true);
}
