function ResultHexes(canvas_elem, clear_color, asset_folder){
	//Class to control the result hexagon-tile animation
	//canvas_elem: a <canvas> element to draw the animation to
	//asset_folder: the folder where red.png, blue.png, gray.png, hex.obj, and hex.mtl are stored. Must end with "/"! By default: "static/resulthexes/"

	this.hexes = [];
	this.controllers = [];

	this.animtimer = 0;
	this.fading=false;
	this.appearedFromLeft = false;

	//parameters
	this.startingLightIntensity = 0.3;
	this.asset_folder = asset_folder || "static/resulthexes/"

	//Clock to get deltas for each frame
	this.clock = new THREE.Clock();

	//threejs constructs
	this.scene = new THREE.Scene();
	this. scene.add( new THREE.AmbientLight( 0xaaaaaa) );

	this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1,200);
	this.camera.position.set(0,0,0);
	this.scene.add(this.camera);

	//add some light
	this.light =  new THREE.DirectionalLight( 0xffffff, this.startingLightIntensity) 
	this.light.position.set(0,0,3);
	this.scene.add( this.light );
                                                                               
	// Renderer
	var clear_color = clear_color || 0x000000;

	this.renderer = new THREE.WebGLRenderer({ antialias : true, canvas: canvas_elem});
	this.renderer.setSize( window.innerWidth, window.innerHeight);
	this.renderer.setClearColor( clear_color, 1);

	//queue async texture loads
	this.textures = {};
	new THREE.OBJLoader().load(this.asset_folder+"beveledhex.obj",function(mesh){
		this.hex_geometry = mesh.children[0].geometry;
	}.bind(this));
	var loader = 
	new THREE.TextureLoader();
	loader.load(this.asset_folder+"red.png",function(tex){
		this.textures[this.asset_folder+"red.png"] = tex;
	}.bind(this));
	loader.load(this.asset_folder+"blue.png",function(tex){
		this.textures[this.asset_folder+"blue.png"] = tex;
	}.bind(this));
	loader.load(this.asset_folder+"gray.png",function(tex){
		this.textures[this.asset_folder+"gray.png"] = tex;
	}.bind(this));
}
ResultHexes.prototype.beginAppearAnim = function(start_from_left, color){
	//Begin playing the appearing animation.
	//start_from_left: boolean; whether to start the animatino from the top left corner or the top right
	//color: "red", "blue", or "gray".

	var colorMap = {"red": this.asset_folder+"red.png", "blue": this.asset_folder+"blue.png", "gray": this.asset_folder+"gray.png"};
	var filename = colorMap[color];

	if(filename === undefined){
		throw new Error("Color must be one of 'red', 'blue', or 'gray'");
	}

	//if we already have the necessary objects cached, use them
	if(this.hex_geometry && this.textures[filename]){
		this._makeHexes(this.hex_geometry, this.textures[filename], start_from_left);
	}else{
		//otherwise, load
		new THREE.TextureLoader().load(filename,function(tex){
			new THREE.OBJLoader().load(this.asset_folder+"beveledhex.obj",function(mesh){
				this.hex_geometry = mesh.children[0].geometry;
				this._makeHexes(mesh.children[0].geometry, tex, start_from_left);
			}.bind(this));
		}.bind(this));
	}
}
ResultHexes.prototype._makeHexes = function(geometry, tex, start_from_left){
	var diameter = 2;
	var max_x_displacement = 5;

	var start_pos = new THREE.Vector3(1.5,1.5,0.5).unproject(this.camera); //top right of camera
	if(start_from_left)start_pos.x = -start_pos.x; //if we're starting from the left, use the top left of the camera
	this.appearedFromLeft = start_from_left;

	//reset light
	this.light.intensity = this.startingLightIntensity;

	if(this.hexes.length == 0){
		this.hexes = new Array(16*6);
		this.controllers = new Array(16*6);
	}

	//begin creating meshes
	var i=0;
	for(var x=-8;x<8;x++){
		for(var y=-3;y<3;y++){
			//create a new hex mesh
			if(this.hexes[i] === undefined){
				this.hexes[i] = (new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff,map: tex})));
				this.scene.add(this.hexes[i]);
			}
			this.hexes[i].material.color.setScalar(1,1,1);
			
			//calculate the position the hex needs to fly to to form a perfect hexagonal grid
			//start_pos was calculated earlier
			var pushover = x % 2==0 ? 1 : 0 
			var end_pos = new THREE.Vector3(x * diameter * Math.sqrt(3)/2,y * diameter +(pushover * diameter / 2),-10);

			//set up the random rotation
			var start_rotation = new THREE.Vector3(Math.random()*3,Math.random()*3,Math.random()*3);
			var end_rotation = new THREE.Vector3(Math.PI/2,0,0);

			//using the calculated parameters, create a new hexController to lerp the animation
			this.controllers[i] = (new HexController(start_pos, end_pos, start_rotation, end_rotation, 1.5-end_pos.distanceTo(start_pos)/20, 1));

			//set the hexes' initial positions to offscreen and set their scale to the required scale
			this.hexes[i].position.copy(start_pos);	
			this.hexes[i].scale.set(2/Math.sqrt(3) + 0.1,2/Math.sqrt(3) + 0.1,2/Math.sqrt(3) + 0.1);

			i++;
		}
	}
	this.animtimer = 0;
};
ResultHexes.prototype.update = function(delta){
	var delta = this.clock.getDelta();

	//update any in-progress hex animations
	this.animtimer += delta;
	var allcomplete = true;
	for(var i=0;i<this.hexes.length;i++){ 
			this.controllers[i].update(delta, this.hexes[i]);
			if(allcomplete && !this.controllers[i].complete){
				allcomplete = false;
			}
	}

	//if fading out, update the fade
	if(this.fading){
		//subtract delta/2 from the fade color so it goes from 1 to 0 in this.fade_anim_time seconds
		var nextColor = this.hexes[0].material.color.r - delta/this.fade_anim_time;
		if(nextColor <= this.fade_target){
			this.fading = false;
			nextColor = this.fade_target;
		}
		for(var i=0;i<this.hexes.length;i++){ 
			this.hexes[i].material.color.setScalar(nextColor,nextColor,nextColor);
		}
		//also fade the light so the black is uniform
		this.light.intensity = nextColor * this.startingLightIntensity;
	}

	this.renderer.render( this.scene, this.camera);
}

ResultHexes.prototype.beginFlyoutAnim = function(toLeft){
	//play the zooming-out animation. Only makes sense after beginAppearAnimation() has been called and the ~3s have passed for the animation to complete.

	//toLeft: boolean; whether to fly to the top left or the top right

	for(var i=0;i<this.hexes.length;i++){ 
			//create a new HexController from the old one, but with the reverse animation
			var end_pos = this.controllers[i].start_pos.clone();
			var start_pos = this.controllers[i].end_pos.clone();

			var end_rotation = new THREE.Vector3(Math.random()*3,Math.random()*3,Math.random()*3);
			var start_rotation = this.controllers[i].end_rotation;

			//choose the correct corner to fly to
			if(this.appearedFromLeft != toLeft){
				end_pos.x = -end_pos.x;
			}

			//overwrite the old HexController
			this.controllers[i] = new HexController(start_pos, end_pos, start_rotation, end_rotation, end_pos.distanceTo(start_pos)/10, 0.5)
	}
}
ResultHexes.prototype.beginFadeoutAnim = function(fade_anim_time, fade_target){
	//Fade hexes out to black
	if(fade_target < 0 || fade_target > 1){
		throw new Error("fade_target must be 0-1");
	}
	this.fading = true;
	this.fade_anim_time = fade_anim_time || 2;
	this.fade_target = fade_target || 0;
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
