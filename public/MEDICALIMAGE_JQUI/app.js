(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var NUM_VIEW = 4;

var VIEW_MAIN = 0;
var VIEW_2D_AXL = 1;
var VIEW_2D_COR = 2;
var VIEW_2D_SAG = 3;

function E_Manager()
{
  var m_renderer = [];

  this.GetRenderer = function(idx){
    if(idx == null) return m_renderer;
    return m_renderer[idx];
  }
}

E_Manager.prototype.Initialize = function()
{
  var renderer = this.GetRenderer();


  for(var i =0 ; i<NUM_VIEW ; i++){
    renderer[i] = new THREE.WebGLRenderer({preserveDrawingBuffer:true, alpha:true});
    //Create Scene and Camear
    renderer[i].scene = new THREE.Scene();
    renderer[i].camera = new THREE.PerspectiveCamera( 45, $$("ID_VIEW_MAIN").$width/$$("ID_VIEW_MAIN").$height, 0.1, 10000000000 );
    renderer[i].setClearColor(0x00000a);
  }

  //Attatch Renderer on Viewport
  var viewport0 = $$("ID_VIEW_MAIN");
  viewport0.getNode().replaceChild(renderer[VIEW_MAIN].domElement, viewport0.$view.childNodes[0]);


  var viewport1 = $$("ID_VIEW_AXL");
  viewport1.getNode().replaceChild(renderer[VIEW_2D_AXL].domElement, viewport1.$view.childNodes[0]);


  var viewport2 = $$("ID_VIEW_COR");
  viewport2.getNode().replaceChild(renderer[VIEW_2D_COR].domElement, viewport2.$view.childNodes[0]);


  var viewport3 = $$("ID_VIEW_SAG");
  viewport3.getNode().replaceChild(renderer[VIEW_2D_SAG].domElement, viewport3.$view.childNodes[0]);


  this.Redraw();
}

E_Manager.prototype.Redraw = function()
{
  //Get Renderer and viewport
  var renderer = this.GetRenderer();


  //Set setSize
  var viewport0 = $$("ID_VIEW_MAIN");
  renderer[0].setSize(viewport0.$width, viewport0.$height);

  var viewport1 = $$("ID_VIEW_AXL");
  renderer[1].setSize(viewport1.$width, viewport1.$height);

  var viewport2 = $$("ID_VIEW_COR");
  renderer[2].setSize(viewport2.$width, viewport2.$height);

  var viewport3 = $$("ID_VIEW_SAG");
  renderer[3].setSize(viewport3.$width, viewport3.$height);

  //Render
  for(var i in renderer){
      renderer[i].render(renderer[i].scene, renderer[i].camera);
  }

}

E_Manager.prototype.OnResize = function()
{
  this.Redraw();
}
module.exports = E_Manager;

},{}],2:[function(require,module,exports){
//Define Header
var E_Manager = require("./E_Manager.js");


//Initialize Manager
var Manager = new E_Manager();
Manager.Initialize();

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

},{"./E_Manager.js":1}]},{},[2]);
