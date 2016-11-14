(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//Define Header
var E_Manager = require("./Manager/E_Manager.js");


//Initialize Manager
var Manager = new E_Manager();
Manager.Initialize();
Manager.Animate();

///////////////////////////////////INTERACTION EVENTS////////////////////////////////
/// Resizing Events

$(window).resize(function(){
  Manager.OnResize();
});

$$("ID_LEFT_AREA").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_MAIN").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_AXL").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_COR").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_SAG").attachEvent("onViewResize", function(){
  Manager.OnResize();
});

$$("ID_VIEW_FOOTER").attachEvent("onViewResize", function(){
  Manager.OnResize();
});


/// Button Events
$$("ID_BUTTON_IMPORT_MESH").attachEvent("onItemClick", function(){
  var parent = $$("ID_BUTTON_IMPORT_MESH").getNode().childNodes[0];

  //Create File Dialog
  var fileDialog = document.createElement("input");
  fileDialog.setAttribute("type", "file");
  fileDialog.setAttribute("multiple", true);
  fileDialog.click();
  parent.appendChild(fileDialog);

  fileDialog.addEventListener("change", function(ev){
    //console.log(ev.target.files);

    for(var i=0 ; i<ev.target.files.length ; i++){
        var path = URL.createObjectURL(ev.target.files[i]);
        var name = ev.target.files[i].name;

        //Import Mesh
        Manager.MeshMgr().ImportMesh(path, name);
    }

    //Remove File Dialog Element
    parent.removeChild(fileDialog);
  });
});

$$("ID_BUTTON_IMPORT_VOLUME").attachEvent("onItemClick", function(){
  console.log("Volume Import Clicked");
});


///Tree Events
$$("ID_VIEW_TREE").attachEvent("onItemCheck", function(id){
  if(this.isBranch()) return;

  var checkState = this.isChecked(id);
  Manager.MeshMgr().ShowHide(id, checkState);

})

$$("ID_VIEW_TREE").attachEvent("onItemClick", function(id){
  //this.select(id);
  Manager.MeshMgr().SetSelectedMesh(id);
})

$$("ID_VIEW_TREE").attachEvent("onItemDblClick", function(){
  console.log("Item DBlClicked");
})

$$("ID_VIEW_TREE").attachEvent("onKeyPress", function(code, e){

  if(e.key == "Backspace"){
    Manager.MeshMgr().RemoveMesh();
  }
})

},{"./Manager/E_Manager.js":2}],2:[function(require,module,exports){
// var THREE = require("three");
// var STLLoader = require('three-stl-loader')(THREE);
// var TrackballControls = require('three.trackball')(THREE);

var E_MeshManager = require("./E_MeshManager.js");
var E_VolumeManager = require("./E_VolumeManager.js");


function E_Manager()
{
  this.NUM_VIEW = 4;
  this.VIEW_MAIN = 0;
  this.VIEW_2D_AXL = 1;
  this.VIEW_2D_COR = 2;
  this.VIEW_2D_SAG = 3;
  //Renderer
  var m_renderer = [];

  //Render Window
  var m_renderWindow = [];

  //Mesh Manager
  var m_meshManager = new E_MeshManager(this);
  var m_volumeManager = new E_VolumeManager(this);

  this.GetRenderer = function(idx){
    if(idx == null) return m_renderer;
    return m_renderer[idx];
  }

  this.GetRenderWindow = function(idx){
    if(idx == null) return m_renderWindow;
    return m_renderWindow[idx];
  }

  this.MeshMgr = function(){
    return m_meshManager;
  }

  this.VolumeMgr = function(){
    return m_volumeManager;
  }
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  var renWin = this.GetRenderWindow();

  //Initialize Render Widnow
  renWin[0] = $$("ID_VIEW_MAIN");
  renWin[1] = $$("ID_VIEW_AXL");
  renWin[2] = $$("ID_VIEW_COR");
  renWin[3] = $$("ID_VIEW_SAG");

  for(var i =0 ; i<this.NUM_VIEW ; i++){
    //Initialize renderer
    renderer[i] = new THREE.WebGLRenderer({preserveDrawingBuffer:true, alpha:true});

    //Create Scene and Camear
    renderer[i].scene = new THREE.Scene();

    //Add light
    renderer[i].pointLight = new THREE.PointLight(0xffffff);
    renderer[i].scene.add(renderer[i].pointLight);

    renderer[i].camera = new THREE.PerspectiveCamera( 45, renWin[i].$width/renWin[i].$height, 0.1, 10000000000 );
    renderer[i].camera.position.set(0, 0, -20);
    renderer[i].camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer[i].setClearColor(0x00000a);

    //Attach to the Viewport
    renWin[i].getNode().replaceChild(renderer[i].domElement, renWin[i].$view.childNodes[0] );

    //Initialize control
    renderer[i].control = new THREE.TrackballControls(renderer[i].camera, renderer[i].domElement );
    renderer[i].control.rotateSpeed = 4.0;
    renderer[i].control.zoomSpeed = 1.2;
    renderer[i].control.panSpeed = 0.8;
    renderer[i].control.noZoom = false;
    renderer[i].control.noPan = false;
    renderer[i].control.staticMoving = true;
    renderer[i].control.dynamicDampingFactor = 0.3;
    renderer[i].control.keys = [ 65, 83, 68 ];
    renderer[i].control.addEventListener( 'change', this.Redraw.bind(this) );
  }

  //Initialize Renderer Size
  this.UpdateWindowSize();

  //Initialize Test Mesh
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshPhongMaterial({color:0xff0000, shading:THREE.SmoothShading, shininess:5, specular:0xaaaaaa});
  var cube = new THREE.Mesh( geometry, material );
  renderer[1].scene.add( cube );
  renderer[2].scene.add( cube.clone() );

  //Redraw
  this.Redraw();
}

E_Manager.prototype.Animate = function()
{
  for(var i=0 ; i<this.NUM_VIEW ; i++){
    this.GetRenderer(i).control.update();
  }

  requestAnimationFrame( this.Animate.bind(this) );
}

E_Manager.prototype.Redraw = function()
{
  //Get Renderer and viewport
  var renderer = this.GetRenderer();

  //Set PointLight of Main VIEW_MAIN
  for(var i in renderer)
  {
    var camera = renderer[i].camera;
    renderer[i].pointLight.position.set(camera.position.x, camera.position.y, camera.position.z );
  }

  //Render
  for(var i in renderer){
      renderer[i].render(renderer[i].scene, renderer[i].camera);
  }
}

E_Manager.prototype.ResetCamera = function()
{
  var meshMgr = this.MeshMgr();
  var scene = this.GetRenderer(this.VIEW_MAIN).scene;
  var control = this.GetRenderer(this.VIEW_MAIN).control;

  var target = new THREE.Vector3(0, 0, 0);
  var count = 0;

  scene.traverse(function(object){
    if(object instanceof THREE.Mesh){
      target.add( meshMgr.GetCenter(object) );
      count++;
    }

    target.divideScalar(count);
    control.target = target;
    control.update();
  });
}

E_Manager.prototype.OnResize = function()
{
  this.UpdateWindowSize();

  this.Redraw();
}

E_Manager.prototype.UpdateWindowSize = function()
{
  //Get Renderer and viewport
  var renderer = this.GetRenderer();
  var renWin = this.GetRenderWindow();

  for(var i=0 ; i<this.NUM_VIEW ; i++){
    renderer[i].setSize(renWin[i].$width, renWin[i].$height);
    renderer[i].camera.aspect = renWin[i].$width/renWin[i].$height;
    renderer[i].camera.updateProjectionMatrix();
    renderer[i].control.handleResize();
  }
}


E_Manager.prototype.ResetTreeItems = function()
{
  var tree = $$("ID_VIEW_TREE");
  tree.clearAll();

  tree.add({ id:"ID_TREE_MESH", open:true, value:"Mesh"});
  tree.add({ id:"ID_TREE_VOLUME", open:false, value:"Volume"});


  var meshList = this.MeshMgr().m_meshList;
  for(var i in meshList){
    var mesh = meshList[i];
    tree.add({id:i, value:mesh.name}, i, "ID_TREE_MESH");
    tree.checkItem(i);
  }
}
module.exports = E_Manager;

},{"./E_MeshManager.js":3,"./E_VolumeManager.js":4}],3:[function(require,module,exports){
function E_MeshManager(Mgr)
{
  this.Mgr = Mgr;

  this.m_meshList = [];
  this.m_selectedMeshIdx = -1;
}

E_MeshManager.prototype.ImportMesh = function(path, name)
{
  //Extract Geometry From the Path
  var that = this;
  var loader = new THREE.STLLoader();

  loader.load( path, function(geometry){
    that.LoadMesh(geometry, name);
  } );
}

E_MeshManager.prototype.LoadMesh = function(geometry, name)
{
  if(name == null) name = "mesh_unnamed";

  //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var material = new THREE.MeshPhongMaterial({color:0xff0000, shading:THREE.SmoothShading, shininess:30, specular:0xaaaaaa});
  material.side = THREE.DoubleSide;
  material.color = new THREE.Color(Math.random(), Math.random(), Math.random());

  var mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;

  //Add Mesh
  this.AddMesh(mesh);
}

E_MeshManager.prototype.AddMesh = function(mesh)
{
  var scene = this.Mgr.GetRenderer(0).scene;
  this.m_meshList.push(mesh);
  scene.add(mesh);

  this.Mgr.ResetTreeItems();

  this.Mgr.ResetCamera();
  this.Mgr.Redraw();
}

E_MeshManager.prototype.ShowHide = function(id, show)
{
  if(this.m_meshList.length < 1) return;
  var mesh = this.GetMesh(id);
  var scene = this.Mgr.GetRenderer(this.Mgr.VIEW_MAIN).scene;

  if(show){
    scene.add(mesh);
  }else{
    scene.remove(mesh);

    //Update Tree
  }

  this.Mgr.Redraw();
}

E_MeshManager.prototype.RemoveMesh = function(){

  if(this.m_selectedMeshIdx == -1) return;
  var id = this.m_selectedMeshIdx;
  //Hide Mesh
  this.ShowHide(id, false);

  //Remove From The Mesh List
  this.m_meshList.splice(id, 1);

  if(this.m_meshList.length == 0) this.m_selectedMeshIdx = -1;

  //Remove From Mesh Tree
  this.Mgr.ResetTreeItems();
}

E_MeshManager.prototype.SetSelectedMesh = function(id)
{
  this.m_selectedMeshIdx = id;
}

E_MeshManager.prototype.GetMesh = function(id){
  return this.m_meshList[id];
}

E_MeshManager.prototype.GetCenter = function(mesh)
{
  //Real Center Position of Mesh
  mesh.geometry.computeBoundingBox();
  var boundingBox = mesh.geometry.boundingBox;
  var position = new THREE.Vector3();

  position.subVectors( boundingBox.max, boundingBox.min );
  position.multiplyScalar( 0.5 );
  position.add( boundingBox.min );
  position.applyMatrix4( mesh.matrixWorld );

  return position;
}

module.exports = E_MeshManager;

},{}],4:[function(require,module,exports){
function E_VolumeManager(Mgr)
{
  this.Mgr = Mgr;
  
}

module.exports = E_VolumeManager;

},{}]},{},[1]);
