function Hexagons(){
	this.hexes = [];
	this.controllers = [];
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
	//var startPos = new THREE.Vector3(10,10,0);
	var startPos = new THREE.Vector3(1.3,1.3,0.5).unproject(camera);

	//var geometry = new THREE.CircleGeometry(diameter/Math.sqrt(3), 6) ;

	var i=0;
	this.min_y = -10;
	for(var x=-10;x<10;x++){
		for(var y=-3;y<3;y++){
			//mesh
			var pushover = x % 2==0 ? 1 : 0 
			this.hexes.push(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff})));
			scene.add(this.hexes[i]);
			
			var initial_pos = new THREE.Vector3(x * diameter * Math.sqrt(3)/2,y * diameter +(pushover * diameter / 2),-10)
			this.controllers.push(new HexController(startPos, initial_pos, (y+3)/10 + (x+10)/15));

			this.hexes[i].position.copy(startPos);	
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
		//if(this.animtimer*30 + this.min_y - 20 > -this.hexes[i].position.y){

			//gravity
			this.controllers[i].update(delta, this.hexes[i]);
		//	this.hexes[i].rotation.x += 0.3 * delta * this.hex_xspeeds[i];
		//};
	}
}


function HexController(startpos, endpos, startdelay){
	this.endpos = endpos;
	this.startpos = startpos;
	this.startdelay = startdelay;
	this.completionRate = 0;
	this.totalTimer = 0;

	this.complete = false;
}
HexController.prototype.update = function(delta,hex){
	if(this.complete)return;

	this.totalTimer += delta;
	if(this.totalTimer > this.startdelay){
	
		this.completionRate += delta/3;
		if(this.completionRate > 1){
			this.complete = true;
			this.completionRate = 1;
		}
	
		var oneMinusCompletion = 1-this.completionRate;

		//lerp between this.startpos and this.endpos
		hex.position.set(this.startpos.x * oneMinusCompletion + this.endpos.x * this.completionRate,
			this.startpos.y * oneMinusCompletion + this.endpos.y * this.completionRate,
			this.startpos.z * oneMinusCompletion + this.endpos.z * this.completionRate);
	}
	
}
