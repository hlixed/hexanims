function Hexagons(){
	this.hexes = [];
	this.controllers = [];
	this.animtimer = 0;
	this.fading=false;
	this.light = null;
	this.appearedFromLeft = false;
	this.startingLightIntensity = 0.3;
}
Hexagons.prototype.init = function(scene, camera, start_from_left){

	this.light =  new THREE.DirectionalLight( 0xffffff, this.startingLightIntensity) 
	this.light.position.set(0,0,3);
	scene.add( this.light );

	//load the texture, then the .obj file
	new THREE.TextureLoader().load("RedBall.png",function(tex){
		new THREE.OBJLoader().load("beveledhex.obj",function(mesh){
			this._makeHexes(scene, camera, mesh.children[0].geometry, tex, start_from_left);
		}.bind(this));
	}.bind(this));
}
Hexagons.prototype._makeHexes = function(scene, camera, geometry, tex, start_from_left){
	var diameter = 2;
	var max_x_displacement = 5;

	var start_pos = new THREE.Vector3(1.5,1.5,0.5).unproject(camera); //top right of camera
	if(start_from_left)start_pos.x = -start_pos.x;
	this.appearedFromLeft = start_from_left;

	var i=0;
	this.min_y = -10;
	for(var x=-8;x<8;x++){
		for(var y=-3;y<3;y++){
			//create a new hex mesh
			this.hexes.push(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff,map: tex})));
			scene.add(this.hexes[i]);
			
			//calculate the position the hex needs to fly to to form a perfect hexagonal grid
			//start_pos was calculated earlier
			var pushover = x % 2==0 ? 1 : 0 
			var end_pos = new THREE.Vector3(x * diameter * Math.sqrt(3)/2,y * diameter +(pushover * diameter / 2),-10);

			//set up the random rotation
			var start_rotation = new THREE.Vector3(Math.random()*3,Math.random()*3,Math.random()*3);
			var end_rotation = new THREE.Vector3(Math.PI/2,0,0);

			//using the calculated parameters, create a new hexController to lerp the animation
			this.controllers.push(new HexController(start_pos, end_pos, start_rotation, end_rotation, 1.5-end_pos.distanceTo(start_pos)/20, 1));

			//set the hexes' initial positions to offscreen and set their scale to the required scale
			this.hexes[i].position.copy(start_pos);	
			this.hexes[i].scale.set(2/Math.sqrt(3) + 0.1,2/Math.sqrt(3) + 0.1,2/Math.sqrt(3) + 0.1);

			i++;
		}
	}
	this.animtimer = 0;
};
Hexagons.prototype.update = function(delta){
	this.animtimer += delta;
	var allcomplete = true;
	for(var i=0;i<this.hexes.length;i++){ 
			this.controllers[i].update(delta, this.hexes[i]);
			if(allcomplete && !this.controllers[i].complete){
				allcomplete = false;
			}
	}

	if(this.fading){
		//subtract delta/2 from the fade color so it goes from 1 to 0 in 2 seconds
		var nextColor = this.hexes[0].material.color.r - delta/2;
		if(nextColor <= 0){
			this.fading = false;
			nextColor = 0;
		}
		for(var i=0;i<this.hexes.length;i++){ 
			this.hexes[i].material.color.setScalar(nextColor,nextColor,nextColor);
		}
		//also fade the light so the black is uniform
		hexes.light.intensity = nextColor * this.startingLightIntensity;
	}
}

Hexagons.prototype.beginFlyout = function(toLeft){
	for(var i=0;i<this.hexes.length;i++){ 
			//create a new HexController from the old one, but with the reverse animation
			var end_pos = this.controllers[i].start_pos.clone();
			var start_pos = this.controllers[i].end_pos.clone();
			end_pos.x = -end_pos.x;
			var end_rotation = new THREE.Vector3(Math.random()*3,Math.random()*3,Math.random()*3);
			var start_rotation = this.controllers[i].end_rotation;
			this.controllers[i] = new HexController(start_pos, end_pos, start_rotation, end_rotation, end_pos.distanceTo(start_pos)/10, 0.5)
	}
}
Hexagons.prototype.beginFadeout = function(){
	//nonreusable?
	this.fading = true;
}


function HexController(start_pos, end_pos, start_rotation, end_rotation, start_delay, animation_time){
	this.end_pos = end_pos;
	this.start_pos = start_pos;
	this.end_rotation = end_rotation;
	this.start_rotation = start_rotation
	this.start_delay = start_delay;
	this.animation_time = animation_time;

	this.completion_rate = 0;
	this.total_timer = 0;

	this.complete = false;
}
HexController.prototype.update = function(delta,hex){
	if(this.complete)return;

	this.total_timer += delta;
	if(this.total_timer > this.start_delay){

		//this.completion_rate goes from 0 to 1; since delta==1 means 1 second elapsed, dividing by this.animation_time means the animation takes this.animation_time seconds long after the start_delay has elapsed
		this.completion_rate += delta/this.animation_time;
		if(this.completion_rate > 1){
			this.complete = true;
			this.completion_rate = 1;
		}
	
		var oneMinusCompletion = 1-this.completion_rate;

		//lerp between this.start_pos and this.end_pos
		hex.position.set(this.start_pos.x * oneMinusCompletion + this.end_pos.x * this.completion_rate,
			this.start_pos.y * oneMinusCompletion + this.end_pos.y * this.completion_rate,
			this.start_pos.z * oneMinusCompletion + this.end_pos.z * this.completion_rate);

		//also lerp the rotation from this.start_rotation to this.end_rotation
		hex.rotation.set(this.start_rotation.x * oneMinusCompletion + this.end_rotation.x * this.completion_rate,
			this.start_rotation.y * oneMinusCompletion + this.end_rotation.y * this.completion_rate,
			this.start_rotation.z * oneMinusCompletion + this.end_rotation.z * this.completion_rate);

	}	
}
