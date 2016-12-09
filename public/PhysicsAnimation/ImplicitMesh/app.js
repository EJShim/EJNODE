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

  var factor = 0.5;

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

var E_DeformableMesh = require("../libs/physics/E_DeformableMesh.js");
var E_Particle = require("../libs/physics/E_Particle.js");
var E_ParticleSource = require("../libs/physics/E_ParticleSource.js");
var E_FinitePlane = require("../libs/physics/E_FinitePlane.js");
var E_SpringDamper = require('../libs/physics/E_SpringDamper.js');
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
  this.light = new THREE.SpotLight( 0xffffff, 1, 100 );

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
  this.Animate();
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

  camera.position.x = 70;
  camera.position.y = 20;
  camera.lookAt(new THREE.Vector3(0, -10, 0));

  //Light
  this.light.position.set(50, 20, 5);
  this.light.castShadow = true;
  this.light.angle = Math.PI/4;
  //this.light.target.position.set(0, 0, 0);
  this.light.penumbra = 0.05;
  this.light.decay = 2;
  this.light.distance = 200;
  this.light.shadow.mapSize.width = 1024;
  this.light.shadow.mapSize.height = 1024;
  this.light.shadow.camera.near = 1;
  this.light.shadow.camera.far = 10000;

  var ambient = new THREE.AmbientLight({color:0x000000});

  scene.add(this.light);
  scene.add(ambient);

  this.GenerateRandomTriangle();


  var deformmesh = new E_DeformableMesh( this, new THREE.CylinderGeometry( 5, 5, 10, 12 ));
  deformmesh.MakeTranslation(0, 0, -6);
  deformmesh.material.color = new THREE.Color(0.0, 0.4, 0.1);
  deformmesh.AddToRenderer(scene, system);


  var deformmesh2 = new E_DeformableMesh( this, new THREE.BoxGeometry(8, 8, 8) );
  deformmesh2.AddToRenderer(scene, system);


  var deformmesh3 = new E_DeformableMesh( this, new THREE.ConeGeometry( 5, 10, 12 ) );
  deformmesh3.MakeTranslation(0, 0, 4);
  deformmesh3.material.color = new THREE.Color(0.0, 0.1, 0.4);
  deformmesh3.AddToRenderer(scene, system);


  var deformmesh4 = new E_DeformableMesh( this, new THREE.SphereGeometry( 5, 15, 15 ) );
  deformmesh4.MakeTranslation(0, 0, 8);
  deformmesh4.material.color = new THREE.Color(0.5, 0.1, 0.2);
  deformmesh4.AddToRenderer(scene, system);




  system.CompleteInitialize();
}

E_Manager.prototype.GenerateRandomTriangle = function()
{
  var scene = this.GetScene();
  var system = this.ParticleSystem();

  var scaleFactor = 26;
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





  for(var i=0 ; i<10 ; i++){
    this.groundMesh[i].receiveShadow = true;
    this.groundMesh[i].material.side = THREE.FrontSide;
    this.groundMesh[i].material.color = new THREE.Color(0.2, 0.1, 0.05);


    if(i < 8)
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
      console.log(intersects[i].object);
      if(intersects[i].object instanceof E_Particle){
        this.m_selectedMesh = intersects[i].object;
        this.m_selectedMesh.m_bFixed = true;

        this.m_prevTime = new Date();
        this.m_prevPosition = this.m_selectedMesh.position.clone();
        return true;
      }
      else if(intersects[i].object instanceof E_Fabric2 || intersects[i].object instanceof E_DeformableMesh){
        var faceIdx = intersects[i].face.a;


        this.m_prevTime = new Date();
        this.m_selectedMesh = intersects[i].object.particles[faceIdx];
        this.m_selectedMesh.m_bFixed = true;

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


  this.m_selectedMesh.m_bFixed = false;
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

},{"../libs/physics/E_DeformableMesh.js":5,"../libs/physics/E_Fabric2.js":6,"../libs/physics/E_FinitePlane.js":7,"../libs/physics/E_Particle.js":8,"../libs/physics/E_ParticleSource.js":9,"../libs/physics/E_ParticleSystem.js":10,"../libs/physics/E_SpringDamper.js":11,"./E_Interactor.js":1}],4:[function(require,module,exports){
(function (Buffer){
// The MIT License (MIT)

// Copyright (c) 2014 Machine Intelligence Laboratory (The University of Tokyo)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

(function(nodejs) {
  if (Sushi && Sushi.Matrix) {
    return;
  }

  var Sushi = { };

  initConstructor();
  initMethods(Sushi.Matrix, Sushi.Matrix.prototype);
  initAliases(Sushi.Matrix, Sushi.Matrix.prototype);
  ('global', eval)('this').Sushi = Sushi;

  function initConstructor() {
    Sushi.Matrix = function(rows, cols, data) {
      this.rows = rows;
      this.cols = cols;
      this.length = rows * cols;
      this.datum_type = Float32Array;
      this.byte_length = this.length * this.datum_type.BYTES_PER_ELEMENT;
      if (!data) {
        this.data = null;
      } else {
        this.data = data;
      }
      this.row_wise = true;
    };
  }

  function initMethods($M, $P) {
    /* ##### utilities ##### */

    $P.syncData = function() {
      if (!this.data) {
        this.data = new this.datum_type(this.length);
      }
    };

    $P.destruct = function() { this.data = void 0; };

    $M.newMatOrReuseMat = function(rows, cols, mat) {
      if (!mat) {
        return new $M(rows, cols);
      } else if (mat.rows !== rows || mat.cols !== cols) {
        throw new Error('The shape of the matrix to reuse does not match');
      } else {
        mat.rows = rows;
        mat.cols = cols;
        mat.row_wise = true;
        return mat;
      }
    };

    $P.copyPropertyFrom = function(original) {
      this.rows = original.rows;
      this.cols = original.cols;
      this.length = original.length;
      this.datum_type = original.datum_type;
      this.row_wise = original.row_wise;
    };

    $P.equals = function(mat) {
      this.syncData();
      mat.syncData();
      if (this.rows !== mat.rows || this.cols !== mat.cols) {
        return false;
      }
      if (this.row_wise === mat.row_wise) {
        for (var i = 0; i < this.length; i++) {
          if (this.data[i] !== mat.data[i]) {
            return false;
          }
        }
      } else {
        for (var row = 0; row < this.rows; row++) {
          for (var col = 0; col < this.cols; col++) {
            if (this.get(row, col) !== mat.get(row, col)) {
              return false;
            }
          }
        }
      }
      return true;
    };

    $P.nearlyEquals = function(mat, epsilon) {
      this.syncData();
      mat.syncData();
      if (epsilon === void 0) {
        var epsilon = 0.01;
      }
      var nearlyEquals = function(a, b) {
        var tmp = a - b;
        return -epsilon < tmp && tmp < epsilon;
      };
      if (this.rows !== mat.rows || this.cols !== mat.cols) {
        return false;
      }
      if (this.row_wise === mat.row_wise) {
        for (var i = 0; i < this.length; i++) {
          if (!nearlyEquals(this.data[i], mat.data[i])) {
            return false;
          }
        }
      } else {
        for (var row = 0; row < this.rows; row++) {
          for (var col = 0; col < this.cols; col++) {
            if (!nearlyEquals(this.get(row, col), mat.get(row, col))) {
              return false;
            }
          }
        }
      }
      return true;
    };

    $P.print = function() {
      console.log(this.toString());
    };

    $P.toString = function() {
      // TODO: fails when Nan / Infinity exists
      this.syncData();
      var formatWidth = function(str, width) {
        while (str.length < width) {
          str = ' ' + str;
        }
        return str;
      };
      var isInt = function(x) {
        return x % 1 === 0;
      };
      var write_buf = '-- Matrix (' + this.rows + ' x ' + this.cols + ') --';
      write_buf += '\r\n';
      var digit = Math.max(1, Math.floor(Math.LOG10E * Math.log(
          Math.max($M.max(this), -$M.min(this))
      )));
      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          var tmp = this.get(row, col);
          write_buf += formatWidth(
              isInt(tmp) ? String(tmp) : tmp.toFixed(6), 10 + digit);
        }
        if (row != this.rows - 1) { write_buf += '\r\n'; }
      }
      return write_buf;
    };

    $P.toRowWise = function() {
      if (this.row_wise) {
        return this;
      }
      this.syncData();
      var new_data = new this.datum_type(this.length);
      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          new_data[col + this.cols * row] = this.data[row + this.rows * col];
        }
      }
      this.row_wise = true;
      this.data = new_data;
      return this;
    };

    $P.clone = function(output) {
      this.syncData();
      var newM = $M.newMatOrReuseMat(this.rows, this.cols, output);
      newM.syncData();
      newM.copyPropertyFrom(this);
      newM.data = new this.datum_type(this.data);
      return newM;
    };

    $P.alias = function() {
      this.syncData();
      var newM = new $M(this.rows, this.cols, null);
      newM.copyPropertyFrom(this);
      newM.data = this.data;
      return newM;
    };

    $M.hasNaN = function(mat) {
      mat.syncData();
      for (var i = 0; i < mat.length; i++) {
        if (isNaN(mat.data[i])) {
          return true;
        }
      }
      return false;
    };

    /* #####initializer ##### */

    $P.zeros = function(num) {
      if (!num) { var num = 0; }
      this.syncData();
      for (var i = 0; i < this.length; i++) {
        this.data[i] = num;
      }
      return this;
    };

    $P.random = function(min, max) {
      this.syncData();
      if (min === void 0) {
        var min = 0.0;
      }
      if (max === void 0) {
        var max = 1.0;
      }
      for (var i = 0; i < this.length; i++) {
        this.data[i] = min + (max - min) * Math.random();
      }
      return this;
    };

    $P.gaussRandom = function() {
      var getGauss = function(mu, std) {
        var a = 1 - Math.random();
        var b = 1 - Math.random();
        var c = Math.sqrt(-2 * Math.log(a));
        if (0.5 - Math.random() > 0) {
          return c * Math.sin(Math.PI * 2 * b) * std + mu;
        } else {
          return c * Math.cos(Math.PI * 2 * b) * std + mu;
        }
      };
      return function(mu, std) {
        this.syncData();
        for (var i = 0; i < this.length; i++) {
          this.data[i] = getGauss(mu, std);
        }
        return this;
      }
    }();

    $P.range = function() {
      this.syncData();
      for (var i = 0; i < this.data.length; i++) {
        this.data[i] = i;
      }
      return this;
    };

    $M.toArray = function(mat) {
      var rows = [];
      mat.syncData();
      if (mat.row_wise) {
        for (var row = 0; row < mat.rows; row++) {
          var cols = [];
          for (var col = 0; col < mat.cols; col++) {
            cols.push(mat.data[col + mat.cols * row]);
          }
          rows.push(cols);
        }
      } else {
        for (var row = 0; row < mat.rows; row++) {
          var cols = [];
          for (var col = 0; col < mat.cols; col++) {
            cols.push(mat.data[row + mat.rows * col]);
          }
          rows.push(cols);
        }
      }
      return rows;
    };

    $P.toCSV = function() {
      // TODO: format option
      var mat_array = $M.toArray(this);
      var row_string_array = mat_array.map(
              function(row) { return row.join(','); });
      // Add last newline for easy concatenation
      return row_string_array.join('\r\n') + '\r\n';
    };

    $M.fromArray = function(original_array) {
      var newM = new $M(original_array.length, original_array[0].length, null);
      newM.setArray(original_array);
      return newM;
    };

    $P.setArray = function(original_array) {
      this.syncData();
      this.data = new this.datum_type(this.length);
      var i = 0;
      for (var row = 0; row < original_array.length; row++) {
        var row_array = original_array[row];
        for (var col = 0; col < row_array.length; col++) {
          this.data[i++] = row_array[col];
        }
      }
      return this;
    };

    $M.fromCSV = function(csv_string) {
      var row_string_array = csv_string.split(/\r?\n/);
      var nrow = row_string_array.length;
      if (row_string_array[nrow - 1].length == 0) {
        nrow--;
      }
      var newM = null;
      var newM_data = null;
      var i = 0;
      for (var row = 0; row < nrow; row++) {
        var col_string_array = row_string_array[row].split(/[,\t ]/);
        if (row == 0) {
          var ncol = col_string_array.length;
          newM = new $M(nrow, ncol);
          newM.syncData();
          newM_data = newM.data;
        }
        if (col_string_array.length != ncol) {
          throw new Error('Number of columns mismatch');
        }

        for (var col = 0; col < ncol; col++) {
          newM_data[i++] = Number(col_string_array[col]);
        }
      }

      return newM;
    };

    $M.eye = function(size, output) {
      var newM = $M.newMatOrReuseMat(size, size, output);
      newM.syncData();
      for (var i = 0; i < size; i++) {
        newM.data[i * (size + 1)] = 1;
      }
      return newM;
    };

    $M.diag = function(diag) {
      if (!(diag instanceof Array)) {
        diag.syncData();
        diag = diag.data;
      }
      var newM = new $M(diag.length, diag.length);
      newM.syncData();
      for (var i = 0; i < diag.length; i++) {
        newM.data[i * (diag.length + 1)] = diag[i];
      }
      return newM;
    };

    $M.extract = function(mat, offset_row, offset_col, rows, cols, output) {
      var newM = $M.newMatOrReuseMat(rows, cols, output);
      newM.syncData();
      var newM_data = newM.data;
      mat.syncData();
      var mat_data = mat.data;
      if (mat.row_wise) {
        var original_cols = mat.cols;
        for (var row = 0; row < rows; row++) {
          for (var col = 0; col < cols; col++) {
            newM_data[row * cols + col] =
              mat_data[(offset_row + row) * original_cols + offset_col + col];
          }
        }
      } else {
        var original_rows = mat.rows;
        for (var row = 0; row < rows; row++) {
          for (var col = 0; col < cols; col++) {
            newM_data[row * cols + col] =
              mat_data[offset_row + row + (offset_col + col) * original_rows];
          }
        }
      }
      return newM;
    };

    $M.getRow = function(mat, row, output) {
      var cols = mat.cols;

      var newM = $M.newMatOrReuseMat(1, cols, output);
      newM.syncData();
      var newM_data = newM.data;

      mat.syncData();
      var mat_data = mat.data;

      var base = mat.row_wise ? row * cols : row;
      var skip = mat.row_wise ? 1 : mat.rows;
      for (var i = 0; i < cols; i++) {
        newM_data[i] = mat_data[base];
        base += skip;
      }
      return newM;
    };

    $M.getCol = function(mat, col, output) {
      var rows = mat.rows;

      var newM = $M.newMatOrReuseMat(rows, 1, output);
      newM.syncData();
      var newM_data = newM.data;

      mat.syncData();
      var mat_data = mat.data;

      var base = mat.row_wise ? col : rows * col;
      var skip = mat.row_wise ? mat.cols : 1;
      for (var i = 0; i < rows; i++) {
        newM_data[i] = mat_data[base];
        base += skip;
      }
      return newM;
    };

    $P.setRow = function(row, mat) {
      if (this.cols !== mat.cols) {
        throw new Error('the cols does not match');
      }
      if (mat.rows !== 1) {
        throw new Error('mat to write must be row vector');
      }
      var cols = mat.cols;

      this.syncData();
      var this_data = this.data;

      mat.syncData();
      var mat_data = mat.data;

      var base_this = this.row_wise ? cols * row : row;
      var skip_this = this.row_wise ? 1 : this.rows;

      for (var i = 0; i < cols; i++) {
        this_data[base_this] = mat_data[i];
        base_this += skip_this;
      }
      return this;
    };

    $P.setCol = function(col, mat) {
      if (this.rows !== mat.rows) {
        throw new Error('the rows does not match');
      }
      if (mat.cols !== 1) {
        throw new Error('mat to write must be col vector');
      }
      var rows = mat.rows;

      this.syncData();
      var this_data = this.data;

      mat.syncData();
      var mat_data = mat.data;

      var base_this = this.row_wise ? col : rows * col;
      var skip_this = this.row_wise ? this.cols : 1;

      for (var i = 0; i < rows; i++) {
        this_data[base_this] = mat_data[i];
        base_this += skip_this;
      }
      return this;
    };

    $M.vstack = function(mats, output) {
      var rows = mats[0].rows;
      var cols = mats[0].cols;
      for (var i = 1; i < mats.length; i++) {
        if (mats[i].cols !== cols) {
          throw new Error('the cols does not match');
        }
        rows += mats[i].rows;
      }

      var newM = $M.newMatOrReuseMat(rows, cols, output);
      newM.syncData();
      var newM_data = newM.data;
      var newM_offset = 0;
      for (var i = 0; i < mats.length; i++) {
        for (var row = 0; row < mats[i].rows; row++) {
          var base = mats[i].row_wise ? row * cols : row;
          var skip = mats[i].row_wise ? 1 : mats[i].rows;
          mats[i].syncData();
          var matsi_data = mats[i].data;
          for (var col = 0; col < cols; col++) {
            newM_data[newM_offset++] = matsi_data[base];
            base += skip;
          }
        }
      }
      return newM;
    };


    $M.hstack = function(mats, output) {
      var rows = mats[0].rows;
      var cols = mats[0].cols;
      for (var i = 1; i < mats.length; i++) {
        if (mats[i].rows !== rows) {
          throw new Error('the rows does not match');
        }
        cols += mats[i].cols;
      }

      var newM = $M.newMatOrReuseMat(rows, cols, output);
      newM.syncData();
      var newM_data = newM.data;
      var newM_offset = 0;
      for (var i = 0; i < mats.length; i++) {
        for (var col = 0; col < mats[i].cols; col++) {
          var base = mats[i].row_wise ? col : col * rows;
          var skip = mats[i].row_wise ? mats[i].cols : 1;
          mats[i].syncData();
          var matsi_data = mats[i].data;
          for (var row = 0; row < rows; row++) {
            newM_data[newM_offset] = matsi_data[base];
            newM_offset += cols;
            base += skip;
          }
          newM_offset -= cols * rows - 1;
        }
      }
      return newM;
    };

    $P.toJSON = function() {
      this.syncData();
      var bytes = new Uint8Array(this.data.buffer);
      if (nodejs) {
        var base64 = (new Buffer(bytes)).toString('base64');
      } else {
        var binary = '';
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        var base64 = window.btoa(binary);
      }

      return {
        rows: this.rows,
        cols: this.cols,
        data: base64,
        row_wise: this.row_wise
      };
    };

    $M.fromJSON = function(data) {
      var newM = new $M(data.rows, data.cols, null);
      newM.row_wise = data.row_wise;
      newM.syncData();
      var ab = newM.data.buffer;
      var bytes = new Uint8Array(ab);
      var base64 = data.data;
      if (nodejs) {
        var chars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var bufferLength = base64.length * 0.75, len = base64.length;
        var i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
          bufferLength--;
          if (base64[base64.length - 2] === '=') {
            bufferLength--;
          }
        }
        if (bufferLength !== ab.byteLength) {
          throw new Error('length does not match');
        }

        for (i = 0; i < len; i += 4) {
          encoded1 = chars.indexOf(base64[i]);
          encoded2 = chars.indexOf(base64[i + 1]);
          encoded3 = chars.indexOf(base64[i + 2]);
          encoded4 = chars.indexOf(base64[i + 3]);

          bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
          bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
          bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
      } else {
        var binary = window.atob(base64);
        var len = binary.length;
        if (len !== ab.byteLength) {
          throw new Error('length does not match');
        }
        for (var i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
      }
      return newM;
    };

    /* ##### general manipulation ##### */
    $P.get = function(row, col) {
      this.syncData();
      if (row >= this.rows || col >= this.cols) {
        throw new Error('out of range');
      }
      if (this.row_wise) {
        return this.data[row * this.cols + col];
      } else {
        return this.data[col * this.rows + row];
      }
    };

    $M.getEach = function(original, indexes) {
      if (indexes.rows !== 1 && indexes.cols !== 1) {
        throw new Error('indexes matrix must be row vector or col vector');
      } else if (indexes.rows === 1) {
        if (indexes.cols !== original.cols) {
          throw new Error('shape does not match');
        }
        var cols = indexes.cols;

        original.syncData();
        var original_data = original.data;

        indexes.syncData();
        var indexes_data = indexes.data;

        var newM = new $M(1, cols);
        newM.syncData();
        var newM_data = newM.data;
        if (original.row_wise) {
          for (var i = 0; i < cols; i++) {
            newM_data[i] = original_data[indexes_data[i] * cols + i];
          }
        } else {
          var rows = original.rows;
          for (var i = 0; i < cols; i++) {
            newM_data[i] = original_data[indexes_data[i] + i * rows];
          }
        }
        return newM;
      } else {
        if (indexes.rows !== original.rows) {
          throw new Error('shape does not match');
        }
        var rows = indexes.rows;

        original.syncData();
        var original_data = original.data;

        indexes.syncData();
        var indexes_data = indexes.data;

        var newM = new $M(rows, 1);
        newM.syncData();
        var newM_data = newM.data;
        if (original.row_wise) {
          var cols = original.cols;
          for (var i = 0; i < rows; i++) {
            newM_data[i] = original_data[i * cols + indexes_data[i]];
          }
        } else {
          for (var i = 0; i < rows; i++) {
            newM_data[i] = original_data[i + indexes_data[i] * rows];
          }
        }
        return newM;
      }
    };

    $P.set = function(row, col, datum) {
      this.syncData();
      if (row >= this.rows || col >= this.cols) {
        throw new Error('out of range');
      }
      if (this.row_wise) {
        this.data[row * this.cols + col] = datum;
      } else {
        this.data[col * this.rows + row] = datum;
      }
      return this;
    };

    $P.map = function(func) {
      this.syncData();
      for (var i = 0; i < this.length; i++) {
        this.data[i] = func(this.data[i]);
      }
      return this;
    };

    $P.setEach = function(func) {
      this.syncData();
      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          this.set(row, col, func(row, col));
        }
      }
      return this;
    };

    $P.forEach = function(func) {
      this.syncData();
      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          func(row, col);
        }
      }
      return this;
    };

    /* ##### shape ##### */

    $P.reshape = function(rows, cols) {
      if (rows * cols !== this.rows * this.cols) {
        throw new Error('shape does not match');
      }
      this.rows = rows;
      this.cols = cols;
      return this;
    };

    $P.t = function() {
      var alias = this.alias();
      alias.row_wise = !alias.row_wise;
      var tmp = alias.rows;
      alias.rows = alias.cols;
      alias.cols = tmp;
      return alias;
    };

    $P.getShape = function() {
      return { rows: this.rows, cols: this.cols };
    };

    /* ##### statistics ##### */
    $M.max = function(mat) {
      mat.syncData();
      var max_val = mat.data[0];
      for (var row = 0; row < mat.rows; row++) {
        for (var col = 0; col < mat.cols; col++) {
          if (mat.get(row, col) > max_val) {
            max_val = mat.get(row, col);
          }
        }
      }
      return max_val;
    };

    $M.min = function(mat) {
      mat.syncData();
      var min_val = mat.data[0];
      for (var row = 0; row < mat.rows; row++) {
        for (var col = 0; col < mat.cols; col++) {
          if (mat.get(row, col) < min_val) {
            min_val = mat.get(row, col);
          }
        }
      }
      return min_val;
    };

    $M.argmax = function(mat) {
      mat.syncData();
      var max_val = mat.data[0];
      var arg = { row: 0, col: 0 };
      for (var row = 0; row < mat.rows; row++) {
        for (var col = 0; col < mat.cols; col++) {
          if (mat.get(row, col) > max_val) {
            max_val = mat.get(row, col);
            arg.row = row;
            arg.col = col;
          }
        }
      }
      return arg;
    };

    $M.sum = function(mat) {
      mat.syncData();
      var sum = 0.0;
      for (var i = 0; i < mat.length; i++) {
        sum += mat.data[i];
      }
      return sum;
    };

    $M.sumEachRow = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(mat.rows, 1, output);
      for (var row = 0; row < mat.rows; row++) {
        var tmp = 0;
        for (var col = 0; col < mat.cols; col++) {
          tmp += mat.get(row, col);
        }
        newM.set(row, 0, tmp);
      }
      return newM;
    };

    $M.sumEachCol = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(1, mat.cols, output);
      for (var col = 0; col < mat.cols; col++) {
        var tmp = 0;
        for (var row = 0; row < mat.rows; row++) {
          tmp += mat.get(row, col);
        }
        newM.set(0, col, tmp);
      }
      return newM;
    };

    $M.maxEachRow = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(mat.rows, 1, output);
      for (var row = 0; row < mat.rows; row++) {
        var tmp = mat.get(row, 0);
        for (var col = 0; col < mat.cols; col++) {
          tmp = Math.max(tmp, mat.get(row, col));
        }
        newM.set(row, 0, tmp);
      }
      return newM;
    };

    $M.maxEachCol = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(1, mat.cols, output);
      for (var col = 0; col < mat.cols; col++) {
        var tmp = mat.get(0, col);
        for (var row = 0; row < mat.rows; row++) {
          tmp = Math.max(tmp, mat.get(row, col));
        }
        newM.set(0, col, tmp);
      }
      return newM;
    };

    $M.argmaxEachRow = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(mat.rows, 1, output);
      for (var row = 0; row < mat.rows; row++) {
        var max = mat.get(row, 0);
        var arg = 0;
        for (var col = 0; col < mat.cols; col++) {
          var tmp = mat.get(row, col);
          if (max < tmp) {
            arg = col;
            max = tmp;
          }
        }
        newM.set(row, 0, arg);
      }
      return newM;
    };

    $M.argmaxEachCol = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(1, mat.cols, output);
      for (var col = 0; col < mat.cols; col++) {
        var max = mat.get(0, col);
        var arg = 0;
        for (var row = 0; row < mat.rows; row++) {
          var tmp = mat.get(row, col);
          if (max < tmp) {
            arg = row;
            max = tmp;
          }
        }
        newM.set(0, col, arg);
      }
      return newM;
    };

    $M.argminEachRow = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(mat.rows, 1, output);
      for (var row = 0; row < mat.rows; row++) {
        var max = mat.get(row, 0);
        var arg = 0;
        for (var col = 0; col < mat.cols; col++) {
          var tmp = mat.get(row, col);
          if (max > tmp) {
            arg = col;
            max = tmp;
          }
        }
        newM.set(row, 0, arg);
      }
      return newM;
    };

    $M.argminEachCol = function(mat, output) {
      mat.syncData();
      var newM = $M.newMatOrReuseMat(1, mat.cols, output);
      for (var col = 0; col < mat.cols; col++) {
        var max = mat.get(0, col);
        var arg = 0;
        for (var row = 0; row < mat.rows; row++) {
          var tmp = mat.get(row, col);
          if (max > tmp) {
            arg = row;
            max = tmp;
          }
        }
        newM.set(0, col, arg);
      }
      return newM;
    };


    /* ##### basic calculation ##### */

    var eachOperationPGenerator = function(op) {
      return eval(
        [
        '  (function(mat) {                                      ',
        '    this.syncData();                                    ',
        '    mat.syncData();                                      ',
        '    if (!( (this.rows === mat.rows && this.cols === mat.cols) || ',
        '         (this.rows === mat.rows && mat.cols === 1) ||           ',
        '         (this.cols === mat.cols && mat.rows === 1) ) ) {        ',
        '      throw new Error(\'shape does not match\');                 ',
        '    }                                            ',
        '    var this_data = this.data;                            ',
        '    var mat_data = mat.data;                            ',
        '    if (this.rows === mat.rows && this.cols === mat.cols) {      ',
        '      if (this.row_wise === mat.row_wise) {                      ',
        '        for (var i = 0; i < this.length; i++) {                  ',
        '          this_data[i] ' + op + '= mat_data[i];                  ',
        '        }                                        ',
        '      } else {                                      ',
        '        this.forEach(function(row, col) {                        ',
        '          this.set(row, col, this.get(row, col) ' +
                op + ' mat.get(row, col));    ',
        '        }.bind(this));                                  ',
        '      }                                          ',
        '    } else if (this.row_wise) {                                ',
        '      if (this.rows === mat.rows) {                            ',
        '        for (var row = 0; row < mat.rows; row++) {               ',
        '          for (var col = 0; col < this.cols; col++) {            ',
        '            this_data[row * this.cols + col] ' +
                op + '= mat_data[row];        ',
        '          }                                      ',
        '        }                                        ',
        '      } else {                                      ',
        '        for (var col = 0; col < mat.cols; col++) {               ',
        '          for (var row = 0; row < this.rows; row++) {            ',
        '            this_data[row * this.cols + col] ' +
                op + '= mat_data[col];        ',
        '          }                                      ',
        '        }                                        ',
        '      }                                          ',
        '    } else {                                        ',
        '      if (this.rows === mat.rows) {                            ',
        '        for (var row = 0; row < mat.rows; row++) {               ',
        '          for (var col = 0; col < this.cols; col++) {            ',
        '            this_data[col * this.rows + row] ' +
                op + '= mat_data[row];        ',
        '          }                                      ',
        '        }                                        ',
        '      } else {                                      ',
        '        for (var col = 0; col < mat.cols; col++) {               ',
        '          for (var row = 0; row < this.rows; row++) {            ',
        '            this_data[col * this.rows + row] ' +
                op + '= mat_data[col];        ',
        '          }                                      ',
        '        }                                        ',
        '      }                                          ',
        '    }                                            ',
        '    return this;                                      ',
        '  });                                              '
        ].join('\r\n')
      );
    };

    var eachOperationMGenerator = function(op) {
      return eval(
        [
        '  (function(mat1, mat2, output) {                                ',
        '    mat1.syncData();                                    ',
        '    mat2.syncData();                                    ',
        '    if (!( (mat1.rows === mat2.rows && mat1.cols === mat2.cols) ||',
        '         (mat1.rows === mat2.rows && mat2.cols === 1) ||          ',
        '         (mat1.cols === mat2.cols && mat2.rows === 1) ) ) {       ',
        '      throw new Error(\'shape does not match\');                  ',
        '    }                                            ',
        '    var newM = $M.newMatOrReuseMat(mat1.rows, mat1.cols, output); ',
        '    newM.syncData();                                    ',
        '    var newM_data = newM.data;                                ',
        '    var mat1_data = mat1.data;                                ',
        '    var mat2_data = mat2.data;                                ',
        '    if (mat1.rows === mat2.rows && mat1.cols === mat2.cols) {     ',
        '      if (mat1.row_wise && mat2.row_wise) {                       ',
        '        for (var i = 0; i < newM.length; i++) {                   ',
        '          newM_data[i] = mat1_data[i] ' + op + ' mat2_data[i];    ',
        '        }                                        ',
        '      } else {                                      ',
        '        for (var row = 0; row < mat1.rows; row++) {               ',
        '          for (var col = 0; col < mat1.cols; col++) {             ',
        '            newM.set(row, col, mat1.get(row, col) ' +
                op + ' mat2.get(row, col));  ',
        '          }                                      ',
        '        }                                        ',
        '      }                                          ',
        '    } else if (mat1.row_wise) {                                ',
        '      if (mat1.rows === mat2.rows) {                            ',
        '        for (var row = 0; row < mat1.rows; row++) {               ',
        '          for (var col = 0; col < mat1.cols; col++) {             ',
        '            newM_data[row * newM.cols + col] =                    ',
        '              mat1_data[row * mat1.cols + col] ' +
                op + ' mat2_data[row];      ',
        '          }                                      ',
        '        }                                        ',
        '      } else {                                      ',
        '        for (var col = 0; col < mat1.cols; col++) {               ',
        '          for (var row = 0; row < mat1.rows; row++) {             ',
        '            newM_data[row * newM.cols + col] =                    ',
        '              mat1_data[row * mat1.cols + col] ' +
                op + ' mat2_data[col];      ',
        '          }                                      ',
        '        }                                        ',
        '      }                                          ',
        '    } else {                                        ',
        '      if (mat1.rows === mat2.rows) {                            ',
        '        for (var row = 0; row < mat1.rows; row++) {               ',
        '          for (var col = 0; col < mat1.cols; col++) {             ',
        '            newM_data[row * newM.cols + col] =                    ',
        '              mat1_data[col * mat1.rows + row] ' +
                op + ' mat2_data[row];      ',
        '          }                                      ',
        '        }                                        ',
        '      } else {                                      ',
        '        for (var col = 0; col < mat1.cols; col++) {               ',
        '          for (var row = 0; row < mat1.rows; row++) {             ',
        '            newM_data[row * newM.cols + col] =                     ',
        '              mat1_data[col * mat1.rows + row] ' +
                op + ' mat2_data[col];      ',
        '          }                                      ',
        '        }                                        ',
        '      }                                          ',
        '    }                                            ',
        '    return newM;                                      ',
        '  });                                              '
        ].join('\r\n')
      );
    };

    $P.times = function(times) {
      this.syncData();
      for (var i = 0; i < this.length; i++) {
        this.data[i] *= times;
      }
      return this;
    };

    $P.add = eachOperationPGenerator('+');

    $M.add = eachOperationMGenerator('+');

    $P.sub = eachOperationPGenerator('-');

    $M.sub = eachOperationMGenerator('-');

    $P.mulEach = eachOperationPGenerator('*');

    $M.mulEach = eachOperationMGenerator('*');

    $P.divEach = eachOperationPGenerator('/');

    $M.divEach = eachOperationMGenerator('/');

    $P.dot = function(mat) {
      this.syncData();
      mat.syncData();
      if (this.rows !== mat.rows || this.cols !== mat.cols) {
        throw new Error('shape does not match');
      }
      var sum = 0.0;
      if (this.row_wise === mat.row_wise) {
        for (var i = 0; i < this.length; i++) {
          sum += this.data[i] * mat.data[i];
        }
      } else {
        this.forEach(function(row, col) {
          sum += this.get(row, col) * mat.get(row, col);
        }.bind(this));
      }
      return sum;
    };

    $M.dot = function(mat1, mat2) {
      return mat1.dot(mat2);
    };

    $P.mul = function(mat, output) {
      return $M.mul(this, mat, output);
    };

    $M.mul = function() {
      var mulGenerator = function(
          mat1_row_zero_to_idx, mat1_idx_skip,
          mat2_zero_col_to_idx, mat2_idx_skip) {
        return eval([
          '(function(mat1, mat2, output) {                            ',
          '  mat1.syncData();                                  ',
          '  mat2.syncData();                                  ',
          '  if (mat1.cols !== mat2.rows) {                            ',
          '    throw new Error(\'shape does not match\');                 ',
          '  }                                          ',
          '  var newM = $M.newMatOrReuseMat(mat1.rows, mat2.cols, output);',
          '  newM.syncData();                                  ',
          '  var tmp = 0;                                    ',
          '  var newM_data = newM.data; var mat1_data = mat1.data;',
          '  var mat2_data = mat2.data;  ',
          '  var newM_cols = newM.cols; var mat1_cols = mat1.cols;',
          '  var mat2_cols = mat2.cols;  ',
          '  var newM_rows = newM.rows; var mat1_rows = mat1.rows;',
          '  var mat2_rows = mat2.rows;  ',
          '  var newM_idx = 0;                                  ',
          '  for (var row = 0; row < newM_rows; row++) {                  ',
          '    for (var col = 0; col < newM_cols; col++) {                ',
          '      var tmp = 0.0;                                ',
          '      var mat1_idx = ' + mat1_row_zero_to_idx('row') + ';      ',
          '      var mat2_idx = ' + mat2_zero_col_to_idx('col') + ';      ',
          '      for (var i = 0; i < mat1_cols; i++) {                    ',
          '        tmp += mat1_data[mat1_idx] * mat2_data[mat2_idx];      ',
          '        mat1_idx += ' + mat1_idx_skip + ';                    ',
          '        mat2_idx += ' + mat2_idx_skip + ';                    ',
          '      }                                      ',
          '      newM_data[newM_idx++] = tmp;                        ',
          '    }                                        ',
          '  }                                          ',
          '  return newM;                                    ',
          '});                                          '
        ].join('\r\n'));
      };
      var mulRowRow = mulGenerator(
        function(row) { return [row, ' * mat1_cols'].join('') }, 1,
        function(col) { return [col].join('') }, 'mat2_cols'
      );
      var mulRowCol = mulGenerator(
        function(row) { return [row, ' * mat1_cols'].join('') }, 1,
        function(col) { return [col, ' * mat2_rows'].join('') }, 1
        );
      var mulColRow = mulGenerator(
        function(row) { return [row].join('') }, 'mat1_rows',
        function(col) { return [col].join('') }, 'mat2_cols'
        );
      var mulColCol = mulGenerator(
        function(row) { return [row].join('') }, 'mat1_rows',
        function(col) { return [col, ' * mat2_rows'].join('') }, 1
      );
      return function(mat1, mat2, output) {
        if (mat1.row_wise && mat2.row_wise) {
          return mulRowRow(mat1, mat2, output);
        } else if (mat1.row_wise && !mat2.row_wise) {
          return mulRowCol(mat1, mat2, output);
        } else if (!mat1.row_wise && mat2.row_wise) {
          return mulColRow(mat1, mat2, output);
        } else if (!mat1.row_wise && !mat2.row_wise) {
          return mulColCol(mat1, mat2, output);
        } else {
          throw new Error('mysterious error');
        }
      };
    }();

    /* ##### advanced calculation ##### */

    $M.convolve = function(mat1, mat2, mode, output) {
      throw new Error('not implemented');
    };

    $M.upperTriangular = function(mat, output) {
      var newM = mat.clone(output);
      var rows = newM.rows;
      var cols = newM.cols;
      newM.syncData();
      var newM_data = newM.data;
      if (mat.row_wise) {
        for (var col = 0; col < cols; col++) {
          if (newM_data[col + cols * col] === 0) {
            for (var row = col + 1; row < rows; row++) {
              if (newM_data[col + cols * row] !== 0) {
                for (var i = col; i < cols; i++) {
                  newM_data[i + cols * col] += newM_data[i + cols * row];
                }
                break;
              }
            }
          }
          if (newM_data[col + cols * col] !== 0) {
            for (var row = col + 1; row < rows; row++) {
              var multiplier =
                newM_data[col + cols * row] / newM_data[col + cols * col];
              newM_data[col + cols * row] = 0;
              for (var i = col + 1; i < cols; i++) {
                newM_data[i + cols * row] -=
                  newM_data[i + cols * col] * multiplier;
              }
            }
          }
        }
      } else {
        for (var col = 0; col < cols; col++) {
          if (newM_data[col + cols * col] === 0) {
            for (var row = col + 1; row < rows; row++) {
              if (newM_data[rows * col + row] !== 0) {
                for (var i = col; i < cols; i++) {
                  newM_data[rows * i + col] += newM_data[rows * i + row];
                }
                break;
              }
            }
          }
          if (newM_data[col + cols * col] !== 0) {
            for (var row = col + 1; row < rows; row++) {
              var multiplier =
                newM_data[rows * col + row] / newM_data[rows * col + col];
              newM_data[rows * col + row] = 0;
              for (var i = col + 1; i < cols; i++) {
                newM_data[rows * i + row] -=
                  newM_data[rows * i + col] * multiplier;
              }
            }
          }
        }
      }
      return newM;
    };

    $P.det = function() {
      if (this.rows !== this.cols) {
        throw new Error('the matrix must be square');
      }
      this.syncData();
      if (this.rows === 2) {
        return this.data[0] * this.data[3] - this.data[1] * this.data[2];
      } else {
        var ut = $M.upperTriangular(this);
        ut.syncData();
        var det = ut.data[0];
        for (var i = 0; i < ut.rows; i++) {
          det *= ut.data[i * (ut.rows + 1)];
        }
        return det;
      }
    };

    $P.inverse = function() {
      if (this.rows !== this.cols) {
        throw new Error('the matrix must be square');
      }
      var rows = this.rows;
      var cols = this.cols;

      // make jointed upper triangular matrix
      var tmp_mat = new $M(rows, cols * 2);
      this.syncData();
      tmp_mat.syncData();
      var this_data = this.data;
      var tmp_mat_data = tmp_mat.data;
      if (this.row_wise) {
        for (var row = 0; row < rows; row++) {
          for (var col = 0; col < cols; col++) {
            tmp_mat_data[col + (cols * 2) * row] = this_data[col + cols * row];
            tmp_mat_data[col + cols + (cols * 2) * row] = (row === col ? 1 : 0);
          }
        }
      } else {
        for (var row = 0; row < rows; row++) {
          for (var col = 0; col < cols; col++) {
            tmp_mat_data[col + (cols * 2) * row] = this_data[row + rows * col];
            tmp_mat_data[col + cols + (cols * 2) * row] = (row === col ? 1 : 0);
          }
        }
      }
      var tri_mat = $M.upperTriangular(tmp_mat);
      tri_mat.syncData();
      var tri_mat_data = tri_mat.data;

      // normalize
      for (var i = 0; i < rows; i++) {
        var multiply = tri_mat_data[i + (cols * 2) * i];
        if (multiply === 0) {
          throw new Error('the matrix is singular');
        }
        tri_mat_data[i + (cols * 2) * i] = 1;
        for (var j = 0; j < cols; j++) {
          tri_mat_data[j + i + 1 + (cols * 2) * i] /= multiply;
        }
      }

      // inverse
      for (var row_p = rows - 1; row_p >= 0; row_p--) {
        for (var row = row_p - 1; row >= 0; row--) {
          for (var col = 0; col < cols; col++) {
            tri_mat_data[cols + col + (cols * 2) * row] -=
              tri_mat_data[cols + col + (cols * 2) * row_p] *
              tri_mat_data[row_p + (cols * 2) * row];
          }
        }
      }
      var return_mat = new $M(rows, cols);
      return_mat.syncData();
      var return_mat_data = return_mat.data;
      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
          return_mat_data[col + cols * row] =
            tri_mat_data[cols + col + (cols * 2) * row];
        }
      }

      tri_mat.destruct();
      tmp_mat.destruct();
      return return_mat;
    };

    $M.qr = function(A) {
      // http://www.riken.jp/brict/Ijiri/study/QRfactorization.htm
      var n = A.rows;
      var m = A.cols;
      if (n < m) {
        throw new Error('rows must be equal to or greater than cols');
      }

      // Gram-Schmidt orthonormalization
      var B = A.clone();
      A.syncData();
      B.syncData();
      var X = new $M(m, m);
      X.syncData();
      var calcXij = function(i, j) {
        // A and B have the same 'row_wise'
        var offset_A = A.row_wise ? j : j * A.rows;
        var offset_B = A.row_wise ? i : i * A.rows;
        var skip = A.row_wise ? A.cols : 1;
        var dividend = 0;
        var divisor = 0;
        for (var k = 0; k < A.rows; k++) {
          dividend += A.data[offset_A] * B.data[offset_B];
          divisor += B.data[offset_B] * B.data[offset_B];
          offset_A += skip;
          offset_B += skip;
        }
        return dividend / divisor;
      };

      for (var i = 0; i < m; i++) {
        for (var j = 0; j < i; j++) {
          var xji = calcXij(j, i);
          var offset_Bi = B.row_wise ? i : i * B.rows;
          var offset_Bj = B.row_wise ? j : j * B.rows;
          var skip = B.row_wise ? B.cols : 1;
          for (var row = 0; row < n; row++) {
            B.data[offset_Bi] -= xji * B.data[offset_Bj];
            offset_Bi += skip;
            offset_Bj += skip;
          }
          X.data[i + X.cols * j] = xji;
        }
        X.data[i + X.cols * i] = 1;
      }

      // normalization
      var Q = new $M(n, n);
      var rank = m;
      Q.syncData();
      for (var row = 0; row < n; row++) {
        var offset = B.row_wise ? B.cols * row : row;
        var skip = B.row_wise ? 1 : B.rows;
        for (var col = 0; col < m; col++) {
          Q.data[col + Q.cols * row] = B.data[offset];
          offset += skip;
        }
      }
      for (var col = 0; col < m; col++) {
        var sum = 0;
        for (var row = 0; row < n; row++) {
          sum += Q.data[col + row * n] * Q.data[col + row * n];
        }
        sum = Math.sqrt(sum);
        if (sum <= 0) {
          rank = col;
          break;
        }
        for (var row = 0; row < n; row++) {
          Q.data[col + row * n] /= sum;
        }
        for (var i = 0; i < m; i++) {
          X.data[i + col * m] *= sum;
        }
      }

      // expansion
      for (var i = rank; i < n; i++) {
        Q.data[i + i * n] = 1;
        for (var j = 0; j < i; j++) {
          // calcXij
          var dividend = Q.data[j + i * n];
          var divisor = 0;
          for (var k = 0; k < n; k++) {
            divisor += Q.data[j + k * n] * Q.data[j + k * n];
          }
          var multiplier = dividend / divisor;
          for (var row = 0; row < n; row++) {
            Q.data[i + row * n] -= multiplier * Q.data[j + row * n];
          }
        }
        var sum = 0;
        for (var row = 0; row < n; row++) {
          sum += Q.data[i + row * n] * Q.data[i + row * n];
        }
        sum = Math.sqrt(sum);
        for (var row = 0; row < n; row++) {
          Q.data[i + row * n] /= sum;
        }
      }
      var R = new $M(n, m);
      R.syncData();
      for (var i = 0; i < rank * m; i++) {
        R.data[i] = X.data[i];
      }

      return { Q: Q, R: R };
    };

    $M.svd = function(A) {
      var temp;
      var prec = 0.001;
      var tolerance = 1.e-16 / prec;
      var itmax = 50;
      var c = 0;
      var i = 0;
      var j = 0;
      var k = 0;
      var l = 0;

      var u = $M.toArray(A);
      var m = u.length;
      var n = u[0].length;

      if (m < n) {
        throw new Error('rows must be equal to or greater than cols');
      }

      var e = new Array(n);
      var q = new Array(n);
      for (i = 0; i < n; i++)
        e[i] = q[i] = 0.0;
      var v = [];
      for (i = 0; i < n; i++) {
        temp = [];
        for (j = 0; j < n; j++) {
          temp.push(0);
        }
        v.push(temp);
      }

      function pythag(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        if (a > b)
          return a * Math.sqrt(1.0 + (b * b / a / a));
        else if (b === 0.0)
          return a;
        return b * Math.sqrt(1.0 + (a * a / b / b));
      }

      // Householder's reduction to bidiagonal form

      var f = 0.0;
      var g = 0.0;
      var h = 0.0;
      var x = 0.0;
      var y = 0.0;
      var z = 0.0;
      var s = 0.0;

      for (i = 0; i < n; i++) {
        e[i] = g;
        s = 0.0;
        l = i + 1;
        for (j = i; j < m; j++)
          s += (u[j][i] * u[j][i]);
        if (s <= tolerance)
          g = 0.0;
        else {
          f = u[i][i];
          g = Math.sqrt(s);
          if (f >= 0.0)
            g = -g;
          h = f * g - s;
          u[i][i] = f - g;
          for (j = l; j < n; j++) {
            s = 0.0;
            for (k = i; k < m; k++)
              s += u[k][i] * u[k][j];
            f = s / h;
            for (k = i; k < m; k++)
              u[k][j] += f * u[k][i];
          }
        }
        q[i] = g;
        s = 0.0;
        for (j = l; j < n; j++)
          s = s + u[i][j] * u[i][j];
        if (s <= tolerance)
          g = 0.0;
        else {
          f = u[i][i + 1];
          g = Math.sqrt(s);
          if (f >= 0.0)
            g = -g;
          h = f * g - s;
          u[i][i + 1] = f - g;
          for (j = l; j < n; j++)
            e[j] = u[i][j] / h;
          for (j = l; j < m; j++) {
            s = 0.0;
            for (k = l; k < n; k++)
              s += (u[j][k] * u[i][k]);
            for (k = l; k < n; k++)
              u[j][k] += s * e[k];
          }
        }
        y = Math.abs(q[i]) + Math.abs(e[i]);
        if (y > x)
          x = y;
      }

      // accumulation of right hand gtransformations
      for (i = n - 1; i != -1; i += -1) {
        if (g != 0.0) {
          h = g * u[i][i + 1];
          for (j = l; j < n; j++)
            v[j][i] = u[i][j] / h;
          for (j = l; j < n; j++) {
            s = 0.0;
            for (k = l; k < n; k++)
              s += u[i][k] * v[k][j];
            for (k = l; k < n; k++)
              v[k][j] += (s * v[k][i]);
          }
        }
        for (j = l; j < n; j++) {
          v[i][j] = 0;
          v[j][i] = 0;
        }
        v[i][i] = 1;
        g = e[i];
        l = i;
      }

      // accumulation of left hand transformations
      for (i = n - 1; i != -1; i += -1) {
        l = i + 1;
        g = q[i];
        for (j = l; j < n; j++)
          u[i][j] = 0;
        if (g != 0.0) {
          h = u[i][i] * g;
          for (j = l; j < n; j++) {
            s = 0.0;
            for (k = l; k < m; k++)
              s += u[k][i] * u[k][j];
            f = s / h;
            for (k = i; k < m; k++)
              u[k][j] += f * u[k][i];
          }
          for (j = i; j < m; j++)
            u[j][i] = u[j][i] / g;
        } else
          for (j = i; j < m; j++)
            u[j][i] = 0;
        u[i][i] += 1;
      }

      // diagonalization of the bidiagonal form
      prec = prec * x;
      for (k = n - 1; k != -1; k += -1) {
        for (var iteration = 0; iteration < itmax; iteration++) { // test
                                      // f
                                      // splitting
          var test_convergence = false;
          for (l = k; l != -1; l += -1) {
            if (Math.abs(e[l]) <= prec) {
              test_convergence = true;
              break;
            }
            if (Math.abs(q[l - 1]) <= prec)
              break;
          }
          if (!test_convergence) { // cancellation of e[l] if l>0
            c = 0.0;
            s = 1.0;
            var l1 = l - 1;
            for (i = l; i < k + 1; i++) {
              f = s * e[i];
              e[i] = c * e[i];
              if (Math.abs(f) <= prec)
                break;
              g = q[i];
              h = pythag(f, g);
              q[i] = h;
              c = g / h;
              s = -f / h;
              for (j = 0; j < m; j++) {
                y = u[j][l1];
                z = u[j][i];
                u[j][l1] = y * c + (z * s);
                u[j][i] = -y * s + (z * c);
              }
            }
          }
          // test f convergence
          z = q[k];
          if (l === k) { // convergence
            if (z < 0.0) { // q[k] is made non-negative
              q[k] = -z;
              for (j = 0; j < n; j++)
                v[j][k] = -v[j][k];
            }
            break; // break out of iteration loop and move on to next k
            // value
          }
          if (iteration >= itmax - 1)
            throw 'Error: no convergence.';
            // shift from bottom 2x2 minor
          x = q[l];
          y = q[k - 1];
          g = e[k - 1];
          h = e[k];
          f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2.0 * h * y);
          g = pythag(f, 1.0);
          if (f < 0.0)
            f = ((x - z) * (x + z) + h * (y / (f - g) - h)) / x;
          else
            f = ((x - z) * (x + z) + h * (y / (f + g) - h)) / x;
            // next QR transformation
          c = 1.0;
          s = 1.0;
          for (i = l + 1; i < k + 1; i++) {
            g = e[i];
            y = q[i];
            h = s * g;
            g = c * g;
            z = pythag(f, h);
            e[i - 1] = z;
            c = f / z;
            s = h / z;
            f = x * c + g * s;
            g = -x * s + g * c;
            h = y * s;
            y = y * c;
            for (j = 0; j < n; j++) {
              x = v[j][i - 1];
              z = v[j][i];
              v[j][i - 1] = x * c + z * s;
              v[j][i] = -x * s + z * c;
            }
            z = pythag(f, h);
            q[i - 1] = z;
            c = f / z;
            s = h / z;
            f = c * g + s * y;
            x = -s * g + c * y;
            for (j = 0; j < m; j++) {
              y = u[j][i - 1];
              z = u[j][i];
              u[j][i - 1] = y * c + z * s;
              u[j][i] = -y * s + z * c;
            }
          }
          e[l] = 0.0;
          e[k] = f;
          q[k] = x;
        }
      }

      // vt= transpose(v)
      // return (u,q,vt)
      for (i = 0; i < q.length; i++)
        if (q[i] < prec)
          q[i] = 0;

      // sort eigenvalues
      for (i = 0; i < n; i++) {
        for (j = i - 1; j >= 0; j--) {
          if (q[j] < q[i]) {
            c = q[j];
            q[j] = q[i];
            q[i] = c;
            for (k = 0; k < u.length; k++) {
              temp = u[k][i];
              u[k][i] = u[k][j];
              u[k][j] = temp;
            }
            for (k = 0; k < v.length; k++) {
              temp = v[k][i];
              v[k][i] = v[k][j];
              v[k][j] = temp;
            }
            i = j;
          }
        }
      }

      return {
        U: $M.fromArray(u),
        S: $M.fromArray([q]),
        V: $M.fromArray(v)
      };
    };
  }

  function initAliases($M, $P) {
    /* ##### large matrix calculation ##### */

    $P.largeAdd = $P.add;
    $P.largeSub = $P.sub;
    $P.largeMulEach = $P.mulEach;
    $P.largeDivEach = $P.divEach;
    $P.largeMul = $P.mul;
    $P.largeTimes = $P.times;
    $P.largeClone = $P.clone;
    $P.largeZeros = $P.zeros;

    $M.largeAdd = $M.add;
    $M.largeSub = $M.sub;
    $M.largeMulEach = $M.mulEach;
    $M.largeDivEach = $M.divEach;
    $M.largeMul = $M.mul;
    $M.largeSum = $M.sum;

    $M.largeSumEachRow = $M.sumEachRow;
    $M.largeSumEachCol = $M.sumEachCol;
    $M.largeMaxEachRow = $M.maxEachRow;
    $M.largeMaxEachCol = $M.maxEachCol;
    $M.largeArgmaxEachRow = $M.argmaxEachRow;
    $M.largeArgmaxEachCol = $M.argmaxEachCol;
    $M.largeArgminEachRow = $M.argminEachRow;
    $M.largeArgminEachCol = $M.argminEachCol;
    $M.largeConvolve = $M.convolve;
    $M.largeExtract = $M.extract;
  }

  module.exports = Sushi;
})(typeof window === 'undefined');

}).call(this,require("buffer").Buffer)
},{"buffer":12}],5:[function(require,module,exports){
var E_Particle = require("./E_Particle.js");
var E_SpringDamper = require("./E_SpringDamper");

function E_DeformableMesh(Mgr, geometry)
{
  THREE.Mesh.call(this);

  this.Mgr = Mgr;

  this.geometry = geometry;
  this.geometry.mergeVertices();
  this.material = new THREE.MeshPhongMaterial({color:0x5a0000});

  this.particles = [];
  this.springs = [];
  this.castShadow = true;



  //Initialize
  this.Initialize();
}

E_DeformableMesh.prototype = Object.create(THREE.Mesh.prototype);

E_DeformableMesh.prototype.Initialize = function()
{


  var vertMap = [];

  var numVerts = this.geometry.vertices.length;
  var numFaces = this.geometry.faces.length;
  var mass = 1;

  if(this.geometry instanceof THREE.SphereGeometry) mass = 0.5;

  for(var i=0 ; i<numVerts ; i++){
    var part = new E_Particle(this.Mgr, 0.45);
    part.mass = mass;
    var realPos = this.geometry.vertices[i].clone();
    part.position.set(realPos.x, realPos.y, realPos.z);
    part.m_colorFixed = true;
    part.material.color = new THREE.Color(0.5, 0.5, 0.1);
    this.particles.push(part);


    //Initialize Vertex Connection Map (for spring connection)
    vertMap[i] = [];
    for(var j=0 ; j<numVerts ; j++){
      vertMap[i].push(false);
    }
  }



  // Spring-Damper
  for(var i=0 ; i<numFaces ; i++){
    var face = this.geometry.faces[i];
    var spring;

    if( vertMap[ face.a ][ face.b ] === false ){
      spring = new E_SpringDamper(this.Mgr);
      spring.AddMesh( this.particles[ face.a ] );
      spring.AddMesh( this.particles[ face.b ] );
      vertMap[ face.a ][ face.b ] = true;
      vertMap[ face.b ][ face.a ] = true;
      this.springs.push(spring);
    }

    if( vertMap[ face.b ][ face.c ] === false ){
      spring = new E_SpringDamper(this.Mgr);
      spring.AddMesh( this.particles[ face.b ] );
      spring.AddMesh( this.particles[ face.c ] );
      vertMap[ face.b ][ face.c ] = true
      vertMap[ face.c ][ face.b ] = true
      this.springs.push(spring);
    }

    if( vertMap[ face.c ][ face.a ] === false ){
      spring = new E_SpringDamper(this.Mgr);
      spring.AddMesh( this.particles[ face.c ] );
      spring.AddMesh( this.particles[ face.a ] );
      vertMap[ face.c ][ face.a ] = true;
      vertMap[ face.a ][ face.c ] = true;
      this.springs.push(spring);
    }
  }

}

E_DeformableMesh.prototype.AddToRenderer = function(scene, system)
{
  var numVerts = this.particles.length;
  var numSprings = this.springs.length;

  for(var i=0 ; i<numVerts ; i++){
    if(this.particles[i].connectedObject.length !== 0){

      if(i == 0)
      scene.add(this.particles[i]);
      system.add(this.particles[i]);
    }
  }

  for(var i=0 ; i<numSprings ; i++){
    //scene.add(this.springs[i]);
    system.add(this.springs[i]);
  }

  scene.add(this);
  system.add(this);
}

E_DeformableMesh.prototype.MakeTranslation = function(x, y, z)
{
  var len = this.particles.length;

  for(var i=0 ; i<len ; i++){
    this.particles[i].position.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
  }
}


E_DeformableMesh.prototype.Update = function()
{
  //Update Geometry
  for(var i in this.geometry.vertices){
    this.geometry.verticesNeedUpdate = true;
    this.geometry.elementsNeedUpdate = true;
    this.geometry.normalsNeedUpdate = true;
    this.geometry.groupsNeedUpdate = true;
    this.geometry.lineDistancesNeedUpdate = true;

    var pos = this.particles[i].position.clone();
    this.geometry.vertices[i].set(pos.x, pos.y, pos.z);
  }

  this.geometry.computeFaceNormals();
  this.geometry.computeVertexNormals();
}

module.exports = E_DeformableMesh;

},{"./E_Particle.js":8,"./E_SpringDamper":11}],6:[function(require,module,exports){
var E_ParticleSource = require('./E_ParticleSource.js');

var E_Particle = require("./E_Particle.js");
var E_SpringDamper = require("./E_SpringDamper");


function E_Fabric2(Mgr)
{
  THREE.Mesh.call(this);

  this.Manager = Mgr;

  this.width = 10;
  this.height = 10;

  this.resolution = 1;
  this.xSeg = Math.round(this.width*this.resolution)-1;
  this.ySeg = Math.round(this.height*this.resolution)-1;

  this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.xSeg, this.ySeg);
  this.material = new THREE.MeshPhongMaterial({color:0x5a0000});

  this.particles = [];
  this.springs = [];

  this.material.side = 2;
}

E_Fabric2.prototype = Object.create(THREE.Mesh.prototype);

E_Fabric2.prototype.SetGeometry = function(x, y, xSeg, ySeg)
{
  this.width = x;
  this.height = y;
  this.xSeg = xSeg;
  this.ySeg = ySeg;
  this.geometry = new THREE.PlaneGeometry(x, y, xSeg, ySeg);
}

E_Fabric2.prototype.AddToRenderer = function(scene, system)
{

  for(var i in this.geometry.vertices){

    this.particles[i] = new E_ParticleSource(this.Manager, 0.45);
    this.particles[i].mass = 1;
    var realPos = this.geometry.vertices[i].clone();
    this.particles[i].m_colorFixed = true;
    this.particles[i].position.set(realPos.x, realPos.y, realPos.z);

    this.particles[i].parent = true;
    //this.particles[i].material.color = new THREE.Color(0.0, 0.1, 0.4);
    //scene.add(this.particles[i]);
    system.add(this.particles[i]);

    var i0 = i<= this.xSeg;
    var j0 = i % (this.xSeg+1) == 0;

    if(!j0){
      var spring = new E_SpringDamper(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-1]);
      this.springs.push(spring);

      //scene.add(spring);
      system.add(spring);
    }

    if(i0){
      //this.particles[i].m_bFixed = true;
    }else{
      var spring = new E_SpringDamper(this.Manager);
      spring.AddMesh(this.particles[i]);
      spring.AddMesh(this.particles[i-this.xSeg-1]);
      this.springs.push(spring);

      //scene.add(spring);
      system.add(spring);
    }
  }

  //Add to System
  scene.add(this);
  system.add(this);
}

E_Fabric2.prototype.Update = function()
{
  //Update Particles and Geometry
  for(var i in this.geometry.vertices){
    this.geometry.verticesNeedUpdate = true;

    var pos = this.particles[i].position.clone();
    this.geometry.vertices[i].set(pos.x, pos.y, pos.z);
  }

  this.geometry.computeFaceNormals();
   this.geometry.computeVertexNormals();
}

E_Fabric2.prototype.GetParticle = function(index)
{
  return this.particles[index];
}

E_Fabric2.prototype.FixPoint = function(x,y)
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

E_Fabric2.prototype.SetC = function(c)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].cValue = c;
  }
}

E_Fabric2.prototype.SetK = function(k)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].kValue = k;
  }
}

E_Fabric2.prototype.SetELength = function(eL)
{
  for(var i=0 ; i<this.springs.length ; i++){
    this.springs[i].equilibriumLength = eL;
  }
}

module.exports = E_Fabric2;

},{"./E_Particle.js":8,"./E_ParticleSource.js":9,"./E_SpringDamper":11}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
  this.mass = radius;

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

  // if(this.m_bFixed) {
  //   this.material.color = new THREE.Color(0.4, 0.2, 0.1);
  //   return;
  // }else{
  //   this.material.color = new THREE.Color(0.0, 0.4, 0.0);
  // }


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

  var gravity = this.Manager.GetGravity();

  this.acceleration = new THREE.Vector3(0, 0, 0);
  if(gravity.length() > 0){
    this.ApplyForce(gravity.multiplyScalar(this.mass ));
  }

  this.m_bCollided = false;


  //Remove Particle When
  if(new Date() - this.startTime > this.lifeSpan){
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

},{}],9:[function(require,module,exports){
function E_ParticleSource(Mgr, radius){

  if(radius == null) radius = 15;
  this.radius = radius;


  this.Manager = Mgr;


  //Dynamics
  this.position = new THREE.Vector3(0.0, 0.0, 0.0);
  this.acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
  this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
  this.mass = radius;

  this.elasticity = 0.04;

  //Informations
  this.lifeSpan = 30000000000000;
  this.startTime = new Date();

  //For Hair Simulation
  this.connectedObject = [];

  //Position Fix
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

E_ParticleSource.prototype.HairSimulation2 = function()
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

E_ParticleSource.prototype.HairSimulation = function()
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

E_ParticleSource.prototype.GetTangent = function(prevNode, currentNode, nextNode)
{
  return nextNode.clone().sub(prevNode).divideScalar(nextNode.clone().sub(currentNode).length() + currentNode.clone().sub(prevNode).length() );
}

E_ParticleSource.prototype.GetTangentPrime = function(Xp, Xc, Xn)
{
  return ( Xn.clone().sub(Xc).normalize().sub( Xc.clone().sub(Xp).normalize() )  ).multiplyScalar(2/( Xn.clone().sub(Xp).length() ));
}



E_ParticleSource.prototype.Update = function()
{
  // if(!this.visible) {
  //   this.Manager.particleList().remove(this);
  //   this.Manager.GetScene().remove(this);
  //   return;
  // }

  if(this.m_bFixed) {
    //If Fixed Position
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

  //Set Initial Acceleration
  this.acceleration = new THREE.Vector3(0, 0, 0);
  var gravity = this.Manager.GetGravity();
  if(gravity.length() > 0){
    this.ApplyForce(gravity.multiplyScalar(this.mass ));
  }

  this.m_bCollided = false;


  //Remove Particle When
  if(new Date() - this.startTime > this.lifeSpan || this.position.y < -15){
    //this.Manager.ParticleSystem().remove(this);
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

},{}],10:[function(require,module,exports){
var E_Particle = require("./E_Particle.js");
var E_ParticleSource = require("./E_ParticleSource.js");
var E_FinitePlane = require("./E_FinitePlane.js");
var E_DeformableMesh = require("./E_DeformableMesh.js");

var E_SpringDamper = require("./E_SpringDamper.js");

var E_Fabric2 = require("./E_Fabric2.js");

//Matrix
var Sushi = require("../Matrix/sushi.js");

function E_ParticleSystem(Mgr)
{
  this.Manager = Mgr;
  this.m_bInitialized = false;

  this.particleList = [];
  this.SAPList = [[], [], []];
  this.collisionMap = [];

  this.planeList = [];
  this.springList = [];
  this.fabricList = [];
  this.meshList = [];


  //Matrix
  ///Mass Matrix
  this.M = null;

  ///K matrix
  this.K = null;

  ///C Matrix
  this.C = null;

  this.P = null;
  this.V = null;
  this.A = null;

  this.dispMat = null;
  this.R = null;


  //K hat Inverse
  this.invK = null;
}

E_ParticleSystem.prototype.CompleteInitialize = function()
{
  this.m_bInitialized = true;
  this.UpdateConnectivityMatrix();
}

E_ParticleSystem.prototype.add = function( object )
{
  if(object instanceof E_Particle || object instanceof E_ParticleSource){
    if(object instanceof E_ParticleSource){
      object.parent = true;
    }
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
  }else if(object instanceof E_Fabric2){
    this.fabricList.push(object);
  }else if(object instanceof E_DeformableMesh){
    this.meshList.push(object);
  }else{
    return;
  }

  this.UpdateConnectivityMatrix();
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

  this.UpdateConnectivityMatrix();
}

E_ParticleSystem.prototype.UpdateDisplacementMatrix = function()
{
  this.dispMat = this.P;

  console.log(this.dispMat);
}

E_ParticleSystem.prototype.UpdateConnectivityMatrix = function()
{
  if(!this.m_bInitialized) return;

  var len = this.particleList.length;
  if(len == 0) return;

  var kValue = 50;
  var cValue = 20;

  var conMatrix = [];
  var massMatrix = [];
  var kMatrix = [];
  var cMatrix = [];

  conMatrix.length = len * 3;
  massMatrix.length = len* 3;
  kMatrix.length = len * 3;
  cMatrix.length = len * 3;

  //Initialzie Matrix 3N x 3N
  for(var i=0 ; i<len*3 ; i++){
    conMatrix[i] = [];
    massMatrix[i] = [];
    kMatrix[i] = [];
    cMatrix[i] = [];

    for(var j=0 ; j<len*3 ; j++){
      conMatrix[i].push(0);
      massMatrix[i].push(0);
      kMatrix[i].push(0);
      cMatrix[i].push(0);
    }
  }

  for(var i=0 ; i<len ; i++){
    //Build Connectivity, Mass, K, C Matrix
    var particle = this.particleList[i];
    var numConObj = particle.connectedObject.length;

    if(numConObj != 0){
      for(var j=0 ; j<numConObj ; j++){
          var idx = this.particleList.indexOf(particle.connectedObject[j]);

          conMatrix[i][idx] = -1;
          conMatrix[i + len][ idx + len ] = -1;
          conMatrix[i + len*2][ idx + len*2 ] = -1;
      }
    }

    conMatrix[i][i] = numConObj;
    conMatrix[i + len][i + len] = numConObj;
    conMatrix[i + len*2][i + len*2] = numConObj;

    massMatrix[i][i] = this.particleList[i].mass;
    massMatrix[i + len][i + len] = this.particleList[i].mass;
    massMatrix[i + len*2][i + len*2] = this.particleList[i].mass;


    //Kvalue (temp)

    kMatrix[i][i] = kValue;
    kMatrix[i+len][i+len] = kValue;
    kMatrix[i+len*2][i+len*2] = kValue;

    //cValue (temp, damper)

    cMatrix[i][i] = cValue;
    cMatrix[i+len][i+len] = cValue;
    cMatrix[i+len*2][i+len*2] = cValue;
  }

  var connectivityMatrix = Sushi.Matrix.fromArray(conMatrix);
  var mMatrix = Sushi.Matrix.fromArray(massMatrix);
  var kMatrix = Sushi.Matrix.fromArray(kMatrix);
  var cMatrix = Sushi.Matrix.fromArray(cMatrix);

  this.M = Sushi.Matrix.fromArray( massMatrix );
  this.K = connectivityMatrix.clone().times(kValue);
  this.C = connectivityMatrix.clone().times(cValue);

  var timeStep = 1 / this.Manager.interval;
  var a0 = 1/(0.25 * Math.pow(timeStep, 2) );
  var a1 = 0.5/( 0.25 * timeStep );


  var KHat = this.K.clone().add( this.M.clone().times(a0) ).add(this.C.clone().times(a1));
  this.invK = KHat.clone().inverse();
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
  if(!this.m_bInitialized) return;
  if(this.particleList.length < 1) return;
  // this.InsertionSort();
  // this.UpdateCollisionMap();
  // this.SAPCollision();



  //Explicit Method-SpringDamper
  // for(var i=0 ; i<this.springList.length ; i++){
  //   this.springList[i].Update();
  // }
  //

  //Update fabricList
  var fablen = this.fabricList.length;
  if(fablen !== 0){
    for(var i=0 ; i<fablen ; i++){
        this.fabricList[i].Update();
    }
  }

  var meshLen = this.meshList.length;
  if(meshLen != 0){
    for(var i=0 ; i<meshLen ; i++){
      this.meshList[i].Update();
    }
  }

  for(var i = 0  ; i < this.particleList.length ; i++){

      //Update Plane Collision
      for(var j in this.planeList){
        this.PlaneCollisionDetection(this.particleList[i], this.planeList[j]);
      }


    // for(var k = i+1 ; k < this.particleList.length ; k++){
    //   this.ParticleCollisionDetection(this.particleList[i], this.particleList[k]);
    // }
  }


  //Implicit Method-SpringDamper
  this.ImplicitSpringDamperSystem();


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
  if(!plane instanceof E_FinitePlane || !object instanceof E_Particle || !object instanceof E_ParticleSource){
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


  var Vnp = Vn.clone().multiplyScalar(-1 * object.elasticity);
  if(Vnp.y < 2){
    Vnp.y = 0.0;
  }
  var V = Vnp.clone().add(Vt);

  object.position.set(colPoint.x, colPoint.y, colPoint.z);
  object.velocity.set(V.x, V.y, V.z);

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

E_ParticleSystem.prototype.ImplicitSpringDamperSystem = function()
{
  if(this.invK == null) return;
  var len = this.particleList.length;

  this.UpdateDynamics();

  var timeStep = 1 / this.Manager.interval;
  var a0 = 1/(0.25 * Math.pow(timeStep, 2) );
  var a1 = 0.5/( 0.25 * timeStep );
  var a2 = 1/(0.25 * timeStep);
  var a3 = 1/( 2* 0.25 ) - 1;
  var a4 = (0.5 / 0.25) - 1;
  var a5 = (timeStep / 2)*((0.5/0.25)-2 );
  var a6 = timeStep * (1 - 0.5);
  var a7 = 0.5 * timeStep;

  var eq1 = Sushi.Matrix.mul(this.M ,  this.P.clone().times(a0).add( this.V.clone().times(a2) ).add( this.A.clone().times(a3) ) );
  var eq2 = Sushi.Matrix.mul(this.C ,  this.P.clone().times(a1).add( this.V.clone().times(a4) ).add( this.A.clone().times(a5) ) );

  var RHat = eq1.add(eq2);

  //Update Position
  var updateP = Sushi.Matrix.mul(this.invK, RHat);

  //Update Acceleration
  var updateA =  updateP.clone().sub( this.P ).times(a0).sub( this.V.clone().times(a2) ).sub( this.A.clone().times(a3) );

  //Update Velocity
  var updateV = this.V.clone().add( this.A.clone().times(a6) ).add( updateA.clone().times(a7) );

  updateP.add(this.dispMat);

  //Update Animation
  for(var i=0 ; i<len ; i++){
    var particle = this.particleList[i];

    if(!particle.m_bFixed){
      particle.position.set( updateP.get(i, 0),  updateP.get(i+len, 0),  updateP.get(i+len*2, 0) );
      particle.velocity.set( updateV.get(i, 0),  updateV.get(i+len, 0),  updateV.get(i+len*2, 0) );
      var acc = new THREE.Vector3( updateA.get(i, 0),  updateA.get(i+len, 0),  updateA.get(i+len*2, 0) )
      particle.acceleration.add( acc );
    }

  }


  //Update Scene
  for(var i=0 ; i<this.springList.length ; i++){
    this.springList[i].UpdateConnectivity();

    if(this.springList[i] instanceof E_SpringDamper){
      this.springList[i].UpdateLineShape();
    }
  }

}

E_ParticleSystem.prototype.UpdateDynamics = function()
{
  var len = this.particleList.length;

  //Build Position, Velocity, Acceleration Matrix

  //if(this.P == null || this.V == null || this.A == null){
    var arrayP = [];
    var arrayV = [];
    var arrayA = [];

    arrayP.push([]);
    arrayV.push([]);
    arrayA.push([]);

    for(var i=0 ; i<len ; i++){
      arrayP[0].push(this.particleList[i].position.x);
      arrayV[0].push(this.particleList[i].velocity.x);
      arrayA[0].push(this.particleList[i].acceleration.x);
    }

    for(var i=0 ; i<len ; i++){
      arrayP[0].push(this.particleList[i].position.y);
      arrayV[0].push(this.particleList[i].velocity.y);
      arrayA[0].push(this.particleList[i].acceleration.y);
    }

    for(var i=0 ; i<len ; i++){
      arrayP[0].push(this.particleList[i].position.z);
      arrayV[0].push(this.particleList[i].velocity.z);
      arrayA[0].push(this.particleList[i].acceleration.z);
    }

    this.P = Sushi.Matrix.fromArray(arrayP).t();
    this.V = Sushi.Matrix.fromArray(arrayV).t();
    this.A = Sushi.Matrix.fromArray(arrayA).t();

    if(this.dispMat === null){
      this.dispMat = this.P;
    }else{
      this.P.sub(this.dispMat);
    }

}





module.exports = E_ParticleSystem;

},{"../Matrix/sushi.js":4,"./E_DeformableMesh.js":5,"./E_Fabric2.js":6,"./E_FinitePlane.js":7,"./E_Particle.js":8,"./E_ParticleSource.js":9,"./E_SpringDamper.js":11}],11:[function(require,module,exports){
function E_SpringDamper(Mgr)
{
  THREE.Line.call(this);

  this.Manager = Mgr;
  this.geometry = new THREE.Geometry();
  this.geometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
  this.material = new THREE.LineBasicMaterial({color:0xaaaa00, linewidth:1});

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

E_SpringDamper.prototype.UpdateLineShape = function()
{
  //Update Line Shape
  this.geometry.verticesNeedUpdate = true;
  this.geometry.vertices[0] = this.objects[0].position.clone();
  this.geometry.vertices[1] = this.objects[1].position.clone();
}

E_SpringDamper.prototype.UpdateConnectivity = function()
{
  //Calculate The amount of Stretc
  // if(this.objects[0].parent == null || this.objects[1].parent == null){
  //   if(this.objects[0].parent == null){
  //     var idx = this.objects[1].connectedObject.indexOf(this.objects[0]);
  //     this.objects[1].connectedObject.splice(idx, 1);
  //   }else{
  //     var idx = this.objects[0].connectedObject.indexOf(this.objects[1]);
  //     this.objects[0].connectedObject.splice(idx, 1);
  //   }
  //
  //   this.Manager.ParticleSystem().remove(this);
  //   this.Manager.GetScene().remove(this);
  // }
}

E_SpringDamper.prototype.Update = function()
{

  this.UpdateConnectivity();
  this.UpdateLineShape();


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

  //this.material.color = new THREE.Color(1 - obj1Color.r - obj2Color.r, 1 - obj1Color.g - obj2Color.g, 1 - obj1Color.b - obj2Color.b);
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

},{}],12:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":13,"ieee754":14,"isarray":15}],13:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],14:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],15:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}]},{},[2]);
