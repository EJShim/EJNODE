(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function E_Interactor(Mgr)
{
  this.Manager = Mgr;

  this.m_bDown = false;
  this.m_bRDown = false;
  this.m_bObjectSelected = false;

  this.m_keyCode = -1;

  this.prevPosition = new THREE.Vector2(0, 0);
}

E_Interactor.prototype.onMouseDown = function(event)
{
  this.m_bDown = true;

  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  //Check if Object is Selected;
  this.m_bObjectSelected = this.Manager.SelectObject(mouseX, mouseY);

  //Store Position;
  this.prevPosition.x = mouseX;
  this.prevPosition.y = mouseY;
}

E_Interactor.prototype.onMouseUp = function(event)
{
  if(this.m_bDown){
    if(this.m_bObjectSelected){
      this.Manager.OnReleaseMouse();
      this.m_bObjectSelected = false;
    }
  }
  this.m_bDown = false;
  this.m_bRDown = false;
}

E_Interactor.prototype.onMouseRDown = function(event)
{
  this.m_bRDown = true;
  this.m_bDown = false;

  event.preventDefault();
}

E_Interactor.prototype.onMouseRUp = function(event)
{

}

E_Interactor.prototype.onMouseMove = function(event)
{
  if(!this.m_bDown && !this.m_bRDown) return;

  //Get Current position
  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  var currentPosition = new THREE.Vector2(mouseX, mouseY);
  var delta = currentPosition.clone().sub(this.prevPosition.clone());

  if(this.m_bDown && this.m_bObjectSelected)
  {
    this.Manager.OnMoveObject(mouseX, mouseY);
  }else if(this.m_bRDown){
    //Mouse R Move Event
    var camera = this.Manager.GetCamera();

    var xComp = new THREE.Vector2(delta.x, 0);
    var yComp = new THREE.Vector2(0, delta.y);
    var theta = xComp.clone().add(yComp).length();

    var xEul = new THREE.Vector3(0, -delta.x, 0);
    var yEul = new THREE.Vector3(delta.y, 0, 0);
    var axis = xEul.clone().add(yEul).normalize();

    var mat = camera.matrix.clone()
    mat.multiply(new THREE.Matrix4().makeRotationAxis(axis , theta));
    camera.rotation.setFromRotationMatrix(mat);
    //this.Manager.Redraw();
  }

  this.prevPosition = currentPosition;
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
  var mat = camera.matrix.clone();

  var factor = 0.1;

  switch (this.m_keyCode) {
    case -1:
      return;
    break;
    case 86:
    //this.Manager.frand(-2.0, 2.0), this.Manager.frand(2.0, 3.0), this.Manager.frand(-2.0, 2.0)
      this.Manager.GenerateObject(0, 5, 0);
    break;
    case 67: // c
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, factor));
      camera.position.setFromMatrixPosition(mat);
    break;
    case 32: // Space key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, 0, -factor));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 87: // W Key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, factor, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 83: // S key
      mat.multiply(new THREE.Matrix4().makeTranslation(0, -factor, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 65: // A key
      mat.multiply(new THREE.Matrix4().makeTranslation(-factor, 0, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 68: // D Key
      mat.multiply(new THREE.Matrix4().makeTranslation(factor, 0, 0));
      camera.position.setFromMatrixPosition(mat);

    break;
    case 81: // Q
      mat.multiply(new THREE.Matrix4().makeRotationZ(factor / 10));
      camera.rotation.setFromRotationMatrix(mat);


    break;
    case 69: // E Key
      mat.multiply(new THREE.Matrix4().makeRotationZ(-factor / 10));
      camera.rotation.setFromRotationMatrix(mat);

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

$("#viewport").contextmenu(function(event){
  Manager.GetInteractor().onMouseRDown(event);
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
var E_SpringDamper = require('../libs/physics/E_SpringDamper.js');
var E_ParticleSystem = require("../libs/physics/E_ParticleSystem.js");

function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true, alpha:true});


  var m_interactor = new E_Interactor(this);
  var m_particleSystem = new E_ParticleSystem(this);

  var m_gravity = new THREE.Vector3(0.0, 0.0, 0.0);

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

  pointLight.position.set(10, 15, 5);
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
  var prevMesh = null;
  for(var i=0 ; i<10 ; i++){
    var newMesh = new E_Particle(this, 0.45);
    newMesh.mass = 1;
    newMesh.lifeSpan = 18000000000000;
    newMesh.castShadow = true;
    newMesh.position.set(this.frand(-0.1, 0.1), i-4 , this.frand(-0.1, 0.1));
    newMesh.material.color = new THREE.Color(0.1, 0.1, 0.4);
    newMesh.m_colorFixed = true;

    if( i!= 9)
    {
      system.add(newMesh);
    }
    scene.add(newMesh);

    if(prevMesh != null){
      var spring = new E_SpringDamper(this);
      spring.castShadow = true;
      spring.AddMesh(prevMesh);
      spring.AddMesh(newMesh);

      scene.add(spring);
      system.add(spring);
    }
    prevMesh = newMesh;

    if(i == 9) prevMesh = null;
  }

  prevMesh = null;

  for(var i=0 ; i<10 ; i++){
    var newMesh = new E_Particle(this, 0.45);
    newMesh.mass = 1;
    newMesh.lifeSpan = 18000000000000;
    newMesh.castShadow = true;
    newMesh.position.set(this.frand(-0.1, 0.1), i-4 , this.frand(-0.1, 0.1)-3);
    newMesh.material.color = new THREE.Color(0.1, 0.4, 0.1);
    newMesh.m_colorFixed = true;

    if( i!= 9)
    {
      system.add(newMesh);
    }
    scene.add(newMesh);

    if(prevMesh != null){
      var spring = new E_SpringDamper(this);
      spring.castShadow = true;
      spring.AddMesh(prevMesh);
      spring.AddMesh(newMesh);

      scene.add(spring);
      system.add(spring);
    }
    prevMesh = newMesh;
  }



}

E_Manager.prototype.GenerateRandomTriangle = function()
{
  var scene = this.GetScene();
  var system = this.ParticleSystem();

  var scaleFactor = 8;
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
      // else if(intersects[i].object instanceof E_Fabric){
      //   var faceIdx = intersects[i].face.a;
      //   this.m_prevTime = new Date();
      //   this.m_selectedMesh = intersects[i].object.particles[faceIdx];
      //   this.m_selectedMesh.velocity.set(0, 0, 0);
      //   this.m_prevPosition = intersects[i].object.particles[faceIdx].position.clone();
      //   return true;
      // }
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

},{"../libs/physics/E_FinitePlane.js":4,"../libs/physics/E_Particle.js":5,"../libs/physics/E_ParticleSystem.js":7,"../libs/physics/E_SpringDamper.js":8,"./E_Interactor.js":1}],4:[function(require,module,exports){
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
  this.material = new THREE.MeshPhongMaterial({color: 0xffff00, shininess:80});


  this.Manager = Mgr;


  //Dynamics
  this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.mass = radius * 10;

  this.elasticity = 0.1;

  //Informations
  this.lifeSpan = 30000000000000;
  this.startTime = new Date();

  //For Hair Simulation
  this.connectedObject = [];

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
  this.velocity.add(acc);
}

E_Particle.prototype.HairSimulation2 = function()
{
  var pN = this.connectedObject[0].position.clone();
  var cN = this.position.clone();
  var nN = this.connectedObject[1].position.clone();

  var cosTheta = pN.clone().sub(cN).normalize().dot( nN.clone().sub(cN).normalize() );
  var theta = Math.acos(cosTheta);
  var sinTheta = Math.sin(theta);

  //avoid Singularity
  if(sinTheta == 0) sineTheta = 0.01;

  var ThetaD = ( (pN.clone().sub(cN).normalize().multiplyScalar(cosTheta)).sub( nN.clone().sub( pN ).normalize() ) ).multiplyScalar(1/( sinTheta * ( pN.clone().sub(cN).length())));
  var force = ThetaD.multiplyScalar(-1)
  this.ApplyForce( force )
}

E_Particle.prototype.HairSimulation = function()
{
  var prevIdx = this.connectedObject[0].connectedObject.indexOf(this);
  var nextIdx = this.connectedObject[1].connectedObject.indexOf(this);

  var ppN = this.connectedObject[0].connectedObject[ !prevIdx^0 ].position.clone();
  var pN = this.connectedObject[0].position.clone();
  var cN = this.position.clone();
  var nN = this.connectedObject[1].position.clone();
  var nnN = this.connectedObject[1].connectedObject[ !nextIdx^0 ].position.clone();


  var Tc = this.GetTangent(pN, cN, nN);


  var TpP = this.GetTangentPrime(ppN, pN, cN);
  var TcP = this.GetTangentPrime(pN, cN, nN);
  var TnP = this.GetTangentPrime(cN, nN, nnN);


  var TSecondPrime = TcP.clone().sub(TpP).divideScalar( nN.clone().add(cN).sub(pN).sub(ppN).length() ).add( TnP.clone().sub(TcP).divideScalar( nnN.clone().add(nN).sub(cN).sub(pN) )).multiplyScalar(2);

  //Curvature
  var K = TcP.clone().length();
  //Torsion
  var Tor = Tc.clone().dot( TcP.clone().cross( TSecondPrime ) ) / Math.pow(K, 2);


}

E_Particle.prototype.GetTangent = function(prevNode, currentNode, nextNode)
{
  return nextNode.clone().sub(prevNode).divideScalar(nextNode.clone().sub(currentNode).length() + currentNode.clone().sub(prevNode).length() );
}

E_Particle.prototype.GetTangentPrime = function(Xp, Xc, Xn)
{
  return ( Xn.clone().sub(Xc).normalize().sub( Xc.clone().sub(Xp).normalize() )  ).multiplyScalar(2/( Xn.clone().sub(Xp).length() ));
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


  //Hair Simulation
  // if(this.connectedObject.length == 2){
  //   this.HairSimulation2();
  // }


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
function E_ParticleSource(Mgr){

  //Set Small Radius
  this.radius = 0.1;

  this.Manager = Mgr;

  //Dynamics
  this.position = new THREE.Vector3(0.0, 0.0, 0.0);
  this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.mass = this.radius * 10;

  this.elasticity = 0.1;

  //Informations
  this.lifeSpan = 30000000000000;
  this.startTime = new Date();

  //Position Fix
  this.m_colorFixed = false;
  this.m_bFixed = false;
  this.m_bCollided = false;
}

E_ParticleSource.prototype.ApplyForce = function(force)
{
  //a = f/m;

  if(this == this.Manager.m_selectedMesh) return;
  //this.acceleration.add(force.divideScalar(this.mass));
  this.acceleration.add(force.divideScalar(this.mass) );
}

E_ParticleSource.prototype.ApplyImpulse = function(force)
{
  //a = f/m;
  if(this == this.Manager.m_selectedMesh) return;
  //this.acceleration.add(force.divideScalar(this.mass));
  var acc = new THREE.Vector3(0, 0, 0);
  acc.add(force.divideScalar(this.mass));
  this.velocity.add(acc);
}


E_ParticleSource.prototype.Update = function()
{
  var timeStep = this.Manager.timeStep;

  //Set Velocity and Update Position
  this.velocity.add(this.acceleration.clone().multiplyScalar(timeStep));
  this.position.add(this.velocity.clone().multiplyScalar(timeStep) );


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



E_ParticleSource.prototype.GetPosition = function()
{
  return this.position;
}

E_ParticleSource.prototype.GetNextPosition = function()
{
  var tempVel = this.velocity.clone();
  tempVel.add( this.acceleration.clone().multiplyScalar(this.Manager.timeStep) );
  return this.position.clone().add(tempVel.clone().multiplyScalar(this.Manager.timeStep));
}

module.exports = E_ParticleSource;

},{}],7:[function(require,module,exports){
var E_Particle = require("./E_Particle.js");
var E_ParticleSource = require("./E_ParticleSource");
var E_FinitePlane = require("./E_FinitePlane.js");
var E_SpringDamper = require("./E_SpringDamper.js");

function E_ParticleSystem(Mgr)
{
  this.Manager = Mgr;

  this.particleList = [];
  this.SAPList = [[], [], []];
  this.collisionMap = [];

  this.planeList = [];
  this.springList = [];
}

E_ParticleSystem.prototype.add = function( object )
{
  if(object instanceof E_Particle || object instanceof E_ParticleSource){
    this.particleList.push(object);

    for(var i in this.SAPList){
      this.SAPList[i].push(this.particleList.length);
      this.SAPList[i].push(-this.particleList.length);
    }

    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }
  else if(object instanceof E_FinitePlane){
    this.planeList.push(object);
  }else if(object instanceof E_SpringDamper){
    this.springList.push(object);
  }else{
    return;
  }
}


E_ParticleSystem.prototype.remove = function( object )
{
  if(object instanceof E_Particle || object instanceof E_ParticleSource){
    var idx = this.particleList.indexOf(object);
    this.particleList.splice(idx, 1);

    for(var i in this.SAPList){
      var sapidx = this.SAPList[i].indexOf(idx+1);
      var sapidx2 = this.SAPList[i].indexOf(-idx-1);


      this.SAPList[i].splice(sapidx, 1);
      this.SAPList[i].splice(sapidx2, 1);

      for(var j in this.SAPList[i]){
        if(this.SAPList[i][j] > 0 && this.SAPList[i][j] > idx+1){
          this.SAPList[i][j] -= 1;
        }else if(this.SAPList[i][j] < 0 && this.SAPList[i][j] < -idx-1){
          this.SAPList[i][j] += 1;
        }
      }
    }
    this.Manager.SetLog("Number of Particles : " + this.particleList.length);
  }else if(object instanceof E_FinitePlane){
    var idx = this.planeList.indexOf(object);
    this.planeList.splice(idx, 1);
  }else if(object instanceof E_SpringDamper){
    var idx = this.springList.indexOf(object);
    this.springList.splice(idx, 1);
  }
}

E_ParticleSystem.prototype.UpdateCollisionMap = function()
{
  var length = this.particleList.length;

  for(var i=0 ; i<length ; i++){
    this.collisionMap.push(new Array());
    for(var j=0 ; j<length ; j++){
      this.collisionMap[i].push(0);
    }
  }

}

E_ParticleSystem.prototype.GetSign = function(num){
  if(num >= 0) return 1;
  else return -1;
}

E_ParticleSystem.prototype.InsertionSort = function()
{
  var list = this.SAPList[0];
  var length = this.particleList.length * 2;

  for(var i=1 ; i<length ; i++){
    var temp = list[i];


    var t = this.particleList[ Math.abs(list[i])-1 ].position.x + this.GetSign(list[i]) * this.particleList[ Math.abs(list[i])-1 ].radius;
    var j = i-1;

    while(j>=0 && this.particleList[ Math.abs(list[j])-1 ].position.x + this.GetSign(list[j]) * this.particleList[ Math.abs(list[j])-1 ].radius > t){
      list[j+1] = list[j];
      j--;
    }

    list[j+1] = temp;
  }


  //Y axiss
  list = this.SAPList[1];

  for(var i=1 ; i<length ; i++){
    var temp = list[i];

    var t = this.particleList[ Math.abs(list[i])-1 ].position.y + this.GetSign(list[i]) * this.particleList[ Math.abs(list[i])-1 ].radius;
    var j = i-1;

    while(j>=0 && this.particleList[ Math.abs(list[j])-1 ].position.y + this.GetSign(list[j]) * this.particleList[ Math.abs(list[j])-1 ].radius > t){
      list[j+1] = list[j];
      j--;
    }

    list[j+1] = temp;
  }

  //Z axis
  list = this.SAPList[2];

  for(var i=1 ; i<length ; i++){
    var temp = list[i];

    var t = this.particleList[ Math.abs(list[i])-1 ].position.z + this.GetSign(list[i]) * this.particleList[ Math.abs(list[i])-1 ].radius;
    var j = i-1;

    while(j>=0 && this.particleList[ Math.abs(list[j])-1 ].position.z + this.GetSign(list[j]) * this.particleList[ Math.abs(list[j])-1 ].radius > t){
      list[j+1] = list[j];
      j--;
    }

    list[j+1] = temp;
  }
}

E_ParticleSystem.prototype.SAPCollision = function()
{
  //Sweep And Prune Algorithm
  for(var k=0 ; k<2 ; k++){
    var list = this.SAPList[k];
    var activeList = [];

    for(var i in list){
      if(list[i] < 0){
        //Store Particle Index
        var particleIdx = Math.abs(list[i])-1;
        activeList.push(  particleIdx  );
      }else{
        if(activeList.length > 2){
          for(var j=1 ; j<activeList.length-1 ; j++){
            //if(this.collisionMap[ activeList[0] ][ activeList[j] ] == k){
              //if(k == 2){
                this.ParticleCollisionDetection( this.particleList[ activeList[ 0 ] ], this.particleList[ activeList[ j ] ]);
              //}else{
              //  this.collisionMap[ activeList[0] ][activeList[j]]++;
              //}
            //}
          }
        }
        activeList.shift();
      }
    }
  }


}

E_ParticleSystem.prototype.Update = function()
{
  if(this.particleList.length < 1) return;
  this.InsertionSort();
  this.UpdateCollisionMap();
  this.SAPCollision();

  for(var i = 0  ; i < this.particleList.length ; i++){

      //Update Plane Collision
      for(var j in this.planeList){
        this.PlaneCollisionDetection(this.particleList[i], this.planeList[j]);
      }


    // for(var k = i+1 ; k < this.particleList.length ; k++){
    //   this.ParticleCollisionDetection(this.particleList[i], this.particleList[k]);
    // }
  }


  for(var i=0 ; i<this.particleList.length ; i++){
    this.particleList[i].Update();
  }

  for(var i=0 ; i<this.springList.length ; i++){
    this.springList[i].Update();
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
  if(!plane instanceof E_FinitePlane || !object instanceof E_Particle || object instanceof E_ParticleSource){
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
  if(!objectA instanceof E_Particle || !objectB instanceof E_Particle || !objectA instanceof E_ParticleSource || !objectB instanceof E_ParticleSource ) return;

  var posA = objectA.GetNextPosition();
  var posB = objectB.GetNextPosition();

  //penetration
  var z = posB.clone().sub(posA).length() - (objectA.radius + objectB.radius);
  //If Collision
  if(z < 0){
    //Normal
    var n = posB.clone().sub(posA).normalize();
    var curVel = (objectB.velocity.clone().sub(objectA.velocity).dot(n) );


    //Elasticity
    var avgElasticity = (objectA.elasticity + objectB.elasticity) / 2;
    var e = avgElasticity;


    //use Z* 20 instead of curVel;

    //J-Impulse, E-force
    var j = (1+e)*(objectA.mass*objectB.mass) * z * 60/ (objectA.mass+objectB.mass);
    var E = n.clone().multiplyScalar( j );



    //Apply Impulse
    objectA.ApplyImpulse(E)
    objectB.ApplyImpulse(E.multiplyScalar(-1));

    objectB.m_bCollided = true;
  }
}



module.exports = E_ParticleSystem;

},{"./E_FinitePlane.js":4,"./E_Particle.js":5,"./E_ParticleSource":6,"./E_SpringDamper.js":8}],8:[function(require,module,exports){
function E_SpringDamper(Mgr)
{
  THREE.Line.call(this);

  this.Manager = Mgr;
  this.geometry = new THREE.Geometry();
  this.geometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
  this.material = new THREE.LineBasicMaterial({color:0xaaaa00, linewidth:10});

  this.objects = [];
  this.cValue = 5;
  this.equilibriumLength = 1;
  this.kValue = 50;

  //TEMP

}

E_SpringDamper.prototype = Object.create(THREE.Line.prototype);

E_SpringDamper.prototype.AddMesh = function(mesh)
{
  if(this.objects.length > 1){
    console.log("cannot add more than 2 objects");
    return;
  }
  this.objects.push(mesh);

  //Add Mesh a Spring Damper
  if(this.objects.length == 2){
    this.objects[0].connectedObject.push(this.objects[1]);
    this.objects[1].connectedObject.push(this.objects[0]);

    var length = this.objects[0].position.clone().sub(this.objects[1].position).length();
    //this.equilibriumLength = length;
  }

  if(this.objects.length >= 2){
    this.geometry.verticesNeedUpdate = true;
    this.geometry.vertices[0] = this.objects[0].position.clone();
    this.geometry.vertices[1] = this.objects[1].position.clone();
  }
}

E_SpringDamper.prototype.Update = function()
{
  //Calculate The amount of Stretc
  if(this.objects[0].parent == null || this.objects[1].parent == null){
    if(this.objects[0].parent == null){
      var idx = this.objects[1].connectedObject.indexOf(this.objects[0]);
      this.objects[1].connectedObject.splice(idx, 1);
    }else{
      var idx = this.objects[0].connectedObject.indexOf(this.objects[1]);
      this.objects[0].connectedObject.splice(idx, 1);
    }

    this.Manager.ParticleSystem().remove(this);
    this.Manager.GetScene().remove(this);
  }

  //Update Line Shape
  this.geometry.verticesNeedUpdate = true;
  this.geometry.vertices[0] = this.objects[0].position.clone();
  this.geometry.vertices[1] = this.objects[1].position.clone();


  //Calculate Force for both objects - Spring Force
  var pbpa = this.objects[1].position.clone().sub( this.objects[0].position.clone());
  var lpbpa = pbpa.length();

  var magnitudeSpring = this.kValue * ( lpbpa - this.equilibriumLength );
  var Fsa = pbpa.multiplyScalar( magnitudeSpring / lpbpa );

  //Damper Force
  var d = this.objects[1].position.clone().sub( this.objects[0].position.clone()).normalize();
  var vda = this.objects[0].velocity.clone().dot(d.clone());
  var vdb = this.objects[1].velocity.clone().dot(d.clone());
  //var Fa = d.clone().multiplyScalar(this.objects[0].velocity.length() * this.cValue).add(Fsa);

  var Fa = d.clone().multiplyScalar(this.cValue * (vdb - vda)).add(Fsa);
  var Fb = Fa.clone().multiplyScalar(-1);


  this.objects[0].ApplyForce(Fa);
  this.objects[1].ApplyForce(Fb);

  //**** FOR FUN
  var obj1Color = this.objects[0].material.color;
  var obj2Color = this.objects[1].material.color;


  //this.UpdateImplicit();
  //this.material.color = new THREE.Color(1 - obj1Color.r - obj2Color.r, 1 - obj1Color.g - obj2Color.g, 1 - obj1Color.b - obj2Color.b);
}

E_SpringDamper.prototype.UpdateImplicit = function()
{
  if(this.objects.length != 2) return;

  //Update Line Shape
  this.geometry.verticesNeedUpdate = true;
  this.geometry.vertices[0] = this.objects[0].position.clone();
  this.geometry.vertices[1] = this.objects[1].position.clone();

  //Calcualte Force using Implicit Metho
  var Xi = [this.objects[0].position.x, this.objects[0].position.y, this.objects[0].position.z];
  var Xj = [this.objects[1].position.x, this.objects[1].position.y, this.objects[1].position.z];

  var XJmXI = this.objects[1].position.clone().sub(this.objects[0].position);
  var VJmVI = this.objects[1].velocity.clone().sub(this.objects[0].velocity);

  var XJmXIarr = [XJmXI.x,XJmXI.y,XJmXI.z];
  var VJmVIarr = [VJmVI.x,VJmVI.y,VJmVI.z];


  var I = math.eye(3);

  var xjxiT = math.zeros(3, 3);
  for(var i=0 ; i<3 ; i++){
    for(var j=0 ; j<3 ; j++){
      xjxiT._data[i][j] = XJmXIarr[i] * XJmXIarr[j];
    }
  }

  var length = this.objects[1].position.clone().sub(this.objects[0].position).length();
  var length = 1;
  //뒷부분
  var bElement = math.subtract(I, this.MultiplyScalar(xjxiT, 2/math.pow(length, 2) ));
  var SpringForce = this.MultiplyScalar(math.add( this.MultiplyScalar(bElement, this.equilibriumLength / length) , this.MultiplyScalar(I, -1.0) ), this.kValue);

  var xvT = math.zeros(3, 3);
  for(var i=0 ; i<3 ; i++){
    for(var j=0 ; j<3 ; j++){
      xvT._data[i][j] = XJmXIarr[i] * VJmVIarr[j];
    }
  }
  var con = this.objects[1].position.clone().sub(this.objects[0].position).dot( this.objects[1].velocity.clone().sub(this.objects[0].velocity.clone()) );
  var bb = this.MultiplyScalar(bElement, con);

  var DamperForce = this.MultiplyScalar( math.add(xvT, bb), this.cValue / math.pow(length, 2) );

  var FXi = math.subtract(SpringForce, DamperForce);
  var FXj = this.MultiplyScalar(FXi, -1);

  var FVi = this.MultiplyScalar(xjxiT, -this.cValue/math.pow(length,2));
  var FVj = this.MultiplyScalar(FXj, -1);

  var Mi = math.multiply( math.eye(3), this.objects[0].mass );
  var Mj = math.multiply( math.eye(3), this.objects[1].mass );

  var DaDxi = math.multiply( Mi, FXi );
  var DaDxj = math.multiply( Mj, FXj );

  var DaDvi = math.multiply( Mi, FVi );
  var DaDvj = math.multiply( Mj, FVj );

  console.log(DaDvi);

  //console.log(haha);

}

E_SpringDamper.prototype.MultiplyScalar = function(mat, scalar)
{
  var col = mat._size[0];
  var row = mat._size[1];
  var result = math.zeros(col, row);

  for(var i=0 ; i<col ; i++){
    for(var j=0 ; j<row ; j++){
      result._data[i][j] = mat._data[i][j] * scalar;
    }
  }

  return result;
}


module.exports = E_SpringDamper;

},{}]},{},[2]);
