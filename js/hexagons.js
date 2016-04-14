function Hexagons(){
	this.hexes = [];
	this.controllers = [];
	this.animtimer = 0;
}
Hexagons.prototype.init = function(scene){
	new THREE.TextureLoader().load("RedBall.png",function(tex){
		new THREE.OBJLoader().load("beveledhex.obj",function(mesh){
			this._makeHexes(scene, mesh.children[0].geometry, tex);
		}.bind(this));
	}.bind(this));
}
Hexagons.prototype._makeHexes = function(scene, geometry, tex){
	var diameter = 2;
	var max_x_displacement = 5;
	var startPos = new THREE.Vector3(1.5,1.5,0.5).unproject(camera); //top right of camera

	var i=0;
	this.min_y = -10;
	for(var x=-10;x<10;x++){
		for(var y=-3;y<3;y++){
			//mesh
			var pushover = x % 2==0 ? 1 : 0 
			this.hexes.push(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff,map: tex})));
			scene.add(this.hexes[i]);
			
			var end_pos = new THREE.Vector3(x * diameter * Math.sqrt(3)/2,y * diameter +(pushover * diameter / 2),-10)
			var end_rotation = new THREE.Vector3(Math.PI/2,0,0);
			this.controllers.push(new HexController(startPos, end_pos, end_rotation, 1.5-end_pos.distanceTo(startPos)/20, 1));

			this.hexes[i].position.copy(startPos);	
			// + (pushover * diameter / 2)
			this.hexes[i].scale.set(2/Math.sqrt(3) + 0.1,2/Math.sqrt(3) + 0.1,2/Math.sqrt(3) + 0.1);
			i++;
		}
	}
	this.animtimer = 0;
};
Hexagons.prototype.update = function(delta){
	this.animtimer += delta;
	for(var i=0;i<this.hexes.length;i++){ 
			this.controllers[i].update(delta, this.hexes[i]);
	}
}


function HexController(startpos, endpos, endrotation, startdelay, animationTime){
	this.endpos = endpos;
	this.startpos = startpos;
	this.endrotation = endrotation;
	this.startrotation = new THREE.Vector3(Math.random()*3,Math.random()*3,Math.random()*3);
	this.startdelay = startdelay;
	this.animationTime = animationTime;

	this.completionRate = 0;
	this.totalTimer = 0;

	this.complete = false;
}
HexController.prototype.update = function(delta,hex){
	if(this.complete)return;

	this.totalTimer += delta;
	if(this.totalTimer > this.startdelay){

		//this.completionRate goes from 0 to 1; since delta==1 means 1 second elapsed, dividing by this.animationTime means the animation takes this.animationTime seconds long after the startdelay has elapsed
		this.completionRate += delta/this.animationTime;
		if(this.completionRate > 1){
			this.complete = true;
			this.completionRate = 1;
		}
	
		var oneMinusCompletion = 1-this.completionRate;

		//lerp between this.startpos and this.endpos
		hex.position.set(this.startpos.x * oneMinusCompletion + this.endpos.x * this.completionRate,
			this.startpos.y * oneMinusCompletion + this.endpos.y * this.completionRate,
			this.startpos.z * oneMinusCompletion + this.endpos.z * this.completionRate);

		//also lerp the rotation from this.startrotation to this.endrotation
		hex.rotation.set(this.startrotation.x * oneMinusCompletion + this.endrotation.x * this.completionRate,
			this.startrotation.y * oneMinusCompletion + this.endrotation.y * this.completionRate,
			this.startrotation.z * oneMinusCompletion + this.endrotation.z * this.completionRate);

	}	
}
