"use strict";
var Detector = {
	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () {
		try {
			var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
		} catch ( e ) {
			return false;
		}
	} )(),
};

var scene, camera, renderer, hexes;
var clock = new THREE.Clock();
document.body.onload = function(){
	var body = document.body;

	//stop mobile scrolling
	body.addEventListener("touchmove", function(e){
		console.log("Saw touchmove");
		e.stopPropagation();
		e.preventDefault();
	}, false);

	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0xaaaaaa) );

	window.basicMat = new THREE.MeshBasicMaterial({color:0xeeeeee});

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1,200);
	camera.position.set(0,0,0);
	scene.add(camera);

	//mesh
	hexes = new Hexagons();
	hexes.init(scene);

	document.body.onclick = function(){
		hexes.beginfadeout();
	}
	                                                                                                   
	// Renderer

	renderer = new THREE.WebGLRenderer({ antialias : true});
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.setClearColor( 0x00000, 1);


	var container = document.getElementById("canvasContainer");
	container.appendChild( renderer.domElement );
	renderer.domElement.style.position = "absolute";

	//listen for resizing
	window.addEventListener( 'resize', function(){
		renderer.setSize( window.innerWidth, window.innerHeight );

		camera.aspect = (window.innerWidth / window.innerHeight);

		renderer.domElement.width = window.innerWidth;
		renderer.domElement.height = window.innerHeight;

	}, false );

	update();

};
function update(){
	var delta = clock.getDelta();

	hexes.update(delta);

	renderer.render( scene, camera);

	window.requestAnimationFrame(update);
};
