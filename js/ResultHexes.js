"use strict";
function ResultHexes(container_elem){

	//Clock to get deltas for each frame
	this.clock = new THREE.Clock();

	//threejs constructs
	this.scene = new THREE.Scene();
	this. scene.add( new THREE.AmbientLight( 0xaaaaaa) );

	this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1,200);
	this.camera.position.set(0,0,0);
	this.scene.add(this.camera);

	//create the actual hexagon controller
	this.hexes = new Hexagons();
                                                                               
	// Renderer
	this.renderer = new THREE.WebGLRenderer({ antialias : true});
	this.renderer.setSize( window.innerWidth, window.innerHeight);
	this.renderer.setClearColor( 0x00000, 1);

	//append the renderer to the container_elem DOMElement
	container_elem.appendChild( this.renderer.domElement );

}
ResultHexes.prototype.beginAppearAnimation = function(start_from_left, color){
	//start_from_left: boolean; whether to show from top left corner or top right
	//color: "red","blue","gray"; specifies which texture to use


	//todo: implement color
	//todo: implement preloading
	//create the meshes
	this.hexes.init(this.scene, this.camera, start_from_left);

}
ResultHexes.prototype.beginDisappearAnimation = function(toLeft){
	//play the zooming-out animation
	//toLeft: boolean; whether to fly to the top left or the top right
	this.hexes.beginFlyout(toLeft);
	
}
ResultHexes.prototype.update = function(){
	var delta = this.clock.getDelta();

	this.hexes.update(delta);

	this.renderer.render( this.scene, this.camera);
};
