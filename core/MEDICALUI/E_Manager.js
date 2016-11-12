var VIEW_MAIN = 0;
var VIEW_2D_AXL = 1;
var VIEW_2D_COR = 2;
var VIEW_2D_SAG = 3;

function E_Manager()
{
  var m_renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true, alpha:true});

  this.GetRenderer = function(){
    return m_renderer;
  }
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();
  var viewport = $$("ID_VIEW_MAIN");

  //Create Scene and Camear
  renderer.scene = new THREE.Scene();
  renderer.camera = new THREE.PerspectiveCamera( 45, $$("ID_VIEW_MAIN").$width/$$("ID_VIEW_MAIN").$height, 0.1, 10000000000 );

  //Initialize Renderer
  renderer.setClearColor(0x00000a);

  //Attatch Renderer on Viewport
  viewport.getNode().replaceChild(renderer.domElement, viewport.$view.childNodes[0]);

  this.Redraw();
}

E_Manager.prototype.Redraw = function()
{
  //Get Renderer and viewport
  var renderer = this.GetRenderer();
  var viewport = $$("ID_VIEW_MAIN");

  //Set setSize
  renderer.setSize(viewport.$width, viewport.$height);

  //Render
  renderer.render(renderer.scene, renderer.camera);
}

E_Manager.prototype.OnResize = function()
{
  this.Redraw();
}
module.exports = E_Manager;
