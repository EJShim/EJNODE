(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function E_Interactor(Mgr)
{
  this.Manager = Mgr;

  this.m_bDown = false;
  this.m_bRDown = false;

  this.m_keyCode = -1;

  this.prevPosition = new THREE.Vector2(0, 0);
}

E_Interactor.prototype.onMouseDown = function(event)
{
  this.m_bDown = true;

  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  this.Manager.GenerateObjectScreen(mouseX, mouseY);
}

E_Interactor.prototype.onMouseUp = function(event)
{
  this.m_bDown = false;
}

E_Interactor.prototype.onMouseRDown = function(event)
{
}

E_Interactor.prototype.onMouseRUp = function(event)
{

}

E_Interactor.prototype.onMouseMove = function(event)
{

}

E_Interactor.prototype.onKeyboardDown = function(event)
{
  this.m_keyCode = event.keyCode;

  if(this.m_keyCode == 32){
    //this.Manager.ResetGround();
  }
}

E_Interactor.prototype.onKeyboardUp = function(event)
{
  this.m_keyCode = -1;
}

E_Interactor.prototype.Update = function()
{

  var camera = this.Manager.GetCamera();
  var camDir = new THREE.Vector3(0, 0, 0);
  camera.getWorldDirection(camDir);
  var camUp = camera.up.clone();


  var sideDir = camUp.cross(camDir.clone());
  switch (this.m_keyCode) {
    case -1:
      return;
    break;
    case 32:
      this.Manager.GenerateObject(this.Manager.frand(-2.0, 2.0), this.Manager.frand(2.0, 3.0), this.Manager.frand(-2.0, 2.0));
    break;
    case 87: // W Key
      var nextPosition = camera.position.clone().add(camDir.clone().multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 83: // S key
      var nextPosition = camera.position.clone().sub(camDir.clone().multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 65: // A key
      var nextPosition = camera.position.clone().add(sideDir.multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 68: // D Key
      var nextPosition = camera.position.clone().sub(sideDir.multiplyScalar(0.1));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    default:
    break;
  }
}

module.exports = E_Interactor;

},{}],2:[function(require,module,exports){
var E_Manager = require("./Manager.js");


var Manager = new E_Manager();
Manager.Initialize();
Manager.Animate();

$(window).resize(function(){
  Manager.GetRenderer().setSize(window.innerWidth, window.innerHeight);
  Manager.GetCamera().aspect = $("#viewport").width()/$("#viewport").height();
  Manager.GetCamera().updateProjectionMatrix();
});


//Event Handlers
$("#viewport").mousedown(function(event){
  Manager.GetInteractor().onMouseDown(event);
});

$("#viewport").mousemove(function(event){
  Manager.GetInteractor().onMouseMove(event);
});

$("#viewport").mouseup(function(event){
  Manager.GetInteractor().onMouseUp(event);
});


$("#viewport").bind('touchstart', function(event) {
  Manager.GetInteractor().onMouseDown(event.originalEvent.touches[0]);
});

$("#viewport").bind('touchmove', function(event) {
  Manager.GetInteractor().onMouseMove(event.originalEvent.touches[0]);
  event.preventDefault();
});
$("#viewport").bind('touchend', function(event) {
  Manager.GetInteractor().onMouseUp(event.originalEvent.touches[0]);
 });

$(window).keydown(function(event){
  Manager.GetInteractor().onKeyboardDown(event);
});

$(window).keyup(function(event){
  Manager.GetInteractor().onKeyboardUp(event);
});

},{"./Manager.js":3}],3:[function(require,module,exports){
var E_Interactor = require('./E_Interactor.js');
var E_Particle = require("../libs/physics/E_Particle.js");
var E_FinitePlane = require("../libs/physics/E_FinitePlane.js");
var E_ParticleSystem = require("../libs/physics/E_ParticleSystem.js");

function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true, alpha:true});
  var m_interactor = new E_Interactor(this);
  var m_particleSystem = new E_ParticleSystem(this);

  var m_gravity = new THREE.Vector3(0.0, -10, 0.0);

  this.thumbnailSaved = false;
  this.starttime = new Date();

  this.then = new Date();
  this.interval = 1000 / 60;

  //Time Step for Rendering
  this.timeStep = 0;
  this.prevTime = new Date();

  this.groundMesh = [];

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
    //this.then = now - (this.delta % this.interval);
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
  var camera = this.GetCamera();

  camera.position.z = 3;
  camera.position.y = 5;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var pointLight = new THREE.PointLight({color:0xffffff});
  pointLight.position.set(0, 5, 0);
  var ambient = new THREE.AmbientLight({color:0x000000});

  scene.add(pointLight);
  scene.add(ambient);

  this.GenerateRandomTriangle();

}

E_Manager.prototype.GenerateRandomTriangle = function()
{
  var scene = this.GetScene();
  var system = this.ParticleSystem();

  var scaleFactor = 1;
  var vertices = [];
  vertices[0] = new THREE.Vector3( -scaleFactor, -scaleFactor, -scaleFactor );
  vertices[1] = new THREE.Vector3( -scaleFactor, -scaleFactor, scaleFactor );
  vertices[2] = new THREE.Vector3( -scaleFactor, scaleFactor, -scaleFactor );
  vertices[3] = new THREE.Vector3( scaleFactor, -scaleFactor, -scaleFactor );
  vertices[4] = new THREE.Vector3( -scaleFactor, scaleFactor, scaleFactor );
  vertices[5] = new THREE.Vector3( scaleFactor, -scaleFactor, scaleFactor );
  vertices[6] = new THREE.Vector3( scaleFactor, scaleFactor, -scaleFactor );
  vertices[7] = new THREE.Vector3( scaleFactor, scaleFactor, scaleFactor );


  //ground
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



  for(var i=0 ; i<10 ; i++){
    this.groundMesh[i].material.transparent = true;
    this.groundMesh[i].material.opacity = 0.2;
    this.groundMesh[i].material.color = new THREE.Color(Math.random() / 4, Math.random() / 4, Math.random() / 4);

    scene.add(this.groundMesh[i]);
    system.add(this.groundMesh[i]);
  }
}

E_Manager.prototype.ResetGround = function()
{
//   var v1 = new THREE.Vector3(this.frand(-2.5, -1.0), this.frand(-0.2, 0.2), this.frand(-2.5, -1.0));
//   var v2 = new THREE.Vector3(this.frand(1.0, 2.5), this.frand(-0.2, 0.2) , this.frand(-2.5, -1.0));
//   var v3 = new THREE.Vector3(this.frand(-0.5, -0.5), this.frand(-0.2, 0.2, this.frand(1.0, 2.5)));
//
//   this.groundMesh.geometry.vertices[0].set(v1.x, v1.y, v1.z) ;
//   this.groundMesh.geometry.vertices[1].set(v2.x, v2.y, v2.z);
//   this.groundMesh.geometry.vertices[2].set(v3.x, v3.y, v3.z);
//   this.groundMesh.geometry.verticesNeedUpdate = true;
}


E_Manager.prototype.GenerateObjectScreen = function(x, y)
{
  var camera = this.GetCamera();


  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2(x, y);

  raycaster.setFromCamera(mouse, camera);

  var distance = 5;
  var generatePosition = new THREE.Vector3();
  generatePosition.addVectors(raycaster.ray.origin.clone(), raycaster.ray.direction.clone().multiplyScalar(distance));

  this.GenerateObject(generatePosition.x, generatePosition.y, generatePosition.z);

}

E_Manager.prototype.GenerateObject = function(x, y, z)
{
  var scene = this.GetScene();
  var system = this.ParticleSystem();

  var newMesh = new E_Particle(this, 0.1);
  newMesh.position.set(x, y, z);
  newMesh.material.color = new THREE.Color(Math.random() / 2, Math.random() / 2, Math.random() / 2);
  newMesh.m_colorFixed = true;

  var velFactor = 5;
  newMesh.velocity.set( this.frand(-velFactor, velFactor), this.frand(-velFactor, velFactor), this.frand(-velFactor, velFactor) );

  scene.add(newMesh);
  system.add(newMesh);
  // scene.add(newMesh2);
  // scene.add(spring);

  //Impulse
  //newMesh.ApplyImpulse(raycaster.ray.direction.clone().normalize().multiplyScalar(0));


  //log

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

E_Manager.prototype.frand = function(min, max)
{
  var range = max - min;
  var value = Math.random();

  value *= range;
  value += min;

  return value;
}

module.exports = E_Manager;

},{"../libs/physics/E_FinitePlane.js":4,"../libs/physics/E_Particle.js":5,"../libs/physics/E_ParticleSystem.js":6,"./E_Interactor.js":1}],4:[function(require,module,exports){
function E_FinitePlane(v1, v2, v3)
{
  THREE.Mesh.call(this);

  this.geometry = new THREE.Geometry();
  this.geometry.vertices.push(v1);
  this.geometry.vertices.push(v2);
  this.geometry.vertices.push(v3);
  this.geometry.faces.push(new THREE.Face3(0, 1, 2));
  this.geometry.faces.push(new THREE.Face3(2, 1, 0));
  this.geometry.computeFaceNormals();

  this.material = new THREE.MeshPhongMaterial({color:0xff0000});
  this.material.color = new THREE.Color(Math.random(), Math.random(), Math.random());
}

E_FinitePlane.prototype = Object.create(THREE.Mesh.prototype);

E_FinitePlane.prototype.GetPlaneEquation = function(s, t)
{
  var p = this.geometry.vertices[0].clone();
  var q = this.geometry.vertices[1].clone();
  var r = this.geometry.vertices[2].clone();

  // p + s(q-p) + t(r-p);
  return p.clone().add( q.clone().sub(p.clone()).multiplyScalar(s) ).add( r.clone().sub(p.clone()).multiplyScalar(t));
}

E_FinitePlane.prototype.IsCollisionOccured = function(object , nextPosition)
{
  if(nextPosition == null) nextPosition = true;
  var p = this.geometry.vertices[0];
  var q = this.geometry.vertices[1];
  var r = this.geometry.vertices[2];

  var nP;
  if(nextPosition){
    nP = object.GetNextPosition();
  }else{
    nP = object.position.clone().add(object.velocity.clone().normalize().multiplyScalar(object.radius));
  }

  var u = q.clone().sub(p);
  var v = r.clone().sub(p);

  var a = object.GetPosition().clone().sub(nP);
  var b = object.GetPosition().clone().sub(p);

  var Const = 1 / (u.clone().cross(v.clone()).dot(a));

  var s = Const * (a.clone().cross(b.clone()).dot(v));
  var t = Const * -1 * (a.clone().cross(b.clone()).dot(u));
  var l = Const * (u.clone().cross(v.clone()).dot(b));


  if(s >= 0 && t >= 0  && l >= 0 && l <= 1 && s+t <= 1) {
    //console.log( crossLine );
    //this.material.color = new THREE.Color(Math.random(), Math.random(), Math.random());


    // intersected point on the plane
    var n = this.GetNormal();
    var v = nP.clone().sub(p);
    var dist = n.clone().dot(v);

    if(dist < 0) dist *= -1;
    else n.multiplyScalar(-1);

    var cP = this.GetPlaneEquation(s, t);
    var length = nP.clone().sub(cP).length();
    return cP.add(n.clone().multiplyScalar( object.radius / 2 ) );
  }
  else return false;
}

E_FinitePlane.prototype.GetNormal = function()
{
  var p = this.geometry.vertices[0].clone();
  var q = this.geometry.vertices[1].clone();
  var r = this.geometry.vertices[2].clone();

  var u = q.clone().sub(p);
  var v = r.clone().sub(p);

  var normal = u.clone().cross(v);
  return normal.normalize();
}

module.exports = E_FinitePlane;

},{}],5:[function(require,module,exports){
function E_Particle(Mgr, radius){
  THREE.Mesh.call(this);

  if(radius == null) radius = 15;
  this.radius = radius;
  this.geometry = new THREE.SphereGeometry(radius, 32, 32);
  this.material = new THREE.MeshPhongMaterial({color: 0xffff00});


  this.Manager = Mgr;


  //Dynamics
  this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.mass = 1;

  this.elasticity = 0.1;

  //Informations
  this.lifeSpan = 30000000000000;
  this.startTime = new Date();

  //Position Fix
  this.m_colorFixed = false;
  this.m_bFixed = false;
  this.m_bCollided = false;
}
E_Particle.prototype = Object.create(THREE.Mesh.prototype);

E_Particle.prototype.ApplyForce = function(force)
{
  //a = f/m;

  if(this == this.Manager.m_selectedMesh) return;
  //this.acceleration.add(force.divideScalar(this.mass));
  this.acceleration.add(force.divideScalar(this.mass) );
}

E_Particle.prototype.ApplyImpulse = function(force)
{
  //a = f/m;
  if(this == this.Manager.m_selectedMesh) return;
  //this.acceleration.add(force.divideScalar(this.mass));
  var acc = new THREE.Vector3(0, 0, 0);
  acc.add(force.divideScalar(this.mass));
  this.velocity.add(acc.clone().multiplyScalar(1));
}


E_Particle.prototype.Update = function()
{
  if(!this.visible) {
    this.Manager.particleList().remove(this);
    this.Manager.GetScene().remove(this);
    return;
  }

  if(this.m_bFixed) {
    this.material.color = new THREE.Color(0.2, 0.2, 0.2);
    return;
  }

  var timeStep = this.Manager.timeStep;

  //Set Velocity and Update Position
  this.velocity.add(this.acceleration.clone().multiplyScalar(timeStep));
  this.position.add(this.velocity.clone().multiplyScalar(timeStep) );

  //***FOR FUN***
  if(!this.m_colorFixed){
    var velcol = new THREE.Vector3(1.0).sub(this.velocity.clone()).normalize();
    //if(velcol.length < 1.0) velcol.normalize();
    this.material.color = new THREE.Color(velcol.x, velcol.y, velcol.z);
  }

  //Set Initial Acceleration
  this.acceleration = new THREE.Vector3(0, 0, 0);
  var gravity = this.Manager.GetGravity();
  if(gravity.length() > 0){
    this.ApplyForce(gravity.multiplyScalar(this.mass ));
  }

  this.m_bCollided = false;


  //Remove Particle When
  if(new Date() - this.startTime > this.lifeSpan || this.position.y < -10){
    this.Manager.GetScene().remove(this);
    this.Manager.ParticleSystem().remove(this);
  }
}



E_Particle.prototype.GetPosition = function()
{
  return this.position;
}

E_Particle.prototype.GetNextPosition = function()
{
  var tempVel = this.velocity.clone();
  tempVel.add( this.acceleration.clone().multiplyScalar(this.Manager.timeStep) );
  return this.position.clone().add(tempVel.clone().multiplyScalar(this.Manager.timeStep));
}

module.exports = E_Particle;

},{}],6:[function(require,module,exports){
var E_Particle = require("./E_Particle.js");
var E_FinitePlane = require("./E_FinitePlane.js");

function E_ParticleSystem(Mgr)
{
  this.Manager = Mgr;

  this.particleList = [];
  this.planeList = [];
}

E_ParticleSystem.prototype.add = function( object )
{
  if(object instanceof E_Particle){
    this.particleList.push(object);
    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }
  else if(object instanceof E_FinitePlane){
    this.planeList.push(object);
  }else{
    return;
  }
}

E_ParticleSystem.prototype.remove = function( object )
{


  if(object instanceof E_Particle){
    var idx = this.particleList.indexOf(object);
    this.particleList.splice(idx, 1);
    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }else if(object instanceof E_FinitePlane){
    var idx = this.planeList.indexOf(object);
    this.planeList.splice(idx, 1);
  }
}


E_ParticleSystem.prototype.Update = function()
{

  for(var a = 0 ; a < 3 ; a++){
    for(var i = 0  ; i < this.particleList.length ; i++){
      if(a == 0){
        for(var j in this.planeList){
          this.PlaneCollisionDetection(this.particleList[i], this.planeList[j]);
        }
      }

      for(var k = i+1 ; k < this.particleList.length ; k++){
        this.ParticleCollisionDetection(this.particleList[i], this.particleList[k]);
      }
    }
  }

  for(var i=0 ; i<this.particleList.length ; i++){
    this.particleList[i].Update();
  }
}

E_ParticleSystem.prototype.PlaneCollisionDetection = function(object, plane)
{

  // if(!colPoint){
  //   //Intersection with next position - in case of fast movement of the particl
  var colPoint = this.IsPlaneObjectCollisionOccured(plane, object, true );
  if(!colPoint){
    var colPoint = this.IsPlaneObjectCollisionOccured(plane, object, false);
  }

  if(!colPoint){
    return
  }else{
    this.OnCollision(object, plane, colPoint);
  }

}

E_ParticleSystem.prototype.IsPlaneObjectCollisionOccured = function(plane, object, nextPosition)
{
  if(!plane instanceof E_FinitePlane || !object instanceof E_Particle){
    console.error("not proper type");
    return;
  }

  var p = plane.geometry.vertices[0];
  var q = plane.geometry.vertices[1];
  var r = plane.geometry.vertices[2];

  var n = plane.GetNormal();
  var chk = n.clone().dot(object.velocity.clone().normalize());
  if(chk < 0) n.multiplyScalar(-1);

  var nP, curP;


  if(nextPosition){
    nP = object.GetNextPosition().clone().add( n.clone().multiplyScalar(object.radius) ) ;
    curP = object.GetPosition().clone().add( n.clone().multiplyScalar(object.radius) ) ;
  }else{
    curP = object.GetPosition();
    nP = curP.clone().add( n.clone().multiplyScalar(object.radius) ) ;
  }

  var u = q.clone().sub(p);
  var v = r.clone().sub(p);

  var a = curP.clone().sub(nP);
  var b = curP.clone().sub(p);

  var Const = 1 / (u.clone().cross(v.clone()).dot(a));

  var s = Const * (a.clone().cross(b.clone()).dot(v));
  var t = Const * -1 * (a.clone().cross(b.clone()).dot(u));
  var l = Const * (u.clone().cross(v.clone()).dot(b));


  if(s >= 0 && t >= 0  && l >= 0 && l <= 1 && s+t <= 1) { //if collision occured
    // intersected point on the plane

    var v = nP.clone().sub(p);
    var dist = n.clone().dot(v);

    if(dist < 0) dist *= -1;
    else n.multiplyScalar(-1);

    var cP = plane.GetPlaneEquation(s, t);
    var length = nP.clone().sub(cP).length();
    return cP.add(n.clone().multiplyScalar( object.radius ) );
  }
  else return false;
}

E_ParticleSystem.prototype.OnCollision = function(object, plane, colPoint)
{
  //Check if Local Collision Occurs
  var normal = plane.GetNormal();

  var Vn = normal.clone().multiplyScalar(object.velocity.clone().dot(normal));

  var Vt = object.velocity.clone().sub(Vn.clone());
  //console.log(Vn.length());

  var Vnp = Vn.clone().multiplyScalar(-1 * object.elasticity);
  if(Vnp.y < 2){
    Vnp.y = 0.0;
  }
  var V = Vnp.clone().add(Vt);

  object.position.set(colPoint.x, colPoint.y, colPoint.z);
  object.velocity.set(V.x, V.y, V.z);

  //plane.material.color = object.material.color;
}

E_ParticleSystem.prototype.ParticleCollisionDetection = function(objectA, objectB)
{
  if(!objectA instanceof E_Particle || !objectB instanceof E_Particle ) return;

  var posA = objectA.GetNextPosition();
  var posB = objectB.GetNextPosition();

  //penetration
  var z = posB.clone().sub(posA).length() - (objectA.radius + objectB.radius);
  //If Collision
  if(z < 0){
    var n = posB.clone().sub(posA).multiplyScalar( posB.clone().sub(posA).length() );

    // var VaN = n.clone().multiplyScalar(objectA.velocity.clone().dot(n));
    // var VaT = objectA.velocity.clone().sub(VaN);
    // //Va = VaN + VaT
    //
    // var VbN = n.clone().multiplyScalar(objectB.velocity.clone().dot(n));
    // var VbT = objectB.velocity.clone().sub(VbN);
    //this.Manager.SetLog( Math.abs(z) * 1000 / (objectA.radius + objectB.radius) );
    var Uminus = (objectB.velocity.clone().sub(objectA.velocity).dot(n) );
    var e = Math.abs(z) * 300 / (objectA.radius + objectB.radius);

    var j = (1+e)*(objectA.mass*objectB.mass / (objectA.mass+objectB.mass) )
    var E = n.clone().multiplyScalar(j);

    var velA = objectA.velocity.clone();
    var velB = objectB.velocity.clone();

    velA.sub(n.clone().multiplyScalar(j/objectA.mass));
    velB.add(n.clone().multiplyScalar(j/objectB.mass));

    objectA.velocity.set(velA.x, velA.y, velA.z);
    objectB.velocity.set(velB.x, velB.y, velB.z);


    //objectB.ApplyImpulse(E)
    //objectA.ApplyImpulse(E.multiplyScalar(-1));

    objectB.m_bCollided = true;
  }
}



module.exports = E_ParticleSystem;

},{"./E_FinitePlane.js":4,"./E_Particle.js":5}]},{},[2]);
