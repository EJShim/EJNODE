var E_Interactor = require('./E_Interactor.js');
var E_Particle = require("../libs/physics/E_Particle.js");
var E_ParticleSource = require("../libs/physics/E_ParticleSource.js");
var E_FinitePlane = require("../libs/physics/E_FinitePlane.js");
var E_SpringDamper = require('../libs/physics/E_SpringDamper.js');
var E_SpringDamperSource = require("../libs/physics/E_SpringDamperSource.js");
var E_ParticleSystem = require("../libs/physics/E_ParticleSystem.js");

var E_Fabric2 = require("../libs/physics/E_Fabric2.js");

function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true, alpha:true});


  var m_interactor = new E_Interactor(this);
  var m_particleSystem = new E_ParticleSystem(this);

  var m_gravity = new THREE.Vector3(0.0, -0.98, 0.0);

  this.thumbnailSaved = false;
  this.starttime = new Date();

  this.then = new Date();
  this.interval = 1000 / 60;

  //Time Step for Rendering
  this.timeStep = 0;
  this.prevTime = new Date();

  this.groundMesh = [];
  this.m_selectedMesh = null

  this.GetScene = function()
  {
    return m_scene;
  }

  this.GetCamera = function()
  {
    return m_camera;
  }

  this.GetRenderer = function()
  {
    return m_renderer;
  }

  this.GetInteractor = function()
  {
    return m_interactor;
  }

  this.GetGravity = function()
  {
    return m_gravity;
  }

  this.ParticleSystem = function()
  {
    return m_particleSystem;
  }
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  //init renderrer
  //renderer.setClearColor(0xffffff, 1);
  renderer.setSize(window.innerWidth, window.innerHeight );

  //Initialize Object
  this.InitObject();
}

E_Manager.prototype.Animate = function()
{
  //Rendering
  var now = new Date();
  this.delta = (now - this.then);
  if(this.delta > this.interval){
    //Update Time Step
    this.timeStep = (now - this.prevTime) / 1000;
    if(this.timeStep > this.interval/1000) this.timeStep = this.interval / 1000;

    this.ParticleSystem().Update();

    var renderer = this.GetRenderer();

    var camera = this.GetCamera();
    var scene = this.GetScene();

    renderer.render(scene, camera);

    this.prevTime = now;
    this.then = now - (this.delta % this.interval);
  }


  //Update Interactor
  var interactor = this.GetInteractor();
  interactor.Update();

  this.SaveThumbnail();

  var Mgr = this;
  requestAnimationFrame(Mgr.Animate.bind(Mgr));
}


E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var system = this.ParticleSystem();
  var camera = this.GetCamera();
  var renderer = this.GetRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = 23;
  camera.position.y = 10;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  //Light
  var pointLight = new THREE.SpotLight( 0xffffff, 1, 100 );

  pointLight.position.set(10, 5, 5);
  pointLight.castShadow = true;
  pointLight.angle = Math.PI/4;
  pointLight.penumbra = 0.05;
  pointLight.decay = 2;
  pointLight.distance = 200;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.camera.near = 1;
  pointLight.shadow.camera.far = 10000;

  var ambient = new THREE.AmbientLight({color:0x000000});

  scene.add(pointLight);
  scene.add(ambient);

  this.GenerateRandomTriangle();


  //Init ParticleSs
  var numRow = 12;
  var numPart = 10;

  var arr = [];
  prevMesh = null;

  // for(var n=0 ; n<numRow ; n++){
  //   for(var i=0 ; i<numPart ; i++){
  //     var newMesh;
  //
  //     if(n === 5){
  //       newMesh = new E_ParticleSource(this, 0.45);
  //       newMesh.parent = true;
  //     }else{
  //       newMesh = new E_Particle(this, 0.45);
  //       newMesh.material.color = new THREE.Color(0.1, 0.4, 0.1);
  //       newMesh.m_colorFixed = true;
  //       scene.add(newMesh);
  //     }
  //
  //     newMesh.mass = 1;
  //     newMesh.lifeSpan = 18000000000000;
  //     newMesh.castShadow = true;
  //     newMesh.position.set(0, (n-numRow/2)*2 , (i-numPart/2)* 3 );
  //
  //     system.add(newMesh);
  //
  //     if(n === 0 || n === numRow-1 || i===0 || i === numPart-1){
  //       newMesh.m_bFixed = true;
  //     }
  //
  //     if(prevMesh != null){
  //       var spring = new E_SpringDamperSource(this);
  //       spring.castShadow = true;
  //       spring.AddMesh(prevMesh);
  //       spring.AddMesh(newMesh);
  //
  //       //scene.add(spring);
  //       system.add(spring);
  //     }
  //
  //     if(n != 0){
  //       var spring = new E_SpringDamperSource(this);
  //       spring.castShadow = true;
  //       spring.AddMesh(arr[i]);
  //       spring.AddMesh(newMesh);
  //
  //       //scene.add(spring);
  //       system.add(spring);
  //     }
  //
  //
  //     prevMesh = newMesh;
  //     arr[i] = newMesh;
  //   }
  //   prevMesh = null;
  // }

  var fab = new E_Fabric2(this);
  fab.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));
  fab.material.color = new THREE.Color(0.4, 0.1, 0.1);
  fab.castShadow = true;
  //fab.material = this.m_shaderMaterial;
  fab.AddToRenderer(scene, system);
  var scale = 12;

  for(var i=0 ; i<=scale ; i++){
    fab.FixPoint(0, i/scale);
    fab.FixPoint(1, i/scale);

    fab.FixPoint(i/scale, 0);
    fab.FixPoint(i/scale, 1);
  }
}

E_Manager.prototype.GenerateRandomTriangle = function()
{
  var scene = this.GetScene();
  var system = this.ParticleSystem();

  var scaleFactor = 16;
  var vertices = [];
  vertices[0] = new THREE.Vector3( -scaleFactor, -scaleFactor, -scaleFactor );
  vertices[1] = new THREE.Vector3( -scaleFactor, -scaleFactor, scaleFactor );
  vertices[2] = new THREE.Vector3( -scaleFactor, scaleFactor, -scaleFactor );
  vertices[3] = new THREE.Vector3( scaleFactor, -scaleFactor, -scaleFactor );
  vertices[4] = new THREE.Vector3( -scaleFactor, scaleFactor, scaleFactor );
  vertices[5] = new THREE.Vector3( scaleFactor, -scaleFactor, scaleFactor );
  vertices[6] = new THREE.Vector3( scaleFactor, scaleFactor, -scaleFactor );
  vertices[7] = new THREE.Vector3( scaleFactor, scaleFactor, scaleFactor );


  //Cube Box
  this.groundMesh[0] = new E_FinitePlane( vertices[0],vertices[1],vertices[2] );
  this.groundMesh[1] = new E_FinitePlane( vertices[1],vertices[2],vertices[4] );
  this.groundMesh[2] = new E_FinitePlane( vertices[0],vertices[1],vertices[5] );
  this.groundMesh[3] = new E_FinitePlane( vertices[0],vertices[3],vertices[5] );
  this.groundMesh[4] = new E_FinitePlane( vertices[0],vertices[2],vertices[6] );
  this.groundMesh[5] = new E_FinitePlane( vertices[0],vertices[6],vertices[3] );
  this.groundMesh[6] = new E_FinitePlane( vertices[1],vertices[4],vertices[7] );
  this.groundMesh[7] = new E_FinitePlane( vertices[1],vertices[7],vertices[5] );
  this.groundMesh[8] = new E_FinitePlane( vertices[3],vertices[5],vertices[6] );
  this.groundMesh[9] = new E_FinitePlane( vertices[5],vertices[6],vertices[7] );



  for(var i=0 ; i<8 ; i++){
    this.groundMesh[i].receiveShadow = true;
    this.groundMesh[i].material.side = THREE.FrontSide;
    this.groundMesh[i].material.color = new THREE.Color(0.2, 0.1, 0.05);

    scene.add(this.groundMesh[i]);
    system.add(this.groundMesh[i]);
  }

}

E_Manager.prototype.GenerateObjectScreen = function(x, y)
{
  var camera = this.GetCamera();


  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);

  raycaster.setFromCamera(mouse, camera);

  var distance = 0;
  var generatePosition = new THREE.Vector3();
  generatePosition.addVectors(raycaster.ray.origin.clone(), raycaster.ray.direction.clone().multiplyScalar(distance));

  this.GenerateObject(generatePosition.x, generatePosition.y, generatePosition.z, raycaster.ray.direction.clone().multiplyScalar(20));

}

E_Manager.prototype.GenerateObject = function(x, y, z, vel)
{
  var scene = this.GetScene();
  var system = this.ParticleSystem();

  var newMesh = new E_Particle(this, this.frand(0.3, 0.4));
  newMesh.lifeSpan = 30000; //30 secs
  newMesh.castShadow = true;
  newMesh.receiveShadow = true;
  newMesh.position.set(x, y, z);
  newMesh.material.color = new THREE.Color(Math.random()/3, Math.random()/3, Math.random()/3);
  newMesh.m_colorFixed = true;

  if(vel == undefined) {
    var velFactor = 5;
    vel = new THREE.Vector3(this.frand(-velFactor, velFactor), this.frand(-velFactor, velFactor), this.frand(-velFactor, velFactor));
  }

  newMesh.velocity.set( vel.x, vel.y, vel.z  );

  scene.add(newMesh);
  system.add(newMesh);

}

E_Manager.prototype.SetLog = function(string)
{
  document.getElementById("log").innerHTML = string;
}



E_Manager.prototype.SaveThumbnail = function()
{
  var elapsedTime = (new Date() - this.starttime)/1000;
  if(elapsedTime > 15 || this.thumbnailSaved){
    return;
  }


  this.thumbnailSaved = true;
  console.log("Thumbnail Saved");


  if(this.thumbnailSaved) return;
	//var testCanvas = m_renderer.domElement.toDataURL();
	var canvasData = this.GetRenderer().domElement.toDataURL();
	var postData = "canvasData="+canvasData;


	//alert("canvasData ="+canvasData );
	var ajax = new XMLHttpRequest();
	ajax.open("POST",'../../thumbnail.php',true);
	ajax.setRequestHeader('Content-Type', 'canvas/upload');
	//ajax.setRequestHeader('Content-TypeLength', postData.length);


	ajax.onreadystatechange=function()
	{
		if (ajax.readyState == 4)
		{
			//alert(ajax.responseText);
			// Write out the filename.


		}
	}
	ajax.send(postData);
}

E_Manager.prototype.SelectObject = function(x, y)
{
  var camera = this.GetCamera();
  var scene = this.GetScene();

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);


  if(intersects.length > 0){
    for(var i in intersects){
      if(intersects[i].object instanceof E_Particle){
        this.m_selectedMesh = intersects[i].object;
        this.m_selectedMesh.velocity.set(0, 0, 0);

        this.m_prevTime = new Date();
        this.m_prevPosition = this.m_selectedMesh.position.clone();
        return true;
        //intersects[i].object.material.color.set(0xff0000);
        break;
      }
      else if(intersects[i].object instanceof E_Fabric2){
        var faceIdx = intersects[i].face.a;
        this.m_prevTime = new Date();
        this.m_selectedMesh = intersects[i].object.particles[faceIdx];
        this.m_selectedMesh.velocity.set(0, 0, 0);
        this.m_prevPosition = intersects[i].object.particles[faceIdx].position.clone();
        return true;
      }
    }
  }
  return false;
}
E_Manager.prototype.OnMoveObject = function(x, y)
{

  //Save Time and Position
  this.m_prevTime = new Date();
  this.m_prevPosition = this.m_selectedMesh.position.clone()

  var camera = this.GetCamera();
  var scene = this.GetScene();
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);
  raycaster.setFromCamera(mouse, camera);
  var distance = camera.position.clone().sub(this.m_selectedMesh.position).length();
  var newPosition = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(distance));
  this.m_selectedMesh.position.set(newPosition.x, newPosition.y, newPosition.z);
}

E_Manager.prototype.OnReleaseMouse = function()
{
  var currentTime = new Date();
  var currentPosition = this.m_selectedMesh.position.clone();

  var elapsedTime = (currentTime-this.m_prevTime);
  var elapsedPosition = currentPosition.sub(this.m_prevPosition);


  this.m_selectedMesh = -1;
  this.m_prevTime = 0;
  this.m_prevPosition.set(0, 0, 0);
}

E_Manager.prototype.frand = function(min, max)
{
  var range = max - min;
  var value = Math.random();

  value *= range;
  value += min;

  return value;
}

module.exports = E_Manager;
