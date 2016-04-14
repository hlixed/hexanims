function Hexagons(){
	this.hexes = [];
	this.hex_initial_ys = [];
	this.hex_xspeeds = [];
	this.animtimer = 0;
}
Hexagons.prototype.init = function(scene){
	new THREE.OBJLoader().load("hex.obj",function(mesh){
		this.makeHexes(scene, mesh.children[0].geometry);
	}.bind(this));
}

Hexagons.prototype.makeHexes = function(scene, geometry){
	var diameter = 2;
	var max_x_displacement = 5;

	//var geometry = new THREE.CircleGeometry(diameter/Math.sqrt(3), 6) ;

	var i=0;
	this.min_y = -10;
	for(var x=-10;x<10;x++){
		for(var y=-3;y<3;y++){
			//mesh
			var pushover = x % 2==0 ? 1 : 0 
			this.hexes.push(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff})));
			scene.add(this.hexes[i]);
			
			this.hex_initial_ys.push(y * diameter +(pushover * diameter / 2)); //store the initial Y-pos for gravity calcs later
			this.hex_xspeeds.push(Math.random()*max_x_displacement - max_x_displacement/2);

			this.hexes[i].position.set(x * diameter * Math.sqrt(3)/2,this.hex_initial_ys[i],-10);	
			// + (pushover * diameter / 2)
			this.hexes[i].rotation.set(Math.PI/2,Math.PI/6,0);
			this.hexes[i].scale.set(2/Math.sqrt(3),2/Math.sqrt(3),2/Math.sqrt(3));
			i++;
		}
	}
	this.animtimer = 0;
};
Hexagons.prototype.update = function(delta){
	this.animtimer += delta;
	for(var i=0;i<this.hexes.length;i++){ 
		//stagger the falling so each horizontal line takes 1/30s after the next one to fall
		//the +2 is there to make the animation occur 2s after loading the page
		if(this.animtimer*30 + this.min_y - 20 > -this.hexes[i].position.y){

			//gravity
			this.hexes[i].position.y -= ((this.hex_initial_ys[i] - this.hexes[i].position.y)*3 + 1)*delta*2;
			//move each hex away from the others
			this.hexes[i].position.x += this.hex_xspeeds[i] * delta;
			this.hexes[i].position.z += this.hex_xspeeds[i] * delta*3;

			//add some rotation
			this.hexes[i].rotation.y += 0.5 * delta * this.hex_xspeeds[i];
			this.hexes[i].rotation.x += 0.3 * delta * this.hex_xspeeds[i];
		};
	}
}
