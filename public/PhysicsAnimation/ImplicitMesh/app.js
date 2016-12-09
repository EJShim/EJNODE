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

  var m_gravity = new THREE.Vector3(0.0, -1.98, 0.0);

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
},{"buffer":37}],5:[function(require,module,exports){
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
var $M = require('milsushi2');

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
  //var connectivityMatrix = $M.jsa2mat(conMatrix);
  var mMatrix = Sushi.Matrix.fromArray(massMatrix);
  //var mMatrix = $M.jsa2mat(massMatrix);
  var kMatrix = Sushi.Matrix.fromArray(kMatrix);
  //var kMatrix = $M.jsa2mat(kMatrix);
  var cMatrix = Sushi.Matrix.fromArray(cMatrix);
  //var cMatrix = $M.jsa2mat(cMatrix);

  this.M = Sushi.Matrix.fromArray( massMatrix );
  //this.M = $M.jsa2mat( massMatrix );
   this.K = connectivityMatrix.clone().times(kValue);
  //this.K = $M.times(kValue, connectivityMatrix);
  this.C = connectivityMatrix.clone().times(cValue);
  //this.C = $M.times(cValue, connectivityMatrix);

  var timeStep = 1 / this.Manager.interval;
  var a0 = 1/(0.25 * Math.pow(timeStep, 2) );
  var a1 = 0.5/( 0.25 * timeStep );


  var KHat = this.K.clone().add( this.M.clone().times(a0) ).add(this.C.clone().times(a1));
  //var KHat = $M.plus($M.plus(this.K, $M.times(a0, this.M)), $M.times(a1, this.C));

  this.invK = KHat.clone().inverse();
  //this.invK = $M.uminus(KHat);
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
  //var eq1 = $M.mtimes(this.M, $M.plus($M.plus($M.times(a0, this.P), $M.times(a2, this.V)), $M.times(a3, this.A)) );

  var eq2 = Sushi.Matrix.mul(this.C ,  this.P.clone().times(a1).add( this.V.clone().times(a4) ).add( this.A.clone().times(a5) ) );
  //var eq2 = $M.mtimes(this.C ,  $M.plus($M.plus($M.times(a1, this.P), $M.times(a4, this.V)), $M.times(a5, this.A)) );

  var RHat = eq1.add(eq2);
  //var RHat = $M.plus(eq1, eq1);


  //Update Position
  var updateP = Sushi.Matrix.mul(this.invK, RHat);
  //var updateP = $M.mtimes(this.invK, RHat);

  //Update Acceleration
  var updateA =  updateP.clone().sub( this.P ).times(a0).sub( this.V.clone().times(a2) ).sub( this.A.clone().times(a3) );
  //var updateA =  $M.minus($M.minus($M.minus(updateP, $M.times(a0, this.P)), $M.times(a2, this.V) ), $M.times(a3, this.A));

  //Update Velocity
  var updateV = this.V.clone().add( this.A.clone().times(a6) ).add( updateA.clone().times(a7) );
  //var updateV = $M.plus($M.plus(this.V, $M.times(a6, this.A)), $M.times(a7, updateA));

  updateP.add(this.dispMat);
  //updateP = $M.plus(updateP, this.dispMat);

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




    for(var i=0 ; i<len ; i++){
      arrayP.push([]);
      arrayV.push([]);
      arrayA.push([]);

      arrayP[arrayP.length-1].push(this.particleList[i].position.x);
      arrayV[arrayV.length-1].push(this.particleList[i].velocity.x);
      arrayA[arrayA.length-1].push(this.particleList[i].acceleration.x);
    }

    for(var i=0 ; i<len ; i++){

      arrayP.push([]);
      arrayV.push([]);
      arrayA.push([]);

      arrayP[arrayP.length-1].push(this.particleList[i].position.y);
      arrayV[arrayV.length-1].push(this.particleList[i].velocity.y);
      arrayA[arrayA.length-1].push(this.particleList[i].acceleration.y);
    }

    for(var i=0 ; i<len ; i++){

      arrayP.push([]);
      arrayV.push([]);
      arrayA.push([]);

      arrayP[arrayP.length-1].push(this.particleList[i].position.z);
      arrayV[arrayV.length-1].push(this.particleList[i].velocity.z);
      arrayA[arrayA.length-1].push(this.particleList[i].acceleration.z);
    }

    this.P = Sushi.Matrix.fromArray(arrayP);
    //this.P = $M.jsa2mat(arrayP);
    this.V = Sushi.Matrix.fromArray(arrayV);
    //this.V = $M.jsa2mat(arrayV);
    this.A = Sushi.Matrix.fromArray(arrayA);
    //this.A = $M.jsa2mat(arrayA);

    if(this.dispMat === null){
      this.dispMat = this.P;
    }else{
      this.P.sub(this.dispMat);
      //this.P = $M.minus(this.P, this.dispMat);
    }

}

module.exports = E_ParticleSystem;

},{"../Matrix/sushi.js":4,"./E_DeformableMesh.js":5,"./E_Fabric2.js":6,"./E_FinitePlane.js":7,"./E_Particle.js":8,"./E_ParticleSource.js":9,"./E_SpringDamper.js":11,"milsushi2":13}],11:[function(require,module,exports){
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
(function (process,__filename){

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }
  opts.__proto__ = defaults

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? require.resolve(n) : require(n)
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

}).call(this,require('_process'),"/node_modules/bindings/bindings.js")
},{"_process":42,"fs":36,"path":41}],13:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Sushi = require('./src/sushi');
module.exports = Sushi;

},{"./src/sushi":33}],14:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
// overwrites binary arithmetic functions

var $M = require('../../sushi');
var util = require('../../util');
var util_cl = require('./util_cl');

(function () {
  var $CL = require('./driver');
  $M.CL = $CL;

  var Matrix = require('../../matrix');
  var MatrixCL = require('../matrix_cl');
  var WebCL = $M.CL.WebCL;
  var ctypes = util_cl.ctypes;
  var webcltypes = util_cl.webcltypes;

  var binary_arith_cl = function (A, B, name, operator) {
    var dst_klass = util.commonklass(A, B);
    if (dst_klass == 'logical') {
      dst_klass = 'single';
    }
    var left_type, right_type;
    var left_scalar = null, right_scalar = null;
    var left_isscalar = true, right_isscalar = true;
    var kernel_param_a, kernel_param_b;
    if (A instanceof Matrix) {
      if (A._numel == 1) {
        left_type = ctypes[dst_klass];
        left_scalar = A.get();
      } else {
        left_type = '__global ' + ctypes[A._klass] + ' *';
        kernel_param_a = { access: WebCL.MEM_READ_ONLY, datum: A };
        left_isscalar = false;
      }
    } else {
      left_type = ctypes[dst_klass];
      left_scalar = A;
    }
    if (left_isscalar) {
      kernel_param_a = { datum: MatrixCL.cast_scalar_val(left_scalar, dst_klass), type: webcltypes[dst_klass] };
    }

    if (B instanceof Matrix) {
      if (B._numel == 1) {
        right_type = ctypes[dst_klass];
        right_scalar = B.get();
      } else {
        right_type = '__global ' + ctypes[B._klass] + ' *';
        kernel_param_b = { access: WebCL.MEM_READ_ONLY, datum: B };
        right_isscalar = false;
      }
    } else {
      right_type = ctypes[dst_klass];
      right_scalar = B;
    }
    if (right_isscalar) {
      kernel_param_b = { datum: MatrixCL.cast_scalar_val(right_scalar, dst_klass), type: webcltypes[dst_klass] };
    }

    var kernel_name = 'binary_arith_cl_' + name + '_' + (left_isscalar || A._klass) + '_' + (right_isscalar || B._klass) + '_' + dst_klass;
    var kernel = MatrixCL.kernel_cache[kernel_name];
    if (!kernel) {
      kernel = $CL.createKernel([
        '#define LEFT_TYPE ' + left_type,
        '#define RIGHT_TYPE ' + right_type,
        '#define DST_TYPE ' + ctypes[dst_klass],
        '#define LEFT_ACCESS(i) ' + (left_isscalar ? 'a' : 'a[(i)]'),
        '#define RIGHT_ACCESS(i) ' + (right_isscalar ? 'b' : 'b[(i)]'),
        '#define OPERATOR(left, right) ' + operator,
        '__kernel void kernel_func(__global DST_TYPE *dst, LEFT_TYPE a, RIGHT_TYPE b, uint length) {',
        '  uint i = get_global_id(0);',
        '  if (i >= length) { return; }',
        '  dst[i] = (DST_TYPE)OPERATOR(LEFT_ACCESS(i), RIGHT_ACCESS(i));',
        '}'
      ].join('\n'));
      MatrixCL.kernel_cache[kernel_name] = kernel;
    }

    var dst_size;
    if (left_isscalar) {
      if (right_isscalar) {
        dst_size = [1, 1];
      } else {
        dst_size = B._size;
      }
    } else {
      dst_size = A._size;
      if (!right_isscalar) {
        // both matrix; size check
        if (!util.issamesize(A._size, B._size)) {
          throw new Error('Dimension mismatch');
        }
      }
    }

    var dst = new MatrixCL(dst_size, dst_klass);
    if (dst._numel > 0) {
      $CL.executeKernel(kernel, [
        { access: WebCL.MEM_WRITE_ONLY, datum: dst },
        kernel_param_a,
        kernel_param_b,
        { datum: dst._numel, type: WebCL.type.UINT }],
        dst._numel);
    }
    return dst;
  }

  var subsitute_binary_arith = function (name, operator) {
    var func_native = $M[name];
    var func_cl = function (A, B) {
      return binary_arith_cl(A, B, name, operator);
    };
    $M[name] = function (A, B) {
      var ret = $M.autodestruct(function () {
        return util_cl.unify_call(func_native, func_cl, A, B);
      });
      return ret;
    };
  }
  subsitute_binary_arith('plus', '((left) + (right))');
  subsitute_binary_arith('minus', '((left) - (right))');
  subsitute_binary_arith('times', '((left) * (right))');
  subsitute_binary_arith('rdivide', '((left) / (right))');
  subsitute_binary_arith('ldivide', '((right) / (left))');
  subsitute_binary_arith('power', '(pow((float)(left), (float)(right)))');
  $M.CL._max_elementwise_cl = function (A, B) {
    return binary_arith_cl(A, B, 'max_elementwise_cl', '(((left) > (right)) ? (left) : (right))');
  };
  $M.CL._min_elementwise_cl = function (A, B) {
    return binary_arith_cl(A, B, 'min_elementwise_cl', '(((left) < (right)) ? (left) : (right))');
  };


  var compare_cl = function (A, B, name, operator) {
    var dst_klass = util.commonklass(A, B);
    var left_type, right_type;
    var left_scalar = null, right_scalar = null;
    var left_isscalar = true, right_isscalar = true;
    var kernel_param_a, kernel_param_b;
    if (A instanceof Matrix) {
      if (A._numel == 1) {
        left_type = ctypes[dst_klass];
        left_scalar = A.get();
      } else {
        left_type = '__global ' + ctypes[A._klass] + ' *';
        kernel_param_a = { access: WebCL.MEM_READ_ONLY, datum: A };
        left_isscalar = false;
      }
    } else {
      left_type = ctypes[dst_klass];
      left_scalar = A;
    }
    if (left_isscalar) {
      kernel_param_a = { datum: MatrixCL.cast_scalar_val(left_scalar, dst_klass), type: webcltypes[dst_klass] };
    }

    if (B instanceof Matrix) {
      if (B._numel == 1) {
        right_type = ctypes[dst_klass];
        right_scalar = B.get();
      } else {
        right_type = '__global ' + ctypes[B._klass] + ' *';
        kernel_param_b = { access: WebCL.MEM_READ_ONLY, datum: B };
        right_isscalar = false;
      }
    } else {
      right_type = ctypes[dst_klass];
      right_scalar = B;
    }
    if (right_isscalar) {
      kernel_param_b = { datum: MatrixCL.cast_scalar_val(right_scalar, dst_klass), type: webcltypes[dst_klass] };
    }

    var kernel_name = 'compare_cl_' + name + '_' + (left_isscalar || A._klass) + '_' + (right_isscalar || B._klass);
    var kernel = MatrixCL.kernel_cache[kernel_name];
    if (!kernel) {
      kernel = $CL.createKernel([
        '#define LEFT_TYPE ' + left_type,
        '#define RIGHT_TYPE ' + right_type,
        '#define LEFT_ACCESS(i) ' + (left_isscalar ? 'a' : 'a[(i)]'),
        '#define RIGHT_ACCESS(i) ' + (right_isscalar ? 'b' : 'b[(i)]'),
        '#define OPERATOR(left, right) ' + operator,
        '__kernel void kernel_func(__global uchar *dst, LEFT_TYPE a, RIGHT_TYPE b, uint length) {',
        '  uint i = get_global_id(0);',
        '  if (i >= length) { return; }',
        '  dst[i] = OPERATOR(LEFT_ACCESS(i), RIGHT_ACCESS(i));',
        '}'
      ].join('\n'));
      MatrixCL.kernel_cache[kernel_name] = kernel;
    }

    var dst_size;
    if (left_isscalar) {
      if (right_isscalar) {
        dst_size = [1, 1];
      } else {
        dst_size = B._size;
      }
    } else {
      dst_size = A._size;
      if (!right_isscalar) {
        // both matrix; size check
        if (!util.issamesize(A._size, B._size)) {
          throw new Error('Dimension mismatch');
        }
      }
    }

    var dst = new MatrixCL(dst_size, 'logical');
    if (dst._numel > 0) {
      $CL.executeKernel(kernel, [
        { access: WebCL.MEM_WRITE_ONLY, datum: dst },
        kernel_param_a,
        kernel_param_b,
        { datum: dst._numel, type: WebCL.type.UINT }],
        dst._numel);
    }
    return dst;
  };

  var subsitute_compare = function (name, operator) {
    var func_native = $M[name];
    var func_cl = function (A, B) {
      return compare_cl(A, B, name, operator);
    };
    $M[name] = function (A, B) {
      var ret = $M.autodestruct(function () {
        return util_cl.unify_call(func_native, func_cl, A, B);
      });
      return ret;
    };
  };

  subsitute_compare('eq', '((left) == (right))');
  subsitute_compare('ge', '((left) >= (right))');
  subsitute_compare('gt', '((left) > (right))');
  subsitute_compare('le', '((left) <= (right))');
  subsitute_compare('lt', '((left) < (right))');
  subsitute_compare('ne', '((left) != (right))');

  var isequal_cl_both = function (mats, nan_equal) {
    var A = mats[0];
    var eqmat = new MatrixCL([1, 1], 'logical');
    eqmat.set(1, 0);
    for (var i = 1; i < mats.length; i++) {
      var B = mats[i];
      if (!util.issamesize(A._size, B._size)) {
        return false;
      }

      var kernel_name = 'isequal_cl_' + A._klass + '_' + B._klass + '_' + nan_equal;
      var kernel = MatrixCL.kernel_cache[kernel_name];
      if (!kernel) {
        var condition = 'aval != bval';
        if (nan_equal) {
          if (A._klass === 'single' && B._klass === 'single') {
            condition += '&& !(isnan(aval) && isnan(bval))';//become false if both is nan
          }
        }

        kernel = $CL.createKernel([
          '#define LEFT_TYPE ' + ctypes[A._klass],
          '#define RIGHT_TYPE ' + ctypes[B._klass],
          '__kernel void kernel_func(__global uchar *dst, __global LEFT_TYPE *a, __global RIGHT_TYPE *b, uint length) {',
          '  uint i = get_global_id(0);',
          '  if (i >= length) { return; }',
          '  LEFT_TYPE aval = a[i];',
          '  RIGHT_TYPE bval = b[i];',
          '  if (' + condition + ') {*dst = 1;}',
          '}'
        ].join('\n'));
        MatrixCL.kernel_cache[kernel_name] = kernel;
      }

      if (A._numel > 0) {
        $CL.executeKernel(kernel, [
          { access: WebCL.MEM_WRITE_ONLY, datum: eqmat },
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { access: WebCL.MEM_READ_ONLY, datum: B },
          { datum: A._numel, type: WebCL.type.UINT }],
          A._numel);
      }
      if (eqmat.get()) {
        //non-equal value found
        return false;
      }
    }
    return true;
  };

  var isequal_cl = function () {
    return isequal_cl_both(arguments, false);
  };

  var isequaln_cl = function () {
    return isequal_cl_both(arguments, true);
  }

  var isequal_native = $M.isequal;
  $M.isequal = function () {
    var mats = arguments;//variable length input
    var ret = $M.autodestruct(function () {
      // Array.concat does not work on array-like (arguments)
      var unify_call_args = [isequal_native, isequal_cl];
      Array.prototype.push.apply(unify_call_args, mats);
      return util_cl.unify_call.apply(null, unify_call_args);
    });
    return ret;
  };
  
  var isequaln_native = $M.isequaln;
  $M.isequaln = function () {
    var mats = arguments;
    var ret = $M.autodestruct(function () {
      var unify_call_args = [isequaln_native, isequaln_cl];
      Array.prototype.push.apply(unify_call_args, mats);
      return util_cl.unify_call.apply(null, unify_call_args);
    });
    return ret;
  };

})();

},{"../../matrix":29,"../../sushi":33,"../../util":34,"../matrix_cl":24,"./driver":16,"./util_cl":23}],15:[function(require,module,exports){
'use strict';
/* ************************************************************************
 * This is the JavaScript porting of sgemm code in clBLAS.
 * Ported by Machine Intelligence Laboratory (The University of Tokyo)
 * Original license is the following:
 * Copyright 2013 Advanced Micro Devices, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ************************************************************************/

(function () {
  var $M = require('../../sushi');
  var util = require('../../util');
  var util_cl = require('./util_cl');
  var $CL = require('./driver');
  $M.CL = $CL;

  var Matrix = require('../../matrix');
  var MatrixCL = require('../matrix_cl');
  var WebCL = $M.CL.WebCL;
  var ctypes = util_cl.ctypes;
  var webcltypes = util_cl.webcltypes;

  var select_macroTileNumRowsCols = function (m, n) {
    var size_limits = [4000, 2448, 1600, 1008, 960, 896, 864, 784, 768, 720, 464, 304, 0];
    var fallback = [96, 96, 96, 96, 32, 32, 32, 32, 32, 32, 48, 32, 16];
    var divisors = [[96],//4000
      [96],//2448
      [96, 64, 80],//1600
      [96, 64, 80, 48],//1008
      [64, 48, 80, 32],//960
      [64, 96, 48, 80, 32],//896
      [96, 48, 80, 64, 32],//864
      [48, 80, 64, 32, 16],//784
      [48, 80, 64, 32, 16],//768
      [64, 80, 96, 48],//720
      [48, 64, 32, 80],//464
      [48, 32, 16],//304
      [16]];//0
    
    for (var index = 0; index < size_limits.length; index++) {
      var size_limit = size_limits[index];
      if (m * n < size_limit * size_limit) {
        continue;
      }
      var divisor = divisors[index];
      for (var j = 0; j < divisor.length; j++) {
        var div = divisor[j];
        if (m % div == 0 && n % div == 0) {
          return div;
        }
      }

      return fallback[index];
    }

    return 16;//not reachable
  }

  var sgemm = function (transa, transb, m, n, k, alpha, A, ldA, B, ldB, beta, C, ldC, offsetA, offsetB, offsetC) {
    //console.log('sgemm ' + transa + transb + ',' + m + ',' + n + ',' + k);
    offsetA = offsetA | 0;
    offsetB = offsetB | 0;
    offsetC = offsetC | 0;
    var betazero = '1';
    var caccess = WebCL.MEM_READ_WRITE;
    if (beta == 0) {
      betazero = '0';
      caccess = WebCL.MEM_WRITE_ONLY;
    }
    var workGroupNumRows = 16, workGroupNumCols = 16;
    var macroTileNumRowsCols = select_macroTileNumRowsCols(m, n);
    var unroll = 1;
    if (k % 16 == 0) {
      unroll = 16;
    } else if (k % 8 == 0) {
      unroll = 8;
    }
    if (macroTileNumRowsCols == 96 && unroll == 16) {
      unroll = 8;//the combination very slow on S9170 GPU
    }

    var macroTileNumRows = macroTileNumRowsCols, macroTileNumCols = macroTileNumRowsCols;
    var globalWorkSizeRows = Math.floor(m / macroTileNumRows) * workGroupNumRows;
    var globalWorkSizeCols = Math.floor(n / macroTileNumCols) * workGroupNumCols;
    if (globalWorkSizeRows > 0 && globalWorkSizeCols > 0) {
      //console.log('sgemm_Row_' + transa + transb + '_B' + betazero + '_MX' + macroTileNumRows + '_NX' + macroTileNumCols + '_KX' + unroll);
      var kernel_tile = getgemmkernel('sgemm_Col_' + transa + transb + '_B' + betazero + '_MX' + macroTileNumRows + '_NX' + macroTileNumCols + '_KX' + unroll);
      $CL.executeKernel(
        kernel_tile,
        [
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { access: WebCL.MEM_READ_ONLY, datum: B },
          { access: caccess, datum: C },
          { datum: alpha, type: WebCL.type.FLOAT },//alpha
          { datum: beta, type: WebCL.type.FLOAT },//beta=0
          { datum: m, type: WebCL.type.UINT },//M
          { datum: n, type: WebCL.type.UINT },//N
          { datum: k, type: WebCL.type.UINT },//K
          { datum: ldA, type: WebCL.type.UINT },//lda
          { datum: ldB, type: WebCL.type.UINT },//ldb
          { datum: ldC, type: WebCL.type.UINT },//ldc
          { datum: offsetA, type: WebCL.type.UINT },//offseta
          { datum: offsetB, type: WebCL.type.UINT },//offsetb
          { datum: offsetC, type: WebCL.type.UINT },//offsetc
        ],
        [globalWorkSizeRows, globalWorkSizeCols],
        [workGroupNumRows, workGroupNumCols]
        );
    }
    if (m % macroTileNumRows != 0 && globalWorkSizeCols > 0) {
      var kernel_row = getgemmkernel('sgemm_Col_' + transa + transb + '_B' + betazero + '_ML' + macroTileNumRows + '_NX' + macroTileNumCols + '_KX' + unroll);
      $CL.executeKernel(
        kernel_row,
        [
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { access: WebCL.MEM_READ_ONLY, datum: B },
          { access: caccess, datum: C },
          { datum: alpha, type: WebCL.type.FLOAT },//alpha
          { datum: beta, type: WebCL.type.FLOAT },//beta=0
          { datum: m, type: WebCL.type.UINT },//M
          { datum: n, type: WebCL.type.UINT },//N
          { datum: k, type: WebCL.type.UINT },//K
          { datum: ldA, type: WebCL.type.UINT },//lda
          { datum: ldB, type: WebCL.type.UINT },//ldb
          { datum: ldC, type: WebCL.type.UINT },//ldc
          { datum: offsetA, type: WebCL.type.UINT },//offseta
          { datum: offsetB, type: WebCL.type.UINT },//offsetb
          { datum: offsetC, type: WebCL.type.UINT },//offsetc
        ],
        [workGroupNumRows, globalWorkSizeCols],
        [workGroupNumRows, workGroupNumCols]
        );
    }

    if (globalWorkSizeRows > 0 && n % macroTileNumCols != 0) {
      var kernel_col = getgemmkernel('sgemm_Col_' + transa + transb + '_B' + betazero + '_MX' + macroTileNumRows + '_NL' + macroTileNumCols + '_KX' + unroll);
      $CL.executeKernel(
        kernel_col,
        [
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { access: WebCL.MEM_READ_ONLY, datum: B },
          { access: caccess, datum: C },
          { datum: alpha, type: WebCL.type.FLOAT },//alpha
          { datum: beta, type: WebCL.type.FLOAT },//beta=0
          { datum: m, type: WebCL.type.UINT },//M
          { datum: n, type: WebCL.type.UINT },//N
          { datum: k, type: WebCL.type.UINT },//K
          { datum: ldA, type: WebCL.type.UINT },//lda
          { datum: ldB, type: WebCL.type.UINT },//ldb
          { datum: ldC, type: WebCL.type.UINT },//ldc
          { datum: offsetA, type: WebCL.type.UINT },//offseta
          { datum: offsetB, type: WebCL.type.UINT },//offsetb
          { datum: offsetC, type: WebCL.type.UINT },//offsetc
        ],
        [globalWorkSizeRows, workGroupNumCols],
        [workGroupNumRows, workGroupNumCols]
        );
    }
    if ((m % macroTileNumRows != 0) && (n % macroTileNumCols != 0)) {
      var kernel_corner = getgemmkernel('sgemm_Col_' + transa + transb + '_B' + betazero + '_ML' + macroTileNumRows + '_NL' + macroTileNumCols + '_KX' + unroll);
      $CL.executeKernel(
        kernel_corner,
        [
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { access: WebCL.MEM_READ_ONLY, datum: B },
          { access: caccess, datum: C },
          { datum: alpha, type: WebCL.type.FLOAT },//alpha
          { datum: beta, type: WebCL.type.FLOAT },//beta=0
          { datum: m, type: WebCL.type.UINT },//M
          { datum: n, type: WebCL.type.UINT },//N
          { datum: k, type: WebCL.type.UINT },//K
          { datum: ldA, type: WebCL.type.UINT },//lda
          { datum: ldB, type: WebCL.type.UINT },//ldb
          { datum: ldC, type: WebCL.type.UINT },//ldc
          { datum: offsetA, type: WebCL.type.UINT },//offseta
          { datum: offsetB, type: WebCL.type.UINT },//offsetb
          { datum: offsetC, type: WebCL.type.UINT },//offsetc
        ],
        [workGroupNumRows, workGroupNumCols],
        [workGroupNumRows, workGroupNumCols]
        );
    }
  };

  $M.CL.sgemm = sgemm;

  var mtimes_native = $M.mtimes;
  var mtimes_cl = function (A, B) {
    if (A._ndims != 2 || B._ndims != 2) {
      throw new Error('Matrix must be two-dimensional');
    }
    if (A._size[1] != B._size[0]) {
      throw new Error('Shape mismatch');
    }
    if (A._klass != 'single' || B._klass != 'single') {
      throw new Error('Matrix klass must be single');
    }
    var m = A._size[0], n = B._size[1], k = A._size[1];
    var C = new MatrixCL([m, n], 'single');
    var lda = A._strides[1];
    var ldb = B._strides[1];
    var ldc = C._strides[1];
    sgemm('N', 'N', m, n, k, 1.0, A, lda, B, ldb, 0.0, C, ldc);
    return C;
  };

  $M.mtimes = function (A, B) {
    return $M.autodestruct(function () {
      return util_cl.unify_call(mtimes_native, mtimes_cl, A, B);
    });
  };

  var getgemmkernel = function () {
    var kernels = {};

    var KernelParameters = function (name) {
      this.name = name;//cgemm_Col_CC_B0_ML080_NL080_KX08
      var items = name.split('_');
      this.precision = items[0].substr(0, 1);
      this.microTileNumRows = parseInt(items[4].substr(2), 10) / this.workGroupNumRows;
      this.microTileNumCols = parseInt(items[5].substr(2), 10) / this.workGroupNumCols;
      this.unroll = parseInt(items[6].substr(2), 10);
      this.localRowPad = 0;
      this.localColPad = 0;
      this.order = items[1] == 'Col' ? 'clblasColumnMajor' : 'clblasRowMajor';
      this.transA = items[2].substr(0, 1);
      this.transB = items[2].substr(1, 1);
      this.beta = parseInt(items[3].substr(1, 1), 10);
      this._isRowKernel = items[4].substr(1, 1) == 'L';
      this._isColKernel = items[5].substr(1, 1) == 'L';
    };

    KernelParameters.prototype.workGroupNumRows = 16;
    KernelParameters.prototype.workGroupNumCols = 16;

    KernelParameters.prototype.isValid = function () {
      return true;
    };

    KernelParameters.prototype.getName = function () {
      return this.name;
    };

    KernelParameters.prototype.isRowKernel = function () {
      return this._isRowKernel;
    };

    KernelParameters.prototype.isColKernel = function () {
      return this._isColKernel;
    };

    var Common = {};
    Common.hostDataChar = { "s": "s", "d": "d", "c": "c", "z": "z" };
    Common.hostDataType = { "s": "float", "d": "double", "c": "float2", "z": "double2" };
    Common.openclDataType = { "s": "float", "d": "double", "c": "float2", "z": "double2" };

    Common.precisionInt = { "s": 0, "d": 1, "c": 2, "z": 3 };
    Common.orderInt = { "clblasRowMajor": 0, "clblasColumnMajor": 1 };
    Common.transposeInt = { "N": 0, "T": 1, "C": 2 };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Make OpenCL Kernel String
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function makeOpenCLKernelString(kernel) {
      //var endLine = "\\n\"\n\"";
      var endLine = "\n";

      ////////////////////////////////////////////////////////////////////////
      // parameters valid?
      if (kernel.isValid() == false) {
        return kernel.getName() + " invalid";
      }

      ////////////////////////////////////////////////////////////////////////
      // initializations
      var kStr = "";
      kStr += endLine;
      kStr += "/* " + kernel.getName() + " */";
      kStr += endLine;

      ////////////////////////////////////////////////////////////////////////
      // Double precision pragma
      var prec = kernel.precision;
      if (prec == "d" || prec == "z") {
        kStr += endLine;
        kStr += "//pragma OPENCL EXTENSION cl_khr_fp64 : enable" + endLine;
      }

      ////////////////////////////////////////////////////////////////////////
      // kernel parameters
      kStr += endLine;
      kStr += "/* kernel parameters */" + endLine;
      //if kernel.order == "clblasColumnMajor":
      //  kStr += "#define COLUMN_MAJOR          1" + endLine
      //else:
      //  kStr += "#define COLUMN_MAJOR          0" + endLine
      //if kernel.transA == "T":
      //  kStr += "#define TRANSPOSE_A           1" + endLine
      //else:
      //  kStr += "#define TRANSPOSE_A           0" + endLine
      //if kernel.transB == "T":
      //  kStr += "#define TRANSPOSE_B           1" + endLine
      //else:
      //  kStr += "#define TRANSPOSE_B           0" + endLine
      //kStr += "" + endLine
      kStr += "#define WG_NUM_ROWS          " + (kernel.workGroupNumRows + endLine);
      kStr += "#define WG_NUM_COLS          " + (kernel.workGroupNumCols + endLine);
      kStr += "#define MICRO_TILE_NUM_ROWS  " + (kernel.microTileNumRows + endLine);
      kStr += "#define MICRO_TILE_NUM_COLS  " + (kernel.microTileNumCols + endLine);
      kStr += "#define MACRO_TILE_NUM_ROWS  " + ((kernel.workGroupNumRows * kernel.microTileNumRows) + endLine);
      kStr += "#define MACRO_TILE_NUM_COLS  " + ((kernel.workGroupNumCols * kernel.microTileNumCols) + endLine);
      kStr += "#define NUM_UNROLL_ITER      " + (kernel.unroll + endLine);
      kStr += "" + endLine;
      kStr += "#define LOCAL_ROW_PAD        " + (kernel.localRowPad + endLine);
      kStr += "#define LOCAL_COL_PAD        " + (kernel.localColPad + endLine);

      ////////////////////////////////////////////////////////////////////////
      // global memory indices
      // A
      kStr += endLine;
      kStr += "/* global memory indices */" + endLine;
      if ((kernel.order == "clblasColumnMajor") == (kernel.transA == "N")) {
        kStr += "#define GET_GLOBAL_INDEX_A(ROW,COL) ((COL)*lda+(ROW))" + endLine;
      } else {
        kStr += "#define GET_GLOBAL_INDEX_A(ROW,COL) ((ROW)*lda+(COL))" + endLine;
      }
      // B
      if ((kernel.order == "clblasColumnMajor") == (kernel.transB == "N")) {
        kStr += "#define GET_GLOBAL_INDEX_B(ROW,COL) ((COL)*ldb+(ROW))" + endLine;
      } else {
        kStr += "#define GET_GLOBAL_INDEX_B(ROW,COL) ((ROW)*ldb+(COL))" + endLine;
      }
      // C
      if (kernel.order == "clblasColumnMajor") {
        kStr += "#define GET_GLOBAL_INDEX_C(ROW,COL) ((COL)*ldc+(ROW))" + endLine;
      } else {
        kStr += "#define GET_GLOBAL_INDEX_C(ROW,COL) ((ROW)*ldc+(COL))" + endLine;
      }

      ////////////////////////////////////////////////////////////////////////
      // local memory indices
      // A
      kStr += endLine;
      kStr += "/* local memory indices */" + endLine;
      kStr += "#define GET_LOCAL_INDEX_A(ROW,COL) ((ROW) + (COL)*((MACRO_TILE_NUM_ROWS)+(LOCAL_COL_PAD)) )" + endLine;
      // B
      kStr += "#define GET_LOCAL_INDEX_B(ROW,COL) ((COL) + (ROW)*((MACRO_TILE_NUM_COLS)+(LOCAL_ROW_PAD)) )" + endLine;

      ////////////////////////////////////////////////////////////////////////
      // data types
      kStr += endLine;
      kStr += "/* data types */" + endLine;
      kStr += "#define DATA_TYPE_STR " + (Common.openclDataType[kernel.precision] + endLine);
      if (kernel.precision == "s" || kernel.precision == "d") {
        // real arithmetic
        kStr += "#define TYPE_MAD(MULA,MULB,DST) DST = mad(MULA,MULB,DST);" + endLine;
        if (kernel.beta == 1) {
          kStr += "#define TYPE_MAD_WRITE(DST,ALPHA,REG,BETA) DST = (ALPHA)*(REG) + (BETA)*(DST);" + endLine;
        } else {
          kStr += "#define TYPE_MAD_WRITE(DST,ALPHA,REG,BETA) DST = (ALPHA)*(REG);" + endLine;
        }
      } else {
        // complex arithmetic
        if (kernel.transA != "C" && kernel.transB != "C") {
          // neither conjugate
          kStr += (
            "#define TYPE_MAD(MULA,MULB,DST) \\" + endLine +
            "  DST.s0 = mad(  MULA.s0, MULB.s0, DST.s0 ); \\" + endLine +
            "  DST.s0 = mad( -MULA.s1, MULB.s1, DST.s0 ); \\" + endLine +
            "  DST.s1 = mad(  MULA.s0, MULB.s1, DST.s1 ); \\" + endLine +
            "  DST.s1 = mad(  MULA.s1, MULB.s0, DST.s1 );" + endLine);
        } else if (kernel.transA == "C" && kernel.transB != "C") {
          // A conjugate (negate imaginary A.s1)
          kStr += (
            "#define TYPE_MAD(MULA,MULB,DST) \\" + endLine +
            "  DST.s0 = mad(  MULA.s0, MULB.s0, DST.s0 ); \\" + endLine +
            "  DST.s0 = mad(  MULA.s1, MULB.s1, DST.s0 ); \\" + endLine +
            "  DST.s1 = mad(  MULA.s0, MULB.s1, DST.s1 ); \\" + endLine +
            "  DST.s1 = mad( -MULA.s1, MULB.s0, DST.s1 );" + endLine);
        } else if (kernel.transA != "C" && kernel.transB == "C") {
          // B conjugate (negate imaginary B.s1)
          kStr += (
            "#define TYPE_MAD(MULA,MULB,DST) \\" + endLine +
            "  DST.s0 = mad(  MULA.s0,  MULB.s0, DST.s0 ); \\" + endLine +
            "  DST.s0 = mad( -MULA.s1, -MULB.s1, DST.s0 ); \\" + endLine +
            "  DST.s1 = mad(  MULA.s0, -MULB.s1, DST.s1 ); \\" + endLine +
            "  DST.s1 = mad(  MULA.s1,  MULB.s0, DST.s1 );" + endLine);
        } else {
          // A & B conjugate (negate imaginary .s1)
          kStr += (
            "#define TYPE_MAD(MULA,MULB,DST) \\" + endLine +
            "  DST.s0 = mad(  MULA.s0,  MULB.s0, DST.s0 ); \\" + endLine +
            "  DST.s0 = mad(  MULA.s1, -MULB.s1, DST.s0 ); \\" + endLine +
            "  DST.s1 = mad(  MULA.s0, -MULB.s1, DST.s1 ); \\" + endLine +
            "  DST.s1 = mad( -MULA.s1,  MULB.s0, DST.s1 );" + endLine);
        }
        if (kernel.beta == 1) {
          kStr += (
            "#define TYPE_MAD_WRITE( DST, ALPHA, REG, BETA ) \\" + endLine +
            "  /* (1) */ \\" + endLine +
            "  type_mad_tmp = REG.s0; \\" + endLine +
            "  REG.s0 *= ALPHA.s0; \\" + endLine +
            "  REG.s0 = mad( -ALPHA.s1, REG.s1, REG.s0 ); \\" + endLine +
            "  REG.s1 *= ALPHA.s0; \\" + endLine +
            "  REG.s1 = mad(  ALPHA.s1, type_mad_tmp, REG.s1 ); \\" + endLine +
            "  /* (2) */ \\" + endLine +
            "  REG.s0 = mad(  BETA.s0, DST.s0, REG.s0 ); \\" + endLine +
            "  REG.s0 = mad( -BETA.s1, DST.s1, REG.s0 ); \\" + endLine +
            "  REG.s1 = mad(  BETA.s1, DST.s0, REG.s1 ); \\" + endLine +
            "  REG.s1 = mad(  BETA.s0, DST.s1, REG.s1 ); \\" + endLine +
            "  /* (3) */ \\" + endLine +
            "  DST = REG;" + endLine);
        } else {
          kStr += (
            "#define TYPE_MAD_WRITE( DST, ALPHA, REG, BETA ) \\" + endLine +
            "  /* (1) */ \\" + endLine +
            "  type_mad_tmp = REG.s0; \\" + endLine +
            "  REG.s0 *= ALPHA.s0; \\" + endLine +
            "  REG.s0 = mad( -ALPHA.s1, REG.s1, REG.s0 ); \\" + endLine +
            "  REG.s1 *= ALPHA.s0; \\" + endLine +
            "  REG.s1 = mad(  ALPHA.s1, type_mad_tmp, REG.s1 ); \\" + endLine +
            "  /* (2) */ \\" + endLine +
            "  REG.s0 = mad(  BETA.s0, DST.s0, REG.s0 ); \\" + endLine +
            "  REG.s0 = mad( -BETA.s1, DST.s1, REG.s0 ); \\" + endLine +
            "  REG.s1 = mad(  BETA.s1, DST.s0, REG.s1 ); \\" + endLine +
            "  REG.s1 = mad(  BETA.s0, DST.s1, REG.s1 ); \\" + endLine +
            "  /* (3) */ \\" + endLine +
            "  DST = REG;" + endLine);
        }
      }

      ////////////////////////////////////////////////////////////////////////
      // micro-tile
      kStr += endLine;
      kStr += "/* " + kernel.microTileNumRows + "x" + kernel.microTileNumCols + " micro-tile */" + endLine;
      kStr += "#define MICRO_TILE \\" + endLine;
      for (var a = 0; a < kernel.microTileNumRows; a++) {
        kStr += "  rA[" + a + "] = localA[offA + " + a + "*WG_NUM_ROWS]; \\" + endLine;
      }
      for (var b = 0; b < kernel.microTileNumCols; b++) {
        kStr += "  rB[" + b + "] = localB[offB + " + b + "*WG_NUM_COLS]; \\" + endLine;
      }
      kStr += "  offA += (MACRO_TILE_NUM_ROWS+LOCAL_COL_PAD); \\" + endLine;
      kStr += "  offB += (MACRO_TILE_NUM_COLS+LOCAL_ROW_PAD); \\" + endLine;
      for (var a = 0; a < kernel.microTileNumRows; a++) {
        for (var b = 0; b < kernel.microTileNumCols; b++) {
          kStr += "  TYPE_MAD(rA[" + a + "],rB[" + b + "],rC[" + a + "][" + b + "]); \\" + endLine;

        }
      }
      kStr += "  mem_fence(CLK_LOCAL_MEM_FENCE);" + endLine;
      kStr += endLine;

      ////////////////////////////////////////////////////////////////////////
      // function signature
      ////////////////////////////////////////////////////////////////////////
      kStr += "__attribute__((reqd_work_group_size(WG_NUM_COLS,WG_NUM_ROWS,1)))" + endLine;
      kStr += "__kernel void kernel_func"// + ( kernel.getName() ) // for sushi_cl function name restriction
      kStr += "(" + endLine;
      // arguments
      kStr += (
        "  __global DATA_TYPE_STR const * restrict A," + endLine +
        "  __global DATA_TYPE_STR const * restrict B," + endLine +
        "  __global DATA_TYPE_STR       *          C," + endLine +
        "  DATA_TYPE_STR const alpha," + endLine +
        "  DATA_TYPE_STR const beta," + endLine +
        "  uint const M," + endLine +
        "  uint const N," + endLine +
        "  uint const K," + endLine +
        "  uint const lda," + endLine +
        "  uint const ldb," + endLine +
        "  uint const ldc," + endLine +
        "  uint const offsetA," + endLine +
        "  uint const offsetB," + endLine +
        "  uint const offsetC" + endLine +
        ") {" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // apply offsets
      kStr += endLine;
      kStr += (
        "  /* apply offsets */" + endLine +
        "  A += offsetA;" + endLine +
        "  B += offsetB;" + endLine +
        "  C += offsetC;" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // allocate registers
      kStr += endLine;
      kStr += (
        "  /* allocate registers */" + endLine +
        "  DATA_TYPE_STR rC[MICRO_TILE_NUM_ROWS][MICRO_TILE_NUM_COLS] = { {0} };" + endLine +
        "  DATA_TYPE_STR rA[MICRO_TILE_NUM_ROWS];" + endLine +
        "  DATA_TYPE_STR rB[MICRO_TILE_NUM_COLS];" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // allocate local memory
      kStr += endLine;
      kStr += (
        "  /* allocate local memory */" + endLine +
        "  __local DATA_TYPE_STR localA[NUM_UNROLL_ITER*(MACRO_TILE_NUM_ROWS+LOCAL_COL_PAD)];" + endLine +
        "  __local DATA_TYPE_STR localB[NUM_UNROLL_ITER*(MACRO_TILE_NUM_COLS+LOCAL_ROW_PAD)];" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // work item indices
      kStr += endLine;
      kStr += "  /* work item indices */" + endLine;
      if (kernel.isRowKernel()) {
        kStr += "  uint groupRow = M / " + (kernel.workGroupNumRows * kernel.microTileNumRows) + "; // last row" + endLine;
      } else {
        kStr += "  uint groupRow = get_group_id(0);" + endLine;
      }
      if (kernel.isColKernel()) {
        kStr += "  uint groupCol = N / " + (kernel.workGroupNumCols * kernel.microTileNumCols) + "; // last column" + endLine;
      } else {
        kStr += "  uint groupCol = get_group_id(1);" + endLine;
      }

      ////////////////////////////////////////////////////////////////////////
      // z-order - TODO doesn't improve caching, only lowers occupancy
      if (false) {
        kStr += (
          "  // convert work-group order to z-order" + endLine +
          "  unsigned int morton = get_group_id(1) * get_num_groups(0) + get_group_id(0);" + endLine +
          "  groupRow = morton;" + endLine +
          "  groupCol = ( groupRow >> 1 );" + endLine +
          "  groupRow &= 0x55555555;" + endLine +
          "  groupCol &= 0x55555555;" + endLine +
          "  groupRow |= ( groupRow >> 1 );" + endLine +
          "  groupCol |= ( groupCol >> 1 );" + endLine +
          "  groupRow &= 0x33333333;" + endLine +
          "  groupCol &= 0x33333333;" + endLine +
          "  groupRow |= ( groupRow >> 2 );" + endLine +
          "  groupCol |= ( groupCol >> 2 );" + endLine +
          "  groupRow &= 0x0f0f0f0f;" + endLine +
          "  groupCol &= 0x0f0f0f0f;" + endLine +
          "  groupRow |= ( groupRow >> 4 );" + endLine +
          "  groupCol |= ( groupCol >> 4 );" + endLine +
          "  groupRow &= 0x00ff00ff;" + endLine +
          "  groupCol &= 0x00ff00ff;" + endLine +
          "  groupRow |= ( groupRow >> 8 );" + endLine +
          "  groupCol |= ( groupCol >> 8 );" + endLine +
          "  groupRow &= 0x0000ffff;" + endLine +
          "  groupCol &= 0x0000ffff;" + endLine + endLine
          );
      }

      kStr += (
        "  uint localRow = get_local_id(0);" + endLine +
        "  uint localCol = get_local_id(1);" + endLine +
        "  uint localSerial = localRow + localCol*WG_NUM_ROWS;" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // global indices being loaded
      kStr += endLine;
      kStr += "  /* global indices being loaded */" + endLine;
      if ((kernel.order == "clblasColumnMajor") == (kernel.transA == "N")) {
        kStr += (
          "#define globalARow(LID) (groupRow*MACRO_TILE_NUM_ROWS + (localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)%MACRO_TILE_NUM_ROWS)" + endLine +
          "#define globalACol(LID) ((localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)/MACRO_TILE_NUM_ROWS)" + endLine);
      } else {
        kStr += (
          "#define globalARow(LID) (groupRow*MACRO_TILE_NUM_ROWS + (localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)/NUM_UNROLL_ITER)" + endLine +
          "#define globalACol(LID) ((localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)%NUM_UNROLL_ITER)" + endLine);
      }
      if ((kernel.order == "clblasColumnMajor") == (kernel.transB == "N")) {
        kStr += (
          "#define globalBRow(LID) ((localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)%NUM_UNROLL_ITER)" + endLine +
          "#define globalBCol(LID) (groupCol*MACRO_TILE_NUM_COLS + (localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)/NUM_UNROLL_ITER)" + endLine);
      } else {
        kStr += (
          "#define globalBRow(LID) ((localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)/MACRO_TILE_NUM_COLS)" + endLine +
          "#define globalBCol(LID) (groupCol*MACRO_TILE_NUM_COLS + (localSerial+(LID)*WG_NUM_ROWS*WG_NUM_COLS)%MACRO_TILE_NUM_COLS)" + endLine);
      }
  
      //kStr += (
      //  "  A += GET_GLOBAL_INDEX_A( globalARow, globalACol );" + endLine +
      //  "  B += GET_GLOBAL_INDEX_B( globalBRow, globalBCol );" + endLine )

      ////////////////////////////////////////////////////////////////////////
      // loop over k
      kStr += endLine;
      kStr += (
        "  /* loop over k */" + endLine +
        "  uint block_k = K / NUM_UNROLL_ITER;" + endLine +
        "  do {" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // local indices being written
      kStr += endLine;
      kStr += "    /* local indices being written */" + endLine;
      if ((kernel.order == "clblasColumnMajor") == (kernel.transA == "N")) {
        kStr += (
          "#define localARow (localSerial % MACRO_TILE_NUM_ROWS)" + endLine +
          "#define localACol (localSerial / MACRO_TILE_NUM_ROWS)" + endLine +
          "#define localAStride (WG_NUM_ROWS*WG_NUM_COLS)" + endLine);
      } else {
        kStr += (
          "#define localARow (localSerial / NUM_UNROLL_ITER)" + endLine +
          "#define localACol (localSerial % NUM_UNROLL_ITER)" + endLine +
          "#define localAStride (WG_NUM_ROWS*WG_NUM_COLS/NUM_UNROLL_ITER)" + endLine);
      }

      if ((kernel.order == "clblasColumnMajor") == (kernel.transB == "N")) {
        kStr += (
          "#define localBRow ( localSerial % NUM_UNROLL_ITER )" + endLine +
          "#define localBCol ( localSerial / NUM_UNROLL_ITER )" + endLine +
          "#define localBStride (WG_NUM_ROWS*WG_NUM_COLS/NUM_UNROLL_ITER)" + endLine);
      } else {
        kStr += (
          "#define localBRow ( localSerial / MACRO_TILE_NUM_COLS )" + endLine +
          "#define localBCol ( localSerial % MACRO_TILE_NUM_COLS )" + endLine +
          "#define localBStride  (WG_NUM_ROWS*WG_NUM_COLS)" + endLine);
      }


      kStr += (
        "    __local DATA_TYPE_STR *lA = localA + GET_LOCAL_INDEX_A(localARow, localACol);" + endLine +
        "    __local DATA_TYPE_STR *lB = localB + GET_LOCAL_INDEX_B(localBRow, localBCol);" + endLine +
        "    barrier(CLK_LOCAL_MEM_FENCE);" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // load global -> local
      // threads to do loading = (workGroupNumRows*workGroupNumCols)
      // A elements to be loaded = workGroupNumRows*microTileNumRows*unroll
      // B elements to be loaded = workGroupNumCols*microTileNumCols*unroll
      kStr += endLine;
      kStr += "    /* load global -> local */" + endLine;
      var numALoads = Math.floor((kernel.workGroupNumRows * kernel.microTileNumRows * kernel.unroll) / (kernel.workGroupNumRows * kernel.workGroupNumCols));
      var numALoadsR = (kernel.workGroupNumRows * kernel.microTileNumRows * kernel.unroll) % (kernel.workGroupNumRows * kernel.workGroupNumCols);
      var numBLoads = Math.floor((kernel.workGroupNumCols * kernel.microTileNumCols * kernel.unroll) / (kernel.workGroupNumRows * kernel.workGroupNumCols));
      var numBLoadsR = (kernel.workGroupNumCols * kernel.microTileNumCols * kernel.unroll) % (kernel.workGroupNumRows * kernel.workGroupNumCols);

      // TODO - zeroString for real and complex
      var zeroString;
      if (kernel.precision == "c") {
        zeroString = "(float2)(0.f, 0.f)";
      } else if (kernel.precision == "z") {
        zeroString = "(double2)(0.0, 0.0)";
      } else {
        zeroString = "0.0";
      }
      for (var a = 0; a < numALoads; a++) {
        kStr += "    lA[ " + a + "*localAStride ] = ";
        if (kernel.isRowKernel()) {
          kStr += "( globalARow(" + a + ") >= M) ? " + zeroString + " : ";
        }
        kStr += "A[ GET_GLOBAL_INDEX_A( globalARow(" + a + "), globalACol(" + a + ") ) ];" + endLine;
      }
      if (numALoadsR > 0) {
        kStr += "    if ( localSerial + " + (numALoads) + "*WG_NUM_ROWS*WG_NUM_COLS < (WG_NUM_ROWS*MICRO_TILE_NUM_ROWS*NUM_UNROLL_ITER) ) {" + endLine;
        kStr += "      lA[ " + numALoads + "*localAStride ] = ";
        if (kernel.isRowKernel()) {
          kStr += "( globalARow(" + numALoads + ") >= M) ? " + zeroString + " : ";
        }
        kStr += "A[ GET_GLOBAL_INDEX_A( globalARow(" + numALoads + "), globalACol(" + numALoads + ") ) ];" + endLine;
        kStr += "    }" + endLine;
      }

      for (var b = 0; b < numBLoads; b++) {
        kStr += "    lB[ " + b + "*localBStride ] = ";
        if (kernel.isColKernel()) {
          kStr += "( globalBCol(" + b + ") >= N) ? " + zeroString + " : ";
        }
        kStr += "B[ GET_GLOBAL_INDEX_B( globalBRow(" + b + "), globalBCol(" + b + ") ) ];" + endLine;

      }
      if (numBLoadsR > 0) {
        kStr += "    if ( localSerial + " + (numBLoads) + "*WG_NUM_ROWS*WG_NUM_COLS < (WG_NUM_COLS*MICRO_TILE_NUM_COLS*NUM_UNROLL_ITER) ) {" + endLine;
        kStr += "      lB[ " + numBLoads + "*localBStride ] = ";
        if (kernel.isColKernel()) {
          kStr += "(globalBCol(" + numBLoads + ") >= N) ? " + zeroString + " : ";
        }
        kStr += "B[ GET_GLOBAL_INDEX_B( globalBRow(" + numBLoads + "), globalBCol(" + numBLoads + ") ) ];" + endLine;
        kStr += "    }" + endLine;
      }
      kStr += (
        "    barrier(CLK_LOCAL_MEM_FENCE);" + endLine +
        "    uint offA = localRow;" + endLine +
        "    uint offB = localCol;" + endLine);

      ////////////////////////////////////////////////////////////////////////
      // do mads
      kStr += endLine;
      kStr += "    /* do mads */" + endLine;
      for (var u = 0; u < kernel.unroll; u++) {
        kStr += "    MICRO_TILE" + endLine;
      }

      ////////////////////////////////////////////////////////////////////////
      // shift to next k block
      kStr += endLine;
      kStr += "    /* shift to next k block */" + endLine;
      if ((kernel.order == "clblasColumnMajor") == (kernel.transA == "N")) {
        kStr += "    A += lda*NUM_UNROLL_ITER;" + endLine;
      } else {
        kStr += "    A += NUM_UNROLL_ITER;" + endLine;
      }
      if ((kernel.order == "clblasColumnMajor") == (kernel.transB == "N")) {
        kStr += "    B += NUM_UNROLL_ITER;" + endLine;
      } else {
        kStr += "    B += ldb*NUM_UNROLL_ITER;" + endLine;
      }

      ////////////////////////////////////////////////////////////////////////
      // end loop
      kStr += endLine;
      kStr += "  } while (--block_k > 0);" + endLine;
      kStr += endLine;

      ////////////////////////////////////////////////////////////////////////
      // which global Cij index
      kStr += endLine;
      kStr += "  /* which global Cij index */" + endLine;
      kStr += "  uint globalCRow = groupRow * MACRO_TILE_NUM_ROWS + localRow;" + endLine;
      kStr += "  uint globalCCol = groupCol * MACRO_TILE_NUM_COLS + localCol;" + endLine;

      ////////////////////////////////////////////////////////////////////////
      // write global Cij
      kStr += endLine;
      kStr += "  /* write global Cij */" + endLine;
      if (kernel.precision == "c") {
        kStr += "  float type_mad_tmp;" + endLine;
      }
      if (kernel.precision == "z") {
        kStr += "  double type_mad_tmp;" + endLine;
      }

      for (var a = 0; a < kernel.microTileNumRows; a++) {
        for (var b = 0; b < kernel.microTileNumCols; b++) {
          if (kernel.isRowKernel()) {
            kStr += "  if (globalCRow+" + a + "*WG_NUM_ROWS < M)";
          }
          if (kernel.isColKernel()) {
            kStr += "  if (globalCCol+" + b + "*WG_NUM_COLS < N)";
          }
          if (kernel.isRowKernel() || kernel.isColKernel()) {
            kStr += "{";
          }
          kStr += "  TYPE_MAD_WRITE( C[ GET_GLOBAL_INDEX_C( globalCRow+" + a + "*WG_NUM_ROWS, globalCCol+" + b + "*WG_NUM_COLS) ], alpha, rC[" + a + "][" + b + "], beta )";
          if (kernel.isRowKernel() || kernel.isColKernel()) {
            kStr += "}";
          }
          kStr += endLine;
        }
      }

      ////////////////////////////////////////////////////////////////////////
      // end kernel
      kStr += endLine;
      kStr += "}" + endLine;

      return kStr;
    }

    return function (name) {
      var kernel;
      if (!(name in kernels)) {
        var kp = new KernelParameters(name);
        var kernelstr = makeOpenCLKernelString(kp);
        //var compile_begin = new Date();
        kernel = $CL.createKernel(kernelstr);
        //var compile_end = new Date();
        //console.log('compiling ' + name + ': ' + (compile_end - compile_begin) + 'ms');
        kernels[name] = kernel;
      } else {
        kernel = kernels[name];
      }
      return kernel;
    }
  } ();

})();

},{"../../matrix":29,"../../sushi":33,"../../util":34,"../matrix_cl":24,"./driver":16,"./util_cl":23}],16:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.

(function () {
  var $CL;
  if (typeof window === 'undefined') {
    $CL = require('./driver_opencl.js');
  } else {
    $CL = require('./driver_webcl.js');
  }
  
  module.exports = $CL;
})();

},{"./driver_opencl.js":17,"./driver_webcl.js":18}],17:[function(require,module,exports){
(function (process){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.

(function () {
  var $M = require('../../sushi');

  var $CL = {};
  $CL.WebCL = createWebCLObject();
  initWebCL($CL.WebCL);
  initUtilityMethods($CL.WebCL);

  function createWebCLObject() {
    // create WebCL object
    var web_cl;
    try {
      web_cl = require('node-opencl');
    } catch (e) {
      web_cl = void 0;
    }
    return web_cl;
  }

  function initWebCL(WebCL) {
    // decide platform to use
    var platform_list = WebCL.getPlatformIDs();
    var platform_index = 0;
    if ('OPENCL_PLATFORM_INDEX' in process.env) {
      platform_index = Number(process.env['OPENCL_PLATFORM_INDEX']);
      if (platform_index >= platform_list.length) {
        throw new Error('Invalid platform index ' + platform_index);
      }
    } else {
      //select by name
      var platform_priority = ['CUDA', 'AMD', 'Apple', 'OpenCL'];
      var priority = platform_priority.length + 1;
      var includeIndexOf = function (array, search) {
        for (var i = 0; i < array.length; i++) {
          if (search.indexOf(array[i]) !== -1) {
            return i;
          }
        }
        return array.length;
      };
      for (var i = 0; i < platform_list.length; i++) {
        var platform_tmp = platform_list[i];
        var platform_info_tmp = WebCL.getPlatformInfo(platform_tmp, WebCL.PLATFORM_NAME);
        var priority_tmp = includeIndexOf(platform_priority, platform_info_tmp);
        if (priority_tmp < priority) {
          priority = priority_tmp;
          platform_index = i;
          $CL.platform = platform_tmp;
          $CL.platform_info = platform_info_tmp;
        }
      }
    }
    $CL.platform = platform_list[platform_index];
    $CL.platform_info = WebCL.getPlatformInfo($CL.platform, WebCL.PLATFORM_NAME);

    try {
      var device_type = WebCL.DEVICE_TYPE_GPU;
      $CL.devices = WebCL.getDeviceIDs($CL.platform, device_type);//causes exception on firefox + Intel OpenCL
    } catch (ex) {
      $CL.devices = [];
    }
    if ($CL.devices.length === 0) {
      device_type = WebCL.DEVICE_TYPE_CPU;
      $CL.devices = WebCL.getDeviceIDs($CL.platform, device_type);;
    }

    // device selector (experimental)
    var device_index = 0;
    // Explicit setting by environment variable
    if ('OPENCL_DEVICE_INDEX' in process.env) {
      device_index = Number(process.env['OPENCL_DEVICE_INDEX']);
      if (device_index >= $CL.devices.length) {
        throw new Error('Invalid device index ' + device_index);
      }
    }
    $CL.selected_device = $CL.devices[device_index];
    $CL.device_info = WebCL.getDeviceInfo($CL.selected_device, WebCL.DEVICE_NAME);
    $CL.device_max_work_group_size = WebCL.getDeviceInfo($CL.selected_device, WebCL.DEVICE_MAX_WORK_GROUP_SIZE);

    // initialize methods dependent on implementation
    WebCL.type = {
      CHAR: 0,
      UCHAR: 1,
      SHORT: 2,
      USHORT: 3,
      INT: 4,
      UINT: 5,
      LONG: 6,
      ULONG: 7,
      FLOAT: 8,
      HALF: 9,
      DOUBLE: 10,
      QUAD: 11,
      LONG_LONG: 12,
      VEC2: 65536,
      VEC3: 131072,
      VEC4: 262144,
      VEC8: 524288,
      VEC16: 1048576,
      LOCAL_MEMORY_SIZE: 255
    };
    var table_primitive = {};
    table_primitive[WebCL.type.CHAR] = 'char';
    table_primitive[WebCL.type.UCHAR] = 'uchar';
    table_primitive[WebCL.type.SHORT] = 'short';
    table_primitive[WebCL.type.USHORT] = 'ushort';
    table_primitive[WebCL.type.INT] = 'int';
    table_primitive[WebCL.type.UINT] = 'uint';
    table_primitive[WebCL.type.LONG] = 'long';//64bit variable is not supported
    table_primitive[WebCL.type.ULONG] = 'ulong';
    table_primitive[WebCL.type.FLOAT] = 'float';
    table_primitive[WebCL.type.HALF] = 'half';//16bit float is not supported
    table_primitive[WebCL.type.DOUBLE] = 'double';
    table_primitive[WebCL.type.QUAD] = 'quad';//not supported
    table_primitive[WebCL.type.LONG_LONG] = 'long long';//not supported
    var table_vec_len = {};
    table_vec_len[0] = 1;
    table_vec_len[WebCL.type.VEC2] = 2;
    table_vec_len[WebCL.type.VEC3] = 3;
    table_vec_len[WebCL.type.VEC4] = 4;
    table_vec_len[WebCL.type.VEC8] = 8;
    table_vec_len[WebCL.type.VEC16] = 16;
    $CL.context = WebCL.createContext([WebCL.CONTEXT_PLATFORM, $CL.platform, 0], [$CL.selected_device]);
    $CL.kernelSetArg = function (kernel, idx, param, type) {
      var typestr = '';
      if (type !== void 0) {
        if (type == WebCL.type.LOCAL_MEMORY_SIZE) {
          typestr = 'local';
        } else {
          var primitive = type & 0xFF;
          typestr = table_primitive[primitive];
          var vec = type & 0x1F0000;
          var vec_len = table_vec_len[vec];
          if (vec_len > 1) {
            typestr += vec_len;
          }
        }
      } else {
        //buffer
        typestr = 'cl_mem';
      }
      WebCL.setKernelArg(kernel, idx, typestr, param);
    };

    if (WebCL.createCommandQueueWithProperties !== undefined) {
      $CL.queue = WebCL.createCommandQueueWithProperties($CL.context, $CL.selected_device, []); // OpenCL 2
    } else {
      $CL.queue = WebCL.createCommandQueue($CL.context, $CL.selected_device, 0); // OpenCL 1.x
    }

    $CL.buffers = 0;//number of existing buffers on device
  }


  function initUtilityMethods(WebCL) {
    $CL.createKernel = function (code, name) {
      if (!name) {
        name = 'kernel_func';
      }
      var program = WebCL.createProgramWithSource($CL.context, code);
      WebCL.buildProgram(program);
      return WebCL.createKernel(program, name);
    };

    $CL.createBuffer = function (byte_length) {
      var buffer = WebCL.createBuffer($CL.context, WebCL.MEM_READ_WRITE, byte_length);
      $CL.buffers++;
      return buffer;
    };

    $CL.writeBuffer = function (buffer, typed_array, offset) {
      if (offset === void 0) { offset = 0; }
      WebCL.enqueueWriteBuffer($CL.queue, buffer,
        true,//blocking write
        offset,
        typed_array.byteLength,
        typed_array);
    }

    $CL.executeKernel = function (kernel, params, parallelization, localWS) {
      for (var i = 0; i < params.length; i++) {
        if (params[i].type === void 0) {
          // Matrix class
          $CL.kernelSetArg(kernel, i, params[i].datum._clbuffer);
        } else {
          // native type
          $CL.kernelSetArg(kernel, i, params[i].datum, params[i].type);
        }
      }

      // scalar to array
      if (parallelization != null && parallelization.length === void 0) {
        parallelization = [parallelization];
      }
      if (localWS != null && localWS.length === void 0) {
        localWS = [localWS];
      }

      var globalWS;
      if (localWS == null) {
        //n-d parallelization
        var localWS_each = [64, 64, 8, 4][parallelization.length];
        localWS = [];
        globalWS = [];
        for (var i = 0; i < parallelization.length; i++) {
          localWS.push(localWS_each);
          globalWS.push(Math.ceil(parallelization[i] / localWS_each) * localWS_each);
        }
      } else {
        globalWS = [];
        for (var i = 0; i < parallelization.length; i++) {
          globalWS.push(Math.ceil(parallelization[i] / localWS[i]) * localWS[i]);
        }
      }
      // Execute kernel
      WebCL.enqueueNDRangeKernel($CL.queue, kernel,
        globalWS.length,
        null,
        globalWS,
        localWS);
      $CL.flush();
    };

    $CL.flush = function () {
      WebCL.flush($CL.queue);
    };

    $CL.finish = function () {
      WebCL.finish($CL.queue);
    };

    $CL.readBuffer = function (buffer, typed_array, offset) {
      if (offset === void 0) { offset = 0; }
      WebCL.enqueueReadBuffer($CL.queue, buffer,
        true,//blocks until the reading completes
        offset,
        typed_array.byteLength,
        typed_array);
    }

    $CL.releaseBuffer = function (buffer) {
      WebCL.releaseMemObject(buffer);
      $CL.buffers--;
    };
  }

  module.exports = $CL;
})();

}).call(this,require('_process'))
},{"../../sushi":33,"_process":42,"node-opencl":35}],18:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.

(function () {
  var $M = require('../../sushi');

  var $CL = {};
  var env = getEnvironment();
  $CL.WebCL = createWebCLObject();
  initWebCL($CL.WebCL);
  initUtilityMethods($CL.WebCL);

  function getEnvironment() {
    // check environment
    if (typeof window !== 'undefined' && window.webcl !== void 0) {
      var env = 'ff';
    } else if (typeof WebCL === 'function') {
      var env = 'chromium';
    } else {
      var env = void 0;
    }
    return env;
  }

  function createWebCLObject() {
    // create WebCL object
    var web_cl = void 0;
    switch (env) {
      case 'chromium':
        web_cl = new WebCL();
        break;
      case 'ff':
        web_cl = window.webcl;
        break;
    }
    return web_cl;
  }

  function initWebCL(WebCL) {
    // decide platform to use
    var platform_list = WebCL.getPlatforms();
    var platform_index = 0;
    //select by name
    var platform_priority = ['CUDA', 'AMD', 'Apple', 'OpenCL'];
    var priority = platform_priority.length + 1;
    var includeIndexOf = function (array, search) {
      for (var i = 0; i < array.length; i++) {
        if (search.indexOf(array[i]) !== -1) {
          return i;
        }
      }
      return array.length;
    };
    for (var i = 0; i < platform_list.length; i++) {
      var platform_tmp = platform_list[i];
      var platform_info_tmp = platform_tmp.getInfo(WebCL.PLATFORM_NAME);
      var priority_tmp = includeIndexOf(platform_priority, platform_info_tmp);
      if (priority_tmp < priority) {
        priority = priority_tmp;
        platform_index = i;
        $CL.platform = platform_tmp;
        $CL.platform_info = platform_info_tmp;
      }
    }
    $CL.platform = platform_list[platform_index];
    $CL.platform_info = $CL.platform.getInfo(WebCL.PLATFORM_NAME);

    try {
      var device_type = WebCL.DEVICE_TYPE_GPU;
      $CL.devices = $CL.platform.getDevices(device_type);//causes exception on firefox + Intel OpenCL
    } catch (ex) {
      $CL.devices = [];
    }
    if ($CL.devices.length === 0) {
      device_type = WebCL.DEVICE_TYPE_CPU;
      $CL.devices = $CL.platform.getDevices(device_type);;
    }

    // device selector (experimental)
    var device_index = 0;
    // selection by url (xxx?device_index=X)
    var url_vars = function () {
      var vars = {};
      var param = location.search.substring(1).split('&');
      for (var i = 0; i < param.length; i++) {
        var keySearch = param[i].search(/=/);
        var key = '';
        if (keySearch != -1) key = param[i].slice(0, keySearch);
        var val = param[i].slice(param[i].indexOf('=', 0) + 1);
        if (key != '') vars[key] = decodeURI(val);
      }
      return vars;
    } ();
    device_index =
      url_vars.device_index ?
        Math.min(url_vars.device_index, $CL.devices.length - 1) :
        0;
    $CL.selected_device = $CL.devices[device_index];
    $CL.device_info = $CL.selected_device.getInfo(WebCL.DEVICE_NAME);
    $CL.device_max_work_group_size = $CL.selected_device.getInfo(WebCL.DEVICE_MAX_WORK_GROUP_SIZE);

    // initialize methods dependent on implementation
    WebCL.type = {
      CHAR: 0,
      UCHAR: 1,
      SHORT: 2,
      USHORT: 3,
      INT: 4,
      UINT: 5,
      LONG: 6,
      ULONG: 7,
      FLOAT: 8,
      HALF: 9,
      DOUBLE: 10,
      QUAD: 11,
      LONG_LONG: 12,
      VEC2: 65536,
      VEC3: 131072,
      VEC4: 262144,
      VEC8: 524288,
      VEC16: 1048576,
      LOCAL_MEMORY_SIZE: 255
    };

    switch (env) {
      case 'ff':
        $CL.context = WebCL.createContext($CL.platform, device_type);
        var table_primitive = {};
        table_primitive[WebCL.type.CHAR] = Uint8Array;
        table_primitive[WebCL.type.UCHAR] = Int8Array;
        table_primitive[WebCL.type.SHORT] = Int16Array;
        table_primitive[WebCL.type.USHORT] = Uint16Array;
        table_primitive[WebCL.type.INT] = Int32Array;
        table_primitive[WebCL.type.UINT] = Uint32Array;
        table_primitive[WebCL.type.LONG] = Int32Array;//64bit variable is not supported
        table_primitive[WebCL.type.ULONG] = Uint32Array;
        table_primitive[WebCL.type.FLOAT] = Float32Array;
        table_primitive[WebCL.type.HALF] = Float32Array;//16bit float is not supported
        table_primitive[WebCL.type.DOUBLE] = Float64Array;
        table_primitive[WebCL.type.QUAD] = Float32Array;//not supported
        table_primitive[WebCL.type.LONG_LONG] = Float32Array;//not supported
        var table_vec_len = {};
        table_vec_len[0] = 1;
        table_vec_len[WebCL.type.VEC2] = 2;
        table_vec_len[WebCL.type.VEC3] = 3;
        table_vec_len[WebCL.type.VEC4] = 4;
        table_vec_len[WebCL.type.VEC8] = 8;
        table_vec_len[WebCL.type.VEC16] = 16;
        $CL.kernelSetArg = function (kernel, idx, param, type) {
          if (type !== void 0) {
            if (type == WebCL.type.LOCAL_MEMORY_SIZE) {
              param = new Uint32Array([param]);
            } else {
              var primitive = type & 0xFF;
              var array_ctor = table_primitive[primitive];
              var vec = type & 0x1F0000;
              var vec_len = table_vec_len[vec];
              if (vec_len > 1) {
                param = new array_ctor(param);//param is array
              } else {
                param = new array_ctor([param]);//param is scalar value
              }
            }
          }
          kernel.setArg(idx, param);
        };
        break;
      case 'chromium':
        //TODO
        var properties = new WebCLContextProperties();
        properties.platform = $CL.platform;
        properties.deviceType = device_type;
        properties.devices = $CL.devices;
        properties.shareGroup = 1;
        $CL.context = WebCL.createContext(properties);
        $CL.kernelSetArg = function (kernel, idx, param, type) {
          if (type !== void 0) {
            switch (type) {
              case WebCL.type.UINT:
                var type_tmp = WebCL.KERNEL_ARG_UINT;
                break;
              case WebCL.type.INT:
                var type_tmp = WebCL.KERNEL_ARG_INT;
                break;
              case WebCL.type.FLOAT:
                var type_tmp = WebCL.KERNEL_ARG_FLOAT;
                break;
            }
            kernel.setKernelArg(idx, param, type_tmp);
          } else {
            kernel.setKernelArgGlobal(idx, param);
          }
        };
        break;
    }

    switch (env) {
      case 'ff':
        $CL.queue =
          $CL.context.createCommandQueue($CL.selected_device, 0);
        break;
      case 'chromium':
        $CL.queue =
          $CL.context.createCommandQueue($CL.devices, null);
        break;
    }

    $CL.buffers = 0;//number of existing buffers on device
  }


  function initUtilityMethods(WebCL) {
    $CL.createKernel = function (code, name) {
      if (!name) {
        name = 'kernel_func';
      }
      var program = $CL.context.createProgram(code);
      switch (env) {
        case 'ff':
          program.build($CL.devices);
          break;
        case 'chromium':
          program.buildProgram(null, null, null);
          break;
      }
      return program.createKernel(name);
    };

    $CL.createBuffer = function (byte_length) {
      var buffer = $CL.context.createBuffer(WebCL.MEM_READ_WRITE, byte_length);
      $CL.buffers++;
      return buffer;
    };

    $CL.writeBuffer = function (buffer, typed_array, offset) {
      if (offset === void 0) { offset = 0; }
      if (typed_array.byteOffset === 0) {
        $CL.queue.enqueueWriteBuffer(buffer,
          true,//blocking write
          offset,
          typed_array.byteLength,
          typed_array);
      } else {
        //workaround for firefox
        var tmpbuf = new typed_array.constructor(typed_array);
        $CL.queue.enqueueWriteBuffer(buffer,
          true,//blocking write
          offset,
          tmpbuf.byteLength,
          tmpbuf);
      }
    };

    $CL.executeKernel = function (kernel, params, parallelization, localWS) {
      for (var i = 0; i < params.length; i++) {
        if (params[i].type === void 0) {
          // Matrix class
          $CL.kernelSetArg(kernel, i, params[i].datum._clbuffer);
        } else {
          // native type
          $CL.kernelSetArg(kernel, i, params[i].datum, params[i].type);
        }
      }

      // scalar to array
      if (parallelization != null && parallelization.length === void 0) {
        parallelization = [parallelization];
      }
      if (localWS != null && localWS.length === void 0) {
        localWS = [localWS];
      }

      var globalWS;
      if (localWS == null) {
        //n-d parallelization
        var localWS_each = [64, 64, 8, 4][parallelization.length];
        localWS = [];
        globalWS = [];
        for (var i = 0; i < parallelization.length; i++) {
          localWS.push(localWS_each);
          globalWS.push(Math.ceil(parallelization[i] / localWS_each) * localWS_each);
        }
      } else {
        globalWS = [];
        for (var i = 0; i < parallelization.length; i++) {
          globalWS.push(Math.ceil(parallelization[i] / localWS[i]) * localWS[i]);
        }
      }
      // Execute kernel
      switch (env) {
        case 'ff':
          $CL.queue.enqueueNDRangeKernel(kernel,
            globalWS.length,
            null,
            globalWS,
            localWS);
          break;
        case 'chromium':
          globalWS = new Int32Array(globalWS);
          $CL.queue.enqueueNDRangeKernel(kernel,
            null,
            globalWS,
            localWS);
          $CL.queue.finish();
          break;
      }
      $CL.queue.flush();
    };

    $CL.flush = function () {
      $CL.queue.flush();
    };

    $CL.finish = function () {
      $CL.queue.finish();
    };

    $CL.readBuffer = function (buffer, typed_array, offset) {
      if (offset === void 0) { offset = 0; }
      if (typed_array.byteOffset === 0) {
        $CL.queue.enqueueReadBuffer(buffer,
          true,//blocks until the reading completes
          offset,
          typed_array.byteLength,
          typed_array);
      } else {
        //workaround of bug in firefox webcl that byteOffset is ignored
        var tmpbuf = new typed_array.constructor(typed_array.length);
        $CL.queue.enqueueReadBuffer(buffer,
          true,//blocks until the reading completes
          offset,
          tmpbuf.byteLength,
          tmpbuf);
        typed_array.set(tmpbuf);
      }
    }

    switch (env) {
      case 'ff':
        $CL.releaseBuffer = function (buffer) {
          buffer.release();
          $CL.buffers--;
        };
        break;
      case 'chromium':
        $CL.releaseBuffer = function (buffer) {
          buffer.releaseCL();
          $CL.buffers--;
        };
        break;
    }
  }

  module.exports = $CL;
})();

},{"../../sushi":33}],19:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
// overwrites reduction functions

var $M = require('../../sushi');
var util = require('../../util');
var util_cl = require('./util_cl');

(function () {
  var $CL = require('./driver');
  $M.CL = $CL;

  var Matrix = require('../../matrix');
  var MatrixCL = require('../matrix_cl');
  var WebCL = $M.CL.WebCL;
  var ctypes = util_cl.ctypes;
  var webcltypes = util_cl.webcltypes;

  var maxmin_reduction_along_axis_cl = function (A, dim, name, is_min, is_argmax) {
    if (dim == null) {
      //select first non-1 axis
      dim = A._numel;
      for (var i = 0; i < A._size.length; i++) {
        var dimsize = A._size[i];
        if (dimsize !== 1) {
          dim = i + 1;
          break;
        }
      }
    }

    if (dim > A._ndims) {
      //max along axis with size 1
      if (is_argmax) {
        var amat = new MatrixCL(A._size, 'int32');
        amat._fill(1);
        return { M: A.copy(), I: amat };
      } else {
        return A.copy();
      }
    }

    var dstsize = A._size.slice();
    if (dstsize[dim - 1] !== 0) {
      //size 0 dimension is preserved
      dstsize[dim - 1] = 1;
    }

    if ((A._numel === 0) || (A._size[dim - 1] === 1)) {
      //only change shape
      var dst_onlyreshape = A.copy();
      dst_onlyreshape.reshape_inplace(dstsize);
      if (is_argmax) {
        var amat = new MatrixCL(dstsize, 'int32');
        amat._fill(1);
        return { M: dst_onlyreshape, I: amat };
      } else {
        return dst_onlyreshape;
      }
    }

    //reduction actually needed
    var dst = new MatrixCL(dstsize, A._klass);
    var argmax = null;
    if (is_argmax) {
      argmax = new MatrixCL(dstsize, 'int32');
    }
    var input_strides = A._strides;
    var output_strides = dst._strides.slice();
    while (output_strides.length <= input_strides.length) {
      output_strides.push(dst._numel);
    }
    var output_strides_mat = MatrixCL._fromtypedarray(new Int32Array(output_strides), 'int32');
    var input_strides_mat = MatrixCL._fromtypedarray(new Int32Array(A._strides), 'int32');

    var reduction_step = input_strides[dim - 1];
    var reduction_count = A._size[dim - 1];
    var dims = A._ndims;

    var kernel_name = 'maxmin_reduction_cl_' + name + '_' + (A._klass) + '_' + dims;
    var kernel = MatrixCL.kernel_cache[kernel_name];
    if (!kernel) {
      kernel = $CL.createKernel([
        '#define SRC_DST_TYPE ' + ctypes[A._klass],
        '#define DIMS ' + dims,
        '__kernel void kernel_func(__global SRC_DST_TYPE *dst, __global SRC_DST_TYPE *src,',
        is_argmax ? '__global int *argmax,' : '',
        ' uint length,',
        '__global int *output_strides, __global int *input_strides, int reduction_step, int reduction_count) {',
        '  int i = (int)get_global_id(0);',
        '  if (i >= length) { return; }',
        '  int src_idx = 0;',
        '  for (int d = 0; d < DIMS; d++) {',
        '    src_idx += i % output_strides[d+1] / output_strides[d] * input_strides[d];',
        '  }',
        '  SRC_DST_TYPE val = src[src_idx];',
        '  SRC_DST_TYPE accum = val;',
        is_argmax ? '  int accumarg = 0;' : '',
        '  for (int red = 1; red < reduction_count; red++) {',
        '    src_idx += reduction_step;',
        '    val = src[src_idx];',
        is_min ? (is_argmax ? 'if (val < accum) { accum = val; accumarg = red; }' : 'if (val < accum) { accum = val; }')
          : (is_argmax ? 'if (val > accum) { accum = val; accumarg = red; }' : 'if (val > accum) { accum = val; }'),//'    if (val > accum) { accum = val; }'
        '  }',
        '  dst[i] = accum;',
        is_argmax ? 'argmax[i] = accumarg + 1;' : '',
        '}'
      ].join('\n'));
      MatrixCL.kernel_cache[kernel_name] = kernel;
    }

    if (dst._numel > 0) {
      if (is_argmax) {
        $CL.executeKernel(kernel, [
          { access: WebCL.MEM_WRITE_ONLY, datum: dst },
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { access: WebCL.MEM_WRITE_ONLY, datum: argmax },
          { datum: dst._numel, type: WebCL.type.INT },
          { access: WebCL.MEM_READ_ONLY, datum: output_strides_mat },
          { access: WebCL.MEM_READ_ONLY, datum: input_strides_mat },
          { datum: reduction_step, type: WebCL.type.INT },
          { datum: reduction_count, type: WebCL.type.INT }
        ], dst._numel);

      } else {
        $CL.executeKernel(kernel, [
          { access: WebCL.MEM_WRITE_ONLY, datum: dst },
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { datum: dst._numel, type: WebCL.type.INT },
          { access: WebCL.MEM_READ_ONLY, datum: output_strides_mat },
          { access: WebCL.MEM_READ_ONLY, datum: input_strides_mat },
          { datum: reduction_step, type: WebCL.type.INT },
          { datum: reduction_count, type: WebCL.type.INT }
        ], dst._numel);
      }
    }

    if (is_argmax) {
      return { M: dst, I: argmax };
    } else {
      return dst;
    }
  };

  var stat_reduction_along_axis_cl = function (A, dim, name, init_accum, update_accum, assign_result) {
    // for statistics methods, output is single klass
    if (dim == null) {
      //select first non-1 axis
      dim = A._numel;
      for (var i = 0; i < A._size.length; i++) {
        var dimsize = A._size[i];
        if (dimsize !== 1) {
          dim = i + 1;
          break;
        }
      }
    }

    var virtual_input_shape = A._size.concat();
    while (dim > virtual_input_shape.length) {
      // A._size = [10, 20], dim = 4 => virtual_input_shape = [10, 20, 1, 1]
      virtual_input_shape.push(1);
    }
    var dstsize = virtual_input_shape.concat();
    if (dstsize[dim - 1] !== 0) {
      //size 0 dimension is preserved
      dstsize[dim - 1] = 1;
    }

    //reduction actually needed
    var dst = new MatrixCL(dstsize, 'single');
    if (A._numel == 0) {
      return dst;//empty
    }
    var dims = virtual_input_shape.length;
    var input_strides = [];
    var tmp = 1;
    for (var i = 0; i < dims; i++) {
      input_strides.push(tmp);
      tmp *= virtual_input_shape[i];
    }
    var output_strides = [];
    tmp = 1;
    for (var i = 0; i < dims; i++) {
      output_strides.push(tmp);
      tmp *= dstsize[i];
    }
    output_strides.push(tmp);//excess 1 dimension required

    var output_strides_mat = MatrixCL._fromtypedarray(new Int32Array(output_strides), 'int32');
    var input_strides_mat = MatrixCL._fromtypedarray(new Int32Array(input_strides), 'int32');

    var reduction_step = input_strides[dim - 1];
    var reduction_count = virtual_input_shape[dim - 1];

    var kernel_name = 'stat_reduction_cl_' + name + '_' + (A._klass) + '_' + dims;
    var kernel = MatrixCL.kernel_cache[kernel_name];
    if (!kernel) {
      kernel = $CL.createKernel([
        '#define SRC_TYPE ' + ctypes[A._klass],
        '#define DST_TYPE float',
        '#define DIMS ' + dims,
        '__kernel void kernel_func(__global DST_TYPE *dst, __global const SRC_TYPE *src,',
        ' uint length,',
        '__global const int *output_strides, __global const int *input_strides, int reduction_step, int reduction_count) {',
        '  int i = (int)get_global_id(0);',
        '  if (i >= length) { return; }',
        '  int src_idx = 0;',
        '  for (int d = 0; d < DIMS; d++) {',
        '    src_idx += i % output_strides[d+1] / output_strides[d] * input_strides[d];',
        '  }',
        '  DST_TYPE val = src[src_idx];',
        init_accum,//'  DST_TYPE accum = val;',
        '  for (int red = 1; red < reduction_count; red++) {',
        '    src_idx += reduction_step;',
        '    val = (DST_TYPE)src[src_idx];',
        update_accum,
        '  }',
        assign_result,//'  dst[i] = accum;',
        '}'
      ].join('\n'));
      MatrixCL.kernel_cache[kernel_name] = kernel;
    }

    $CL.executeKernel(kernel, [
      { access: WebCL.MEM_WRITE_ONLY, datum: dst },
      { access: WebCL.MEM_READ_ONLY, datum: A },
      { datum: dst._numel, type: WebCL.type.INT },
      { access: WebCL.MEM_READ_ONLY, datum: output_strides_mat },
      { access: WebCL.MEM_READ_ONLY, datum: input_strides_mat },
      { datum: reduction_step, type: WebCL.type.INT },
      { datum: reduction_count, type: WebCL.type.INT }
    ], dst._numel);

    output_strides_mat.destruct();
    input_strides_mat.destruct();

    return dst;
  };

  var max_native = $M.max;
  $M.max = function (A, B, dim) {
    return $M.autodestruct(function () {
      var mats = util_cl.unify_mats([A, B]);
      if (mats.cl) {
        if (B == null) {
          return maxmin_reduction_along_axis_cl(A, dim, 'max', false, false);
        } else {
          return $M.CL._max_elementwise_cl(mats[0], mats[1]);
        }
      } else {
        return max_native(mats[0], mats[1], dim);
      }
    });
  };

  var min_native = $M.min;
  $M.min = function (A, B, dim) {
    return $M.autodestruct(function () {
      var mats = util_cl.unify_mats([A, B]);
      if (mats.cl) {
        if (B == null) {
          return maxmin_reduction_along_axis_cl(A, dim, 'min', true, false);
        } else {
          return $M.CL._min_elementwise_cl(mats[0], mats[1]);
        }
      } else {
        return min_native(mats[0], mats[1], dim);
      }
    });
  };

  var argmax_native = $M.argmax;
  $M.argmax = function (A, dummy, dim) {
    if (A instanceof MatrixCL) {
      return maxmin_reduction_along_axis_cl(A, dim, 'argmax', false, true);
    } else {
      return argmax_native(A, dummy, dim);
    }
  };
  var argmin_native = $M.argmin;
  $M.argmin = function (A, dummy, dim) {
    if (A instanceof MatrixCL) {
      return maxmin_reduction_along_axis_cl(A, dim, 'argmin', true, true);
    } else {
      return argmin_native(A, dummy, dim);
    }
  };

  var replace_sum = function (f_native, name, init_accum, update_accum, assign_result) {
    return function (A) {//(A: Matrix, dim: number, outtype?: string)
      if (A instanceof MatrixCL) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var dim = undefined;
        var outtype = undefined;
        for (var i = 1; i < arguments.length; i++) {
          var arg = arguments[i];
          if (typeof (arg) === 'string') {
            if (arg != 'native') {
              throw new Error('Outtype other than native is currently not supported');
            }
          } else if (typeof (arg) === 'number') {
            dim = arg;
          } else {
            throw new Error('Unknown argument ' + arg);
          }
        }
        return stat_reduction_along_axis_cl(A, dim, name,
          init_accum, update_accum, assign_result);
      } else {
        //use native
        return f_native.apply(null, arguments);
      }
    };
  }

  $M.sum = replace_sum($M.sum, 'sum', 'DST_TYPE accum = val;', 'accum += val;', 'dst[i] = accum;');
  $M.mean = replace_sum($M.mean, 'mean', 'DST_TYPE accum = val;', 'accum += val;', 'dst[i] = accum / reduction_count;');
  $M.prod = replace_sum($M.prod, 'prod', 'DST_TYPE accum = val;', 'accum *= val;', 'dst[i] = accum;');

  var replace_variance = function (f_native, name, do_sqrt) {
    return function (A, w, dim) {//(A: Matrix, w: number = 0, dim?: number)
      if (A instanceof MatrixCL) {
        var assign_result;
        if (w == null || w == 0) {
          assign_result = 'dst[i] = ' + do_sqrt + '((sqsum - normalsum * normalsum / reduction_count) / (reduction_count > 1 ? reduction_count - 1 : 1));';
        } else if (w == 1) {
          assign_result = 'dst[i] = ' + do_sqrt + '((sqsum - normalsum * normalsum / reduction_count) / reduction_count);';
        } else {
          throw new Error('w must be 0 or 1');
        }
        return stat_reduction_along_axis_cl(A, dim, name + w,
          'DST_TYPE normalsum = (DST_TYPE)val; DST_TYPE sqsum = (DST_TYPE)val * (DST_TYPE)val;', 'normalsum += val; sqsum += (DST_TYPE)val * (DST_TYPE)val;', assign_result);
      } else {
        //use native
        return f_native.apply(null, arguments);
      }
    };
  }

  $M.variance = replace_variance($M.variance, 'variance', '');
  $M.std = replace_variance($M.std, 'std', 'sqrt');
})();

},{"../../matrix":29,"../../sushi":33,"../../util":34,"../matrix_cl":24,"./driver":16,"./util_cl":23}],20:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
// overwrites shape conversion functions

var $M = require('../../sushi');
var util = require('../../util');
var util_cl = require('./util_cl');


(function () {
  var $CL = require('./driver');
  $M.CL = $CL;

  var Matrix = require('../../matrix');
  var MatrixCL = require('../matrix_cl');
  var WebCL = $M.CL.WebCL;
  var ctypes = util_cl.ctypes;
  var webcltypes = util_cl.webcltypes;

  var transpose_native = $M.transpose;
  var transpose_cl = function (A) {
    if (A._ndims != 2) {
      throw new Error('Matrix must be two-dimensional');
    }

    var dst_cols = A._size[0], dst_rows = A._size[1];
    var dst = new MatrixCL([dst_rows, dst_cols], A._klass);

    
    if (dst_cols % 64 == 0 && dst_rows % 64 == 0) {
      var kernel_name = 'transpose_cl_' + A._klass + '_64';
      var kernel = MatrixCL.kernel_cache[kernel_name];
      var tile_size = 64;
      var block_size = 16;
      if (!kernel) {
        kernel = $CL.createKernel([
          '#define SRC_DST_TYPE ' + ctypes[A._klass],
          '#define TILE_SIZE ' + tile_size,
          '#define BLOCK_SIZE ' + block_size,
          '__kernel void kernel_func(__global SRC_DST_TYPE *dst, __global SRC_DST_TYPE *src,',
          'uint dst_rows, uint dst_cols)',
          '{',
          'uint r0 = get_group_id(0);',
          'uint r1 = get_group_id(1);',
          //'uint l0 = get_local_id(0);',
          'uint l1 = get_local_id(1);',
          '__local SRC_DST_TYPE block_cache[BLOCK_SIZE][BLOCK_SIZE];',
          'for (int tile_x = 0; tile_x < (TILE_SIZE / BLOCK_SIZE); tile_x++) {',
          'for (int tile_y = 0; tile_y < (TILE_SIZE / BLOCK_SIZE); tile_y++) {',
          'for (int i = 0; i < BLOCK_SIZE; i++) {',
          'block_cache[l1][i] = src[(r0 * TILE_SIZE + tile_x * BLOCK_SIZE + l1)+(r1 * TILE_SIZE + tile_y * BLOCK_SIZE + i)*dst_cols];',
          '}',
          'barrier(CLK_LOCAL_MEM_FENCE);',
          'for (int i = 0; i < BLOCK_SIZE; i++) {',
          'dst[(r1 * TILE_SIZE + tile_y * BLOCK_SIZE + l1) + (r0 * TILE_SIZE + tile_x * BLOCK_SIZE + i) * dst_rows] = block_cache[i][l1];',
          '}',
          'barrier(CLK_LOCAL_MEM_FENCE);',
          '}',
          '}',
          '}'
        ].join('\n'));
        MatrixCL.kernel_cache[kernel_name] = kernel;
      }

      if (dst._numel > 0) {
        $CL.executeKernel(kernel, [
          { access: WebCL.MEM_WRITE_ONLY, datum: dst },
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { datum: dst_rows, type: WebCL.type.UINT },
          { datum: dst_cols, type: WebCL.type.UINT }
        ], [dst_cols / tile_size, dst_rows / (tile_size / block_size)], [1, block_size]);
      }
    } else if (dst_cols % 16 == 0 && dst_rows % 16 == 0) {
      var kernel_name = 'transpose_cl_' + A._klass + '_16';
      var kernel = MatrixCL.kernel_cache[kernel_name];
      var block_size = 16;
      if (!kernel) {
        kernel = $CL.createKernel([
          '#define SRC_DST_TYPE ' + ctypes[A._klass],
          '#define BLOCK_SIZE ' + block_size,
          '__kernel void kernel_func(__global SRC_DST_TYPE *dst, __global SRC_DST_TYPE *src,',
          'uint dst_rows, uint dst_cols)',
          '{',
          'uint r0 = get_group_id(0);',
          'uint r1 = get_group_id(1);',
          //'uint l0 = get_local_id(0);',
          'uint l1 = get_local_id(1);',
          '__local SRC_DST_TYPE block_cache[BLOCK_SIZE][BLOCK_SIZE];',
          'for (int i = 0; i < BLOCK_SIZE; i++) {',
          'block_cache[l1][i] = src[(r0 * BLOCK_SIZE + l1)+(r1 * BLOCK_SIZE + i)*dst_cols];',
          '}',
          'barrier(CLK_LOCAL_MEM_FENCE);',
          'for (int i = 0; i < BLOCK_SIZE; i++) {',
          'dst[(r1 * BLOCK_SIZE + l1) + (r0 * BLOCK_SIZE + i) * dst_rows] = block_cache[i][l1];',
          '}',
          '}'
        ].join('\n'));
        MatrixCL.kernel_cache[kernel_name] = kernel;
      }

      if (dst._numel > 0) {
        $CL.executeKernel(kernel, [
          { access: WebCL.MEM_WRITE_ONLY, datum: dst },
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { datum: dst_rows, type: WebCL.type.UINT },
          { datum: dst_cols, type: WebCL.type.UINT }
        ], [dst_cols / block_size, dst_rows], [1, block_size]);
      }
    } else {
      var kernel_name = 'transpose_cl_' + A._klass;
      var kernel = MatrixCL.kernel_cache[kernel_name];
      if (!kernel) {
        kernel = $CL.createKernel([
          '#define SRC_DST_TYPE ' + ctypes[A._klass],
          '__kernel void kernel_func(__global SRC_DST_TYPE *dst, __global SRC_DST_TYPE *src,',
          'uint dst_rows, uint dst_cols, uint length)',
          '{',
          'uint i = get_global_id(0);',
          'if (i >= length) {return;}',
          'uint dst_row = i % dst_rows, dst_col = i / dst_rows;',
          'dst[i] = src[dst_row * dst_cols + dst_col];',
          '}'
        ].join('\n'));
        MatrixCL.kernel_cache[kernel_name] = kernel;
      }

      if (dst._numel > 0) {
        $CL.executeKernel(kernel, [
          { access: WebCL.MEM_WRITE_ONLY, datum: dst },
          { access: WebCL.MEM_READ_ONLY, datum: A },
          { datum: dst_rows, type: WebCL.type.UINT },
          { datum: dst_cols, type: WebCL.type.UINT },
          { datum: dst._numel, type: WebCL.type.UINT }
        ], dst._numel);
      }

    }

    return dst;
  };

  $M.transpose = function (A) {
    if (A instanceof MatrixCL) {
      return transpose_cl(A);
    } else {
      return transpose_native(A);
    }
  }
  $M.t = $M.transpose;

  var repmat_native = $M.repmat;
  var repmat_cl = function (A) {
    //convert to Array
    var _rs;//number of repetion for each dim
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    var first_arg = args[0];
    if (first_arg instanceof Matrix) {
      var tarray = first_arg._getdata();
      _rs = Array.prototype.slice.call(tarray);
    } else if (first_arg.length !== void 0) {
      _rs = Array.prototype.slice.call(first_arg);
    } else {
      _rs = Array.prototype.slice.call(args);
    }
    if (_rs.length === 1) {
      //[2] => [2,2]
      _rs.push(_rs[0]);
    }

    while (_rs.length < A._ndims) {
      _rs.push(1);
    }

    // remove tailing 1
    while ((_rs.length > A._ndims) && (_rs[_rs.length - 1] == 1)) {
      _rs.pop();
    }

    var newdims = _rs.length;
    var newsize = [];
    var input_strides = new Int32Array(newdims + 1);
    var output_strides = new Int32Array(newdims + 1);
    var tmp_in_stride = 1;
    var tmp_out_stride = 1;
    var n_copy = 1;
    var rs_strides = [];
    for (var dim = 0; dim < newdims; dim++) {
      var indimsize = A._ndims > dim ? A._size[dim] : 1;
      var outdimsize = indimsize * _rs[dim];
      rs_strides.push(n_copy);
      n_copy *= _rs[dim];
      newsize.push(outdimsize);
      input_strides[dim] = (tmp_in_stride);
      output_strides[dim] = (tmp_out_stride);
      tmp_in_stride *= indimsize;
      tmp_out_stride *= outdimsize;
    }
    input_strides[newdims] = (tmp_in_stride);//dummy
    rs_strides.push(n_copy);//dummy

    var output_steps = new Int32Array(n_copy);
    for (var i = 0; i < n_copy; i++) {
      var out_offset = 0;
      for (var dim = 0; dim < newdims; dim++) {
        out_offset += Math.floor(i % rs_strides[dim + 1] / rs_strides[dim]) * output_strides[dim] * (A._size[dim] || 1);
      }
      output_steps[i] = (out_offset);
    }

    var dst = new MatrixCL(newsize, A._klass);
    var kernel_name = 'repmat_cl_' + newdims + '_' + A._klass;
    var kernel = MatrixCL.kernel_cache[kernel_name];
    if (!kernel) {
      kernel = $CL.createKernel([
        '#define DIMS ' + newdims,
        '#define SRC_DST_TYPE ' + ctypes[A._klass],
        '__kernel void kernel_func(__global SRC_DST_TYPE *dst, __global SRC_DST_TYPE *src,',
        '__global int *input_strides, __global int *output_strides, __global int *output_steps,',
        'uint n_copy, uint length)',
        '{',
        'uint i = get_global_id(0);',
        'if (i >= length) {return;}',
        'int out_offset = 0;',
        'SRC_DST_TYPE val = src[i];',
        'for (int dim = 0; dim < DIMS; dim++) {',
        '  out_offset += i % input_strides[dim+1] / input_strides[dim] * output_strides[dim];',
        '}',
        'for (int j = 0; j < n_copy; j++) {',
        '  dst[out_offset + output_steps[j]] = val;',
        '}',
        '}'
      ].join('\n'));
      MatrixCL.kernel_cache[kernel_name] = kernel;
    }

    if (dst._numel > 0) {
      var input_strides_mat = MatrixCL._fromtypedarray(input_strides, 'int32');
      var output_strides_mat = MatrixCL._fromtypedarray(output_strides, 'int32');
      var output_steps_mat = MatrixCL._fromtypedarray(output_steps, 'int32');
      $CL.executeKernel(kernel, [
        { access: WebCL.MEM_WRITE_ONLY, datum: dst },
        { access: WebCL.MEM_READ_ONLY, datum: A },
        { access: WebCL.MEM_READ_ONLY, datum: input_strides_mat },
        { access: WebCL.MEM_READ_ONLY, datum: output_strides_mat },
        { access: WebCL.MEM_READ_ONLY, datum: output_steps_mat },
        { datum: n_copy, type: WebCL.type.UINT },
        { datum: A._numel, type: WebCL.type.UINT }
      ], A._numel);
      input_strides_mat.destruct();
      output_strides_mat.destruct();
      output_steps_mat.destruct();
    }

    return dst;
  };

  $M.repmat = function (A) {
    if (A instanceof MatrixCL) {
      return repmat_cl.apply(null, arguments);
    } else {
      return repmat_native.apply(null, arguments);
    }
  };

  var permute_native = $M.permute;
  var permute_cl = function (A, order) {
    var src_size = A._size.concat();
    var numel = A._numel;
    if (order.length < src_size.length) {
      throw Error('order must include at least input dimension');
    }
    var ndim = order.length;
    var src_strides = A._strides.concat();
    while (src_size.length < ndim) {
      //append dimension of 1
      src_size.push(1);
      src_strides.push(numel);
    }
    var dst_size = [];
    for (var d = 0; d < ndim; d++) {
      var element = order[d] - 1;//order start from 1
      dst_size.push(src_size[element]);
    }

    var dst = new MatrixCL(dst_size, A._klass);
    var dst_strides = dst._strides.concat();
    while (dst_strides.length < ndim) {
      // occur when last dimensions are 1
      dst_strides.push(numel);
    }
    var dst_strides_perm = [];
    order.forEach((o, i) => dst_strides_perm[o - 1] = dst_strides[i]);
    var perm_stride = MatrixCL._fromtypedarray(new Int32Array(src_strides.concat(src_size, dst_strides_perm)), 'int32');

    var kernel_name = 'permute_cl_' + A._klass + '_' + ndim;
    var kernel = MatrixCL.kernel_cache[kernel_name];
    if (!kernel) {
      kernel = $CL.createKernel([
        '#define SRC_DST_TYPE ' + ctypes[A._klass],
        '#define DIMS ' + ndim,
        '__kernel void kernel_func(__global SRC_DST_TYPE *dst, __global const SRC_DST_TYPE *src,',
        '__global const int *perm_stride, uint length)',
        '{',
        'uint i = get_global_id(0);',
        'if (i >= length) {return;}',
        '__global int *src_strides = perm_stride;',
        '__global int *src_size = perm_stride + DIMS;',
        '__global int *dst_strides_perm = perm_stride + DIMS * 2;',
        'uint dst_idx = 0;',
        'for (int dim = 0; dim < DIMS; dim++) {',
        '  dst_idx += i / src_strides[dim] % src_size[dim] * dst_strides_perm[dim];',
        '}',
        'dst[dst_idx] = src[i];',
        '}'
      ].join('\n'));
      MatrixCL.kernel_cache[kernel_name] = kernel;
    }

    if (dst._numel > 0) {
      $CL.executeKernel(kernel, [
        { access: WebCL.MEM_WRITE_ONLY, datum: dst },
        { access: WebCL.MEM_READ_ONLY, datum: A },
        { access: WebCL.MEM_READ_ONLY, datum: perm_stride },
        { datum: dst._numel, type: WebCL.type.UINT }
      ], dst._numel, 256);
    }

    perm_stride.destruct();

    return dst;
  };

  $M.permute = function (A, order) {
    if (A instanceof MatrixCL) {
      return permute_cl(A, order);
    } else {
      return permute_native(A, order);
    }
  };

  var ipermute_native = $M.ipermute;
  $M.ipermute = function (A, order) {
    if (A instanceof MatrixCL) {
      // reverse order
      var rev_order = order.concat();//have same elements
      for (var d = 0; d < order.length; d++) {
        rev_order[order[d] - 1] = d + 1;
      }
      return permute_cl(A, rev_order);
    } else {
      return ipermute_native(A, order);
    }
  };
})();

},{"../../matrix":29,"../../sushi":33,"../../util":34,"../matrix_cl":24,"./driver":16,"./util_cl":23}],21:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
// overwrites functions in $M by opencl-aware version

var $M = require('../../sushi');
var util = require('../../util');
module.exports = $M;

(function () {
  if ($M.CL) {
    return;
  }
  var $CL = require('./driver');
  $M.CL = $CL;

  var Matrix = require('../../matrix');
  var MatrixCL = require('../matrix_cl');
  $M.CL.MatrixCL = MatrixCL;
  var WebCL = $M.CL.WebCL;

  $M.gpuArray = function (A) {
    if (A instanceof MatrixCL) {
      return A.copy();
    }
    A = util.as_mat(A);
    var mat = new MatrixCL(A._size, A._klass);
    mat.write(A._data);
    return mat;
  };

  $M.gather = function (A) {
    if (!(A instanceof MatrixCL)) {
      return A.copy();
    }
    var mat = new Matrix(A._size, A._klass);
    A.read(mat._data);
    return mat;
  };

  $M.devicetype = function (A) {
    if (A instanceof MatrixCL) {
      return 'cl';
    } else if (A instanceof Matrix) {
      return 'cpu';
    }
    return null;
  }

  var zeros_native = $M.zeros;
  $M.zeros = function () {
    //generate gpuArray if final argument is 'gpuArray'
    if (arguments[arguments.length - 1] == 'gpuArray') {
      var format = util.calc_zeros_size(Array.prototype.slice.call(arguments, 0, -1));
      var mat = new MatrixCL(format.size, format.klass);
      mat._fill(0);
      return mat;
    } else {
      return zeros_native.apply(null, arguments);
    }
  };
  var ones_native = $M.ones;
  $M.ones = function () {
    //generate gpuArray if final argument is 'gpuArray'
    if (arguments[arguments.length - 1] == 'gpuArray') {
      var format = util.calc_zeros_size(Array.prototype.slice.call(arguments, 0, -1));
      var mat = new MatrixCL(format.size, format.klass);
      mat._fill(1);
      return mat;
    } else {
      return ones_native.apply(null, arguments);
    }
  };

  require('./binary_arithmetic');
  require('./unary_arithmetic');
  require('./shape_converter_cl');
  require('./reduction_cl');
  require('./clblasgemm');
})();

},{"../../matrix":29,"../../sushi":33,"../../util":34,"../matrix_cl":24,"./binary_arithmetic":14,"./clblasgemm":15,"./driver":16,"./reduction_cl":19,"./shape_converter_cl":20,"./unary_arithmetic":22}],22:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
// overwrites unary arithmetic functions

var $M = require('../../sushi');
var util = require('../../util');
var util_cl = require('./util_cl');

(function () {
  var $CL = require('./driver');
  $M.CL = $CL;

  var Matrix = require('../../matrix');
  var MatrixCL = require('../matrix_cl');
  var WebCL = $M.CL.WebCL;
  var ctypes = util_cl.ctypes;
  var webcltypes = util_cl.webcltypes;

  var unary_arith_cl = function (A, name, operator) {
    // A is MatrixCL (not number)
    var dst_klass = A._klass;
    if (dst_klass == 'logical') {
      dst_klass = 'single';
    }

    var kernel_name = 'unary_arith_cl_' + name + '_' + A._klass + '_' + dst_klass;
    var kernel = MatrixCL.kernel_cache[kernel_name];
    if (!kernel) {
      kernel = $CL.createKernel([
        '#define SRC_TYPE  ' + ctypes[A._klass],
        '#define DST_TYPE ' + ctypes[dst_klass],
        '#define OPERATOR(left) ' + operator,
        '__kernel void kernel_func(__global DST_TYPE *dst, __global SRC_TYPE *a, uint length) {',
        '  uint i = get_global_id(0);',
        '  if (i >= length) { return; }',
        '  dst[i] = (DST_TYPE)OPERATOR(a[i]);',
        '}'
      ].join('\n'));
      MatrixCL.kernel_cache[kernel_name] = kernel;
    }

    var dst = new MatrixCL(A._size, dst_klass);
    if (dst._numel > 0) {
      $CL.executeKernel(kernel, [
        { access: WebCL.MEM_WRITE_ONLY, datum: dst },
        {access:WebCL.MEM_READ_ONLY,datum:A},
        { datum: dst._numel, type: WebCL.type.UINT }],
        dst._numel);
    }
    return dst;
  }

  var subsitute_unary_arith = function (name, operator) {
    var func_native = $M[name];
    var func_cl = function (A) {
      return unary_arith_cl(A, name, operator);
    };
    $M[name] = function (A) {
      if (A instanceof MatrixCL) {
        return func_cl(A);
      } else {
        return func_native(A);
      }
    };
  }
  subsitute_unary_arith('uplus', '(left)');
  subsitute_unary_arith('uminus', '-(left)');
  subsitute_unary_arith('floor', 'floor((float)(left))');
  subsitute_unary_arith('fix', '((left) > 0 ? floor((float)(left)): ceil((float)(left)))');
  subsitute_unary_arith('ceil', 'ceil((float)(left))');
  subsitute_unary_arith('exp', 'exp((float)(left))');
  subsitute_unary_arith('log', 'log((float)(left))');

})();

},{"../../matrix":29,"../../sushi":33,"../../util":34,"../matrix_cl":24,"./driver":16,"./util_cl":23}],23:[function(require,module,exports){
'use strict';
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.

var $M = require('../../sushi');

(function () {
  var $CL = require('./driver');
  $M.CL = $CL;

  var Matrix = require('../../matrix');
  var MatrixCL = require('../matrix_cl');
  var WebCL = $M.CL.WebCL;
  var ctypes = { single: 'float', int32: 'int', uint8: 'uchar', logical: 'uchar' };
  module.exports.ctypes = ctypes;
  var webcltypes = { single: WebCL.type.FLOAT, int32: WebCL.type.INT, uint8: WebCL.type.UCHAR, logical: WebCL.type.UCHAR };
  module.exports.webcltypes = webcltypes;
  
  // unify matrices into cpu / gpu, number is not changed
  var unify_mats = function (inputs) {
    // determine if MatrixCL exists
    var matcl_exist = false;
    for (var i = 0; i < inputs.length; i++) {
      var mati = inputs[i];
      if (mati instanceof MatrixCL) {
        matcl_exist = true;
        break;
      }
    }

    var unified_mats = { cl: matcl_exist, length: inputs.length };
    if (matcl_exist) {
      // cast all Matrix into MatrixCL
      for (var i = 0; i < inputs.length; i++) {
        var mati = inputs[i];
        if ((mati instanceof Matrix) && !(mati instanceof MatrixCL)) {
          unified_mats[i] = MatrixCL._fromnativemat(mati);
        } else {
          unified_mats[i] = mati;
        }
      }
    } else {
      for (var i = 0; i < inputs.length; i++) {
        var mati = inputs[i];
        unified_mats[i] = mati;
      }
    }

    return unified_mats;
  }
  
  module.exports.unify_mats = unify_mats;

  var unify_call = function (native_func, cl_func) {
    //call function using specified arguments unified
    var unified_mats = unify_mats(Array.prototype.slice.call(arguments, 2));
    if (unified_mats.cl) {
      return cl_func.apply(null, unified_mats);
    } else {
      return native_func.apply(null, unified_mats);
    }
  }

  module.exports.unify_call = unify_call;
})();

},{"../../matrix":29,"../../sushi":33,"../matrix_cl":24,"./driver":16}],24:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Matrix = require('../matrix');
var Colon = require('../colon');
var $CL = require('./handwrittenjs/driver');
var WebCL = $CL.WebCL;
var ctypes = { single: 'float', int32: 'int', uint8: 'uchar', logical: 'uchar' };
var webcltypes = { single: WebCL.type.FLOAT, int32: WebCL.type.INT, uint8: WebCL.type.UCHAR, logical: WebCL.type.UCHAR };
var MatrixCL = (function (_super) {
    __extends(MatrixCL, _super);
    function MatrixCL(size, klass) {
        _super.call(this, size, klass, true);
        var buffer_size = this._numel * this._data_ctor.BYTES_PER_ELEMENT;
        if (this._numel == 0) {
            // buffer of 0 byte cannot be constructed, but allocate buffer to avoid exception
            buffer_size = 4;
        }
        this._clbuffer = $CL.createBuffer(buffer_size);
    }
    MatrixCL.prototype.to_cpu = function () {
        var cpumat = new Matrix(this._size, this._klass);
        this.read(cpumat._data);
        return cpumat;
    };
    MatrixCL.prototype.throw_if_destructed = function () {
        if (!this._clbuffer) {
            throw new Error('Attempting use destructed matrix');
        }
    };
    MatrixCL.prototype.write = function (src_typed_array, dst_bytes_offset) {
        this.throw_if_destructed();
        if (src_typed_array.length > 0) {
            $CL.writeBuffer(this._clbuffer, src_typed_array, dst_bytes_offset);
        }
    };
    MatrixCL.prototype.read = function (dst_typed_array, src_bytes_offset) {
        this.throw_if_destructed();
        if (dst_typed_array.length > 0) {
            $CL.readBuffer(this._clbuffer, dst_typed_array, src_bytes_offset);
        }
    };
    MatrixCL._fromnativemat = function (A) {
        if (A instanceof MatrixCL) {
            return A.copy();
        }
        else {
            var matcl = new MatrixCL(A._size, A._klass);
            matcl.write(A._getdata());
            return matcl;
        }
    };
    MatrixCL._fromtypedarray = function (src_typed_array, klass) {
        var mat = new MatrixCL([1, src_typed_array.length], klass);
        mat.write(src_typed_array);
        return mat;
    };
    MatrixCL.prototype.destruct = function () {
        if (this._clbuffer) {
            $CL.releaseBuffer(this._clbuffer);
            this._clbuffer = null;
        }
    };
    MatrixCL.prototype.inspect = function (depth) {
        var shape_str = this._size.join('x');
        if (this._numel <= 100) {
            return 'MatrixCL ' + shape_str + ' ' + this._klass + '\n' + this.toString();
        }
        else {
            return 'MatrixCL ' + shape_str + ' ' + this._klass;
        }
    };
    MatrixCL.prototype._getdata = function () {
        //get copy of data in TypedArray
        var typed_array = new this._data_ctor(this._numel);
        this.read(typed_array);
        return typed_array;
    };
    MatrixCL.prototype.getdataref = function (src_offset, length) {
        if (src_offset === void 0) { src_offset = 0; }
        //get read-only view of array
        // copy minimum range of gpu array
        if (length == null) {
            length = this._numel - src_offset;
        }
        var typed_array = new this._data_ctor(length);
        this.read(typed_array, src_offset * this._data_ctor.BYTES_PER_ELEMENT);
        return typed_array;
    };
    MatrixCL.prototype.getdatacopy = function (src_offset, length, dst) {
        if (src_offset === void 0) { src_offset = 0; }
        if (length == null) {
            length = this._numel - src_offset;
        }
        if (!dst) {
            dst = new this._data_ctor(length);
        }
        var range_view = new this._data_ctor(dst.buffer, dst.byteOffset, length);
        this.read(range_view, src_offset * this._data_ctor.BYTES_PER_ELEMENT);
        return dst;
    };
    MatrixCL.prototype.setdata = function (src, dst_offset) {
        if (dst_offset === void 0) { dst_offset = 0; }
        //set raw data into buffer
        this.write(src, dst_offset * this._data_ctor.BYTES_PER_ELEMENT);
    };
    MatrixCL.get_cast_str = function (dst_klass, src_klass) {
        var cast_str;
        if (src_klass == dst_klass) {
            cast_str = '(x)';
        }
        else if (dst_klass != 'logical') {
            cast_str = '(' + dst_klass + ')(x)';
        }
        else {
            cast_str = '((x != 0) ? 1 : 0)';
        }
        return cast_str;
    };
    MatrixCL.prototype.copy = function (klass) {
        var clone = new MatrixCL(this._size, klass || this._klass);
        var kernel_name = 'copy_' + clone._klass + '_' + this._klass;
        var kernel = MatrixCL.kernel_cache[kernel_name];
        if (!kernel) {
            kernel = $CL.createKernel([
                '#define DST_TYPE ' + ctypes[clone._klass],
                '#define SRC_TYPE ' + ctypes[this._klass],
                '#define TYPE_CAST(x) ' + MatrixCL.get_cast_str(clone._klass, this._klass),
                '__kernel void kernel_func(__global DST_TYPE *dst, __global SRC_TYPE *src, uint length) {',
                '  uint i = get_global_id(0);',
                '  if (i >= length) { return; }',
                '  dst[i] = TYPE_CAST(src[i]);',
                '}'
            ].join('\n'));
            MatrixCL.kernel_cache[kernel_name] = kernel;
        }
        if (this._numel > 0) {
            $CL.executeKernel(kernel, [
                { access: WebCL.MEM_WRITE_ONLY, datum: clone },
                { access: WebCL.MEM_READ_ONLY, datum: this },
                { datum: this._numel, type: WebCL.type.UINT }
            ], this._numel);
        }
        return clone;
    };
    MatrixCL.prototype._fill = function (val) {
        var kernel_name = 'fill_' + this._klass;
        var kernel = MatrixCL.kernel_cache[kernel_name];
        if (!kernel) {
            kernel = $CL.createKernel([
                '#define DST_TYPE ' + ctypes[this._klass],
                '__kernel void kernel_func(__global DST_TYPE *dst, uint length, DST_TYPE val) {',
                '  uint i = get_global_id(0);',
                '  if (i >= length) { return; }',
                '  dst[i] = val;',
                '}'
            ].join('\n'));
            MatrixCL.kernel_cache[kernel_name] = kernel;
        }
        if (this._numel > 0) {
            $CL.executeKernel(kernel, [
                { access: WebCL.MEM_WRITE_ONLY, datum: this },
                { datum: this._numel, type: WebCL.type.UINT },
                { datum: val, type: webcltypes[this._klass] }
            ], this._numel);
        }
    };
    MatrixCL.prototype.get = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args.length == 0) {
            // get scalar
            return this.get_scalar([1]);
        }
        var all_number = args.every(function (v) { return typeof (v) === 'number'; });
        if (all_number) {
            return this.get_scalar(args);
        }
        else {
            return this.get_matrix_nd(args);
        }
    };
    MatrixCL.prototype.get_scalar = function (inds) {
        this._isvalidindexerr(inds);
        var arrayidx = this._getarrayindex(inds);
        var dst_typed_array = new this._data_ctor(1); //read only 1 element
        this.read(dst_typed_array, arrayidx * this._data_ctor.BYTES_PER_ELEMENT);
        return dst_typed_array[0];
    };
    MatrixCL._get_ind_iterator_cl = function (ind, dim_size) {
        // return index within valid range
        if (typeof (ind) === 'number') {
            var ind_positive = ind;
            if (ind_positive < 0) {
                ind_positive += dim_size + 1;
            }
            if (ind_positive <= 0 || ind_positive > dim_size) {
                throw Error('Index exceeds matrix dimension');
            }
            return {
                kernel_arg: { datum: ind_positive, type: webcltypes.int32 },
                to_destruct: null, length: 1,
                typename: 'int'
            };
        }
        else if (ind instanceof Colon) {
            var start = ind.start;
            var stop = ind.stop;
            var step = ind.step;
            if (ind.all) {
                start = 1;
                stop = dim_size;
                step = 1;
            }
            if (start < 0) {
                start += dim_size + 1;
            }
            if (stop < 0) {
                stop += dim_size + 1;
            }
            var length = 0;
            if ((step > 0 && stop >= start) || (step < 0 && stop <= start)) {
                length = Math.floor((stop - start) / step) + 1;
                // check if in valid range
                var final_value = start + step * (length - 1);
                if ((start <= 0 || start > dim_size) || (final_value <= 0 || final_value > dim_size)) {
                    throw Error('Index exceeds matrix dimension');
                }
            }
            return {
                kernel_arg: { datum: [start, step, stop, length], type: webcltypes.int32 | WebCL.type.VEC4 },
                to_destruct: null,
                length: length,
                typename: 'int4'
            };
        }
        else if (ind instanceof Matrix) {
            var to_destruct = null;
            var ind_mat;
            if (ind instanceof MatrixCL) {
                ind_mat = ind;
            }
            else {
                ind_mat = MatrixCL._fromnativemat(ind);
                to_destruct = ind_mat;
            }
            // check if in valid range
            var kernel_name = '_get_ind_iterator_cl_' + ind._klass;
            var kernel = MatrixCL.kernel_cache[kernel_name];
            if (!kernel) {
                var kernel_str = [
                    '#define SRC_TYPE ' + ctypes[ind._klass],
                    '__kernel void kernel_func(__global int *dst, __global const SRC_TYPE *src, int dim_size, uint src_length) {',
                    '  uint i = get_global_id(0);',
                    '  if (i >= src_length) { return; }',
                    '  int src_val = (int)src[i];',
                    '  if (src_val == 0 || src_val > dim_size || src_val < -dim_size) {',
                    '    dst[0] = 1;',
                    '  }',
                    '}'
                ].join('\n');
                kernel = $CL.createKernel(kernel_str);
                MatrixCL.kernel_cache[kernel_name] = kernel;
            }
            if (ind_mat._numel > 0) {
                var validity_result = new MatrixCL([1, 1], 'int32');
                validity_result._fill(0);
                $CL.executeKernel(kernel, [
                    { access: WebCL.MEM_WRITE_ONLY, datum: validity_result },
                    { access: WebCL.MEM_READ_ONLY, datum: ind_mat },
                    { datum: dim_size, type: WebCL.type.INT },
                    { datum: ind_mat._numel, type: WebCL.type.UINT }
                ], ind_mat._numel);
                if (validity_result.getdataref()[0]) {
                    validity_result.destruct();
                    if (to_destruct) {
                        to_destruct.destruct();
                    }
                    throw Error('Index exceeds matrix dimension');
                }
                validity_result.destruct();
            }
            return {
                kernel_arg: { datum: ind_mat, access: WebCL.MEM_READ_ONLY },
                to_destruct: to_destruct,
                length: ind_mat._numel,
                typename: '__global ' + ctypes[ind_mat._klass] + ' *'
            };
        }
    };
    MatrixCL.prototype.get_matrix_nd = function (inds) {
        var inds_ndim = inds.length;
        var destruct_targets = [];
        try {
            // replace logical matrix with vector
            for (var i = 0; i < inds_ndim; i++) {
                var ind = inds[i];
                if (ind instanceof Matrix) {
                    if (ind._klass == 'logical') {
                        var idxarray = ind._find();
                        inds[i] = idxarray;
                        destruct_targets.push(idxarray);
                    }
                }
            }
            var virtual_input_shape = [];
            if (this._ndims <= inds_ndim) {
                // pad with 1
                virtual_input_shape = this._size.concat();
                while (virtual_input_shape.length < inds_ndim) {
                    virtual_input_shape.push(1);
                }
            }
            else {
                // last dimension is like linear index
                var cur_prod = 1;
                for (var dim_1 = 0; dim_1 < inds_ndim - 1; dim_1++) {
                    virtual_input_shape.push(this._size[dim_1]);
                    cur_prod *= this._size[dim_1];
                }
                virtual_input_shape.push(this._numel / cur_prod);
            }
            var virtual_input_stride = [];
            var stride_tmp = 1;
            for (var dim = 0; dim < inds_ndim; dim++) {
                virtual_input_stride.push(stride_tmp);
                stride_tmp *= virtual_input_shape[dim];
            }
            var kernel_args = [];
            var kernel_type_names = [];
            var dst_shape = [];
            var dst_stride = []; //not use dst._strides because tailing 1 dimension is omitted
            var dst_stride_tmp = 1;
            for (var dim = 0; dim < inds_ndim; dim++) {
                var iter_and_length = MatrixCL._get_ind_iterator_cl(inds[dim], virtual_input_shape[dim]);
                if (iter_and_length.to_destruct) {
                    destruct_targets.push(iter_and_length.to_destruct);
                }
                kernel_args.push(iter_and_length.kernel_arg);
                kernel_type_names.push(iter_and_length.typename);
                dst_shape.push(iter_and_length.length);
                dst_stride.push(dst_stride_tmp);
                dst_stride_tmp *= iter_and_length.length;
            }
            var dst_numel = dst_stride_tmp;
            var dst_reshape_shape = null;
            if (inds_ndim == 1) {
                // linear indexing case
                dst_shape.push(1); //avoid error on new Matrix()
                // if ind is logical matrix, regarded as vector in the following
                // colon is row vector
                // src and ind are both vectors => follows direction of src
                // otherwise: follows ind's shape
                var is_ind_vector = false;
                var only_ind = inds[0];
                if (only_ind instanceof Matrix) {
                    if (only_ind._ndims == 2 && (only_ind._size[0] == 1 || only_ind._size[1] == 1)) {
                        is_ind_vector = true;
                    }
                }
                else if (only_ind instanceof Colon) {
                    is_ind_vector = true;
                }
                var is_src_vector = false;
                if (this._ndims == 2 && (this._size[0] == 1 || this._size[1] == 1)) {
                    is_src_vector = true;
                }
                if (is_src_vector && is_ind_vector) {
                    // follow direction of src
                    if (this._size[0] == 1) {
                        // reshape to row vector
                        dst_reshape_shape = [1, dst_shape[0]];
                    }
                }
                else {
                    // follow ind's shape
                    if (only_ind instanceof Matrix) {
                        dst_reshape_shape = only_ind._size;
                    }
                    else if (only_ind instanceof Colon) {
                        // reshape to row vector
                        dst_reshape_shape = [1, dst_shape[0]];
                    }
                }
            }
            var dst = new MatrixCL(dst_shape, this._klass);
            var kernel_name = 'get_matrix_nd_' + this._klass + '_' + inds_ndim + '_' + kernel_type_names.join(',');
            var kernel = MatrixCL.kernel_cache[kernel_name];
            if (!kernel) {
                var kernel_index_args_str = '';
                for (var dim = 0; dim < inds_ndim; dim++) {
                    kernel_index_args_str += ',' + kernel_type_names[dim] + ' ind' + dim; //variable ind0, ind1, ...
                }
                var kernel_add_dim = '';
                for (var dim = 0; dim < inds_ndim; dim++) {
                    kernel_add_dim += 'ADD_IND(' + dim + ');';
                }
                var kernel_get_ind_func = '';
                for (var dim = 0; dim < inds_ndim; dim++) {
                    kernel_get_ind_func += 'int get_ind' + dim;
                    var kernel_type_name = kernel_type_names[dim];
                    switch (kernel_type_name) {
                        case 'int':
                            kernel_get_ind_func += '(int indexer, int offset, int dim_size) {return indexer;}';
                            break;
                        case 'int4':
                            kernel_get_ind_func += '(int4 indexer, int offset, int dim_size) {return indexer.x + indexer.y * offset;}';
                            break;
                        default:
                            kernel_get_ind_func += '(' + kernel_type_name + ' indexer, int offset, int dim_size) {int val = (int)indexer[offset]; if (val < 0) { return val + dim_size + 1; } else { return val; }}';
                            break;
                    }
                    kernel_get_ind_func += '\n';
                }
                var kernel_str = [
                    '#define DIMS ' + inds_ndim,
                    '#define SRC_DST_TYPE ' + ctypes[this._klass],
                    kernel_get_ind_func,
                    '#define ADD_IND(dim) {dst_coord = (i / dst_stride[dim]) % dst_shape[dim]; src_coord = (get_ind ## dim(ind ## dim, dst_coord, src_shape[dim])) - 1; src_linear_index += src_coord * src_stride[dim];}',
                    '__kernel void kernel_func(__global SRC_DST_TYPE *dst, __global const SRC_DST_TYPE *src, __global const int *size_strides, uint output_length',
                    kernel_index_args_str,
                    ') {',
                    '  uint i = get_global_id(0);',
                    '  if (i >= output_length) { return; }',
                    '  __global const int *src_stride = size_strides, *src_shape = size_strides + DIMS * 1, *dst_stride = size_strides + DIMS * 2, *dst_shape = size_strides + DIMS * 3;',
                    '  int dst_coord, src_coord;',
                    '  int src_linear_index = 0;',
                    kernel_add_dim,
                    '  dst[i] = src[src_linear_index];',
                    '}'
                ].join('\n');
                kernel = $CL.createKernel(kernel_str);
                MatrixCL.kernel_cache[kernel_name] = kernel;
            }
            if (dst_numel > 0) {
                var size_strides = []; //src_stride/src_shape/dst_stride/dst_shape; dst_shape is last because [1] may be added above
                size_strides.push.apply(size_strides, virtual_input_stride);
                size_strides.push.apply(size_strides, virtual_input_shape);
                size_strides.push.apply(size_strides, dst_stride);
                size_strides.push.apply(size_strides, dst_shape);
                var size_strides_mat = MatrixCL._fromtypedarray(new Int32Array(size_strides), 'int32');
                destruct_targets.push(size_strides_mat);
                kernel_args.unshift({ access: WebCL.MEM_WRITE_ONLY, datum: dst }, { access: WebCL.MEM_READ_ONLY, datum: this }, { access: WebCL.MEM_READ_ONLY, datum: size_strides_mat }, { datum: dst_numel, type: WebCL.type.UINT });
                $CL.executeKernel(kernel, kernel_args, dst_numel);
            }
            if (dst_reshape_shape) {
                dst.reshape_inplace(dst_reshape_shape);
            }
            return dst;
        }
        finally {
            for (var i = 0; i < destruct_targets.length; i++) {
                destruct_targets[i].destruct();
            }
        }
    };
    MatrixCL.prototype.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        //last argument is value, but subsequent function requires first argument to be value
        var val = args.pop();
        if (!(val instanceof Matrix) && val.length !== void 0) {
            // js array (or array-like)
            val = Matrix.jsa2mat(val, false, this._klass);
        }
        // scalar matrix converted to number
        if (val instanceof Matrix && val._numel == 1) {
            val = val.get_scalar([1]);
        }
        var all_number = args.every(function (v) { return typeof (v) === 'number'; });
        if (all_number) {
            this.set_scalar(val, args);
        }
        else {
            this.set_matrix_nd(val, args);
        }
    };
    MatrixCL.prototype.set_scalar = function (val, inds) {
        this._isvalidindexerr(inds);
        var arrayidx = this._getarrayindex(inds);
        var scalar_val;
        if (val instanceof Matrix) {
            if (val._numel != 1) {
                throw new Error('Value is not scalar');
            }
            scalar_val = val.get_scalar([1]);
        }
        else {
            scalar_val = val;
        }
        if (Matrix._logical_cast_required(this._klass)) {
            scalar_val = Matrix._logical_cast(scalar_val);
        }
        var typed_array = new this._data_ctor(1);
        typed_array[0] = scalar_val;
        this.write(typed_array, arrayidx * this._data_ctor.BYTES_PER_ELEMENT);
    };
    MatrixCL.cast_scalar_val = function (val, klass) {
        switch (klass) {
            case 'int32':
                val = val | 0;
                break;
            case 'uint8':
                val = val & 0xFF;
                break;
            case 'logical':
                val = val ? 1 : 0;
                break;
        }
        return val;
    };
    MatrixCL.prototype.set_matrix_single = function (val, singleind) {
        var index_mat;
        var destruct_index_mat = true;
        var val_mat;
        var destruct_val_mat = false;
        var input_size;
        if (singleind instanceof Colon) {
            var single_idx_array = singleind.tojsa(this._numel);
            input_size = [1, single_idx_array.length]; //row vector
            index_mat = new MatrixCL(input_size, 'int32');
            index_mat.write(new Int32Array(single_idx_array));
        }
        else if (singleind instanceof MatrixCL) {
            index_mat = singleind;
            destruct_index_mat = false;
        }
        else if (singleind instanceof Matrix) {
            index_mat = MatrixCL._fromnativemat(singleind);
        }
        try {
            if (val instanceof Matrix) {
                if (index_mat._numel != val._numel) {
                    throw new Error('Dimension mismatch');
                }
                if (val instanceof MatrixCL) {
                    val_mat = val;
                }
                else {
                    val_mat = MatrixCL._fromnativemat(val);
                    destruct_val_mat = true;
                }
                var kernel_name = 'set_matrix_single_matrix_' + this._klass + '_' + val_mat._klass + '_' + index_mat._klass;
                var kernel = MatrixCL.kernel_cache[kernel_name];
                if (!kernel) {
                    kernel = $CL.createKernel([
                        '#define SRC_TYPE ' + ctypes[val_mat._klass],
                        '#define DST_TYPE ' + ctypes[this._klass],
                        '#define INDEX_TYPE ' + ctypes[index_mat._klass],
                        '#define TYPE_CAST(x) ' + MatrixCL.get_cast_str(this._klass, val_mat._klass),
                        '__kernel void kernel_func(__global DST_TYPE *dst, __global SRC_TYPE *src, __global INDEX_TYPE *index, uint index_length) {',
                        '  uint i = get_global_id(0);',
                        '  if (i >= index_length) { return; }',
                        '  dst[(uint)index[i]-1] = TYPE_CAST(src[i]);',
                        '}'
                    ].join('\n'));
                    MatrixCL.kernel_cache[kernel_name] = kernel;
                }
                if (index_mat._numel > 0) {
                    $CL.executeKernel(kernel, [
                        { access: WebCL.MEM_WRITE_ONLY, datum: this },
                        { access: WebCL.MEM_READ_ONLY, datum: val_mat },
                        { access: WebCL.MEM_READ_ONLY, datum: index_mat },
                        { datum: index_mat._numel, type: WebCL.type.UINT }
                    ], index_mat._numel);
                }
            }
            else {
                var kernel_name = 'set_matrix_single_scalar_' + this._klass + '_' + index_mat._klass;
                var kernel = MatrixCL.kernel_cache[kernel_name];
                if (!kernel) {
                    kernel = $CL.createKernel([
                        '#define DST_TYPE ' + ctypes[this._klass],
                        '#define INDEX_TYPE ' + ctypes[index_mat._klass],
                        '__kernel void kernel_func(__global DST_TYPE *dst, DST_TYPE src, __global INDEX_TYPE *index, uint index_length) {',
                        '  uint i = get_global_id(0);',
                        '  if (i >= index_length) { return; }',
                        '  dst[(uint)index[i]-1] = src;',
                        '}'
                    ].join('\n'));
                    MatrixCL.kernel_cache[kernel_name] = kernel;
                }
                var scalar_val = MatrixCL.cast_scalar_val(val, this._klass);
                if (index_mat._numel > 0) {
                    $CL.executeKernel(kernel, [
                        { access: WebCL.MEM_WRITE_ONLY, datum: this },
                        { datum: scalar_val, type: webcltypes[this._klass] },
                        { access: WebCL.MEM_READ_ONLY, datum: index_mat },
                        { datum: index_mat._numel, type: WebCL.type.UINT }
                    ], index_mat._numel);
                }
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            if (destruct_index_mat) {
                index_mat.destruct();
            }
        }
    };
    MatrixCL.prototype.set_matrix_nd = function (val, inds) {
        var inds_ndim = inds.length;
        var destruct_targets = [];
        try {
            // replace logical matrix with vector
            for (var i = 0; i < inds_ndim; i++) {
                var ind = inds[i];
                if (ind instanceof Matrix) {
                    if (ind._klass == 'logical') {
                        var idxarray = ind._find();
                        inds[i] = idxarray;
                        destruct_targets.push(idxarray);
                    }
                }
            }
            var virtual_input_shape = [];
            if (this._ndims <= inds_ndim) {
                // pad with 1
                virtual_input_shape = this._size.concat();
                while (virtual_input_shape.length < inds_ndim) {
                    virtual_input_shape.push(1);
                }
            }
            else {
                // last dimension is like linear index
                var cur_prod = 1;
                for (var dim_2 = 0; dim_2 < inds_ndim - 1; dim_2++) {
                    virtual_input_shape.push(this._size[dim_2]);
                    cur_prod *= this._size[dim_2];
                }
                virtual_input_shape.push(this._numel / cur_prod);
            }
            var virtual_input_stride = [];
            var stride_tmp = 1;
            for (var dim = 0; dim < inds_ndim; dim++) {
                virtual_input_stride.push(stride_tmp);
                stride_tmp *= virtual_input_shape[dim];
            }
            var kernel_args = [];
            var kernel_type_names = [];
            var dst_shape = [];
            var dst_stride = []; //not use dst._strides because tailing 1 dimension is omitted
            var dst_stride_tmp = 1;
            var squeezed_dst_shape = [];
            for (var dim = 0; dim < inds_ndim; dim++) {
                var iter_and_length = MatrixCL._get_ind_iterator_cl(inds[dim], virtual_input_shape[dim]);
                if (iter_and_length.to_destruct) {
                    destruct_targets.push(iter_and_length.to_destruct);
                }
                kernel_args.push(iter_and_length.kernel_arg);
                kernel_type_names.push(iter_and_length.typename);
                dst_shape.push(iter_and_length.length);
                if (iter_and_length.length != 1) {
                    squeezed_dst_shape.push(iter_and_length.length);
                }
                dst_stride.push(dst_stride_tmp);
                dst_stride_tmp *= iter_and_length.length;
            }
            var dst_numel = dst_stride_tmp;
            var val_is_matrix = false;
            if (val instanceof Matrix) {
                if (val._numel == 1) {
                    //1x1 mat: treat as scalar
                    val = val.get();
                }
                else {
                    val_is_matrix = true;
                    if (!(val instanceof MatrixCL)) {
                        // cpu matrix
                        val = MatrixCL._fromnativemat(val);
                        destruct_targets.push(val);
                    }
                }
            }
            if (val_is_matrix) {
                // check shape
                // squeezed_dst_shape is 1-d, number of element must match
                // otherwise, squeezed shape of val must match
                var val_numel = val._numel;
                var raise_error = false;
                if (squeezed_dst_shape.length == 0) {
                    // set of scalar
                    if (val_numel != 1) {
                        raise_error = true;
                    }
                }
                else if (squeezed_dst_shape.length == 1) {
                    if (val_numel != squeezed_dst_shape[0]) {
                        raise_error = true;
                    }
                }
                else {
                    var val_shape = val._size;
                    var squeezed_val_shape = val_shape.filter(function (v) { return v != 1; });
                    if (!squeezed_val_shape.every(function (v, i) { return v == squeezed_dst_shape[i]; })) {
                        raise_error = true;
                    }
                }
                if (raise_error) {
                    throw new Error('The shape of matrix does not fit');
                }
            }
            var kernel_name = 'set_matrix_nd_' + this._klass + '_' + val_is_matrix + '_' + inds_ndim + '_' + kernel_type_names.join(',');
            var kernel = MatrixCL.kernel_cache[kernel_name];
            if (!kernel) {
                var kernel_index_args_str = '';
                for (var dim = 0; dim < inds_ndim; dim++) {
                    kernel_index_args_str += ',' + kernel_type_names[dim] + ' ind' + dim; //variable ind0, ind1, ...
                }
                var kernel_add_dim = '';
                for (var dim = 0; dim < inds_ndim; dim++) {
                    kernel_add_dim += 'ADD_IND(' + dim + ');';
                }
                var kernel_get_ind_func = '';
                for (var dim = 0; dim < inds_ndim; dim++) {
                    kernel_get_ind_func += 'int get_ind' + dim;
                    var kernel_type_name = kernel_type_names[dim];
                    switch (kernel_type_name) {
                        case 'int':
                            kernel_get_ind_func += '(int indexer, int offset, int dim_size) {return indexer;}';
                            break;
                        case 'int4':
                            kernel_get_ind_func += '(int4 indexer, int offset, int dim_size) {return indexer.x + indexer.y * offset;}';
                            break;
                        default:
                            kernel_get_ind_func += '(' + kernel_type_name + ' indexer, int offset, int dim_size) {int val = (int)indexer[offset]; if (val < 0) { return val + dim_size + 1; } else { return val; }}';
                            break;
                    }
                    kernel_get_ind_func += '\n';
                }
                var kernel_str = [
                    '#define DIMS ' + inds_ndim,
                    '#define SRC_TYPE ' + ctypes[this._klass],
                    '#define DST_TYPE ' + ctypes[val_is_matrix ? val._klass : this._klass],
                    '#define TYPE_CAST(x) ' + MatrixCL.get_cast_str(this._klass, val_is_matrix ? val._klass : this._klass),
                    kernel_get_ind_func,
                    '#define ADD_IND(dim) {dst_coord = (i / dst_stride[dim]) % dst_shape[dim]; src_coord = (get_ind ## dim(ind ## dim, dst_coord, src_shape[dim])) - 1; src_linear_index += src_coord * src_stride[dim];}',
                    '__kernel void kernel_func(',
                    val_is_matrix ? '__global const DST_TYPE *dst' : 'DST_TYPE dst',
                    ', __global SRC_TYPE *src, __global const int *size_strides, uint output_length',
                    kernel_index_args_str,
                    ') {',
                    '  uint i = get_global_id(0);',
                    '  if (i >= output_length) { return; }',
                    '  __global const int *src_stride = size_strides, *src_shape = size_strides + DIMS * 1, *dst_stride = size_strides + DIMS * 2, *dst_shape = size_strides + DIMS * 3;',
                    '  int dst_coord, src_coord;',
                    '  int src_linear_index = 0;',
                    kernel_add_dim,
                    val_is_matrix ? '  src[src_linear_index] = TYPE_CAST(dst[i]);' : '  src[src_linear_index] = TYPE_CAST(dst);',
                    '}'
                ].join('\n');
                kernel = $CL.createKernel(kernel_str);
                MatrixCL.kernel_cache[kernel_name] = kernel;
            }
            if (dst_numel > 0) {
                var size_strides = []; //src_stride/src_shape/dst_stride/dst_shape; dst_shape is last because [1] may be added above
                size_strides.push.apply(size_strides, virtual_input_stride);
                size_strides.push.apply(size_strides, virtual_input_shape);
                size_strides.push.apply(size_strides, dst_stride);
                size_strides.push.apply(size_strides, dst_shape);
                var size_strides_mat = MatrixCL._fromtypedarray(new Int32Array(size_strides), 'int32');
                destruct_targets.push(size_strides_mat);
                kernel_args.unshift({ access: WebCL.MEM_WRITE_ONLY, datum: this }, { access: WebCL.MEM_READ_ONLY, datum: size_strides_mat }, { datum: dst_numel, type: WebCL.type.UINT });
                if (val_is_matrix) {
                    kernel_args.unshift({ access: WebCL.MEM_READ_ONLY, datum: val });
                }
                else {
                    kernel_args.unshift({ datum: val, type: webcltypes[this._klass] });
                }
                $CL.executeKernel(kernel, kernel_args, dst_numel);
            }
        }
        finally {
            for (var i = 0; i < destruct_targets.length; i++) {
                destruct_targets[i].destruct();
            }
        }
    };
    MatrixCL.prototype._find = function () {
        //not paralleled; very slow
        //first, count output size
        var count_mat = new MatrixCL([1, 2], 'int32');
        var kernel_name = 'matrix_find_count_' + this._klass;
        var kernel = MatrixCL.kernel_cache[kernel_name];
        if (!kernel) {
            kernel = $CL.createKernel([
                '#define SRC_TYPE ' + ctypes[this._klass],
                '__kernel void kernel_func(__global int *count, __global SRC_TYPE *logical_index, uint numel) {',
                '  int ctr = 0;',
                '  int max_i = -1;',
                '  if (get_global_id(0) > 0) {return;}',
                '  for (uint i = 0; i < numel; i++) {',
                '    SRC_TYPE val = logical_index[i];',
                '    if (val) {',
                '      ctr++;',
                '      max_i = i;',
                '    }',
                '  }',
                '  count[0] = ctr;',
                '  count[1] = max_i;',
                '}'
            ].join('\n'));
            MatrixCL.kernel_cache[kernel_name] = kernel;
        }
        var count_array = new Int32Array(2); //default value 0
        if (this._numel > 0) {
            $CL.executeKernel(kernel, [
                { access: WebCL.MEM_WRITE_ONLY, datum: count_mat },
                { access: WebCL.MEM_READ_ONLY, datum: this },
                { datum: this._numel, type: WebCL.type.UINT }
            ], 1);
            count_mat.read(count_array);
        }
        var output_length = count_array[0];
        var max_i = count_array[1];
        //second, write indices
        var output = new MatrixCL([output_length, 1], 'int32');
        var kernel_name = 'matrix_find_write_' + this._klass;
        var kernel = MatrixCL.kernel_cache[kernel_name];
        if (!kernel) {
            kernel = $CL.createKernel([
                '#define SRC_TYPE ' + ctypes[this._klass],
                '__kernel void kernel_func(__global int *dst, __global SRC_TYPE *src, uint output_length) {',
                '  uint i = get_global_id(0);',
                '  if (i > 0) { return; }',
                '  int out_idx = 0;',
                '  int in_idx = 0;',
                '  while (out_idx < output_length) {',
                '    if (src[in_idx]) {',
                '      dst[out_idx++] = in_idx + 1;',
                '    }',
                '    in_idx++;',
                '  }',
                '}'
            ].join('\n'));
            MatrixCL.kernel_cache[kernel_name] = kernel;
        }
        if (output_length > 0) {
            $CL.executeKernel(kernel, [
                { access: WebCL.MEM_WRITE_ONLY, datum: output },
                { access: WebCL.MEM_READ_ONLY, datum: this },
                { datum: output_length, type: WebCL.type.UINT }
            ], 1);
        }
        if (this._size[1] == this._numel) {
            // row vector
            output.reshape_inplace(this._size);
        }
        count_mat.destruct();
        return output;
    };
    MatrixCL.kernel_cache = {};
    return MatrixCL;
}(Matrix));
module.exports = MatrixCL;

},{"../colon":25,"../matrix":29,"./handwrittenjs/driver":16}],25:[function(require,module,exports){
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
// colon object
// $M.colon(1,3,10) or $M.colon.fromstring('1:3:10');
"use strict";
var Colon = (function () {
    function Colon(start, stop_step, stop) {
        this.start = start;
        this.step = 1;
        if (this.start == null) {
            this.all = true;
        }
        else {
            if (stop != null) {
                // start:step:stop
                this.step = stop_step;
                this.stop = stop;
            }
            else {
                // start:1:stop
                this.stop = stop_step;
            }
        }
    }
    Colon.fromstring = function (s) {
        var elements = s.replace('end', '-1').split(':');
        var nums = [];
        for (var i = 0; i < elements.length; i++) {
            nums.push(eval(elements[i] || 'null'));
        }
        if (elements.length == 2) {
            return new Colon(nums[0], nums[1]);
        }
        else if (elements.length == 3) {
            return new Colon(nums[0], nums[1], nums[2]);
        }
        else {
            throw new Error('Invalid format');
        }
    };
    Colon.prototype.tojsa = function (size) {
        var start = this.start;
        var stop = this.stop;
        var step = this.step;
        if (this.all) {
            start = 1;
            stop = size;
            step = 1;
        }
        if (start < 0) {
            start += size + 1;
        }
        if (stop < 0) {
            stop += size + 1;
        }
        var jsa = [];
        if (step > 0) {
            for (var i = start; i <= stop; i += step) {
                jsa.push(i);
            }
        }
        else if (step < 0) {
            for (var i = start; i >= stop; i += step) {
                jsa.push(i);
            }
        } //step == 0 means length 0
        return jsa;
    };
    Colon.prototype.toString = function () {
        if (this.start == null) {
            return ':';
        }
        else {
            if (this.step == null) {
                return colonedge2str(this.start) + ':' + colonedge2str(this.stop);
            }
            else {
                return colonedge2str(this.start) + ':' + this.step + ':' + colonedge2str(this.stop);
            }
        }
    };
    return Colon;
}());
function colonedge2str(val) {
    if (val >= 0) {
        return '' + val;
    }
    else {
        if (val == 0) {
            return 'end';
        }
        return 'end-' + (-1 - val);
    }
}
module.exports = Colon;

},{}],26:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Colon = require('./colon');
function colon(start, stop_step, stop) {
    return new Colon(start, stop_step, stop);
}
var colon;
(function (colon) {
    colon.s = Colon.fromstring;
})(colon || (colon = {}));
module.exports = colon;

},{"./colon":25}],27:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Matrix = require('./matrix');
var util = require('./util');
function make_compare_func_all(operation) {
    var func_s_s = make_binary_arith_func(operation, false, false, 'logical');
    var func_s_m = make_binary_arith_func(operation, false, true, 'logical');
    var func_m_s = make_binary_arith_func(operation, true, false, 'logical');
    var func_m_m = make_binary_arith_func(operation, true, true, 'logical');
    return function (A, B) {
        A = util.force_cpu_scalar(A);
        B = util.force_cpu_scalar(B);
        if (A instanceof Matrix) {
            if (B instanceof Matrix) {
                return func_m_m(A, B);
            }
            else {
                return func_m_s(A, B);
            }
        }
        else {
            if (B instanceof Matrix) {
                return func_s_m(A, B);
            }
            else {
                return func_s_s(A, B);
            }
        }
    };
}
exports.make_compare_func_all = make_compare_func_all;
function make_binary_arith_func(operation, a_mat, b_mat, dst_klass) {
    var l_shape;
    var l_size_check = '';
    var l_def_adata = '';
    var l_def_bdata = '';
    var l_get_a;
    var l_get_b;
    if (a_mat) {
        l_shape = 'A._size';
        l_def_adata = 'var a_data = A._data;';
        l_get_a = 'a_data[i]';
        if (b_mat) {
            l_size_check = 'if (!e_util.jsaequal(A._size, B._size)) {throw new Error("Dimension mismatch");}';
        }
    }
    else {
        l_get_a = 'A';
        if (b_mat) {
            l_shape = 'B._size';
        }
        else {
            l_shape = '[1,1]';
        }
    }
    if (b_mat) {
        l_def_bdata = 'var b_data = B._data;';
        l_get_b = 'b_data[i]';
    }
    else {
        l_get_b = 'B';
    }
    var l_opr_formatted = operation.replace('%a', l_get_a).replace('%b', l_get_b);
    var f;
    var e_Matrix = Matrix;
    var e_util = util;
    eval([
        'f = function(A, B) {',
        'var shape = ' + l_shape + ';',
        l_size_check,
        l_def_adata,
        l_def_bdata,
        'var dst = new e_Matrix(shape, "' + dst_klass + '");',
        'var dst_data = dst._data;',
        'for (var i = 0, length = dst._numel; i < length; i++) {',
        '  dst_data[i] = ' + l_opr_formatted + ';',
        '}',
        'return dst;',
        '}'
    ].join('\n'));
    return f;
}
exports.make_binary_arith_func = make_binary_arith_func;
function make_binary_arith_func_all(operation) {
    var funcs = {};
    return function (A, B) {
        var dst_klass = util.commonklass(A, B);
        A = util.force_cpu_scalar(A);
        B = util.force_cpu_scalar(B);
        if (dst_klass == 'logical') {
            dst_klass = 'single';
        }
        var a_mat = A instanceof Matrix;
        var b_mat = B instanceof Matrix;
        var func_name = '' + a_mat + '_' + b_mat + '_' + dst_klass;
        var f = funcs[func_name];
        if (!f) {
            // compile (eval) function on first call
            f = make_binary_arith_func(operation, a_mat, b_mat, dst_klass);
            funcs[func_name] = f;
        }
        return f(A, B);
    };
}
exports.make_binary_arith_func_all = make_binary_arith_func_all;
function make_unary_arith_func(operation, a_mat, dst_klass) {
    var l_shape;
    var l_def_adata = '';
    var l_get_a;
    if (a_mat) {
        l_shape = 'A._size';
        l_def_adata = 'var a_data = A._data;';
        l_get_a = 'a_data[i]';
    }
    else {
        l_shape = '[1,1]';
        l_get_a = 'A';
    }
    var l_opr_formatted = operation.replace(/%a/g, l_get_a);
    var f;
    var e_Matrix = Matrix;
    var e_util = util;
    eval([
        'f = function(A) {',
        'var shape = ' + l_shape + ';',
        l_def_adata,
        'var dst = new e_Matrix(shape, "' + dst_klass + '");',
        'var dst_data = dst._data;',
        'for (var i = 0, length = dst._numel; i < length; i++) {',
        '  dst_data[i] = ' + l_opr_formatted + ';',
        '}',
        'return dst;',
        '}'
    ].join('\n'));
    return f;
}
exports.make_unary_arith_func = make_unary_arith_func;
function make_unary_arith_func_all(operation) {
    var funcs = {};
    return function (A) {
        var dst_klass;
        if (A instanceof Matrix) {
            dst_klass = A._klass;
            if (dst_klass == 'logical') {
                dst_klass = 'single';
            }
        }
        else {
            dst_klass = 'single';
        }
        A = util.force_cpu_scalar(A);
        var a_mat = A instanceof Matrix;
        var func_name = '' + a_mat + '_' + dst_klass;
        var f = funcs[func_name];
        if (!f) {
            // compile (eval) function on first call
            f = make_unary_arith_func(operation, a_mat, dst_klass);
            funcs[func_name] = f;
        }
        return f(A);
    };
}
exports.make_unary_arith_func_all = make_unary_arith_func_all;
function isequal_two(A, B) {
    A = A.to_cpu();
    B = B.to_cpu();
    if (!util.issamesize(A._size, B._size)) {
        return false;
    }
    //(1,1)=>true,(NaN,NaN)=>false,(NaN,1)=>false
    var a_data = A._data;
    var b_data = B._data;
    for (var i = 0, length = a_data.length; i < length; i++) {
        if (a_data[i] !== b_data[i]) {
            // NaN !== NaN
            return false;
        }
    }
    return true;
}
function isequal() {
    var As = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        As[_i - 0] = arguments[_i];
    }
    if (!(As[0] instanceof Matrix)) {
        return false;
    } //scalar is not allowed
    for (var i = 1; i < As.length; i++) {
        if (!(As[i] instanceof Matrix)) {
            return false;
        }
        if (!isequal_two(As[0], As[i])) {
            return false;
        }
    }
    return true;
}
exports.isequal = isequal;
function isequaln_two(A, B) {
    A = A.to_cpu();
    B = B.to_cpu();
    if (!util.issamesize(A._size, B._size)) {
        return false;
    }
    //(1,1)=>true,(NaN,NaN)=>true,(NaN,1)=>false
    var a_data = A._data;
    var b_data = B._data;
    for (var i = 0, length = a_data.length; i < length; i++) {
        var val_a = a_data[i], val_b = b_data[i];
        if (val_a !== val_b) {
            // NaN !== NaN
            if ((val_a === val_a) || (val_b === val_b)) {
                return false;
            }
        }
    }
    return true;
}
function isequaln() {
    var As = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        As[_i - 0] = arguments[_i];
    }
    if (!(As[0] instanceof Matrix)) {
        return false;
    } //scalar is not allowed
    for (var i = 1; i < As.length; i++) {
        if (!(As[i] instanceof Matrix)) {
            return false;
        }
        if (!isequaln_two(As[0], As[i])) {
            return false;
        }
    }
    return true;
}
exports.isequaln = isequaln;
function make_isclose_func_all() {
    var func_s_s = make_isclose_func(false, false);
    var func_s_m = make_isclose_func(false, true);
    var func_m_s = make_isclose_func(true, false);
    var func_m_m = make_isclose_func(true, true);
    return function (A, B, rtol, atol, equal_nan) {
        if (rtol === void 0) { rtol = 1e-5; }
        if (atol === void 0) { atol = 1e-8; }
        if (equal_nan === void 0) { equal_nan = false; }
        A = util.force_cpu_scalar(A);
        B = util.force_cpu_scalar(B);
        if (A instanceof Matrix) {
            if (B instanceof Matrix) {
                return func_m_m(A, B, rtol, atol, equal_nan);
            }
            else {
                return func_m_s(A, B, rtol, atol, equal_nan);
            }
        }
        else {
            if (B instanceof Matrix) {
                return func_s_m(A, B, rtol, atol, equal_nan);
            }
            else {
                return func_s_s(A, B, rtol, atol, equal_nan);
            }
        }
    };
}
function make_isclose_func(a_mat, b_mat) {
    var l_shape;
    var l_size_check = '';
    var l_def_adata = '';
    var l_def_bdata = '';
    var l_get_a;
    var l_get_b;
    if (a_mat) {
        l_shape = 'A._size';
        l_def_adata = 'var a_data = A._data;';
        l_get_a = 'a_data[i]';
        if (b_mat) {
            l_size_check = 'if (!e_util.jsaequal(A._size, B._size)) {throw new Error("Dimension mismatch");}';
        }
    }
    else {
        l_get_a = 'A';
        if (b_mat) {
            l_shape = 'B._size';
        }
        else {
            l_shape = '[1,1]';
        }
    }
    if (b_mat) {
        l_def_bdata = 'var b_data = B._data;';
        l_get_b = 'b_data[i]';
    }
    else {
        l_get_b = 'B';
    }
    var f;
    var e_Matrix = Matrix;
    var e_util = util;
    eval([
        'f = function(A, B, rtol, atol, equal_nan) {',
        'var shape = ' + l_shape + ';',
        l_size_check,
        l_def_adata,
        l_def_bdata,
        'var dst = new e_Matrix(shape, "logical");',
        'var dst_data = dst._data;',
        'if (equal_nan) {',
        '  for (var i = 0, length = dst._numel; i < length; i++) {',
        '    var val_a = ' + l_get_a + ';',
        '    var val_b = ' + l_get_b + ';',
        '    var absdiff = val_a - val_b;',
        '    if (absdiff < 0) {absdiff = -absdiff}',
        '    var ret = 0;',
        '    if (absdiff <= atol + rtol * ((val_b > 0) ? val_b : -val_b)) {',
        '      ret = 1;',
        '    }',
        '    if ((val_a !== val_a) && (val_b !== val_b)) {',
        '      ret = 1;',
        '    }',
        '    dst_data[i] = ret;',
        '  }',
        '} else {',
        '  for (var i = 0, length = dst._numel; i < length; i++) {',
        '    var val_a = ' + l_get_a + ';',
        '    var val_b = ' + l_get_b + ';',
        '    var absdiff = val_a - val_b;',
        '    if (absdiff < 0) {absdiff = -absdiff}',
        '    var ret = 0;',
        '    if (absdiff <= atol + rtol * ((val_b > 0) ? val_b : -val_b)) {',
        '      ret = 1;',
        '    }',
        '    dst_data[i] = ret;',
        '  }',
        '}',
        'return dst;',
        '}'
    ].join('\n'));
    return f;
}
exports.make_isclose_func = make_isclose_func;
exports.isclose = make_isclose_func_all();
function allclose(A, B, rtol, atol, equal_nan) {
    var isclose_result = exports.isclose(A, B, rtol, atol, equal_nan);
    var data = isclose_result.getdataref();
    var prod = 1;
    for (var i = 0; i < data.length; i++) {
        prod *= data[i];
    }
    return prod != 0;
}
exports.allclose = allclose;

},{"./matrix":29,"./util":34}],28:[function(require,module,exports){
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
// read/write numpy format matrix file
"use strict";
var Matrix = require('../matrix');
function parse_header(header_data) {
    //{'descr': '<i4', 'fortran_order': False, 'shape': (3, 1), }            \n
    var header_str = '';
    for (var i = 0; i < header_data.length; i++) {
        var element = header_data[i];
        header_str += String.fromCharCode(element);
    }
    var hobj = /^\{'descr': '(.*)', 'fortran_order': (True|False), 'shape': \(([0-9, ]+)\), \} *\n$/.exec(header_str);
    if (hobj == null) {
        throw Error('Failed to parse header string');
    }
    var typechars = hobj[1]; //"<i4"
    var little_endian = true;
    switch (typechars.substr(0, 1)) {
        case "<":
        case "|":
            little_endian = true;
            break;
        case ">":
            little_endian = false;
            break;
        default:
            throw Error('Unknown endian');
    }
    var descr_wo_endian = typechars.substr(1, 2);
    var fortran_order = hobj[2] == 'True';
    var shape_str = hobj[3].split(',');
    var shape;
    if (shape_str[1] == '') {
        //1-d array (3,) to column vector (3,1)
        shape = [Number(shape_str[0]), 1];
    }
    else {
        shape = shape_str.map(function (v) { return Number(v.trim()); });
    }
    return { descr_wo_endian: descr_wo_endian, fortran_order: fortran_order, shape: shape, little_endian: little_endian };
}
function is_little_endian() {
    /**
     * Check if this machine is little endian
     */
    var raw = new Uint8Array([0x1, 0x2, 0x3, 0x4]);
    var view = new Uint32Array(raw.buffer);
    if (view[0] == 0x01020304) {
        //big endian
        return false;
    }
    else {
        return true;
    }
}
var mat_klass_map = {
    'b1': 'logical',
    'u1': 'uint8',
    'i4': 'int32',
    'f4': 'single',
    'f8': 'single'
};
var view_accessor_map = {
    'b1': DataView.prototype.getUint8,
    'u1': DataView.prototype.getUint8,
    'i4': DataView.prototype.getInt32,
    'f4': DataView.prototype.getFloat32,
    'f8': DataView.prototype.getFloat64
};
var view_bytestep_map = { 'b1': 1, 'u1': 1, 'i4': 4, 'f4': 4, 'f8': 8 };
function npyread(data) {
    //for node: npyread(fs.readFileSync())
    var byteOffset = 0;
    if (ArrayBuffer.isView(data)) {
        //data is Uint8Array
        byteOffset = data.byteOffset;
        data = data.buffer;
    }
    var header_view = new Uint8Array(data, byteOffset);
    //check magic number
    var expect_header = [0x93, 0x4e, 0x55, 0x4d, 0x50, 0x59, 0x01, 0x00]; //only format 1 supported
    for (var i = 0; i < expect_header.length; i++) {
        if (header_view[i] != expect_header[i]) {
            throw Error('Incompatible format header');
        }
    }
    var header_len = header_view[8] + header_view[9] * 256; //16bit little endian
    var data_type = parse_header(header_view.slice(10, 10 + header_len));
    var mat_klass = mat_klass_map[data_type.descr_wo_endian];
    if (mat_klass == null) {
        throw Error('Unsupported data type');
    }
    var data_view = new DataView(data, byteOffset + 10 + header_len);
    //b1 seems to have only 0/1, so no conversion needed
    var mat = new Matrix(data_type.shape, mat_klass);
    var mat_data = mat.getdataref();
    var view_accessor = view_accessor_map[data_type.descr_wo_endian];
    var view_bytestep = view_bytestep_map[data_type.descr_wo_endian];
    var numel = mat._numel;
    var view_little_endian = data_type.little_endian;
    if (data_type.fortran_order) {
        // sequentially copy
        for (var i = 0; i < numel; i++) {
            var val = view_accessor.call(data_view, view_bytestep * i, view_little_endian);
            mat_data[i] = val;
        }
    }
    else {
        //change order from c-order to fortran-order
        /*
        Size of matrix: (I, J, K)
        c-order strides: (J*K, K, 1)
        f-order strides: (1, I, I*J)
        when linear index in c-order is x:
        matrix index: (x / (J*K) % I * 1, x / K % J * I, x / 1 % K * I * J)
        that is: x / cstride[i] % size[i] * fstride[i] (i = 0,1,2)
        */
        var size = mat._size;
        var cstride = [];
        var fstride = [];
        var last_cstride = 1;
        var last_fstride = 1;
        for (var dim = 0; dim < size.length; dim++) {
            cstride.unshift(last_cstride);
            fstride.push(last_fstride);
            last_cstride *= size[size.length - 1 - dim];
            last_fstride *= size[dim];
        }
        for (var i = 0; i < numel; i++) {
            var val = view_accessor.call(data_view, view_bytestep * i, view_little_endian);
            var fidx = 0;
            for (var dim = 0; dim < size.length; dim++) {
                fidx += Math.floor(i / cstride[dim]) % size[dim] * fstride[dim];
            }
            mat_data[fidx] = val;
        }
    }
    return mat;
}
exports.npyread = npyread;
var save_klass_map = { 'logical': 'b1', 'uint8': 'u1', 'int32': 'i4', 'single': 'f4' };
var header_padding = '';
function npysave(A) {
    var klass = A._klass;
    var endian_char;
    switch (klass) {
        case 'logical':
        case 'uint8':
            endian_char = '|'; //not applicable
            break;
        default:
            endian_char = is_little_endian() ? '<' : '>';
            break;
    }
    var header_str = "{'descr': '" + endian_char + save_klass_map[klass] +
        "', 'fortran_order': True, 'shape': (" + A._size.join(', ') + "), }";
    //pad header_str to be (multiple of 16) - (magic 10 + last \n)
    var pad_len = 16 - (header_str.length + 11) % 16;
    header_str += '                '.substr(0, pad_len) + '\n';
    var header_len = header_str.length;
    var header_total_len = header_len + 10; //header with magic number
    var dst_size = A._numel * A._data_ctor.BYTES_PER_ELEMENT + header_total_len;
    var dst = new ArrayBuffer(dst_size);
    var dst_byte_offset = 0;
    var header_dst_view = new Uint8Array(dst, dst_byte_offset, header_total_len);
    var const_header = [0x93, 0x4e, 0x55, 0x4d, 0x50, 0x59, 0x01, 0x00];
    for (var i = 0; i < const_header.length; i++) {
        header_dst_view[i] = const_header[i];
    }
    header_dst_view[8] = header_len % 256;
    header_dst_view[9] = Math.floor(header_len / 256);
    for (var i = 0; i < header_len; i++) {
        header_dst_view[10 + i] = header_str.charCodeAt(i);
    }
    var body_dst_view = new A._data_ctor(dst, dst_byte_offset + header_total_len, A._numel);
    body_dst_view.set(A.getdataref());
    return dst;
}
exports.npysave = npysave;

},{"../matrix":29}],29:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Colon = require('./colon');
var Matrix = (function () {
    function Matrix(size, klass, noalloc) {
        if (klass === void 0) { klass = 'single'; }
        if (noalloc === void 0) { noalloc = false; }
        var _size = Array.prototype.slice.call(size); //copy
        //verify size
        var tmpnumel = 1;
        var strides = [];
        var last_none_one_dim = 0;
        if (_size.length < 2) {
            throw new Error('matrix must have at least 2 dimensions');
        }
        for (var i = 0; i < _size.length; i++) {
            var dimsize = _size[i];
            if (typeof (dimsize) !== 'number' || dimsize < 0 || !Matrix._isinteger(dimsize)) {
                throw new Error('size is invalid');
            }
            if (dimsize != 1) {
                last_none_one_dim = i;
            }
            strides.push(tmpnumel);
            tmpnumel *= dimsize;
        }
        if (tmpnumel >= 2147483648) {
            // indexing with int32 value is impossible
            throw new Error('Matrix of equal to or more than 2G elements is not supported');
        }
        this._numel = tmpnumel;
        //remove tail dimensions with size 1 (retain minimum 2 dimensions)
        last_none_one_dim = Math.max(last_none_one_dim, 1) + 1;
        _size.splice(last_none_one_dim);
        strides.splice(last_none_one_dim);
        this._size = _size;
        this._ndims = _size.length;
        this._strides = strides;
        if (!Matrix._isvalidklass(klass)) {
            throw new Error('unknown klass');
        }
        this._klass = klass;
        this._data_ctor = Matrix.data_ctors[klass];
        if (!noalloc) {
            this._alloccpu();
        }
        if (Matrix._autodestruct_stack_top) {
            Matrix._autodestruct_stack_top.push(this);
        }
    }
    Matrix.autodestruct_push = function () {
        var array = [];
        Matrix._autodestruct_stack_top = array;
        Matrix._autodestruct_stack.push(array);
    };
    Matrix.autodestruct_pop = function () {
        if (Matrix._autodestruct_stack_top) {
            //destruct all in current list
            //console.log('Autodestruct: ' + Matrix._autodestruct_stack_top.length + ' mats');
            for (var i = 0; i < Matrix._autodestruct_stack_top.length; i++) {
                Matrix._autodestruct_stack_top[i].destruct();
            }
            Matrix._autodestruct_stack.pop();
            Matrix._autodestruct_stack_top = Matrix._autodestruct_stack[Matrix._autodestruct_stack.length - 1];
        }
    };
    Matrix.prototype.destruct = function () {
        //release memory
        this._data = null;
    };
    Matrix.prototype.inspect = function (depth) {
        var shape_str = this._size.join('x');
        if (this._numel <= 100) {
            return 'Matrix ' + shape_str + ' ' + this._klass + '\n' + this.toString();
        }
        else {
            return 'Matrix ' + shape_str + ' ' + this._klass;
        }
    };
    Matrix.typedarray2mat = function (size, klass, data) {
        if (klass === void 0) { klass = 'single'; }
        //type check
        if (!(data instanceof Matrix.data_ctors[klass])) {
            throw Error('klass and data type mismatch');
        }
        var m = new Matrix(size, klass, true);
        if (data.length < m._numel) {
            throw Error('The length of data is smaller than matrix size');
        }
        m._data = data;
        if (klass === 'logical') {
            //force values to 0/1
            for (var i = 0; i < m._numel; i++) {
                data[i] = Number(data[i] != 0);
            }
        }
        return m;
    };
    Matrix._isinteger = function (x) {
        return Math.round(x) == x;
    };
    Matrix._isvalidklass = function (klass) {
        return klass == 'single' || klass == 'int32' || klass == 'uint8' || klass == 'logical';
    };
    Matrix._logical_cast_required = function (klass_dst, klass_src) {
        return (klass_dst == 'logical' && klass_src != 'logical');
    };
    Matrix._logical_cast = function (val) {
        return Number(Boolean(val));
    };
    Matrix.prototype._alloccpu = function () {
        // allocate cpu buffer if not exist
        if (!this._data) {
            this._data = new this._data_ctor(this._numel);
        }
        return this._data;
    };
    Matrix.prototype.to_cpu = function () {
        return this;
    };
    Matrix.prototype._getdata = function () {
        //override in gpu
        //get copy of data in TypedArray
        return this._data;
    };
    Matrix.prototype.getdataref = function (src_offset, length) {
        if (src_offset === void 0) { src_offset = 0; }
        //get read-only view of array
        if (!src_offset && length == null) {
            return this._data;
        }
        else {
            if (length == null) {
                length = this._numel;
            }
            return new this._data_ctor(this._data.buffer, src_offset * this._data.BYTES_PER_ELEMENT, length);
        }
    };
    Matrix.prototype.getdatacopy = function (src_offset, length, dst) {
        if (src_offset === void 0) { src_offset = 0; }
        if (length == null) {
            length = this._numel - src_offset;
        }
        if (!dst) {
            dst = new this._data_ctor(length);
        }
        var range_view = new this._data_ctor(this._data.buffer, src_offset * this._data.BYTES_PER_ELEMENT, length);
        dst.set(range_view);
        return dst;
    };
    Matrix.prototype.setdata = function (src, dst_offset) {
        if (dst_offset === void 0) { dst_offset = 0; }
        //set raw data into buffer
        this._data.set(src, dst_offset);
    };
    Matrix.prototype._isvalidindex = function (inds) {
        if (this._numel == 0) {
            // if matrix have zero dimension, all index is invalid
            return false;
        }
        if (inds.length == 0) {
            return false;
        }
        else if (inds.length == 1) {
            return Matrix._isinteger(inds[0]) && ((inds[0] > 0 && inds[0] <= this._numel) || (inds[0] < 0 && (-inds[0]) <= this._numel));
        }
        else {
            if (inds.length < this._ndims) {
                // last index last index is regarded as linear index of remaining dimensions
                for (var dim = 0; dim < inds.length; dim++) {
                    var ind = inds[dim];
                    var dimsize;
                    if (dim == inds.length - 1) {
                        //last index
                        dimsize = 1;
                        for (var dimex = dim; dimex < this._ndims; dimex++) {
                            dimsize *= this._size[dimex];
                        }
                    }
                    else {
                        dimsize = this._size[dim];
                    }
                    if (Matrix._isinteger(ind) && ((ind > 0 && (ind <= dimsize) || (ind < 0 && -ind <= dimsize)))) {
                    }
                    else {
                        return false;
                    }
                }
            }
            else {
                for (var dim = 0; dim < inds.length; dim++) {
                    var ind = inds[dim];
                    var dimsize = this._size[dim] || 1;
                    // if dimensions of inds is more than matrix dimensions, only 1 is ok for the extra dimension
                    if (Matrix._isinteger(ind) && ((ind > 0 && (ind <= dimsize) || (ind < 0 && -ind <= dimsize)))) {
                    }
                    else {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    Matrix.prototype._isvalidindexerr = function (inds) {
        if (!this._isvalidindex(inds)) {
            throw new Error('Invalid index');
        }
    };
    Matrix.prototype._getarrayindex = function (inds) {
        // assume inds is valid
        var idx = 0;
        if (inds.length == 1) {
            var ind = inds[0];
            if (ind < 0) {
                ind += this._numel + 1;
            }
            idx = ind - 1;
        }
        else {
            if (inds.length < this._ndims) {
                // last index last index is regarded as linear index of remaining dimensions
                for (var dim = 0; dim < inds.length; dim++) {
                    var ind = inds[dim];
                    if (ind < 0) {
                        var dimsize;
                        if (dim == inds.length - 1) {
                            //last index
                            dimsize = 1;
                            for (var dimex = dim; dimex < this._ndims; dimex++) {
                                dimsize *= this._size[dimex];
                            }
                        }
                        else {
                            dimsize = this._size[dim];
                        }
                        ind += dimsize + 1;
                    }
                    idx += (ind - 1) * (this._strides[dim] || 0); //trailing 1 does not affect
                }
            }
            else {
                for (var dim = 0; dim < inds.length; dim++) {
                    var ind = inds[dim];
                    if (ind < 0) {
                        ind += (this._size[dim] || 1) + 1;
                    }
                    idx += (ind - 1) * (this._strides[dim] || 0); //trailing 1 does not affect
                }
            }
        }
        return idx;
    };
    Matrix.numel = function (A) {
        return A._numel;
    };
    Matrix.size = function (X, dim) {
        if (dim == undefined) {
            return Matrix.jsa2mat([X._size]);
        }
        else {
            return X._size[dim - 1];
        }
    };
    Matrix.sizejsa = function (X) {
        return X._size;
    };
    Matrix.jsa2mat = function (ary, one_d_column, klass) {
        if (one_d_column === void 0) { one_d_column = false; }
        if (klass === void 0) { klass = 'single'; }
        // TODO: type inference (contains non-integer => single, contains boolean => logical)
        // get dimension
        var mat;
        if (typeof (ary) === 'number') {
            //1x1 matrix
            mat = new Matrix([1, 1], klass);
            mat.set_scalar(ary, [1]);
        }
        else if (ary instanceof Matrix) {
            //simply copy
            mat = ary.copy();
        }
        else if (!ary.length) {
            //0x0 matrix (length is undefined or 0)
            mat = new Matrix([0, 0], klass);
        }
        else {
            //n-d matrix
            //get shape
            var size = [];
            var cur_ary = ary;
            var numel = 1;
            while (cur_ary.length !== void 0) {
                size.push(cur_ary.length);
                numel *= cur_ary.length;
                cur_ary = cur_ary[0];
            }
            var ndims = size.length;
            var cstride = [];
            var fstride = [];
            var last_cstride = 1;
            var last_fstride = 1;
            for (var dim = 0; dim < size.length; dim++) {
                cstride.unshift(last_cstride);
                fstride.push(last_fstride);
                last_cstride *= size[size.length - 1 - dim];
                last_fstride *= size[dim];
            }
            //flatten data
            var data_ctor = Matrix.data_ctors[klass];
            var data = new data_ctor(numel);
            var flat_i = 0;
            var n = function (a, dim, fidx_ofs) {
                if (a.length != size[dim]) {
                    throw Error('Inconsistent size of n-d array');
                }
                if (dim == ndims - 1) {
                    // a contains numbers
                    for (var i = 0; i < size[dim]; i++) {
                        var val = a[i];
                        var fidx = fidx_ofs + Math.floor(flat_i / cstride[dim]) % size[dim] * fstride[dim];
                        data[fidx] = val;
                        flat_i++;
                    }
                }
                else {
                    for (var i = 0; i < size[dim]; i++) {
                        n(a[i], dim + 1, fidx_ofs + Math.floor(flat_i / cstride[dim]) % size[dim] * fstride[dim]);
                    }
                }
            };
            n(ary, 0, 0);
            if (ndims == 1) {
                if (one_d_column) {
                    size = [size[0], 1];
                }
                else {
                    size = [1, size[0]];
                }
            }
            mat = Matrix.typedarray2mat(size, klass, data);
        }
        return mat;
    };
    Matrix.prototype.mat2jsa = function (one_d_flatten) {
        if (one_d_flatten === void 0) { one_d_flatten = false; }
        //empty matrix will be [] not [[]]
        var ary = [];
        if (one_d_flatten && this._ndims == 2 && (this._size[0] == 1 || this._size[1] == 1)) {
            var data = this.getdataref();
            for (var i = 0; i < data.length; i++) {
                ary.push(data[i]);
            }
        }
        else {
            //n-d jagged array
            var size = this._size;
            var ndims = this._ndims;
            var data = this.getdataref();
            var cstride = [];
            var fstride = [];
            var last_cstride = 1;
            var last_fstride = 1;
            for (var dim = 0; dim < ndims; dim++) {
                cstride.unshift(last_cstride);
                fstride.push(last_fstride);
                last_cstride *= size[ndims - 1 - dim];
                last_fstride *= size[dim];
            }
            var flat_i = 0; //c-order
            var n = function (a, dim, fidx_ofs) {
                if (dim == ndims - 1) {
                    for (var i = 0; i < size[dim]; i++) {
                        var fidx = fidx_ofs + Math.floor(flat_i / cstride[dim]) % size[dim] * fstride[dim];
                        a.push(data[fidx]);
                        flat_i++;
                    }
                }
                else {
                    for (var i = 0; i < size[dim]; i++) {
                        var newa = [];
                        a.push(newa);
                        n(newa, dim + 1, fidx_ofs + Math.floor(flat_i / cstride[dim]) % size[dim] * fstride[dim]);
                    }
                }
            };
            n(ary, 0, 0);
        }
        return ary;
    };
    Matrix.prototype.get = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (this._numel == 0) {
            throw Error('Matrix with no element');
        }
        if (args.length == 0) {
            // get scalar
            return this._alloccpu()[0];
        }
        var all_number = args.every(function (v) { return typeof (v) === 'number'; });
        if (all_number) {
            return this.get_scalar(args);
        }
        else {
            return this.get_matrix_nd(args);
        }
    };
    // returns value of (1,1) or 0
    Matrix.prototype.valueOf = function () {
        if (this._numel > 0) {
            return this.get();
        }
        else {
            return 0;
        }
    };
    Matrix.prototype.copy = function (klass) {
        var clone = new Matrix(this._size, klass || this._klass);
        var clone_data = clone._getdata();
        var rawdata = this._alloccpu();
        if (Matrix._logical_cast_required(clone._klass, this._klass)) {
            for (var i = 0, length = clone_data.length; i < length; i++) {
                clone_data[i] = Matrix._logical_cast(rawdata[i]);
            }
        }
        else {
            clone_data.set(rawdata);
        }
        return clone;
    };
    Matrix.prototype.get_scalar = function (inds) {
        var rawdata = this._alloccpu();
        this._isvalidindexerr(inds);
        var arrayidx = this._getarrayindex(inds);
        return rawdata[arrayidx];
    };
    Matrix._get_ind_iterator = function (ind, dim_size) {
        // argument index is 0-origin
        // return index within valid range
        if (typeof (ind) === 'number') {
            var ind_positive = ind;
            if (ind_positive < 0) {
                ind_positive += dim_size + 1;
            }
            if (ind_positive <= 0 || ind_positive > dim_size) {
                throw Error('Index exceeds matrix dimension');
            }
            return {
                iter: function (index) {
                    return ind_positive;
                }, length: 1
            };
        }
        else if (ind instanceof Colon) {
            var start = ind.start;
            var stop = ind.stop;
            var step = ind.step;
            if (ind.all) {
                start = 1;
                stop = dim_size;
                step = 1;
            }
            if (start < 0) {
                start += dim_size + 1;
            }
            if (stop < 0) {
                stop += dim_size + 1;
            }
            var length = 0;
            if ((step > 0 && stop >= start) || (step < 0 && stop <= start)) {
                length = Math.floor((stop - start) / step) + 1;
                // check if in valid range
                var final_value = start + step * (length - 1);
                if ((start <= 0 || start > dim_size) || (final_value <= 0 || final_value > dim_size)) {
                    throw Error('Index exceeds matrix dimension');
                }
            }
            return {
                iter: function (index) {
                    return start + step * index;
                },
                length: length
            };
        }
        else if (ind instanceof Matrix) {
            var dataref = ind.getdataref();
            // check if in valid range
            for (var i = 0; i < dataref.length; i++) {
                var element = dataref[i];
                if (element == 0 || element > dim_size || element < -dim_size) {
                    throw Error('Index exceeds matrix dimension');
                }
            }
            return {
                iter: function (index) {
                    var val = dataref[index];
                    if (val < 0) {
                        val += dim_size;
                    }
                    return val;
                },
                length: dataref.length
            };
        }
    };
    Matrix.prototype.get_matrix_nd = function (inds) {
        var inds_ndim = inds.length;
        // replace logical matrix with vector
        for (var i = 0; i < inds_ndim; i++) {
            var ind = inds[i];
            if (ind instanceof Matrix) {
                if (ind._klass == 'logical') {
                    inds[i] = ind._find();
                }
            }
        }
        var virtual_input_shape = [];
        if (this._ndims <= inds_ndim) {
            // pad with 1
            virtual_input_shape = this._size.concat();
            while (virtual_input_shape.length < inds_ndim) {
                virtual_input_shape.push(1);
            }
        }
        else {
            // last dimension is like linear index
            var cur_prod = 1;
            for (var dim_1 = 0; dim_1 < inds_ndim - 1; dim_1++) {
                virtual_input_shape.push(this._size[dim_1]);
                cur_prod *= this._size[dim_1];
            }
            virtual_input_shape.push(this._numel / cur_prod);
        }
        var virtual_input_stride = [];
        var stride_tmp = 1;
        for (var dim = 0; dim < inds_ndim; dim++) {
            virtual_input_stride.push(stride_tmp);
            stride_tmp *= virtual_input_shape[dim];
        }
        var ind_iters = [];
        var dst_shape = [];
        var dst_stride = []; //not use dst._strides because tailing 1 dimension is omitted
        var dst_stride_tmp = 1;
        for (var dim = 0; dim < inds_ndim; dim++) {
            var iter_and_length = Matrix._get_ind_iterator(inds[dim], virtual_input_shape[dim]);
            ind_iters.push(iter_and_length.iter);
            dst_shape.push(iter_and_length.length);
            dst_stride.push(dst_stride_tmp);
            dst_stride_tmp *= iter_and_length.length;
        }
        var dst_reshape_shape = null;
        if (inds_ndim == 1) {
            // linear indexing case
            dst_shape.push(1); //avoid error on new Matrix()
            // if ind is logical matrix, regarded as vector in the following
            // colon is row vector
            // src and ind are both vectors => follows direction of src
            // otherwise: follows ind's shape
            var is_ind_vector = false;
            var only_ind = inds[0];
            if (only_ind instanceof Matrix) {
                if (only_ind._ndims == 2 && (only_ind._size[0] == 1 || only_ind._size[1] == 1)) {
                    is_ind_vector = true;
                }
            }
            else if (only_ind instanceof Colon) {
                is_ind_vector = true;
            }
            var is_src_vector = false;
            if (this._ndims == 2 && (this._size[0] == 1 || this._size[1] == 1)) {
                is_src_vector = true;
            }
            if (is_src_vector && is_ind_vector) {
                // follow direction of src
                if (this._size[0] == 1) {
                    // reshape to row vector
                    dst_reshape_shape = [1, dst_shape[0]];
                }
            }
            else {
                // follow ind's shape
                if (only_ind instanceof Matrix) {
                    dst_reshape_shape = only_ind._size;
                }
                else if (only_ind instanceof Colon) {
                    // reshape to row vector
                    dst_reshape_shape = [1, dst_shape[0]];
                }
            }
        }
        var dst = new Matrix(dst_shape, this._klass);
        var dst_data = dst._data;
        var src_data = this._data;
        var dst_numel = dst._numel;
        for (var dst_idx = 0; dst_idx < dst_numel; dst_idx++) {
            var input_linear_idx = 0;
            for (var dim = 0; dim < inds_ndim; dim++) {
                var dst_coord = Math.floor(dst_idx / dst_stride[dim]) % dst_shape[dim];
                var src_coord = ind_iters[dim](dst_coord) - 1;
                input_linear_idx += src_coord * virtual_input_stride[dim];
            }
            dst_data[dst_idx] = src_data[input_linear_idx];
        }
        if (dst_reshape_shape) {
            dst.reshape_inplace(dst_reshape_shape);
        }
        return dst;
    };
    Matrix.prototype.get_matrix_nd_old = function (inds) {
        //multidim indexing
        //convert index of each dimension into array
        var eachdimidx = [];
        var eachdimstride = [];
        var output_size = [];
        var output_length = 1;
        var inputdimctr = [];
        for (var dim = 0; dim < inds.length; dim++) {
            var dimind = inds[dim];
            var dimidx;
            if (dimind instanceof Colon) {
                dimidx = dimind.tojsa(this._size[dim] === void 0 ? 1 : this._size[dim]);
            }
            else if (dimind instanceof Matrix) {
                dimidx = dimind._getdata();
            }
            else {
                //number
                dimidx = [dimind];
            }
            //range check
            var dimsize;
            if (dim == inds.length - 1) {
                // last index is regarded as linear index of remaining dimensions
                dimsize = 1;
                for (var dimex = dim; dimex < this._ndims; dimex++) {
                    dimsize *= this._size[dimex];
                }
            }
            else {
                dimsize = this._size[dim] || 1; //exceed dimension must be [1,1,...]
            }
            for (var i = 0; i < dimidx.length; i++) {
                var dimval = dimidx[i];
                if (dimval < 0) {
                    dimval += dimsize + 1;
                    dimidx[i] = dimval;
                }
                if ((dimval > dimsize) || (dimval < 1)) {
                    throw new Error('Index exceeds matrix dimension');
                }
            }
            eachdimidx.push(dimidx);
            eachdimstride.push(this._strides[dim] || 0);
            output_size.push(dimidx.length);
            output_length *= dimidx.length;
            inputdimctr.push(0);
        }
        var output = new Matrix(output_size, this._klass);
        var output_data = output._data;
        var input_data = this._data;
        for (var i = 0; i < output_length; i++) {
            //calc input index
            var input_raw_idx = 0;
            for (var dim = 0; dim < eachdimidx.length; dim++) {
                input_raw_idx += (eachdimidx[dim][inputdimctr[dim]] - 1) * eachdimstride[dim];
            }
            output_data[i] = input_data[input_raw_idx];
            //increment input index
            for (var dim = 0; dim < inputdimctr.length; dim++) {
                var element = ++inputdimctr[dim];
                if (element >= eachdimidx[dim].length) {
                    //overflow to next dimension
                    inputdimctr[dim] = 0;
                }
                else {
                    break;
                }
            }
        }
        return output;
    };
    Matrix.prototype.get_matrix_single = function (singleind) {
        var single_idx_array;
        var output_size;
        if (singleind instanceof Colon) {
            single_idx_array = singleind.tojsa(this._numel);
            output_size = [1, single_idx_array.length]; //row vector
        }
        else if (singleind instanceof Matrix) {
            // returns matrix of same shape
            // value in matrix is used as linear index
            single_idx_array = singleind._data;
            output_size = singleind._size;
        }
        var output = new Matrix(output_size, this._klass);
        var output_data = output._data;
        var input_data = this._data;
        for (var i = 0, length = single_idx_array.length; i < length; i++) {
            output_data[i] = input_data[single_idx_array[i] - 1];
        }
        return output;
    };
    Matrix.prototype.get_matrix_logical = function (map) {
        // equivalent to this.get(find(map))
        var output_length = 0;
        var map_data = map._getdata();
        var max_i = -1;
        for (var i = 0, length = map_data.length; i < length; i++) {
            if (map_data[i]) {
                output_length++;
                max_i = i;
            }
        }
        if (this._numel <= max_i) {
            throw new Error('Index out of bounds');
        }
        var output = new Matrix([output_length, 1], this._klass);
        var output_data = output._data;
        var input_data = this._data;
        var ptr = 0;
        for (var i = 0, length = map_data.length; i < length; i++) {
            if (map_data[i]) {
                output_data[ptr++] = input_data[i];
            }
        }
        return output;
    };
    Matrix.prototype.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        //last argument is value, but subsequent function requires first argument to be value
        var val = args.pop();
        if (!(val instanceof Matrix) && val.length !== void 0) {
            // js array (or array-like)
            val = Matrix.jsa2mat(val, false, this._klass);
        }
        // scalar matrix converted to number
        if (val instanceof Matrix && val._numel == 1) {
            val = val.get_scalar([1]);
        }
        var all_number = args.every(function (v) { return typeof (v) === 'number'; });
        if (all_number) {
            this.set_scalar(val, args);
        }
        else {
            this.set_matrix_nd(val, args);
        }
    };
    Matrix.prototype.set_scalar = function (val, inds) {
        var rawdata = this._alloccpu();
        this._isvalidindexerr(inds);
        var arrayidx = this._getarrayindex(inds);
        var scalar_val;
        if (val instanceof Matrix) {
            if (val._numel != 1) {
                throw new Error('Value is not scalar');
            }
            scalar_val = val._getdata()[0];
        }
        else {
            scalar_val = val;
        }
        if (Matrix._logical_cast_required(this._klass)) {
            scalar_val = Matrix._logical_cast(scalar_val);
        }
        rawdata[arrayidx] = scalar_val;
    };
    Matrix.prototype.set_matrix_single = function (val, singleind) {
        var single_idx_array;
        var output_size;
        if (singleind instanceof Colon) {
            single_idx_array = singleind.tojsa(this._numel);
        }
        else if (singleind instanceof Matrix) {
            // value in matrix is used as linear index
            // used as flattened value array, regardless of shape
            single_idx_array = singleind.getdataref();
        }
        var rawdata = this._alloccpu();
        if (val instanceof Matrix) {
            if (single_idx_array.length != val._numel) {
                throw new Error('Dimension mismatch');
            }
            var val_data = val._getdata();
            // read over flattened val
            if (Matrix._logical_cast_required(this._klass, val._klass)) {
                rawdata[single_idx_array[i] - 1] = Matrix._logical_cast(val_data[i]);
            }
            else {
                for (var i = 0, length = single_idx_array.length; i < length; i++) {
                    rawdata[single_idx_array[i] - 1] = val_data[i];
                }
            }
        }
        else {
            var scalar_val;
            if (Matrix._logical_cast_required(this._klass)) {
                scalar_val = Matrix._logical_cast(val);
            }
            else {
                scalar_val = val;
            }
            for (var i = 0, length = single_idx_array.length; i < length; i++) {
                rawdata[single_idx_array[i] - 1] = scalar_val;
            }
        }
    };
    Matrix.prototype.set_matrix_nd = function (val, inds) {
        var inds_ndim = inds.length;
        // replace logical matrix with vector
        for (var i = 0; i < inds_ndim; i++) {
            var ind = inds[i];
            if (ind instanceof Matrix) {
                if (ind._klass == 'logical') {
                    inds[i] = ind._find();
                }
            }
        }
        var virtual_input_shape = [];
        if (this._ndims <= inds_ndim) {
            // pad with 1
            virtual_input_shape = this._size.concat();
            while (virtual_input_shape.length < inds_ndim) {
                virtual_input_shape.push(1);
            }
        }
        else {
            // last dimension is like linear index
            var cur_prod = 1;
            for (var dim_2 = 0; dim_2 < inds_ndim - 1; dim_2++) {
                virtual_input_shape.push(this._size[dim_2]);
                cur_prod *= this._size[dim_2];
            }
            virtual_input_shape.push(this._numel / cur_prod);
        }
        var virtual_input_stride = [];
        var stride_tmp = 1;
        for (var dim = 0; dim < inds_ndim; dim++) {
            virtual_input_stride.push(stride_tmp);
            stride_tmp *= virtual_input_shape[dim];
        }
        var ind_iters = [];
        var dst_shape = [];
        var dst_stride = []; //not use dst._strides because tailing 1 dimension is omitted
        var dst_stride_tmp = 1;
        for (var dim = 0; dim < inds_ndim; dim++) {
            var iter_and_length = Matrix._get_ind_iterator(inds[dim], virtual_input_shape[dim]);
            ind_iters.push(iter_and_length.iter);
            dst_shape.push(iter_and_length.length);
            dst_stride.push(dst_stride_tmp);
            dst_stride_tmp *= iter_and_length.length;
        }
        var dst_numel = dst_stride_tmp;
        var scalar_val = null;
        if (typeof (val) === 'number') {
            scalar_val = val;
        }
        else if (val instanceof Matrix) {
            if (val._numel === 1) {
                scalar_val = val.valueOf();
            }
        }
        if (scalar_val == null) {
            // set matrix
            // shape check; dimensions excluding value 1 must match
            var dst_shape_exclude_one = dst_shape.filter(function (v) { return v != 1; });
            var val_shape_exclude_one = val._size.filter(function (v) { return v != 1; });
            if (dst_shape_exclude_one.length != val_shape_exclude_one.length) {
                throw Error('Shape mismatch');
            }
            if (!dst_shape_exclude_one.every(function (v, i) { return v == val_shape_exclude_one[i]; })) {
                throw Error('Shape mismatch');
            }
            var dst_data = val.getdataref();
            var src_data = this._data;
            for (var dst_idx = 0; dst_idx < dst_numel; dst_idx++) {
                var input_linear_idx = 0;
                for (var dim = 0; dim < inds_ndim; dim++) {
                    var dst_coord = Math.floor(dst_idx / dst_stride[dim]) % dst_shape[dim];
                    var src_coord = ind_iters[dim](dst_coord) - 1;
                    input_linear_idx += src_coord * virtual_input_stride[dim];
                }
                src_data[input_linear_idx] = dst_data[dst_idx];
            }
        }
        else {
            // set scalar
            var src_data = this._data;
            for (var dst_idx = 0; dst_idx < dst_numel; dst_idx++) {
                var input_linear_idx = 0;
                for (var dim = 0; dim < inds_ndim; dim++) {
                    var dst_coord = Math.floor(dst_idx / dst_stride[dim]) % dst_shape[dim];
                    var src_coord = ind_iters[dim](dst_coord) - 1;
                    input_linear_idx += src_coord * virtual_input_stride[dim];
                }
                src_data[input_linear_idx] = scalar_val;
            }
        }
    };
    Matrix.prototype.set_matrix_nd_old = function (val, inds) {
        //multidim indexing
        //convert index of each dimension into array
        var eachdimidx = [];
        var eachdimstride = [];
        var output_size = [];
        var output_length = 1;
        var inputdimctr = [];
        for (var dim = 0; dim < inds.length; dim++) {
            var dimind = inds[dim];
            var dimidx;
            if (dimind instanceof Colon) {
                dimidx = dimind.tojsa(this._size[dim] || 1);
            }
            else if (dimind instanceof Matrix) {
                dimidx = dimind._getdata();
            }
            else {
                //number
                dimidx = [dimind];
            }
            //range check
            var dim_size = this._size[dim] || 1; //exceed dimension must be [1,1,...]
            for (var i = 0; i < dimidx.length; i++) {
                if ((dimidx[i] > dim_size) || (dimidx[i] < 1)) {
                    throw new Error('Index exceeds matrix dimension');
                }
            }
            eachdimidx.push(dimidx);
            eachdimstride.push(this._strides[dim] || 0);
            output_size.push(dimidx.length);
            output_length *= dimidx.length;
            inputdimctr.push(0);
        }
        var rawdata = this._alloccpu();
        if (val instanceof Matrix) {
            //val shape check
            var is_vector = output_size.filter(function (v) { return v != 1; }).length <= 1;
            if (is_vector) {
                // if shape is vector, only numel have to match
                if (val._numel != output_length) {
                    throw new Error('Dimensions mismatch');
                }
            }
            else {
                // shape must match (exclude tailing 1)
                for (var dim = 0; dim < Math.max(val._size.length, output_size.length); dim++) {
                    if ((val._size[dim] || 1) != (output_size[dim] || 1)) {
                        throw new Error('Dimensions mismatch');
                    }
                }
            }
            var val_data = val._getdata();
            if (Matrix._logical_cast_required(this._klass, val._klass)) {
                for (var i = 0; i < output_length; i++) {
                    //calc input index
                    var input_raw_idx = 0;
                    for (var dim = 0; dim < eachdimidx.length; dim++) {
                        input_raw_idx += (eachdimidx[dim][inputdimctr[dim]] - 1) * eachdimstride[dim];
                    }
                    rawdata[input_raw_idx] = Matrix._logical_cast(val_data[i]);
                    //increment input index
                    for (var dim = 0; dim < inputdimctr.length; dim++) {
                        var element = ++inputdimctr[dim];
                        if (element >= eachdimidx[dim].length) {
                            //overflow to next dimension
                            inputdimctr[dim] = 0;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            else {
                for (var i = 0; i < output_length; i++) {
                    //calc input index
                    var input_raw_idx = 0;
                    for (var dim = 0; dim < eachdimidx.length; dim++) {
                        input_raw_idx += (eachdimidx[dim][inputdimctr[dim]] - 1) * eachdimstride[dim];
                    }
                    rawdata[input_raw_idx] = val_data[i];
                    //increment input index
                    for (var dim = 0; dim < inputdimctr.length; dim++) {
                        var element = ++inputdimctr[dim];
                        if (element >= eachdimidx[dim].length) {
                            //overflow to next dimension
                            inputdimctr[dim] = 0;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        else {
            //val is scalar
            var scalar_val;
            if (Matrix._logical_cast_required(this._klass)) {
                scalar_val = Matrix._logical_cast(val);
            }
            else {
                scalar_val = val;
            }
            for (var i = 0; i < output_length; i++) {
                //calc input index
                var input_raw_idx = 0;
                for (var dim = 0; dim < eachdimidx.length; dim++) {
                    input_raw_idx += (eachdimidx[dim][inputdimctr[dim]] - 1) * eachdimstride[dim];
                }
                rawdata[input_raw_idx] = scalar_val;
                //increment input index
                for (var dim = 0; dim < inputdimctr.length; dim++) {
                    var element = ++inputdimctr[dim];
                    if (element >= eachdimidx[dim].length) {
                        //overflow to next dimension
                        inputdimctr[dim] = 0;
                    }
                    else {
                        break;
                    }
                }
            }
        }
    };
    Matrix.prototype.set_matrix_logical = function (val, map) {
        // equivalent to this.set(val, find(map))
        var output_length = 0;
        var map_data = map._getdata();
        var max_i = -1;
        for (var i = 0, length = map_data.length; i < length; i++) {
            if (map_data[i]) {
                output_length++;
                max_i = i;
            }
        }
        if (this._numel < max_i) {
            throw new Error('Index out of bounds');
        }
        var rawdata = this._alloccpu();
        if (val instanceof Matrix) {
            var val_data = val._getdata();
            var ptr = 0;
            if (Matrix._logical_cast_required(this._klass, val._klass)) {
                for (var i = 0, length = map_data.length; i < length; i++) {
                    if (map_data[i]) {
                        rawdata[i] = Matrix._logical_cast(val_data[ptr++]);
                    }
                }
            }
            else {
                for (var i = 0, length = map_data.length; i < length; i++) {
                    if (map_data[i]) {
                        rawdata[i] = val_data[ptr++];
                    }
                }
            }
        }
        else {
            var ptr = 0;
            var scalar_val;
            if (Matrix._logical_cast_required(this._klass)) {
                scalar_val = Matrix._logical_cast(val);
            }
            else {
                scalar_val = val;
            }
            for (var i = 0, length = map_data.length; i < length; i++) {
                if (map_data[i]) {
                    rawdata[i] = scalar_val;
                }
            }
        }
    };
    Matrix.prototype.toString = function () {
        var s = '';
        var rows = this._size[0], cols = this._size[1];
        var rawdata = this.getdataref();
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                s += rawdata[col * rows + row] + '\t';
            }
            s += '\n';
        }
        return s;
    };
    Matrix.prototype.disp = function (X) {
        var s = '';
        if (this !== void 0) {
            s = this.toString();
        }
        else {
            s = X.toString();
        }
        console.log(s);
    };
    Matrix.prototype.reshape_inplace = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var _size;
        var first_arg = args[0];
        //convert to Array
        if (first_arg instanceof Matrix) {
            var tarray = first_arg._getdata();
            _size = Array.prototype.slice.call(tarray);
        }
        else if (first_arg.length !== void 0) {
            _size = Array.prototype.slice.call(first_arg);
        }
        else {
            _size = Array.prototype.slice.call(args);
        }
        //type check
        var tmpnumel = 1;
        var strides = [];
        var last_none_one_dim = 0;
        if (_size.length < 2) {
            throw new Error('matrix must have at least 2 dimensions');
        }
        //substitute -1 to remaining value
        var minus_pos = -1;
        var remaining_prod = 1;
        for (var i = 0; i < _size.length; i++) {
            if (_size[i] < 0) {
                if (minus_pos >= 0) {
                    throw new Error('Only one free size is accepted');
                }
                minus_pos = i;
            }
            else {
                remaining_prod *= _size[i];
            }
        }
        if (minus_pos >= 0) {
            _size[minus_pos] = this._numel / remaining_prod;
        }
        for (var i = 0; i < _size.length; i++) {
            var dimsize = _size[i];
            if (typeof (dimsize) !== 'number' || dimsize < 0 || !Matrix._isinteger(dimsize)) {
                throw new Error('size is invalid');
            }
            if (dimsize != 1) {
                last_none_one_dim = i;
            }
            strides.push(tmpnumel);
            tmpnumel *= dimsize;
        }
        if (tmpnumel !== this._numel) {
            throw new Error('New shape must have same elements');
        }
        //remove tail dimensions with size 1 (retain minimum 2 dimensions)
        last_none_one_dim = Math.max(last_none_one_dim, 1) + 1;
        _size.splice(last_none_one_dim);
        strides.splice(last_none_one_dim);
        this._size = _size;
        this._numel = tmpnumel;
        this._ndims = _size.length;
        this._strides = strides;
    };
    Matrix.prototype.squeeze_inplace = function () {
        if (this._ndims == 2) {
            // keep [1,5] remained
            return;
        }
        var new_size = this._size.filter(function (v) { return v !== 1; });
        //append 1 to tail
        while (new_size.length < 2) {
            new_size.push(1);
        }
        var tmpnumel = 1;
        var strides = [];
        for (var dim = 0; dim < new_size.length; dim++) {
            var dimsize = new_size[dim];
            strides.push(tmpnumel);
            tmpnumel *= dimsize;
        }
        this._size = new_size;
        this._ndims = new_size.length;
        this._strides = strides;
    };
    Matrix.prototype._find = function () {
        // returns nonzero-element indices
        // if this is vector, direction (row/col) is kept.
        // otherwise, column vector is returned.
        var output_length = 0;
        var src_data = this.getdataref();
        for (var i = 0; i < src_data.length; i++) {
            if (src_data[i]) {
                output_length++;
            }
        }
        var dst = new Matrix([output_length, 1], 'int32');
        var dst_idx = 0;
        var dst_data = dst._data;
        for (var i = 0; dst_idx < output_length; i++) {
            if (src_data[i]) {
                dst_data[dst_idx++] = i + 1;
            }
        }
        if (this._size[1] == this._numel) {
            // row vector
            dst.reshape_inplace(this._size);
        }
        return dst;
    };
    Matrix._autodestruct_stack = [];
    Matrix._autodestruct_stack_top = null;
    Matrix.data_ctors = { 'single': Float32Array, 'int32': Int32Array, 'uint8': Uint8Array, 'logical': Uint8Array };
    return Matrix;
}());
module.exports = Matrix;

},{"./colon":25}],30:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Matrix = require('./matrix');
function mtimes(A, B) {
    if (A._ndims != 2 || B._ndims != 2) {
        throw new Error('Matrix must be two-dimensional');
    }
    if (A._size[1] != B._size[0]) {
        throw new Error('Shape mismatch');
    }
    if (A._klass != 'single' || B._klass != 'single') {
        throw new Error('Matrix klass must be single');
    }
    var m = A._size[0], n = B._size[1], k = A._size[1];
    var lda = A._strides[1];
    var ldb = B._strides[1];
    var data_a = A._data;
    var data_b = B._data;
    var dst = new Matrix([m, n], 'single');
    var ldc = dst._strides[1];
    var data_c = dst._data;
    for (var i = 0; i < m; i++) {
        for (var j = 0; j < n; j++) {
            var sum = 0;
            for (var r = 0; r < k; r++) {
                sum += data_a[i + r * lda] * data_b[r + j * ldb];
            }
            data_c[i + j * ldc] = sum;
        }
    }
    return dst;
}
exports.mtimes = mtimes;

},{"./matrix":29}],31:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Matrix = require('./matrix');
var util = require('./util');
var func_generator = require('./func_generator');
function max_along_axis_old(A, dim) {
    if (dim == null) {
        //select first non-1 axis
        dim = A._numel;
        for (var i = 0; i < A._size.length; i++) {
            var dimsize = A._size[i];
            if (dimsize !== 1) {
                dim = i + 1;
                break;
            }
        }
    }
    if (dim > A._ndims) {
        //max along axis with size 1
        return A.copy();
    }
    var dstsize = A._size.slice();
    if (dstsize[dim - 1] !== 0) {
        //size 0 dimension is preserved
        dstsize[dim - 1] = 1;
    }
    if ((A._numel === 0) || (A._size[dim - 1] === 1)) {
        //only change shape
        var dst_onlyreshape = A.copy();
        dst_onlyreshape.reshape_inplace(dstsize);
        return dst_onlyreshape;
    }
    //reduction actually needed
    var dst = new Matrix(dstsize, A._klass);
    var input_strides = A._strides;
    var output_strides = dst._strides.slice();
    while (output_strides.length <= input_strides.length) {
        output_strides.push(dst._numel);
    }
    var reduction_step = input_strides[dim - 1];
    var reduction_count = A._size[dim - 1];
    var a_data = A._data;
    var dst_data = dst._data;
    var dims = A._ndims;
    for (var dst_idx = 0, dst_numel = dst._numel; dst_idx < dst_numel; dst_idx++) {
        var src_idx = 0;
        for (var d = 0; d < dims; d++) {
            src_idx += Math.floor(dst_idx % output_strides[d + 1] / output_strides[d]) * input_strides[d];
        }
        var val = a_data[src_idx];
        var curret = val;
        for (var red = 1; red < reduction_count; red++) {
            src_idx += reduction_step;
            val = a_data[src_idx];
            if (val > curret) {
                curret = val;
            }
        }
        dst_data[dst_idx] = curret;
    }
    return dst;
}
function _argmax_ones_like(A) {
    var amax = new Matrix(A._size, 'int32');
    amax._data.fill(1);
    return { M: A, I: amax };
}
function make_reduction_along_axis(var_decl, var_update, result_assign, out_argmax) {
    var f;
    eval([
        "f = function(A, dim) {",
        "    if (dim == null) {",
        "        //select first non-1 axis",
        "        dim = A._numel;",
        "        for (var i = 0; i < A._size.length; i++) {",
        "            var dimsize = A._size[i];",
        "            if (dimsize !== 1) {",
        "                dim = i + 1;",
        "                break;",
        "            }",
        "        }",
        "    }",
        "    if (dim > A._ndims) {",
        "        //max along axis with size 1",
        out_argmax ? "return _argmax_ones_like(A.copy());" : "return A.copy();",
        "    }",
        "    var dstsize = A._size.slice();",
        "    if (dstsize[dim - 1] !== 0) {",
        "        //size 0 dimension is preserved",
        "        dstsize[dim - 1] = 1;",
        "    }",
        "    if (A._numel === 0) {",
        "        //only change shape",
        "        var dst_onlyreshape = A.copy();",
        "        dst_onlyreshape.reshape_inplace(dstsize);",
        out_argmax ? "return _argmax_ones_like(dst_onlyreshape);" : "return dst_onlyreshape;",
        "    }",
        "    //reduction actually needed",
        "    var dst = new Matrix(dstsize, A._klass);",
        out_argmax ? "var amax = new Matrix(dstsize, 'int32'); var amax_data = amax._data;" : "",
        "    var input_strides = A._strides;",
        "    var output_strides = dst._strides.slice();",
        "    while (output_strides.length <= input_strides.length) {",
        "        output_strides.push(dst._numel);",
        "    }",
        "    var reduction_step = input_strides[dim - 1];",
        "    var reduction_count = A._size[dim - 1];",
        "    var a_data = A._data;",
        "    var dst_data = dst._data;",
        "    var dims = A._ndims;",
        "    for (var dst_idx = 0, dst_numel = dst._numel; dst_idx < dst_numel; dst_idx++) {",
        "        var src_idx = 0;",
        "        for (var d = 0; d < dims; d++) {",
        "            src_idx += Math.floor(dst_idx % output_strides[d + 1] / output_strides[d]) * input_strides[d];",
        "        }",
        "        var val = a_data[src_idx];",
        //"        var curret = val;",
        var_decl,
        "        for (var red = 1; red < reduction_count; red++) {",
        "            src_idx += reduction_step;",
        "            val = a_data[src_idx];",
        //"            if (val > curret) {",
        //"                curret = val;",
        //"            }",
        var_update,
        "        }",
        //"        dst_data[dst_idx] = curret;",
        result_assign,
        "    }",
        out_argmax ? "return {M:dst,I:amax};" : "return dst;",
        "}",].join('\n'));
    return f;
}
function make_reduction_along_axis_stat(var_decl, var_update, result_assign) {
    var f;
    eval([
        "f = function(A, dim) {",
        "    if (dim == null) {",
        "        //select first non-1 axis",
        "        dim = A._numel;",
        "        for (var i = 0; i < A._size.length; i++) {",
        "            var dimsize = A._size[i];",
        "            if (dimsize !== 1) {",
        "                dim = i + 1;",
        "                break;",
        "            }",
        "        }",
        "    }",
        "    if (dim > A._ndims) {",
        "        //max along axis with size 1",
        "    }",
        "    var dstsize = A._size.slice();",
        "    if (dstsize[dim - 1] !== 0) {",
        "        //size 0 dimension is preserved",
        "        dstsize[dim - 1] = 1;",
        "    }",
        "    if (A._numel === 0) {",
        "        //only change shape",
        "        var dst_onlyreshape = A.copy();",
        "        dst_onlyreshape.reshape_inplace(dstsize);",
        "        return dst_onlyreshape;",
        "    }",
        "    //reduction actually needed",
        "    var dst = new Matrix(dstsize, 'single');",
        "    var input_strides = A._strides;",
        "    var output_strides = dst._strides.slice();",
        "    while (output_strides.length <= input_strides.length) {",
        "        output_strides.push(dst._numel);",
        "    }",
        "    var reduction_step = input_strides[dim - 1];",
        "    var reduction_count = A._size[dim - 1];",
        "    var a_data = A._data;",
        "    var dst_data = dst._data;",
        "    var dims = A._ndims;",
        "    for (var dst_idx = 0, dst_numel = dst._numel; dst_idx < dst_numel; dst_idx++) {",
        "        var src_idx = 0;",
        "        for (var d = 0; d < dims; d++) {",
        "            src_idx += Math.floor(dst_idx % output_strides[d + 1] / output_strides[d]) * input_strides[d];",
        "        }",
        "        var val = a_data[src_idx];",
        //"        var curret = val;",
        var_decl,
        "        for (var red = 1; red < reduction_count; red++) {",
        "            src_idx += reduction_step;",
        "            val = a_data[src_idx];",
        //"            if (val > curret) {",
        //"                curret = val;",
        //"            }",
        var_update,
        "        }",
        //"        dst_data[dst_idx] = curret;",
        result_assign,
        "    }",
        "return dst;",
        "}",].join('\n'));
    return f;
}
var max_along_axis = make_reduction_along_axis('var curret = val;', 'if(val>curret){curret=val;}', 'dst_data[dst_idx]=curret;', false);
var max_elementwise = func_generator.make_binary_arith_func_all('Math.max(%a,%b)');
var min_along_axis = make_reduction_along_axis('var curret = val;', 'if(val<curret){curret=val;}', 'dst_data[dst_idx]=curret;', false);
var min_elementwise = func_generator.make_binary_arith_func_all('Math.min(%a,%b)');
function max(A, B, dim) {
    if (B == null) {
        //max along axis
        return max_along_axis(util.as_mat(A), dim);
    }
    else {
        //elementwise max
        return max_elementwise(A, B);
    }
}
exports.max = max;
function min(A, B, dim) {
    if (B == null) {
        return min_along_axis(util.as_mat(A), dim);
    }
    else {
        return min_elementwise(A, B);
    }
}
exports.min = min;
var argmax_along_axis = make_reduction_along_axis('var curret = val, curamax = 0;', 'if(val>curret){curret=val;curamax=red;}', 'dst_data[dst_idx]=curret; amax_data[dst_idx]=curamax+1;', true);
function argmax(A, dummy, dim) {
    return argmax_along_axis(util.as_mat(A), dim);
}
exports.argmax = argmax;
var argmin_along_axis = make_reduction_along_axis('var curret = val, curamax = 0;', 'if(val<curret){curret=val;curamax=red;}', 'dst_data[dst_idx]=curret; amax_data[dst_idx]=curamax+1;', true);
function argmin(A, dummy, dim) {
    return argmin_along_axis(util.as_mat(A), dim);
}
exports.argmin = argmin;
function sum_mean(A, args, f) {
    var dim = undefined;
    var outtype = undefined;
    while (args.length > 0) {
        var arg = args.pop();
        if (typeof (arg) === 'string') {
            if (arg != 'native') {
                throw new Error('Outtype other than native is currently not supported');
            }
        }
        else if (typeof (arg) === 'number') {
            dim = arg;
        }
        else {
            throw new Error('Unknown argument ' + arg);
        }
    }
    return f(A, dim);
}
var sum_along_axis = make_reduction_along_axis_stat('var curret = val;', 'curret += val;', 'dst_data[dst_idx] = curret;');
function sum(A) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sum_mean(A, args, sum_along_axis);
}
exports.sum = sum;
var mean_along_axis = make_reduction_along_axis_stat('var curret = val;', 'curret += val;', 'dst_data[dst_idx] = curret / reduction_count;');
function mean(A) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sum_mean(A, args, mean_along_axis);
}
exports.mean = mean;
var prod_along_axis = make_reduction_along_axis_stat('var curret = val;', 'curret *= val;', 'dst_data[dst_idx] = curret;');
function prod(A) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sum_mean(A, args, prod_along_axis);
}
exports.prod = prod;
//w=0: normalize by N-1
var variance_along_axis_w0 = make_reduction_along_axis_stat('var normalsum = val; var sqsum = val * val;', 'normalsum += val; sqsum += val * val;', 'dst_data[dst_idx] = (sqsum - normalsum * normalsum / reduction_count) / Math.max(reduction_count - 1, 1);');
//w=1: normalize by N
var variance_along_axis_w1 = make_reduction_along_axis_stat('var normalsum = val; var sqsum = val * val;', 'normalsum += val; sqsum += val * val;', 'dst_data[dst_idx] = (sqsum - normalsum * normalsum / reduction_count) / reduction_count;');
function variance(A, w, dim) {
    if (w === void 0) { w = 0; }
    if (w == 0) {
        return variance_along_axis_w0(A, dim);
    }
    else if (w == 1) {
        return variance_along_axis_w1(A, dim);
    }
    else {
        throw new Error('w must be 0 or 1');
    }
}
exports.variance = variance;
//w=0: normalize by N-1
var std_along_axis_w0 = make_reduction_along_axis_stat('var normalsum = val; var sqsum = val * val;', 'normalsum += val; sqsum += val * val;', 'dst_data[dst_idx] = Math.sqrt((sqsum - normalsum * normalsum / reduction_count) / Math.max(reduction_count - 1, 1));');
//w=1: normalize by N
var std_along_axis_w1 = make_reduction_along_axis_stat('var normalsum = val; var sqsum = val * val;', 'normalsum += val; sqsum += val * val;', 'dst_data[dst_idx] = Math.sqrt((sqsum - normalsum * normalsum / reduction_count) / reduction_count);');
function std(A, w, dim) {
    if (w === void 0) { w = 0; }
    if (w == 0) {
        return std_along_axis_w0(A, dim);
    }
    else if (w == 1) {
        return std_along_axis_w1(A, dim);
    }
    else {
        throw new Error('w must be 0 or 1');
    }
}
exports.std = std;

},{"./func_generator":27,"./matrix":29,"./util":34}],32:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Matrix = require('./matrix');
var colon = require('./colonwrap');
function transpose(A) {
    if (A._ndims != 2) {
        throw new Error('Matrix must be two-dimensional');
    }
    A = A.to_cpu();
    var _a = A._size, dst_cols = _a[0], dst_rows = _a[1];
    var dst = new Matrix([dst_rows, dst_cols], A._klass);
    var a_data = A._data;
    var dst_data = dst._data;
    var i = 0;
    for (var dst_col = 0; dst_col < dst_cols; dst_col++) {
        for (var dst_row = 0; dst_row < dst_rows; dst_row++) {
            dst_data[i] = a_data[dst_row * dst_cols + dst_col];
            i++;
        }
    }
    return dst;
}
exports.transpose = transpose;
function repmat(A) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    A = A.to_cpu();
    //convert to Array
    var _rs; //number of repetion for each dim
    var first_arg = args[0];
    if (first_arg instanceof Matrix) {
        var tarray = first_arg._getdata();
        _rs = Array.prototype.slice.call(tarray);
    }
    else if (first_arg.length !== void 0) {
        _rs = Array.prototype.slice.call(first_arg);
    }
    else {
        _rs = Array.prototype.slice.call(args);
    }
    if (_rs.length === 1) {
        //[2] => [2,2]
        _rs.push(_rs[0]);
    }
    while (_rs.length < A._ndims) {
        _rs.push(1);
    }
    // remove tailing 1
    while ((_rs.length > A._ndims) && (_rs[_rs.length - 1] == 1)) {
        _rs.pop();
    }
    var newdims = _rs.length;
    var newsize = [];
    var input_strides = [];
    var output_strides = [];
    var tmp_in_stride = 1;
    var tmp_out_stride = 1;
    var n_copy = 1;
    var rs_strides = [];
    for (var dim = 0; dim < newdims; dim++) {
        var indimsize = A._ndims > dim ? A._size[dim] : 1;
        var outdimsize = indimsize * _rs[dim];
        rs_strides.push(n_copy);
        n_copy *= _rs[dim];
        newsize.push(outdimsize);
        input_strides.push(tmp_in_stride);
        output_strides.push(tmp_out_stride);
        tmp_in_stride *= indimsize;
        tmp_out_stride *= outdimsize;
    }
    input_strides.push(tmp_in_stride); //dummy
    rs_strides.push(n_copy); //dummy
    var output_steps = [];
    for (var i = 0; i < n_copy; i++) {
        var out_offset = 0;
        for (var dim = 0; dim < newdims; dim++) {
            out_offset += Math.floor(i % rs_strides[dim + 1] / rs_strides[dim]) * output_strides[dim] * (A._size[dim] || 1);
        }
        output_steps.push(out_offset);
    }
    var dst = new Matrix(newsize, A._klass);
    var a_data = A._data;
    var dst_data = dst._data;
    for (var i = 0, i_length = A._numel; i < i_length; i++) {
        var a_i = a_data[i];
        var out_offset = 0;
        for (var dim = 0; dim < newdims; dim++) {
            out_offset += Math.floor(i % input_strides[dim + 1] / input_strides[dim]) * output_strides[dim];
        }
        for (var j = 0; j < n_copy; j++) {
            var out_idx = out_offset + output_steps[j];
            dst_data[out_idx] = a_i;
        }
    }
    return dst;
}
exports.repmat = repmat;
function cat(dim) {
    var As = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        As[_i - 1] = arguments[_i];
    }
    //dimension other than concatenating dimension must be same
    var dst_size = As[0]._size.concat();
    // if dim == 4, [2, 3] => [2, 3, 1, 1]
    while (dst_size.length < dim) {
        dst_size.push(1);
    }
    var concat_offsets = [1];
    for (var i = 1; i < As.length; i++) {
        var A = As[i];
        if (A._numel == 0) {
            concat_offsets.push(0); //not used
            continue;
        }
        var a_size = A._size;
        if (a_size.length > dst_size.length) {
            throw Error('Dimension mismatch');
        }
        for (var d = 0; d < dst_size.length; d++) {
            var a_dim = a_size[d] || 1;
            if (d == dim - 1) {
                // dimension to concat
                concat_offsets.push(dst_size[d] + 1);
                dst_size[d] += a_dim;
            }
            else {
                if (a_dim != dst_size[d]) {
                    throw Error('Dimension mismatch');
                }
            }
        }
    }
    var dst = new Matrix(dst_size, As[0]._klass);
    for (var i = 0; i < As.length; i++) {
        var A = As[i];
        if (A._numel == 0) {
            continue;
        }
        var args = [];
        for (var d = 0; d < dst_size.length; d++) {
            var element = A._size[d] || 1;
            if (d == dim - 1) {
                args.push(colon(concat_offsets[i], concat_offsets[i] + element - 1));
            }
            else {
                args.push(colon());
            }
        }
        args.push(A);
        dst.set.apply(dst, args);
    }
    return dst;
}
exports.cat = cat;
function horzcat() {
    var As = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        As[_i - 0] = arguments[_i];
    }
    return cat.apply(void 0, [2].concat(As));
}
exports.horzcat = horzcat;
function vertcat() {
    var As = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        As[_i - 0] = arguments[_i];
    }
    return cat.apply(void 0, [1].concat(As));
}
exports.vertcat = vertcat;
function permute(A, order) {
    var src_size = A._size.concat();
    var numel = A._numel;
    if (order.length < src_size.length) {
        throw Error('order must include at least input dimension');
    }
    var ndim = order.length;
    var src_strides = A._strides.concat();
    while (src_size.length < ndim) {
        //append dimension of 1
        src_size.push(1);
        src_strides.push(numel);
    }
    var dst_size = [];
    for (var d = 0; d < ndim; d++) {
        var element = order[d] - 1; //order start from 1
        dst_size.push(src_size[element]);
    }
    var dst = new Matrix(dst_size, A._klass);
    var dst_strides = dst._strides.concat();
    while (dst_strides.length < ndim) {
        // occur when last dimensions are 1
        dst_strides.push(numel);
    }
    var dst_strides_perm = [];
    order.forEach(function (o, i) { return dst_strides_perm[o - 1] = dst_strides[i]; });
    var src_data = A.getdataref();
    var dst_data = dst._data;
    for (var i = 0; i < numel; i++) {
        var dst_idx = 0;
        for (var d = 0; d < ndim; d++) {
            dst_idx += Math.floor(i / src_strides[d]) % src_size[d] * dst_strides_perm[d];
        }
        dst_data[dst_idx] = src_data[i];
    }
    return dst;
}
exports.permute = permute;
function ipermute(A, order) {
    // reverse order
    var rev_order = order.concat(); //have same elements
    for (var d = 0; d < order.length; d++) {
        rev_order[order[d] - 1] = d + 1;
    }
    return permute(A, rev_order);
}
exports.ipermute = ipermute;

},{"./colonwrap":26,"./matrix":29}],33:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
exports.Matrix = require('./matrix');
exports.Colon = require('./colon');
exports.colon = require('./colonwrap');
var util = require('./util');
var func_generator = require('./func_generator');
var shape_converter = require('./shape_converter');
var reduction = require('./reduction');
var mul = require('./mul');
var npy = require('./io/npy');
//export import MatrixCL = require('./cl/matrix_cl');
exports.CL = null; // for webcl
exports.end = -1;
var initcl_result = null;
function initcl() {
    if (initcl_result != null) {
        return initcl_result;
    }
    try {
        var dummy = require('../src/cl/handwrittenjs/sushi_cl');
        initcl_result = true;
    }
    catch (ex) {
        console.error(ex);
        initcl_result = false;
    }
    return initcl_result;
}
exports.initcl = initcl;
function devicetype(A) {
    if (A instanceof exports.Matrix) {
        return 'cpu';
    }
    return null;
}
exports.devicetype = devicetype;
function autodestruct(f) {
    exports.Matrix.autodestruct_push();
    var mats_to_save = [];
    try {
        mats_to_save = f();
    }
    finally {
        if (typeof (mats_to_save) === 'object') {
            var mats_list;
            if (mats_to_save instanceof exports.Matrix) {
                // single matrix return
                mats_list = [mats_to_save];
            }
            else if (mats_to_save.length !== undefined) {
                //array-like
                mats_list = mats_to_save.filter(function (v) { return (v instanceof exports.Matrix); });
            }
            else {
                //dictionary
                mats_list = [];
                for (var k in mats_to_save) {
                    if (mats_to_save[k] instanceof exports.Matrix) {
                        mats_list.push(mats_to_save[k]);
                    }
                }
            }
            var stack_top = exports.Matrix._autodestruct_stack_top;
            var stack_second_top = exports.Matrix._autodestruct_stack[exports.Matrix._autodestruct_stack.length - 2];
            for (var i = 0; i < mats_list.length; i++) {
                var mat = mats_list[i];
                var delete_idx = stack_top.indexOf(mat);
                if (delete_idx >= 0) {
                    stack_top.splice(delete_idx, 1);
                    if (stack_second_top) {
                        stack_second_top.push(mat); //maybe destructed in nested autodestruct
                    }
                }
            }
        }
        exports.Matrix.autodestruct_pop();
    }
    return mats_to_save;
}
exports.autodestruct = autodestruct;
exports.typedarray2mat = exports.Matrix.typedarray2mat;
function zeros() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var format = util.calc_zeros_size(args);
    return new exports.Matrix(format.size, format.klass);
}
exports.zeros = zeros;
function ones() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var mat = zeros.apply(void 0, args);
    mat._data.fill(1);
    return mat;
}
exports.ones = ones;
function rand() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var mat = zeros.apply(void 0, args);
    var data = mat._data;
    for (var i = 0, length = data.length; i < length; i++) {
        data[i] = Math.random();
    }
    return mat;
}
exports.rand = rand;
function randi(imax) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    //first argument: imax or [imin, imax]
    var _imin = 1, _imax = 1;
    if (imax.length != null) {
        if (imax.length === 2) {
            _imin = imax[0];
            _imax = imax[1];
        }
        else {
            throw new Error('Invalid imax');
        }
    }
    else {
        _imax = imax;
    }
    var mat = zeros.apply(void 0, args);
    var data = mat._data;
    for (var i = 0, length = data.length; i < length; i++) {
        data[i] = Math.floor(Math.random() * (_imax - _imin + 1)) + _imin;
    }
    return mat;
}
exports.randi = randi;
function randn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var mat = zeros.apply(void 0, args);
    var data = mat._data;
    for (var i = 0, length = data.length; i < length; i++) {
        var alpha = Math.random();
        var beta = Math.random();
        data[i] = Math.sqrt(-2 * Math.log(alpha)) * Math.sin(2 * Math.PI * beta);
    }
    return mat;
}
exports.randn = randn;
function eye() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var mat = zeros.apply(void 0, args);
    var min_dim = Math.min(mat._size[0], mat._size[1]);
    for (var i = 1; i <= min_dim; i++) {
        mat.set(i, i, 1);
    }
    return mat;
}
exports.eye = eye;
function size(X, dim) {
    if (dim === void 0) {
        // return as row vector
        return jsa2mat([X._size], false, 'int32'); //int32 to represent value > 8M accurately
    }
    else {
        if (dim <= 0 || !exports.Matrix._isinteger(dim)) {
            throw new Error('Invalid dimension');
        }
        return X._size[dim - 1] || 1;
    }
}
exports.size = size;
function sizejsa(X) {
    return X._size;
}
exports.sizejsa = sizejsa;
function jsa2mat(A, one_d_column, klass) {
    return exports.Matrix.jsa2mat(A, one_d_column, klass);
}
exports.jsa2mat = jsa2mat;
function mat2jsa(A, one_d_flatten) {
    if (one_d_flatten === void 0) { one_d_flatten = false; }
    return A.mat2jsa(one_d_flatten);
}
exports.mat2jsa = mat2jsa;
function length(X) {
    return Math.max.apply(null, X._size);
}
exports.length = length;
function ndims(X) {
    return X._ndims;
}
exports.ndims = ndims;
function numel(X) {
    return X._numel;
}
exports.numel = numel;
function iscolumn(A) {
    return A._ndims == 2 && A._size[1] == 1;
}
exports.iscolumn = iscolumn;
function isrow(A) {
    return A._ndims == 2 && A._size[0] == 1;
}
exports.isrow = isrow;
function isvector(A) {
    return A._ndims == 2 && (A._size[0] == 1 || A._size[1] == 1);
}
exports.isvector = isvector;
function isempty(A) {
    return A._numel == 0;
}
exports.isempty = isempty;
function ismatrix(A) {
    return A._ndims == 2;
}
exports.ismatrix = ismatrix;
function isscalar(A) {
    // currently, number is not supported
    return A._numel == 1;
}
exports.isscalar = isscalar;
function klass(object) {
    return object._klass;
}
exports.klass = klass;
function gpuArray(A) {
    //overriden by sushi_cl
    return util.as_mat(A).copy();
}
exports.gpuArray = gpuArray;
function gather(A) {
    //overriden by sushi_cl
    return A.copy();
}
exports.gather = gather;
function jsaequal(a, b) {
    if (a.length != b.length) {
        return false;
    }
    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}
// If input is 1x1 matrix, returns number
function _singlemat2number(A) {
    if ((A instanceof exports.Matrix) && isscalar(A)) {
        return A.get_scalar([1]);
    }
    return A;
}
//equality http://jp.mathworks.com/help/matlab/relational-operators.html
/**
 * Compares elements of two matrices. One of the input can be scalar number.
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return logical matrix. 1 if A(i) == B(i).
 */
exports.eq = function (A, B) {
    throw new Error();
};
exports.eq = func_generator.make_compare_func_all('Number(%a == %b)');
/**
 * Compares elements of two matrices. One of the input can be scalar number.
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return logical matrix. 1 if A(i) >= B(i).
 */
exports.ge = function (A, B) {
    throw new Error();
};
exports.ge = func_generator.make_compare_func_all('Number(%a >= %b)');
/**
 * Compares elements of two matrices. One of the input can be scalar number.
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return logical matrix. 1 if A(i) > B(i).
 */
exports.gt = function (A, B) {
    throw new Error();
};
exports.gt = func_generator.make_compare_func_all('Number(%a > %b)');
/**
 * Compares elements of two matrices. One of the input can be scalar number.
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return logical matrix. 1 if A(i) <= B(i).
 */
exports.le = function (A, B) {
    throw new Error();
};
exports.le = func_generator.make_compare_func_all('Number(%a <= %b)');
/**
 * Compares elements of two matrices. One of the input can be scalar number.
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return logical matrix. 1 if A(i) < B(i).
 */
exports.lt = function (A, B) {
    throw new Error();
};
exports.lt = func_generator.make_compare_func_all('Number(%a < %b)');
/**
 * Compares elements of two matrices. One of the input can be scalar number.
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return logical matrix. 1 if A(i) != B(i).
 */
exports.ne = function (A, B) {
    throw new Error();
};
exports.ne = func_generator.make_compare_func_all('Number(%a != %b)');
/**
 * Checks if all matrices are equal. Assumes NaN is not equal to NaN.
 *
 * @param As Input matrices.
 * @return true if all matrices are the same regarding both size and value of elements.
 */
exports.isequal = function () {
    var As = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        As[_i - 0] = arguments[_i];
    }
    throw new Error();
};
exports.isequal = func_generator.isequal;
/**
 * Checks if all matrices are equal. Assumes NaN is equal to NaN.
 *
 * @param As Input matrices.
 * @return true if all matrices are the same regarding both size and value of elements.
 */
exports.isequaln = function () {
    var As = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        As[_i - 0] = arguments[_i];
    }
    throw new Error();
};
exports.isequaln = func_generator.isequaln;
/**
 * Compares if elements of two matrices are close. One of the input can be scalar number.
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return logical matrix. 1 if abs(A(i) - B(i)) <= atol + rtol * abs(B(i)).
 */
exports.isclose = function (A, B, rtol, atol, equal_nan) {
    if (rtol === void 0) { rtol = 1e-5; }
    if (atol === void 0) { atol = 1e-8; }
    if (equal_nan === void 0) { equal_nan = false; }
    throw new Error();
};
exports.isclose = func_generator.isclose;
/**
 * Compares if all the elements of two matrices are close. One of the input can be scalar number. See also [[isclose]]
 *
 * @param A Input matrix.
 * @param B Input matrix.
 * @return true if all elements of isclose(A, B) are 1.
 */
exports.allclose = function (A, B, rtol, atol, equal_nan) {
    throw new Error();
};
exports.allclose = func_generator.allclose;
exports.plus = func_generator.make_binary_arith_func_all('%a + %b');
exports.minus = func_generator.make_binary_arith_func_all('%a - %b');
exports.times = func_generator.make_binary_arith_func_all('%a * %b');
exports.rdivide = func_generator.make_binary_arith_func_all('%a / %b');
exports.ldivide = func_generator.make_binary_arith_func_all('%b / %a');
exports.power = func_generator.make_binary_arith_func_all('Math.pow(%a,%b)');
exports.floor = func_generator.make_unary_arith_func_all('Math.floor(%a)');
exports.fix = func_generator.make_unary_arith_func_all('(%a > 0 ? Math.floor(%a) : Math.ceil(%a))');
exports.ceil = func_generator.make_unary_arith_func_all('Math.ceil(%a)');
exports.uplus = func_generator.make_unary_arith_func_all('+%a');
exports.uminus = func_generator.make_unary_arith_func_all('-%a');
exports.exp = func_generator.make_unary_arith_func_all('Math.exp(%a)');
exports.log = func_generator.make_unary_arith_func_all('Math.log(%a)');
exports.max = reduction.max;
exports.min = reduction.min;
exports.argmax = reduction.argmax;
exports.argmin = reduction.argmin;
exports.sum = reduction.sum;
exports.mean = reduction.mean;
exports.prod = reduction.prod;
exports.std = reduction.std;
exports.variance = reduction.variance;
exports.mtimes = mul.mtimes;
function reshape(A) {
    var sz = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sz[_i - 1] = arguments[_i];
    }
    var dst = A.copy();
    try {
        dst.reshape_inplace.apply(dst, sz);
        return dst;
    }
    catch (error) {
        dst.destruct();
        throw error;
    }
}
exports.reshape = reshape;
function squeeze(A) {
    var dst = A.copy();
    dst.squeeze_inplace();
    return dst;
}
exports.squeeze = squeeze;
exports.transpose = shape_converter.transpose;
exports.t = exports.transpose; //alias
exports.repmat = shape_converter.repmat;
exports.cat = shape_converter.cat;
exports.horzcat = shape_converter.horzcat;
exports.vertcat = shape_converter.vertcat;
exports.permute = shape_converter.permute;
exports.ipermute = shape_converter.ipermute;
exports.npyread = npy.npyread;
exports.npysave = npy.npysave;
//indexing
//TODO:test
function sub2ind(matrixSize) {
    var dimSub = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        dimSub[_i - 1] = arguments[_i];
    }
    //note: 'end' cannot be used in matlab sub2ind; only positive index is valid
    var msizejsa;
    if (matrixSize instanceof exports.Matrix) {
        if (!isrow(matrixSize) || matrixSize._numel < 2) {
            throw new Error('matrixSize must be row vector');
        }
        msizejsa = matrixSize.mat2jsa(true);
    }
    else {
        msizejsa = matrixSize;
    }
    var stride = 1;
    var idx = 1;
    for (var i = 0; i < msizejsa.length; i++) {
        idx += ((dimSub[i] || 1) - 1) * stride;
        stride *= msizejsa[i];
    }
    return idx;
}
exports.sub2ind = sub2ind;
function colonvec(start, stop_step, stop, klass) {
    if (klass === void 0) { klass = 'single'; }
    // make row vector by i:j:k
    var step;
    if (stop == null) {
        stop = stop_step;
        step = 1;
    }
    else {
        step = stop_step;
    }
    var n_item = Math.max(Math.floor((stop - start) / step) + 1, 0);
    var vec = new exports.Matrix([1, n_item], klass);
    var vec_data = vec._data;
    for (var i = 0; i < n_item; i++) {
        vec_data[i] = start + step * i;
    }
    return vec;
}
exports.colonvec = colonvec;

},{"../src/cl/handwrittenjs/sushi_cl":21,"./colon":25,"./colonwrap":26,"./func_generator":27,"./io/npy":28,"./matrix":29,"./mul":30,"./reduction":31,"./shape_converter":32,"./util":34}],34:[function(require,module,exports){
"use strict";
// (c) 2016 Machine Intelligence Laboratory (The University of Tokyo), MIT License.
var Matrix = require('./matrix');
/**
 * Convert array-like to Matrix, number to 1x1 Matrix
 */
function as_mat(A) {
    if (A instanceof Matrix) {
        return A;
    }
    else {
        //array to matrix
        //number to 1x1 matrix
        return Matrix.jsa2mat(A);
    }
}
exports.as_mat = as_mat;
/**
 * Convert array-like to Matrix, preserving other type
 */
function as_mat_or_scalar(A) {
    if (A instanceof Matrix) {
        return A;
    }
    else if (typeof (A) === 'object' && A.length != null) {
        //array-like to Matrix
        return Matrix.jsa2mat(A);
    }
    else {
        return A; //preserve number
    }
}
exports.as_mat_or_scalar = as_mat_or_scalar;
//finds common output class for matrices
function commonklassstr() {
    var klasses = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        klasses[_i - 0] = arguments[_i];
    }
    // single > int32 > uint8 > logical
    var klass_order = ['single', 'int32', 'uint8', 'logical'];
    if (klasses.length == 0) {
        return klass_order[0];
    }
    var best_klass = 3;
    for (var i = 0; i < klasses.length; i++) {
        var element = klasses[i];
        var score = klass_order.indexOf(element);
        if (score < 0) {
            throw new Error('Unknown klass');
        }
        best_klass = Math.min(score, best_klass);
    }
    return klass_order[best_klass];
}
exports.commonklassstr = commonklassstr;
function commonklass() {
    var mats = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        mats[_i - 0] = arguments[_i];
    }
    //number not affects class decision
    var klasses = [];
    for (var i = 0; i < mats.length; i++) {
        var element = mats[i];
        if (element instanceof Matrix) {
            klasses.push(element._klass);
        }
    }
    return commonklassstr.apply(void 0, klasses);
}
exports.commonklass = commonklass;
function issamesize(sizea, sizeb) {
    for (var i = 0; i < sizea.length; i++) {
        if (sizea[i] != sizeb[i]) {
            return false;
        }
    }
    return true;
}
exports.issamesize = issamesize;
function force_cpu(A) {
    if (A instanceof Matrix) {
        return A.to_cpu();
    }
    else {
        return A;
    }
}
exports.force_cpu = force_cpu;
function force_cpu_scalar(A) {
    if (A instanceof Matrix) {
        if (A._numel == 1) {
            return A.get();
        }
        else {
            return A.to_cpu();
        }
    }
    else {
        return A;
    }
}
exports.force_cpu_scalar = force_cpu_scalar;
function jsaequal(a, b) {
    if (a.length != b.length) {
        return false;
    }
    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}
exports.jsaequal = jsaequal;
function calc_zeros_size(args) {
    var size;
    var klass = 'single';
    if (args.length >= 1 && typeof (args[args.length - 1]) === 'string') {
        //zeros(_,typename)
        klass = args[args.length - 1];
        args.pop();
    }
    else if (args.length >= 2 && args[args.length - 2] == 'like') {
        //zeros('like', mat)
        klass = args[args.length - 1]._klass;
        args.pop();
        args.pop();
    }
    if (args.length == 0) {
        // return 1x1 matrix
        size = [1, 1];
    }
    else {
        if (args.length == 1) {
            if (typeof (args[0]) === 'number') {
                // nxn matrix
                size = [args[0], args[0]];
            }
            else if (args[0] instanceof Matrix) {
                // size given as matrix
                var sizemat = args[0];
                if (sizemat._size.length == 2 && sizemat._size[0] == 1 && sizemat._size[1] >= 1) {
                    size = Array.prototype.slice.call(sizemat._getdata());
                }
                else {
                    throw new Error('matrix size is not valid row vector');
                }
            }
            else {
                throw new Error('Unknown data type of argument 0');
            }
        }
        else {
            size = args;
        }
    }
    return { size: size, klass: klass };
}
exports.calc_zeros_size = calc_zeros_size;

},{"./matrix":29}],35:[function(require,module,exports){
(function (process,global){
"use strict";

var cl = require('bindings')('opencl.node');

module.exports = cl;

global.WebCLPlatform=cl.WebCLPlatform=function (_) { this._ = _; };
global.WebCLDevice=cl.WebCLDevice=function (_) { this._ = _; };
global.WebCLContext=cl.WebCLContext=function (_) { this._ = _; };
global.WebCLCommandQueue=cl.WebCLCommandQueue=function (_) { this._ = _; };
global.WebCLMemObject=cl.WebCLMemObject=function (_) { this._ = _; };
global.WebCLEvent=cl.WebCLEvent=function (_) { this._ = _; };
global.WebCLProgram=cl.WebCLProgram=function (_) { this._ = _; };
global.WebCLKernel=cl.WebCLKernel=function (_) { this._ = _; };
global.WebCLSampler=cl.WebCLSampler=function (_) { this._ = _; };

process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  process.exit();
});

process.on('exit', function() {
  // this releases all allocated OpenCL objects
  // global.gc();
  cl.releaseAll();
});

/********************************************************************************************************/

// /* Platform API */
// cl.GetPlatformIDs();

// cl.GetPlatformInfo(platform,
//                   param_name);

// /* Device APIs */
// cl.GetDeviceIDs(platform,
//                device_type,
//                devices);

// cl.GetDeviceInfo(device,
//                 param_name);

// if(cl.CL_VERSION_1_2) {
//   cl.CreateSubDevices(in_device,
//                    properties,
//                    out_devices);

//   cl.RetainDevice(device);

//   cl.ReleaseDevice(device);
// }

// /* Context APIs  */
// cl.CreateContext(properties,
//                 devices,
//                 callback,
//                 user_data);

// cl.CreateContextFromType(properties,
//                         device_type,
//                         callback,
//                         user_data);

// cl.RetainContext(context);

// cl.ReleaseContext(context);

// cl.GetContextInfo(context,
//                  param_name);

// /* Command Queue APIs */
// cl.CreateCommandQueue(context,
//                      device,
//                      properties);

// cl.RetainCommandQueue(command_queue);

// cl.ReleaseCommandQueue(command_queue);

// cl.GetCommandQueueInfo(command_queue,
//                       param_name);

// /* Memory Object APIs */
// cl.CreateBuffer(context,
//                flags,
//                size,
//                host_ptr);

// cl.CreateSubBuffer(buffer,
//                   flags,
//                   buffer_create_type,
//                   buffer_create_info);

// if(cl.CL_VERSION_1_2) {
//   cl.CreateImage(context,
//               flags,
//               image_format,
//               image_desc,
//               host_ptr);
// }

// cl.RetainMemObject(memobj);

// cl.ReleaseMemObject(memobj);

// cl.GetSupportedImageFormats(context,
//                            flags,
//                            image_type);

// cl.GetMemObjectInfo(memobj,
//                    param_name);

// cl.GetImageInfo(image,
//                param_name);

// cl.SetMemObjectDestructorCallback(memobj,
//                                  callback,
//                                  user_data);

// /* Sampler APIs */
// cl.CreateSampler(context,
//                 normalized_coords,
//                 addressing_mode,
//                 filter_mode);

// cl.RetainSampler(sampler);

// cl.ReleaseSampler(sampler);

// cl.GetSamplerInfo(sampler,
//                  param_name);

// /* Program Object APIs  */
// cl.CreateProgramWithSource(context,
//                           source);

// cl.CreateProgramWithBinary(context,
//                           device_list,
//                           binaries,
//                           binary_status);

// if(cl.CL_VERSION_1_2) {
//   cl.CreateProgramWithBuiltInKernels(context,
//                                   device_list,
//                                   kernel_names);
// }

// cl.RetainProgram(program);

// cl.ReleaseProgram(program);

// cl.BuildProgram(program,
//                device_list,
//                options,
//                callback,
//                user_data);

// if(cl.CL_VERSION_1_2) {
//   cl.CompileProgram(program,
//                    device_list,
//                    options,
//                    input_headers,
//                    header_include_names,
//                    callback,
//                    user_data);

//   cl.LinkProgram(context,
//                 device_list,
//                 options,
//                 input_programs,
//                 callback,
//                 user_data);

//   cl.UnloadPlatformCompiler(platform);
// }

// cl.GetProgramInfo(program,
//                  param_name);

// cl.GetProgramBuildInfo(program,
//                       device,
//                       param_name);

// /* Kernel Object APIs */
// cl.CreateKernel(program,
//                kernel_name);

// cl.CreateKernelsInProgram(program,
//                          kernels);

// cl.RetainKernel(kernel);

// cl.ReleaseKernel(kernel);

// cl.SetKernelArg(kernel,
//                arg_index,
//                arg_size,
//                arg_value);

// cl.GetKernelInfo(kernel,
//                 param_name);

// if(cl.CL_VERSION_1_2)
//   cl.GetKernelArgInfo(kernel,
//                    arg_indx,
//                    param_name);
// }

// cl.GetKernelWorkGroupInfo(kernel,
//                          device,
//                          param_name);

// /* Event Object APIs */
// cl.WaitForEvents(event_list );

// cl.GetEventInfo(event,
//                param_name);

// cl.CreateUserEvent(context);

// cl.RetainEvent(event);

// cl.ReleaseEvent(event);

// cl.SetUserEventStatus(event,
//                      execution_status);

// cl.SetEventCallback( event,
//                     command_exec_callback_type,
//                     callback,
//                     user_data);

// /* Profiling APIs */
// cl.GetEventProfilingInfo(event,
//                         param_name);

// /* Flush and Finish APIs */
// cl.Flush(command_queue);

// cl.Finish(command_queue);

// /* Enqueued Commands APIs */
// cl.EnqueueReadBuffer(command_queue,
//                     buffer,
//                     blocking_read,
//                     offset,
//                     size,
//                     ptr,
//                     event_wait_list,
//                     event);

// cl.EnqueueReadBufferRect(command_queue,
//                         buffer,
//                         blocking_read,
//                         buffer_offset,
//                         host_offset,
//                         region,
//                         buffer_row_pitch,
//                         buffer_slice_pitch,
//                         host_row_pitch,
//                         host_slice_pitch,
//                         ptr,
//                         event_wait_list,
//                         event);

// cl.EnqueueWriteBuffer(command_queue,
//                      buffer,
//                      blocking_write,
//                      offset,
//                      size,
//                      ptr,
//                      event_wait_list,
//                      event);

// cl.EnqueueWriteBufferRect(command_queue,
//                          buffer,
//                          blocking_write,
//                          buffer_offset,
//                          host_offset,
//                          region,
//                          buffer_row_pitch,
//                          buffer_slice_pitch,
//                          host_row_pitch,
//                          host_slice_pitch,
//                          ptr,
//                          event_wait_list,
//                          event);

// if(c.CL_VERSION_1_2) {
//   cl.EnqueueFillBuffer(command_queue,
//                       buffer,
//                       pattern,
//                       pattern_size,
//                       offset,
//                       size,
//                       event_wait_list,
//                       event);
// }

// cl.EnqueueCopyBuffer(command_queue,
//                     src_buffer,
//                     dst_buffer,
//                     src_offset,
//                     dst_offset,
//                     size,
//                     event_wait_list,
//                     event);

// cl.EnqueueCopyBufferRect(command_queue,
//                         src_buffer,
//                         dst_buffer,
//                         src_origin,
//                         dst_origin,
//                         region,
//                         src_row_pitch,
//                         src_slice_pitch,
//                         dst_row_pitch,
//                         dst_slice_pitch,
//                         event_wait_list,
//                         event);

// cl.EnqueueReadImage(command_queue,
//                    image,
//                    blocking_read,
//                    origin[3],
//                    region[3],
//                    row_pitch,
//                    slice_pitch,
//                    ptr,
//                    event_wait_list,
//                    event);

// cl.EnqueueWriteImage(command_queue,
//                     image,
//                     blocking_write,
//                     origin[3],
//                     region[3],
//                     input_row_pitch,
//                     input_slice_pitch,
//                     ptr,
//                     event_wait_list,
//                     event);

// if(cl.CL_VERSION_1_2) {
//   cl.EnqueueFillImage(command_queue,
//                    image,
//                    fill_color,
//                    origin[3],
//                    region[3],
//                    event_wait_list,
//                    event);
// }

// cl.EnqueueCopyImage(command_queue,
//                    src_image,
//                    dst_image,
//                    src_origin[3],
//                    dst_origin[3],
//                    region[3],
//                    event_wait_list,
//                    event);

// cl.EnqueueCopyImageToBuffer(command_queue,
//                            src_image,
//                            dst_buffer,
//                            src_origin[3],
//                            region[3],
//                            dst_offset,
//                            event_wait_list,
//                            event);

// cl.EnqueueCopyBufferToImage(command_queue,
//                            src_buffer,
//                            dst_image,
//                            src_offset,
//                            dst_origin[3],
//                            region[3],
//                            event_wait_list,
//                            event);

// cl.EnqueueMapBuffer(command_queue,
//                    buffer,
//                    blocking_map,
//                    map_flags,
//                    offset,
//                    size,
//                    event_wait_list,
//                    event);

// cl.EnqueueMapImage(command_queue,
//                   image,
//                   blocking_map,
//                   map_flags,
//                   origin[3],
//                   region[3],
//                   event_wait_list,
//                   event);

// cl.EnqueueUnmapMemObject(command_queue,
//                         memobj,
//                         mapped_ptr,
//                         event_wait_list,
//                         event);

// if(cl.CL_VERSION_1_2) {
//   cl.EnqueueMigrateMemObjects(command_queue,
//                            mem_objects,
//                            flags,
//                            event_wait_list,
//                            event);
// }

// cl.EnqueueNDRangeKernel(command_queue,
//                        kernel,
//                        work_dim,
//                        global_work_offset,
//                        global_work_size,
//                        local_work_size,
//                        event_wait_list,
//                        event);

// cl.EnqueueTask(command_queue,
//               kernel,
//               event_wait_list,
//               event);

// cl.EnqueueNativeKernel(command_queue,
//                       callback,
//                       args,
//                       mem_list,
//                       event_wait_list,
//                       event);

// if(cl.CL_VERSION_1_2) {
//   cl.EnqueueMarkerWithWaitList(command_queue,
//                             event_wait_list,
//                             event);

//   cl.EnqueueBarrierWithWaitList(command_queue,
//                              event_wait_list,
//                              event);
// }

// // Deprecated OpenCL 1.1 APIs
// cl.CreateImage2D(context,
//                 flags,
//                 image_format,
//                 image_width,
//                 image_height,
//                 image_row_pitch,
//                 host_ptr);

// cl.CreateImage3D(context,
//                 flags,
//                 image_format,
//                 image_width,
//                 image_height,
//                 image_depth,
//                 image_row_pitch,
//                 image_slice_pitch,
//                 host_ptr);

// cl.EnqueueMarker(command_queue,
//                 event);

// cl.EnqueueWaitForEvents(command_queue,º
//                        event_list);

// cl.EnqueueBarrier(command_queue);

// cl.UnloadCompiler();

/********************************************************************************************************/
/* Extensions */
/********************************************************************************************************/

/* GL */
// cl.CreateEventFromGLsyncKHR(context,
//                            cl_GLsync);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":42,"bindings":12}],36:[function(require,module,exports){

},{}],37:[function(require,module,exports){
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
},{"base64-js":38,"ieee754":39,"isarray":40}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],41:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":42}],42:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[2]);
