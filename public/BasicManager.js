function E_Manager()
{
  var canvas = document.getElementById("viewport");
  var m_scene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 100000 );
  var m_renderer = new THREE.WebGLRenderer({canvas:canvas, preserveDrawingBuffer: true, antialias: true});
  var m_interactor = new E_Interactor(this);

  this.m_startTime;

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
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  //init renderrer
  renderer.setClearColor(0xfff0ff, 1);
  renderer.setSize(window.innerWidth, window.innerHeight );


  //Initialize Object
  this.InitObject();
}

E_Manager.prototype.Animate = function()
{
  var Mgr = this;
  requestAnimationFrame(Mgr.Animate.bind(Mgr));

  var renderer = this.GetRenderer();
  var camera = this.GetCamera();
  var scene = this.GetScene();

  renderer.render(scene, camera);
}

E_Manager.prototype.InitObject = function()
{
  var scene = this.GetScene();
  var camera = this.GetCamera();
}
