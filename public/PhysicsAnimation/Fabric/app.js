(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function E_Interactor(Mgr)
{
  this.Manager = Mgr;

  this.m_bDown = false;
  this.m_bObjectSelected = false;
  this.m_bRDown = false;

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
  if(this.m_bObjectSelected){
    this.Manager.OnReleaseMouse();
    this.m_bObjectSelected = false;
  }
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
  if(!this.m_bDown || !this.m_bObjectSelected) return;

  //Get Current position
  var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  var currentPosition = new THREE.Vector2(mouseX, mouseY);

  var delta = currentPosition.clone().sub(this.prevPosition.clone());
  this.Manager.OnMoveObject(mouseX, mouseY);

  this.prevPosition = currentPosition;
}

E_Interactor.prototype.onKeyboardDown = function(event)
{
  this.m_keyCode = event.keyCode;
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
    case 87: // W Key
      var nextPosition = camera.position.clone().add(camDir.clone().multiplyScalar(10));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 83: // S key
      var nextPosition = camera.position.clone().sub(camDir.clone().multiplyScalar(10));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 65: // A key
      var nextPosition = camera.position.clone().add(sideDir.multiplyScalar(10));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    case 68: // D Key
      var nextPosition = camera.position.clone().sub(sideDir.multiplyScalar(10));
      camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    break;
    default:
    break;
  }
}


module.exports = E_Interactor;

},{}],2:[function(require,module,exports){
var E_Fabric = require('../libs/physics/E_Fabric.js');
var E_Particle = require('../libs/physics/E_Particle.js');
var E_Interactor = require('./E_Interactor.js');

function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true});
  var m_interactor = new E_Interactor(this);

  var m_gravity = new THREE.Vector3(0.0, -980, 0.0);

  this.m_shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: $('#shader-vertex').text(),
    fragmentShader: $('#shader-fragment').text()
  });


  this.m_selectedMesh;
  this.m_prevTime = 0;
  this.m_prevPosition = new THREE.Vector3(0, 0, 0);

  this.starttime = new Date();
  this.light = new THREE.PointLight(0xffffff, 1, 1000000);
  this.light.position.set(0, 500, 0);
  this.thumbnailSaved = false;

  this.then = new Date();
  this.interval = 1000 / 30;

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
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  //init renderrer
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight );

  //Initialize Object
  this.InitObject();
}

E_Manager.prototype.Animate = function()
{
  var cTime = new Date();
  var elapsedTime = (cTime-this.starttime)/1000;
  if(Math.abs(elapsedTime) > 10 && !this.thumbnailSaved) {
    this.SaveThumbnail();
    this.thumbnailSaved = true;
  }

  var Mgr = this;

  var now = new Date();
  this.delta = (now - this.then);

  if(this.delta > this.interval){
    var renderer = this.GetRenderer();
    var camera = this.GetCamera();
    var scene = this.GetScene();

    renderer.render(scene, camera);

    //Update Interactor
    var interactor = this.GetInteractor();
    interactor.Update();

    //Update Objects in Scene
    var count = 0;
    scene.traverse (function (object)
    {
      if (object instanceof E_Fabric)
      {
          object.Update();
      }
    });

    this.light.position.set(camera.position.x, camera.position.y, camera.position.z);
  }



  requestAnimationFrame(Mgr.Animate.bind(Mgr));
}

E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var camera = this.GetCamera();

  camera.position.z = 1000;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var ambient = new THREE.AmbientLight(0x000000);

  scene.add(this.light);
  scene.add(ambient);

  var fab = new E_Fabric(this);
  fab.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-500, 200, 0));
  //fab.material = this.m_shaderMaterial;
  fab.AddToRenderer(scene);


  var fab2 = new E_Fabric(this);
  fab2.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(500, 200, 0));
  fab2.material.color = new THREE.Color(0, 0, 0.4);
  //fab.material = this.m_shaderMaterial;
  fab2.AddToRenderer(scene);



  var scale = 120;
  for(var i=0 ; i<scale ; i++){
    fab.FixPoint(i/scale, 0);

    fab2.FixPoint(i/scale, 0);
    //fab2.FixPoint(i/scale, 1);
  }

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
      }else if(intersects[i].object instanceof E_Fabric){
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
  var distance = 1000;
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

E_Manager.prototype.SaveThumbnail = function()
{
  if(this.thumbnailSaved) return;
	//var testCanvas = m_renderer.domElement.toDataURL();
	var canvasData = this.GetRenderer().domElement.toDataURL();
	var postData = "canvasData="+canvasData;
	//var debugConsole= document.getElementById("debugConsole");
	//debugConsole.value=canvasData;

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
      //console.log(ajax.responseText);

		}
	}
	ajax.send(postData);
}


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

//Mobile
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

},{"../libs/physics/E_Fabric.js":3,"../libs/physics/E_Particle.js":4,"./E_Interactor.js":1}],3:[function(require,module,exports){
var E_SpringDamperSource = require('./E_SpringDamperSource.js');
var E_ParticleSource = require('./E_ParticleSource.js');

function E_Fabric(Mgr)
{
  THREE.Mesh.call(this);

  this.Manager = Mgr;

  this.width = 800;
  this.height = 200;
  this.xSeg = 120;
  this.ySeg = 10;

  this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.xSeg, this.ySeg);
  this.material = new THREE.MeshPhongMaterial({color:0xaa0000});

  this.particles = [];
  this.springs = [];

  this.material.side = 2;
}

E_Fabric.prototype = Object.create(THREE.Mesh.prototype);

E_Fabric.prototype.SetGeometry = function(x, y, xSeg, ySeg)
{
  this.width = x;
  this.height = y;
  this.xSeg = xSeg;
  this.ySeg = ySeg;
  this.geometry = new THREE.PlaneGeometry(x, y, xSeg, ySeg);
}

E_Fabric.prototype.AddToRenderer = function(scene)
{
  //this.material.morphTargets = true;
  scene.add(this);
  //this.visible = false;
  for(var i in this.geometry.vertices){

    this.particles[i] = new E_ParticleSource(this.Manager);

    var i0 = i<= this.xSeg;
    var j0 = i % (this.xSeg+1) == 0;


    if(!j0){
      var spring = new E_SpringDamperSource(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-1]);
      this.springs.push(spring);
    }

    if(i0){
      //this.particles[i].m_bFixed = true;
    }else{
      var spring = new E_SpringDamperSource(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-this.xSeg-1]);
      this.springs.push(spring);
    }


    var realPos = this.geometry.vertices[i].clone();
    this.particles[i].m_colorFixed = true;
    this.particles[i].position.set(realPos.x, realPos.y, realPos.z);
    // scene.add(this.particles[i]);
  }
}

E_Fabric.prototype.Update = function()
{

  //Update Spring Damper
  for(var i in this.springs){
    this.springs[i].Update();
  }

  //Update Particles and Geometry
  for(var i in this.geometry.vertices){
    this.particles[i].Update();
    this.geometry.verticesNeedUpdate = true;

    var pos = this.particles[i].position.clone();
    this.geometry.vertices[i].set(pos.x, pos.y, pos.z);
  }

  this.geometry.computeFaceNormals();
   this.geometry.computeVertexNormals();
}

E_Fabric.prototype.GetParticle = function(index)
{
  return this.particles[index];
}

E_Fabric.prototype.FixPoint = function(x,y)
{
  //x, y are normalized point position of the geometry
  var xPos = Math.round((x*this.xSeg) + 1);
  var yPos = Math.round(y*this.ySeg);

  var index = yPos * (this.xSeg+1) + xPos;
  // console.log(index);
  // console.log(this.particles.length);
  //console.log(xPos + "," + yPos);
  //Set Index
  this.particles[index-1].m_bFixed = true;
}

E_Fabric.prototype.SetC = function(c)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].cValue = c;
  }
}

E_Fabric.prototype.SetK = function(k)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].kValue = k;
  }
}

E_Fabric.prototype.SetELength = function(eL)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].equilibriumLength = eL;
  }
}

module.exports = E_Fabric;

},{"./E_ParticleSource.js":5,"./E_SpringDamperSource.js":6}],4:[function(require,module,exports){
function E_Particle(Mgr, radius){
  THREE.Mesh.call(this);

  if(radius == null) radius = 15;
  this.radius = radius;
  this.geometry = new THREE.SphereGeometry(radius, 32, 32);
  this.material = new THREE.MeshPhongMaterial({color: 0xffff00});


  this.Manager = Mgr;
  //Physics
  this.timeStep = 0; //Dt

  //For forward and backward dynamics
  this.prevTime = 0;

  //Dynamics
  this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.mass = 1;

  this.elasticity = 0.7;

  //Informations
  this.startTime = new Date();
  this.elapsedTime = 0;

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
    this.Manager.GetScene().remove(this);
    return;
  }

  if(this.prevTime == 0) this.prevTime = this.startTime;
  var currentTime = new Date();
  this.timeStep = (currentTime - this.prevTime) / 1000;
  if(this.timeStep > this.Manager.interval / 1000) this.timeStep = this.Manager.interval / 1000;
  this.elapsedTime = (currentTime - this.startTime) / 1000;
  if(this.m_bFixed) {
    this.material.color = new THREE.Color(0.2, 0.2, 0.2);
    return;
  }


    //Gravity
    var gravity = this.Manager.GetGravity();
    if(gravity.length() > 0){
      this.ApplyForce(gravity.multiplyScalar(this.mass ));
    }


  //Set Velocity and Update Position
  this.velocity.add(this.acceleration.clone().multiplyScalar(this.timeStep));
  this.position.add(this.velocity.clone().multiplyScalar(this.timeStep) );

  //***FOR FUN***
  if(!this.m_colorFixed){
    var velcol = new THREE.Vector3(1.0).sub(this.velocity.clone()).normalize();
    //if(velcol.length < 1.0) velcol.normalize();
    this.material.color = new THREE.Color(velcol.x, velcol.y, velcol.z);
  }

  //Set Accleration 0 every iteration
  this.prevTime = currentTime;
  this.acceleration = new THREE.Vector3(0, 0, 0);
  this.m_bCollided = false;
}



E_Particle.prototype.GetPosition = function()
{
  return this.position;
}

E_Particle.prototype.GetNextPosition = function()
{
  var tempVel = this.velocity.clone();
  tempVel.add( this.acceleration.clone().multiplyScalar(this.Manager.interval/1000) );
  return this.position.clone().add(tempVel.clone().multiplyScalar(this.Manager.interval/1000));
}

module.exports = E_Particle;

},{}],5:[function(require,module,exports){
function E_ParticleSource(Mgr){


  this.Manager = Mgr;
  //Physics
  this.timeStep = 0; //Dt
  this.position = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.acceleration = new THREE.Vector3();
  this.mass = 1;
  this.elasticity = 0.0;

  //Informations
  this.startTime = new Date();
  this.elapsedTime = 0;
  this.prevTime = 0;

  //Position Fix
  this.m_bFixed = false;
}

E_ParticleSource.prototype.ApplyForce = function(force)
{
  //a = f/m;
  if(this == this.Manager.m_selectedMesh) return;
  this.acceleration.add(force.divideScalar(this.mass));
}


E_ParticleSource.prototype.Update = function()
{
  if(this.prevTime == 0) this.prevTime = this.startTime;
  var currentTime = new Date();
  this.timeStep = (currentTime - this.prevTime) / 1000;
  if(this.timeStep > this.Manager.interval / 1000) this.timeStep = this.Manager.interval / 1000;
  this.elapsedTime = (currentTime - this.startTime) / 1000;
  if(this.m_bFixed) {
    return;
  }

  //Gravity
  var gravity = this.Manager.GetGravity();
  if(gravity.length() > 0){
    this.ApplyForce(gravity.multiplyScalar(this.mass));
  }

  //Set Velocity and Update Position
  this.velocity.add(this.acceleration.clone().multiplyScalar(this.timeStep));
  this.position.add(this.velocity.clone().multiplyScalar(this.timeStep) );
  this.prevTime = currentTime;
  this.acceleration = new THREE.Vector3();
}

E_ParticleSource.prototype.GetPosition = function()
{
  return this.position;
}

E_ParticleSource.prototype.GetNextPosition = function()
{
  return this.position.clone().add(this.velocity.clone().multiplyScalar(this.Manager.interval));
}

E_ParticleSource.prototype.ApplyCollision = function(normal)
{
  var Vn = normal.clone().multiplyScalar(this.velocity.clone().dot(normal));
  var Vt = this.velocity.clone().sub(Vn.clone());
  var Vnp = Vn.clone().multiplyScalar(-1 * this.elasticity);
  var V = Vnp.clone().add(Vt);
  this.velocity.set(V.x, V.y, V.z);
}


module.exports = E_ParticleSource;

},{}],6:[function(require,module,exports){
var E_Particle = require("./E_Particle.js");

function E_SpringDamperSource(Mgr)
{
  this.Manager = Mgr;

  this.objects = [];
  this.cValue = 5;
  this.equilibriumLength = 1;
  this.kValue = 110;
}


E_SpringDamperSource.prototype.AddMesh = function(mesh)
{
  if(this.objects.length > 1){
    console.log("cannot add more than 2 objects");
    return;
  }
  this.objects.push(mesh);
}

E_SpringDamperSource.prototype.Update = function()
{
  //Calculate The amount of Stretc
  if(this.objects.length != 2) return;



  //Calculate Force for both objects - Spring Force
  var pbpa = this.objects[1].position.clone().sub( this.objects[0].position.clone());
  var lpbpa = pbpa.length();

  // if(lpbpa > 15){
  //   for(var i in this.objects){
  //     var obj = this.objects[i];
  //     obj.ApplyForce(obj.acceleration.multiplyScalar(obj.mass * -0.5));
  //   }
  // }
  //Resting Spring Distance
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
  if(this.objects[0] instanceof E_Particle && this.objects[1] instanceof E_Particle){
    var obj1Color = this.objects[0].material.color;
    var obj2Color = this.objects[1].material.color;
  }
  //this.material.color = new THREE.Color(obj1Color.r + obj2Color.r, obj1Color.g + obj2Color.g, obj1Color.b + obj2Color.b);
}

E_SpringDamperSource.prototype.SetC = function(c)
{
  this.cValue = c;
}

E_SpringDamperSource.prototype.setK = function(k)
{
  this.kValue = k;
}

module.exports = E_SpringDamperSource;

},{"./E_Particle.js":4}]},{},[2]);
