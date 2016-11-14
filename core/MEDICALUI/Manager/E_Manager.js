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
